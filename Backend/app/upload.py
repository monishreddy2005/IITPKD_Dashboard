import os
import csv
import io
import psycopg2
import psycopg2.extras
from flask import Blueprint, request, jsonify
from .db import get_db_connection
from .auth import token_required

# Define a whitelist of tables that are allowed to be updated via this form.
# This is a CRITICAL security measure to prevent users from trying to update
# sensitive tables (like 'users') or tables that don't make sense to upsert.
# We also map the table name to its unique key(s) for the ON CONFLICT (upsert) clause.
UPDATABLE_TABLES = {
    # Note: Table names should match PostgreSQL schema (lowercase)
    # But we'll handle case-insensitive matching
    'student': ['rollno'],
    'course': ['coursecode'],
    'department': ['deptcode'],
    'alumni': ['rollno'],
    'alumini': ['rollno'],  # Alternative spelling
    # For tables with SERIAL IDs, we use a different business/natural key
    # that is expected to be in the CSV.
    'designation': ['designationname'],
    'employee': ['email'],
    'employment_history': ['historyid'],  # Uses SERIAL ID
    'additional_roles': ['roleid'],  # Uses SERIAL ID
    'externship_info': ['externid'],  # Uses SERIAL ID
    'igrs_yearwise': ['grievance_year'],
    'icc_yearwise': ['complaints_year'],
    'ewd_yearwise': ['ewd_year'],
    'faculty_engagement': ['engagement_code'],
    'placement_summary': ['placement_year', 'program', 'gender'],
    'placement_companies': ['company_id'],
    'placement_packages': ['placement_year', 'program'],
    # 'users' and 'roles' are intentionally left out here for security.
    # You can add them if you need to, but be very careful.
    # 'roles': ['name'],
    # 'users': ['email'],
}

