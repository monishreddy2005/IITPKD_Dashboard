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
    # ✅ CORRECT
    'employment_history': ['employeeid', 'designationid', 'dateofjoining'],  # Uses SERIAL ID
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
    'startups': ['startup_name', 'year_of_incubation'],  # Composite unique key
    'innovation_projects': ['project_title', 'year_started'],  # Composite unique key
    'industry_events': ['event_title', 'event_date'],  # Composite unique key
    'industry_conclave': ['year'],  # One conclave per year
    'open_house': ['event_year', 'event_date'],  # Composite unique key
    'nptel_local_chapters': ['chapter_name'],  # Single unique key
    'nptel_courses': ['course_code', 'offering_year', 'offering_semester'],  # Composite unique key
    'nptel_enrollments': ['enrollment_id'],  # Uses SERIAL ID
    'uba_projects': ['project_id'],  # Uses SERIAL ID
    'uba_events': ['event_id'],  # Uses SERIAL ID
    'nirf_ranking': ['year'],
    # 'users' and 'roles' are intentionally left out here for security.
    # You can add them if you need to, but be very careful.
    # 'roles': ['name'],
    # 'users': ['email'],
}

# Create a new Blueprint for our upload logic
upload_bp = Blueprint('upload', __name__)

def safe_rollback(conn):
    """Safely rollback a database connection, handling cases where it might be closed."""
    if conn:
        try:
            if not conn.closed:
                conn.rollback()
        except (psycopg2.InterfaceError, AttributeError):
            # Connection is already closed or invalid, ignore
            pass

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

        # --- PRE-PROCESSING for 'uba_events' ---
        # The CSV template has 'project_title', but the DB needs 'project_id'.
        # We need to look up these IDs and inject them into the CSV stream before validation.
        if table_name == 'uba_events' and csv_headers and 'project_title' in csv_headers:
            # We need to consume the reader to process rows, so we'll rebuild the stream later
            rows = list(reader)
            
            if not rows:
                 return jsonify({'message': 'CSV file is empty.'}), 400

            # 1. Get all unique project titles from the CSV
            titles = set(row.get('project_title', '').strip() for row in rows if row.get('project_title'))
            
            if not titles:
                return jsonify({'message': 'No project_title found in CSV rows.'}), 400
                
            # 2. Query the DB to get the mapping {title -> id}
            lookup_conn = get_db_connection()
            if lookup_conn:
                cur = lookup_conn.cursor()  # Returns RealDictCursor (dictionaries)
                try:
                    # Use ANY(ARRAY[...]) for efficient lookup
                    cur.execute(
                        "SELECT project_title, project_id FROM uba_projects WHERE LOWER(project_title) = ANY(%s)",
                        (list(t.lower() for t in titles),)
                    )
                    mapping_rows = cur.fetchall()
                    # Create a lookup dictionary: lower(title) -> id
                    # Fixed: Using dictionary keys since RealDictCursor returns dicts
                    title_to_id = {row['project_title'].lower(): row['project_id'] for row in mapping_rows}
                    
                finally:
                    cur.close()
                    lookup_conn.close()
            else:
                return jsonify({'message': 'Database connection failed during lookup.'}), 500
            
            # 3. Validation: specific error for missing projects
            missing_projects = [t for t in titles if t.lower() not in title_to_id]
            if missing_projects:
                return jsonify({
                    'message': 'Project Lookup Failed',
                    'details': f"The following project titles were not found in the database: {', '.join(missing_projects)}. Please ensure strings match exactly."
                }), 400
                
            # 4. Rewrite the rows with project_id
            processed_rows = []
            
            # Update headers: Remove 'project_title' and add 'project_id'
            new_headers = [h for h in csv_headers if h != 'project_title']
            if 'project_id' not in new_headers:
                new_headers.append('project_id')
            
            for row in rows:
                title = row.get('project_title', '').strip()
                if title:
                    pid = title_to_id.get(title.lower())
                    row['project_id'] = pid
                
                # Remove the title key so it doesn't trigger "unknown column" error
                if 'project_title' in row:
                    del row['project_title']
                
                processed_rows.append(row)
            
            # 5. Re-create the csv_file_text stream
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=new_headers)
            writer.writeheader()
            writer.writerows(processed_rows)
            
            # Reset stream position and replace the original variables
            output.seek(0)
            csv_file_text = output
            reader = csv.DictReader(csv_file_text) # Re-init reader for the next steps
            csv_headers = reader.fieldnames # Refresh headers

        # --- PRE-PROCESSING for 'nptel_enrollments' ---
        # The CSV template has 'course_code', but the DB needs 'course_id'.
        # We need to look up these IDs using (course_code, year, semester)
        if table_name == 'nptel_enrollments' and csv_headers and 'course_code' in csv_headers:
            rows = list(reader)
            if not rows:
                 return jsonify({'message': 'CSV file is empty.'}), 400

            # 1. Get unique tuples for lookup
            # We assume enrollment_year/semester match offering_year/semester
            lookup_keys = set()
            for row in rows:
                c_code = row.get('course_code', '').strip()
                year = row.get('enrollment_year', '').strip()
                sem = row.get('enrollment_semester', '').strip()
                if c_code and year:
                     lookup_keys.add((c_code, year, sem))
            
            if not lookup_keys:
                 return jsonify({'message': 'No course_code/year found in CSV rows.'}), 400

            # 2. Query DB
            lookup_map = {} # (code, year, sem) -> course_id
            lookup_conn = get_db_connection()
            if lookup_conn:
                cur = lookup_conn.cursor()
                try:
                    # Construct WHERE clause dynamically or fetch candidates
                    # For simplicity, let's fetch matching courses
                    # Note: We cast year to int in Python if needed, but DB handles string comparison too usually
                    # Better to be safe with types. 'year' from CSV is string.
                    
                    code_list = [k[0] for k in lookup_keys]
                    cur.execute(
                        "SELECT course_id, course_code, offering_year, offering_semester FROM nptel_courses WHERE course_code = ANY(%s)",
                        (code_list,)
                    )
                    matches = cur.fetchall()
                    
                    # Build map: (code, str(year), sem) -> id
                    # normalizing keys to strings for safe lookup
                    for m in matches:
                        k = (
                            m['course_code'].strip(), 
                            str(m['offering_year']), 
                            (m['offering_semester'] or '').strip()
                        )
                        lookup_map[k] = m['course_id']
                        
                finally:
                    cur.close()
                    lookup_conn.close()
            else:
                 return jsonify({'message': 'Database connection failed during lookup.'}), 500

            # 3. Rewrite rows
            processed_rows = []
            new_headers = [h for h in csv_headers if h != 'course_code']
            if 'course_id' not in new_headers:
                new_headers.append('course_id')

            missing_lookups = []

            for row in rows:
                c_code = row.get('course_code', '').strip()
                year = row.get('enrollment_year', '').strip()
                sem = row.get('enrollment_semester', '').strip()
                
                # Try exact match first
                key = (c_code, year, sem)
                cid = lookup_map.get(key)
                
                # Fallback: if semester is empty in CSV or DB, try matching just code and year?
                # For now strict match.
                
                if cid:
                    row['course_id'] = cid
                else:
                    if c_code: missing_lookups.append(f"{c_code} ({year} {sem})")
                
                if 'course_code' in row:
                    del row['course_code']
                processed_rows.append(row)

            if missing_lookups:
                 return jsonify({
                    'message': 'Course Lookup Failed',
                    'details': f"Could not find course_id for: {', '.join(missing_lookups[:5])}... Ensure NPTEL Courses are uploaded first."
                }), 400

            # 4. Re-create stream
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=new_headers)
            writer.writeheader()
            writer.writerows(processed_rows)
            output.seek(0)
            csv_file_text = output
            reader = csv.DictReader(csv_file_text)
            csv_headers = reader.fieldnames

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
                c.data_type,
                c.is_nullable
            FROM information_schema.columns c
            WHERE c.table_schema = 'public' AND LOWER(c.table_name) = LOWER(%s)
            ORDER BY c.ordinal_position;
            """,
            (table_name,)
        )
        db_columns_rows = cur.fetchall()
        
        # Filter out generated columns, SERIAL columns, and columns with DEFAULT values
        # Columns with defaults are optional in CSV (database will use default if not provided)
        # Also track which columns are SERIAL/optional so we can allow them in CSV (they'll be ignored/optional)
        db_columns = []
        serial_columns = []
        optional_columns = []  # Columns with DEFAULT values (non-SERIAL)
        not_null_columns = set() # Track required columns

        for row in db_columns_rows:
            column_name = row['column_name']
            is_generated = (row.get('is_generated') or 'NEVER').upper()
            column_default = row.get('column_default') or ''
            data_type = row.get('data_type') or ''
            is_nullable = (row.get('is_nullable') or 'YES').upper()
            
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
            
            # Check if column has a DEFAULT value OR is NULLABLE (making it optional in CSV)
            # Examples: DEFAULT CURRENT_TIMESTAMP, DEFAULT 0, DEFAULT 'value', etc.
            if (column_default or is_nullable == 'YES') and not is_serial:
                optional_columns.append(column_name)
                continue  # Skip from required columns, but allow in CSV if present
            
            db_columns.append(column_name)
            
            if is_nullable == 'NO':
                not_null_columns.add(column_name.lower())
        
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
                    'optional_columns': optional_columns,
                    'note': 'SERIAL columns (like employeeid) are auto-generated and should be excluded from CSV, or will be ignored if present. Columns with DEFAULT values (like created_at) are optional.'
                }
            }), 400
        
        # Check for extra columns in CSV that don't exist in database at all
        # Allow SERIAL columns and optional columns (with DEFAULT values) in CSV
        # SERIAL columns will be ignored during insert, optional columns will use their values if provided
        serial_columns_lower = [c.lower() for c in serial_columns]
        optional_columns_lower = [c.lower() for c in optional_columns]
        extra_in_csv = [
            csv_headers[i] 
            for i, col in enumerate(csv_headers_lower) 
            if col not in all_db_columns_lower and col not in serial_columns_lower and col not in optional_columns_lower
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
                    'optional_columns': optional_columns,
                    'note': 'SERIAL columns (like employeeid) are auto-generated and will be ignored if present in CSV. Columns with DEFAULT values (like created_at) are optional and will use their values if provided.'
                }
            }), 400
        
        # If CSV has SERIAL columns that we filtered out, that's okay - we'll just ignore them
        # Optional columns (with DEFAULT values) can be included in CSV and will be used if provided
        # This is handled in the data preparation step below
        
        # Map CSV headers to DB column names (handle case differences)
        # Include both required columns (db_columns) and optional columns if present in CSV
        csv_to_db_map = {}
        all_uploadable_columns = db_columns + optional_columns  # Include optional columns for mapping
        for csv_header in csv_headers:
            # Skip SERIAL columns (they'll be ignored)
            if csv_header.lower() in [c.lower() for c in serial_columns]:
                continue
            for db_col in all_uploadable_columns:
                if csv_header.lower() == db_col.lower():
                    csv_to_db_map[csv_header] = db_col
                    break
        
        # 5. --- Database Upsert (INSERT... ON CONFLICT) ---
        
        # Get the conflict key(s) (primary/unique) for this table
        conflict_keys = UPDATABLE_TABLES.get(table_name, [])
        if not conflict_keys:
             conflict_keys = [] # Fallback
        
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
        
        # Determine which columns to actually insert (required + optional if present in CSV)
        # Optional columns that are in CSV should be included
        columns_to_insert = db_columns.copy()
        for opt_col in optional_columns:
            if opt_col.lower() in csv_headers_lower:
                columns_to_insert.append(opt_col)
        
        # Update columns are all columns that are not conflict keys
        update_cols = [col for col in columns_to_insert if col not in conflict_keys_db]

        # --- Build the dynamic, but SAFE, SQL query ---
        # We use f-strings safely here because 'table_name' and column names
        # are validated against our whitelist and database metadata, NOT raw user input.
        
        # "col1", "col2", ...
        cols_sql = ", ".join([f'"{c}"' for c in columns_to_insert])
        
        # "key1", "key2", ...
        conflict_sql = ", ".join([f'"{c}"' for c in conflict_keys_db])
        
        # Build the conflict action depending on whether we have update columns
        if update_cols and conflict_keys_db:
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
        rows_processed = 0
        for i, row in enumerate(reader, start=1):
            # Create a tuple for the row, ensuring columns are in the same order as columns_to_insert
            # Handle empty strings as None (NULL) and map CSV headers to DB column names
            row_tuple = []
            is_empty_row = True
            
            for db_col in columns_to_insert:
                # Find matching CSV header (case-insensitive)
                value = None
                for csv_header in csv_headers:
                    if csv_header.lower() == db_col.lower():
                        value = row[csv_header] if csv_header in row else None
                        break
                # If no match found, try direct match
                if value is None and db_col in row:
                    value = row[db_col]
                
                # Check for empty string
                if value is not None and value.strip() == '':
                    value = None
                
                if value is not None:
                     is_empty_row = False
                
                # Validate NOT NULL
                if value is None and db_col.lower() in not_null_columns:
                     return jsonify({'message': f"Validation Error on Row {i}: Column '{db_col}' cannot be empty."}), 400

                row_tuple.append(value)
            
            if not is_empty_row:
                 # --- DATA NORMALIZATION ---
                 # Apply smart corrections before adding to the list
                 normalized_tuple = list(row_tuple)
                 
                 for idx, db_col in enumerate(columns_to_insert):
                     val = normalized_tuple[idx]
                     if val is None: continue
                     
                     val_str = str(val).strip()
                     
                     # 1. Boolean normalization (Yes/No -> True/False)
                     # Check if column is likely boolean
                     if db_col.lower() in ['pwd', 'is_active', 'is_from_iitpkd', 'pwd_exs', 'certification_earned', 'is_top_recruiter', 'isactive']:
                         if val_str.lower() in ['yes', 'y', 'true', '1']:
                             normalized_tuple[idx] = 'TRUE'
                         elif val_str.lower() in ['no', 'n', 'false', '0']:
                             normalized_tuple[idx] = 'FALSE'
                             
                     # 2. Student Program normalization (B.Tech -> BTech)
                     # Only apply if table is student (to avoid side effects)
                     if table_name == 'student' and db_col.lower() == 'program':
                         normalized_tuple[idx] = val_str.replace('.', '')
                         
                     # 3. Category normalization (General -> Gen)
                     if db_col.lower() == 'category' and val_str.lower() == 'general':
                         normalized_tuple[idx] = 'Gen'

                     # 4. Student Status normalization (Active -> Ongoing)
                     if table_name == 'student' and db_col.lower() == 'status':
                         if val_str.lower() == 'active':
                             normalized_tuple[idx] = 'Ongoing'

                 data_to_insert.append(tuple(normalized_tuple))
                 rows_processed += 1


        if not data_to_insert:
             return jsonify({'message': 'CSV file contains no data rows.'}), 400

        # --- DEDUPLICATION: Remove duplicate rows based on conflict keys ---
        # PostgreSQL's ON CONFLICT cannot handle duplicate keys within the same INSERT statement
        # We deduplicate by keeping the first occurrence of each unique key combination
        duplicates_removed = 0
        if conflict_keys_db:
            seen_keys = set()
            deduplicated_data = []
            
            # Find indices of conflict key columns in columns_to_insert
            conflict_indices = []
            for key in conflict_keys_db:
                for idx, col in enumerate(columns_to_insert):
                    if col.lower() == key.lower():
                        conflict_indices.append(idx)
                        break
            
            for row_tuple in data_to_insert:
                # Create a tuple of conflict key values for this row
                key_tuple = tuple(row_tuple[i] for i in conflict_indices if i < len(row_tuple))
                
                # Skip if we've seen this key combination before
                if key_tuple in seen_keys:
                    duplicates_removed += 1
                    continue
                
                seen_keys.add(key_tuple)
                deduplicated_data.append(row_tuple)
            
            data_to_insert = deduplicated_data
        
        if not data_to_insert:
             return jsonify({
                 'message': 'CSV file contains no unique data rows after deduplication.',
                 'details': 'All rows were duplicates based on the unique key(s) for this table.'
             }), 400

        # Execute the bulk "upsert"
        # execute_values is highly efficient for this
        psycopg2.extras.execute_values(cur, query, data_to_insert)
        
        # Commit the transaction
        conn.commit()
        
        message = f"Successfully updated {len(data_to_insert)} rows in '{table_name}'."
        if duplicates_removed > 0:
            message += f" Removed {duplicates_removed} duplicate row(s) based on unique key(s): {', '.join(conflict_keys_db)}."
        
        return jsonify({'message': message}), 200

    except psycopg2.errors.UniqueViolation as e:
        safe_rollback(conn)
        return jsonify({
            'message': 'Duplicate Entry Error',
            'details': f"A record with this ID or unique key already exists. Error: {str(e).split('DETAIL:')[-1].strip()}"
        }), 409

    except psycopg2.errors.InvalidTextRepresentation as e:
        safe_rollback(conn)
        return jsonify({
            'message': 'Data Format Error',
            'details': f"Invalid value for a column (likely an Enum or Date). Please check your values. Error: {str(e).strip()}"
        }), 400

    except psycopg2.errors.NotNullViolation as e:
        safe_rollback(conn)
        return jsonify({
            'message': 'Missing Required Data',
            'details': f"A required field is missing. Error: {str(e).strip()}"
        }), 400

    except psycopg2.errors.DatatypeMismatch as e:
        safe_rollback(conn)
        return jsonify({
            'message': 'Data Type Mismatch',
            'details': f"Value has incorrect type. Error: {str(e).strip()}"
        }), 400

    except psycopg2.errors.ForeignKeyViolation as e:
        safe_rollback(conn)
        return jsonify({
            'message': 'Foreign Key Constraint Violation',
            'details': f"Referenced record not found. Please ensure you have uploaded the dependent data first. Error: {str(e).split('DETAIL:')[-1].strip()}"
        }), 400

    except Exception as e:
        # Rollback any changes if an error occurs
        safe_rollback(conn)
        print(f"Error during CSV upload: {e}")
        return jsonify({'message': 'An error occurred during processing.', 'error': str(e)}), 500
    
    finally:
        # Always close the connection
        if conn:
            try:
                # Close cursor if it exists (it's only defined after the main DB connection)
                cur.close()
            except (NameError, AttributeError, psycopg2.InterfaceError):
                # cur doesn't exist or is already closed, ignore
                pass
            try:
                if not conn.closed:
                    conn.close()
            except (AttributeError, psycopg2.InterfaceError):
                # Connection is already closed or invalid, ignore
                pass