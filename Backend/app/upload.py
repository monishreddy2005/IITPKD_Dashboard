import os
import csv
import io
import psycopg2
import psycopg2.extras
from flask import Blueprint, request, jsonify
from .db import get_db_connection
from .auth import token_required, role_required

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
    'industry_courses': ['course_id'],
    'academic_program_launch': ['program_code'],
    'research_projects': ['project_id'],
    'research_mous': ['mou_id'],
    'research_patents': ['patent_id'],
    'research_publications': ['publication_id'],
    # 'users' and 'roles' are intentionally left out here for security.
    # You can add them if you need to, but be very careful.
    # 'roles': ['name'],
    # 'users': ['email'],
}

# Create a new Blueprint for our upload logic
upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload-csv', methods=['POST'])
@role_required('admin', 'administration')
def upload_csv(current_user_id, current_user_role_id):
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
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # First, check if the table exists
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND LOWER(table_name) = LOWER(%s)
            ) AS table_exists;
            """,
            (table_name,)
        )
        table_exists_result = cur.fetchone()
        if not table_exists_result or not table_exists_result.get('table_exists'):
            return jsonify({
                'message': (
                    f"Table '{table_name}' does not exist in the database. "
                    "Please ensure the table has been created by running the schema migration."
                )
            }), 400
        
        # Get the actual column names for this table from the database
        # We query information_schema.columns to get metadata
        # Handle case-insensitive table name matching
        # Also check for SERIAL columns (columns with sequence defaults)
        cur.execute(
            """
            SELECT 
                c.column_name, 
                c.is_generated,
                c.column_default,
                c.data_type
            FROM information_schema.columns c
            WHERE c.table_schema = 'public' AND LOWER(c.table_name) = LOWER(%s)
            ORDER BY c.ordinal_position;
            """,
            (table_name,)
        )
        db_columns_rows = cur.fetchall()
        
        # Filter out generated columns and SERIAL columns (columns with sequence defaults)
        # Also track which columns are SERIAL so we can allow them in CSV (they'll be ignored)
        db_columns = []
        serial_columns = []
        for row in db_columns_rows:
            column_name = row['column_name']
            is_generated = (row.get('is_generated') or 'NEVER').upper()
            column_default = row.get('column_default') or ''
            data_type = row.get('data_type') or ''
            
            # Skip if it's a generated column
            if is_generated == 'ALWAYS':
                continue
            
            # Check if it's a SERIAL column (has a sequence default like "nextval('table_column_seq'::regclass)")
            is_serial = (
                column_default.startswith("nextval(") or
                (data_type in ('integer', 'bigint', 'smallint') and 'nextval' in column_default.lower())
            )
            
            if is_serial:
                serial_columns.append(column_name)
                continue
            
            db_columns.append(column_name)
        
        if not db_columns:
            # Provide more diagnostic information
            all_columns = [row['column_name'] for row in db_columns_rows]
            generated_columns = [
                row['column_name'] 
                for row in db_columns_rows 
                if (row.get('is_generated') or 'NEVER').upper() == 'ALWAYS'
            ]
            return jsonify({
                'message': (
                    f"Could not determine uploadable columns for table '{table_name}'. "
                    "All columns appear to be generated or the table has no columns."
                ),
                'details': {
                    'total_columns_found': len(db_columns_rows),
                    'all_columns': all_columns,
                    'generated_columns': generated_columns,
                    'suggestion': 'Ensure the table exists and has at least one non-generated column that can be updated via CSV.'
                }
            }), 400
        
        # Normalize column names for comparison (case-insensitive)
        csv_headers_lower = [h.lower() for h in csv_headers]
        db_columns_lower = [c.lower() for c in db_columns]
        
        # Get all column names from database (including SERIAL/generated) for reference
        all_db_columns = [row['column_name'] for row in db_columns_rows]
        all_db_columns_lower = [c.lower() for c in all_db_columns]
        
        # Check if CSV has all required columns (db_columns must be in CSV)
        missing_in_csv = [db_columns[i] for i, col in enumerate(db_columns_lower) if col not in csv_headers_lower]
        if missing_in_csv:
            return jsonify({
                'message': 'Column mismatch: CSV is missing required columns.',
                'details': {
                    'missing_in_csv': missing_in_csv,
                    'expected_columns': db_columns,
                    'received_columns': csv_headers,
                    'note': 'SERIAL columns (like employeeid) are auto-generated and should be excluded from CSV, or will be ignored if present.'
                }
            }), 400
        
        # Check for extra columns in CSV that don't exist in database at all
        # Allow SERIAL columns in CSV (they'll be ignored during insert)
        serial_columns_lower = [c.lower() for c in serial_columns]
        extra_in_csv = [
            csv_headers[i] 
            for i, col in enumerate(csv_headers_lower) 
            if col not in all_db_columns_lower and col not in serial_columns_lower
        ]
        if extra_in_csv:
            return jsonify({
                'message': 'Column mismatch: CSV contains columns that do not exist in the database.',
                'details': {
                    'extra_in_csv': extra_in_csv,
                    'expected_columns': db_columns,
                    'received_columns': csv_headers,
                    'all_database_columns': all_db_columns,
                    'serial_columns_ignored': serial_columns,
                    'note': 'SERIAL columns (like employeeid) are auto-generated and will be ignored if present in CSV.'
                }
            }), 400
        
        # If CSV has SERIAL columns that we filtered out, that's okay - we'll just ignore them
        # This is handled in the data preparation step below
        
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
        
        # Build the conflict action depending on whether we have update columns
        if update_cols:
            update_assignments = ", ".join([f'"{c}" = EXCLUDED."{c}"' for c in update_cols])
            conflict_action = f"DO UPDATE SET {update_assignments}"
        else:
            conflict_action = "DO NOTHING"

        # The final query template
        # `VALUES %s` is the placeholder for psycopg2.extras.execute_values
        query = f"""
            INSERT INTO "{table_name}" ({cols_sql})
            VALUES %s
            ON CONFLICT ({conflict_sql}) {conflict_action};
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