# Create a new Blueprint for our upload logic
upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload-csv', methods=['POST'])
@token_required
def upload_csv(current_user_id):
    """
    Handles CSV file upload to update a specified database table.
    1. Validates the table name against a whitelist.
    2. Validates the CSV headers against the table's columns.
    3. Performs a bulk "upsert" (INSERT ON CONFLICT UPDATE).
    
    Args:
        current_user_id: The ID of the authenticated user (injected by @token_required decorator)
    """
    
    # 1. --- Validation: Check for table_name and file ---
    
    # Check if a table_name was provided in the form data
    if 'table_name' not in request.form:
        return jsonify({'message': 'No table_name specified.'}), 400
        
    table_name = request.form['table_name']

    # Check if the file part is in the request
    if 'csv_file' not in request.files:
        return jsonify({'message': 'No csv_file part in request.'}), 400
        
    file = request.files['csv_file']

    # Check if a file was actually selected
    if file.filename == '':
        return jsonify({'message': 'No file selected.'}), 400

    # 2. --- Security Check: Validate Table Name ---
    
    # CRITICAL: Check if the provided table_name is in our whitelist (case-insensitive).
    # This prevents arbitrary table updates (e.g., to the 'users' table).
    table_name_lower = table_name.lower()
    matching_table = None
    for allowed_table in UPDATABLE_TABLES.keys():
        if allowed_table.lower() == table_name_lower:
            matching_table = allowed_table
            break
    
    if not matching_table:
        return jsonify({'message': f"Updating table '{table_name}' is not allowed."}), 403 # 403 Forbidden
    
    # Use the matching table name from whitelist
    table_name = matching_table

    if not file.filename.endswith('.csv'):
        return jsonify({'message': 'File is not a CSV.'}), 400

    conn = None
    try:
        # 3. --- CSV Parsing ---
        
        # Read the file from memory as a text stream
        # We use io.StringIO to treat the binary file stream as text
        csv_data = file.stream.read().decode('utf-8')
        csv_file_text = io.StringIO(csv_data)
        
        # Use csv.DictReader to automatically get headers and rows as dicts
        reader = csv.DictReader(csv_file_text)
        
        # Get the headers from the CSV
        csv_headers = reader.fieldnames
        if not csv_headers:
             return jsonify({'message': 'CSV file is empty or headers are missing.'}), 400

        # 4. --- Database Column Validation ---
        
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed.'}), 500
        
        cur = conn.cursor()
        
        # Get the actual column names for this table from the database
        # We query information_schema.columns to get metadata
        # Handle case-insensitive table name matching
        cur.execute(
            """
            SELECT column_name, is_generated
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND LOWER(table_name) = LOWER(%s)
            ORDER BY ordinal_position;
            """,
            (table_name,)
        )
        db_columns_rows = cur.fetchall()
        db_columns = [
            row['column_name']
            for row in db_columns_rows
            if (row.get('is_generated') or 'NEVER').upper() != 'ALWAYS'
        ]
        
        if not db_columns:
            # Try to find the actual table name (case-insensitive)
            cur.execute(
                """
                SELECT column_name, is_generated
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = %s
                ORDER BY ordinal_position;
                """,
                (table_name,)
            )
            actual_table = cur.fetchone()
            if actual_table:
                table_name = actual_table['table_name']
                # Retry column fetch with correct table name
                cur.execute(
                    """
                    SELECT column_name, is_generated
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = %s
                    ORDER BY ordinal_position;
                    """,
                    (table_name,)
                )
                db_columns_rows = cur.fetchall()
                db_columns = [
                    row['column_name']
                    for row in db_columns_rows
                    if (row.get('is_generated') or 'NEVER').upper() != 'ALWAYS'
                ]
        
        # Normalize column names for comparison (case-insensitive)
        csv_headers_lower = [h.lower() for h in csv_headers]
        db_columns_lower = [c.lower() for c in db_columns]
        
        # Compare the sets of columns (case-insensitive)
        if set(csv_headers_lower) != set(db_columns_lower):
            # Sets don't match, return a detailed error
            missing_in_csv = [db_columns[i] for i, col in enumerate(db_columns_lower) if col not in csv_headers_lower]
            extra_in_csv = [csv_headers[i] for i, col in enumerate(csv_headers_lower) if col not in db_columns_lower]
            return jsonify({
                'message': 'Column mismatch.',
                'details': {
                    'missing_in_csv': missing_in_csv,
                    'extra_in_csv': extra_in_csv,
                    'expected_columns': db_columns,
                    'received_columns': csv_headers
                }
            }), 400
        
        # Map CSV headers to DB column names (handle case differences)
        csv_to_db_map = {}
        for csv_header in csv_headers:
            for db_col in db_columns:
                if csv_header.lower() == db_col.lower():
                    csv_to_db_map[csv_header] = db_col
                    break

        # 5. --- Database Upsert (INSERT... ON CONFLICT) ---
        
        # Get the conflict key(s) (primary/unique) for this table
        conflict_keys = UPDATABLE_TABLES[table_name]
        
        # Get all columns that are *not* part of the conflict key
        # These are the ones we will update if a conflict occurs
        # Map conflict keys to actual DB column names
        conflict_keys_db = []
        for key in conflict_keys:
            for db_col in db_columns:
                if key.lower() == db_col.lower():
                    conflict_keys_db.append(db_col)
                    break
            else:
                conflict_keys_db.append(key)  # Fallback if not found
        
        update_cols = [col for col in db_columns if col not in conflict_keys_db]

        # --- Build the dynamic, but SAFE, SQL query ---
        # We use f-strings safely here because 'table_name' and column names
        # are validated against our whitelist and database metadata, NOT raw user input.
        
        # "col1", "col2", ...
        cols_sql = ", ".join([f'"{c}"' for c in db_columns])
        
        # "key1", "key2", ...
        conflict_sql = ", ".join([f'"{c}"' for c in conflict_keys_db])
        
        # "col1" = EXCLUDED."col1", "col2" = EXCLUDED."col2", ...
        update_sql = ", ".join([f'"{c}" = EXCLUDED."{c}"' for c in update_cols])

        # The final query template
        # `VALUES %s` is the placeholder for psycopg2.extras.execute_values
        query = f"""
            INSERT INTO "{table_name}" ({cols_sql})
            VALUES %s
            ON CONFLICT ({conflict_sql}) DO UPDATE SET
            {update_sql};
        """
        
        # Prepare the data for bulk insertion
        # We need a list of tuples, in the correct column order
        # We re-read the CSV data from the beginning
        csv_file_text.seek(0)
        reader = csv.DictReader(csv_file_text) # Re-init the reader
        
        data_to_insert = []
        for row in reader:
            # Create a tuple for the row, ensuring columns are in the same order as db_columns
            # Handle empty strings as None (NULL) and map CSV headers to DB column names
            row_tuple = []
            for db_col in db_columns:
                # Find matching CSV header (case-insensitive)
                value = None
                for csv_header in csv_headers:
                    if csv_header.lower() == db_col.lower():
                        value = row[csv_header] if csv_header in row else None
                        break
                # If no match found, try direct match
                if value is None and db_col in row:
                    value = row[db_col]
                # Convert empty string to None
                value = None if value == '' else value
                row_tuple.append(value)
            data_to_insert.append(tuple(row_tuple))

        if not data_to_insert:
             return jsonify({'message': 'CSV file contains no data rows.'}), 400

        # Execute the bulk "upsert"
        # execute_values is highly efficient for this
        psycopg2.extras.execute_values(cur, query, data_to_insert)
        
        # Commit the transaction
        conn.commit()
        
        return jsonify({'message': f"Successfully updated {len(data_to_insert)} rows in '{table_name}'."}), 200

    except Exception as e:
        # Rollback any changes if an error occurs
        if conn:
            conn.rollback()
        print(f"Error during CSV upload: {e}")
        return jsonify({'message': 'An error occurred during processing.', 'error': str(e)}), 500
    
    finally:
        # Always close the connection
        if conn:
            cur.close()
            conn.close()