@upload_bp.route('/download-template/<table_name>', methods=['GET'])
@token_required
def download_template(current_user_id, current_user_role_id, table_name):
    """
    Downloads a CSV template for a specified table.
    The template includes column headers and example rows.
    """
    # Normalize table name
    table_name_lower = table_name.lower()
    
    # Check if table is in the allowed list
    if table_name_lower not in UPDATABLE_TABLES:
        return jsonify({'message': f'Table "{table_name}" is not available for template download.'}), 400
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor()
        
        # Get table columns (excluding SERIAL columns)
        cur.execute("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position;
        """, (table_name_lower,))
        columns = cur.fetchall()
        
        if not columns:
            return jsonify({'message': f'Table "{table_name}" not found in database.'}), 404
        
        # Filter out SERIAL columns (auto-generated)
        serial_patterns = ['nextval', 'sequence']
        csv_columns = []
        for col in columns:
            col_name = col['column_name']
            col_default = col['column_default'] or ''
            is_serial = any(pattern in str(col_default).lower() for pattern in serial_patterns)
            
            if not is_serial:
                csv_columns.append(col_name)
        
        if not csv_columns:
            return jsonify({'message': f'No downloadable columns found for table "{table_name}".'}), 400
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(csv_columns)
        
        # Write example rows (2-3 examples with placeholder data)
        example_count = min(3, len(csv_columns))
        for i in range(example_count):
            example_row = []
            for col in csv_columns:
                # Generate example data based on column name
                col_lower = col.lower()
                if 'email' in col_lower:
                    example_row.append(f'example{i+1}@example.com')
                elif 'name' in col_lower or 'title' in col_lower:
                    example_row.append(f'Example {col.replace("_", " ").title()} {i+1}')
                elif 'year' in col_lower or 'date' in col_lower:
                    if 'year' in col_lower:
                        example_row.append(str(2020 + i))
                    else:
                        example_row.append(f'2024-01-{i+1:02d}')
                elif 'id' in col_lower and col_lower != 'id':
                    example_row.append(f'ID{i+1}')
                elif 'code' in col_lower:
                    example_row.append(f'CODE{i+1}')
                elif 'gender' in col_lower:
                    example_row.append('Male' if i == 0 else 'Female' if i == 1 else 'Other')
                elif 'status' in col_lower or 'type' in col_lower:
                    example_row.append('Active' if i == 0 else 'Inactive' if i == 1 else 'Pending')
                elif 'amount' in col_lower or 'package' in col_lower or 'salary' in col_lower:
                    example_row.append(str(100000 + i * 50000))
                elif 'count' in col_lower or 'number' in col_lower:
                    example_row.append(str(10 + i * 5))
                elif 'boolean' in str(col['data_type']).lower() or 'bool' in str(col['data_type']).lower():
                    example_row.append('TRUE' if i == 0 else 'FALSE')
                else:
                    example_row.append(f'Example Value {i+1}')
            writer.writerow(example_row)
        
        # Prepare response
        output.seek(0)
        csv_content = output.getvalue()
        output.close()
        
        # Create response with CSV file
        from flask import Response
        response = Response(
            csv_content,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename="{table_name}_template.csv"'
            }
        )
        return response
        
    except Exception as e:
        print(f"Template download error: {e}")
        return jsonify({'message': f'Error generating template: {str(e)}'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()