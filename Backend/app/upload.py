"""
CSV upload endpoint: secure bulk-upsert to any whitelisted database table.

Security: table name is validated against UPDATABLE_TABLES before any DB
interaction. Column names come from information_schema, not raw user input.
"""
import csv
import io
import traceback

import psycopg2
import psycopg2.extras
from flask import Blueprint, jsonify, request

from .auth import token_required
from .db import get_db_connection

upload_bp = Blueprint('upload', __name__)

# Maps allowed table name → its unique/conflict key column(s) for ON CONFLICT.
# Extend this list whenever a new table should be uploadable.
UPDATABLE_TABLES = {
    # Core
    'department':                   ['deptcode'],
    'alumni':                       ['sl_no'],
    'employees':                    ['id'],
    'courses_table':                ['course_code'],
    'student_table':                ['roll_no_current'],
    # Grievance / Welfare
    'externship_info':              ['externid'],
    'igrs_yearwise':                ['grievance_year'],
    'icc_yearwise':                 ['complaints_year'],
    'ewd_yearwise':                 ['ewd_year'],
    'faculty_engagement':           ['engagement_code'],
    # Placement
    'placement_summary':            ['placement_year', 'program', 'gender'],
    'placement_companies':          ['company_id'],
    'placement_packages':           ['placement_year', 'program'],
    # Research
    'icsr_sponsered_projects':      ['project_id'],
    'icsr_consultancy_projects':    ['project_id'],
    'icsr_csr':                     ['csr_id'],
    'research_mous':                ['mou_id'],
    'research_patents':             ['patent_id'],
    'research_publications':        ['publication_id'],
    # Innovation
    'innovation_projects':          ['project_title', 'year_started'],
    'iptif_startup_table':          ['id'],
    'iptif_program_table':          ['id'],
    'iptif_projects_table':         ['project_id'],
    'iptif_facilities_table':       ['facility_id'],
    'techin_startup_table':         ['id'],
    'techin_program_table':         ['id'],
    'techin_skill_development_program': ['id'],
    # Industry Connect
    'industry_events':              ['project_id'],
    'industry_conclave':            ['conclave_id'],
    # Outreach
    'open_house':                   ['event_year', 'event_date'],
    'uba_projects':                 ['project_id'],
    'uba_events':                   ['event_id'],
    'outreach':                     ['id'],
    'nptel_courses':                ['id'],
    # Rankings
    'nirf_ranking':                 ['year'],
}


def safe_rollback(conn):
    """Safely rolls back a connection that may already be closed."""
    if conn and not conn.closed:
        try:
            conn.rollback()
        except (psycopg2.InterfaceError, AttributeError):
            pass


# ---------------------------------------------------------------------------
# Per-table pre-processing helpers
# ---------------------------------------------------------------------------

def _preprocess_employees(reader, csv_headers):
    """
    For the 'employees' table:
    - Renames 'group' → 'group_name' (reserved SQL word).
    - Drops any existing 'id' column and auto-generates it as empid+designation+doj.
    - Normalises date columns from DD/MM/YY to YYYY-MM-DD.
    """
    DATE_COLS = {'dob', 'initial_doj', 'doj', 'dor', 'notificationdate'}

    def _norm_date(val):
        if not val or not val.strip():
            return val
        val = val.strip()
        if len(val) == 10 and val[4] == '-':
            return val  # Already ISO
        parts = val.replace('-', '/').split('/')
        if len(parts) == 3:
            day, month, year = parts
            if len(year) == 2:
                yr = int(year)
                year = str(2000 + yr) if yr <= 30 else str(1900 + yr)
            return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        return val

    rows = list(reader)
    if not rows:
        return None, None, 'CSV file is empty.'

    new_headers = ['id'] + [
        'group_name' if h.lower() == 'group' else h
        for h in csv_headers if h.lower() != 'id'
    ]

    processed = []
    for row in rows:
        new_row = {}
        for k, v in row.items():
            if k.lower() == 'id':
                continue
            key = 'group_name' if k.lower() == 'group' else k
            new_row[key] = _norm_date(v) if key.lower() in DATE_COLS else v

        empid = (new_row.get('empid') or '').strip()
        desig  = (new_row.get('designation') or '').strip()
        doj    = (new_row.get('doj') or '').strip()
        new_row['id'] = f"{empid}{desig}{doj}"
        processed.append(new_row)

    return _rebuild_stream(new_headers, processed)


def _preprocess_student_table(reader, csv_headers):
    """
    For the 'student_table':
    Renames human-readable CSV column names to their snake_case database equivalents.
    """
    RENAME_MAP = {
        'aadhar number':                      'aadhar_number',
        'preparatory ay':                     'preparatory_ay',
        'withdrawn/ terminated':              'withdrawn_terminated',
        'date of withdrawal/ termination':    'date_of_withdrawal_termination',
        'ay of withdrawal/ termination':      'ay_of_withdrawal_termination',
        'reason for withdrawal/ termination': 'reason_for_withdrawal_termination',
    }

    needs_rename = any(h.lower() in RENAME_MAP for h in csv_headers)
    if not needs_rename:
        return reader, csv_headers, None

    rows = list(reader)
    new_headers = [RENAME_MAP.get(h.lower(), h) for h in csv_headers]

    processed = []
    for row in rows:
        new_row = {}
        for old_key, val in row.items():
            new_key = RENAME_MAP.get(old_key.lower(), old_key)
            new_row[new_key] = val
        processed.append(new_row)

    return _rebuild_stream(new_headers, processed)


def _preprocess_uba_events(reader, csv_headers, conn):
    """
    For the 'uba_events' table:
    Accepts 'project_title' in CSV and resolves it to 'project_id' via DB lookup.
    """
    if 'project_title' not in csv_headers:
        return reader, csv_headers, None

    rows = list(reader)
    if not rows:
        return None, None, 'CSV file is empty.'

    titles = {r.get('project_title', '').strip() for r in rows if r.get('project_title')}
    if not titles:
        return None, None, 'No project_title values found in CSV.'

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "SELECT project_title, project_id FROM uba_projects WHERE LOWER(project_title) = ANY(%s)",
            ([t.lower() for t in titles],)
        )
        title_to_id = {r['project_title'].lower(): r['project_id'] for r in cur.fetchall()}
    finally:
        cur.close()

    missing = [t for t in titles if t.lower() not in title_to_id]
    if missing:
        return None, None, (
            f"Project titles not found in database: {', '.join(missing)}. "
            "Ensure strings match exactly."
        )

    new_headers = [h for h in csv_headers if h != 'project_title']
    if 'project_id' not in new_headers:
        new_headers.append('project_id')

    processed = []
    for row in rows:
        title = row.pop('project_title', '').strip()
        row['project_id'] = title_to_id.get(title.lower())
        processed.append(row)

    return _rebuild_stream(new_headers, processed)


def _preprocess_nptel_enrollments(reader, csv_headers, conn):
    """
    For the 'nptel_enrollments' table:
    Accepts 'course_code' in CSV and resolves it to 'course_id' via DB lookup.
    """
    if 'course_code' not in csv_headers:
        return reader, csv_headers, None

    rows = list(reader)
    if not rows:
        return None, None, 'CSV file is empty.'

    codes = [r.get('course_code', '').strip() for r in rows if r.get('course_code')]

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "SELECT course_id, course_code, offering_year, offering_semester FROM nptel_courses WHERE course_code = ANY(%s)",
            (codes,)
        )
        lookup = {
            (r['course_code'].strip(), str(r['offering_year']), (r['offering_semester'] or '').strip()): r['course_id']
            for r in cur.fetchall()
        }
    finally:
        cur.close()

    new_headers = [h for h in csv_headers if h != 'course_code']
    if 'course_id' not in new_headers:
        new_headers.append('course_id')

    missing, processed = [], []
    for row in rows:
        code = row.pop('course_code', '').strip()
        year = row.get('enrollment_year', '').strip()
        sem  = row.get('enrollment_semester', '').strip()
        cid  = lookup.get((code, year, sem))
        if cid:
            row['course_id'] = cid
        elif code:
            missing.append(f"{code} ({year} {sem})")
        processed.append(row)

    if missing:
        return None, None, (
            f"Could not find course_id for: {', '.join(missing[:5])}. "
            "Ensure NPTEL Courses are uploaded first."
        )

    return _rebuild_stream(new_headers, processed)


def _rebuild_stream(headers, rows):
    """Serialises processed rows back into a DictReader-ready StringIO stream."""
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)
    buf.seek(0)
    reader = csv.DictReader(buf)
    return reader, reader.fieldnames, None


# ---------------------------------------------------------------------------
# Upload route
# ---------------------------------------------------------------------------

@upload_bp.route('/upload-csv', methods=['POST'])
@token_required
def upload_csv(current_user_id):
    """
    Handles CSV → DB bulk upsert (INSERT … ON CONFLICT DO UPDATE).

    Flow:
    1. Validate table name against UPDATABLE_TABLES whitelist.
    2. Apply per-table pre-processing (FK lookups, column renames, etc.).
    3. Validate CSV headers against actual DB schema.
    4. Deduplicate rows on the conflict key.
    5. Execute bulk upsert.
    """
    if 'table_name' not in request.form:
        return jsonify({'message': 'No table_name specified.'}), 400
    if 'csv_file' not in request.files or request.files['csv_file'].filename == '':
        return jsonify({'message': 'No CSV file provided.'}), 400

    file = request.files['csv_file']
    if not file.filename.endswith('.csv'):
        return jsonify({'message': 'File is not a CSV.'}), 400

    # Validate table name against the whitelist (case-insensitive)
    table_name_lower = request.form['table_name'].lower()
    table_name = next(
        (t for t in UPDATABLE_TABLES if t.lower() == table_name_lower), None
    )
    if not table_name:
        return jsonify({'message': f"Updating table '{request.form['table_name']}' is not allowed."}), 403
    
    # Log upload attempt
    print(f"\n{'='*80}")
    print(f"CSV UPLOAD INITIATED")
    print(f"{'='*80}")
    print(f"File: {file.filename}")
    print(f"Table: {table_name}")
    print(f"User ID: {current_user_id}")
    print(f"{'='*80}\n")

    conn = None
    try:
        csv_text = io.StringIO(file.stream.read().decode('utf-8'))
        reader   = csv.DictReader(csv_text)
        csv_headers = reader.fieldnames or []
        
        # Strip BOM from the first column name if present
        if csv_headers and csv_headers[0].startswith('\ufeff'):
            original_first = csv_headers[0]
            csv_headers = [csv_headers[0].lstrip('\ufeff')] + csv_headers[1:]
            # Also update the reader's fieldnames
            reader.fieldnames = csv_headers
            print(f"\n{'='*80}")
            print(f"BOM DETECTED AND STRIPPED")
            print(f"{'='*80}")
            print(f"Original first column: {repr(original_first)}")
            print(f"Corrected first column: {repr(csv_headers[0])}")
            print(f"{'='*80}\n")
        
        if not csv_headers:
            return jsonify({'message': 'CSV file is empty or headers are missing.'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'message': 'Database connection failed.'}), 500

        # --- Per-table pre-processing ---
        error = None
        if table_name == 'employees':
            reader, csv_headers, error = _preprocess_employees(reader, csv_headers)
        elif table_name == 'student_table':
            reader, csv_headers, error = _preprocess_student_table(reader, csv_headers)
        elif table_name == 'uba_events' and 'project_title' in csv_headers:
            reader, csv_headers, error = _preprocess_uba_events(reader, csv_headers, conn)
        elif table_name == 'nptel_enrollments' and 'course_code' in csv_headers:
            reader, csv_headers, error = _preprocess_nptel_enrollments(reader, csv_headers, conn)

        if error:
            print(f"\n{'='*80}")
            print(f"PRE-PROCESSING ERROR - Table: {table_name}")
            print(f"{'='*80}")
            print(f"Error: {error}")
            print(f"{'='*80}\n")
            return jsonify({'message': error, 'error_type': 'preprocessing_error'}), 400

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check the table exists
        cur.execute(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_schema = 'public' AND LOWER(table_name) = LOWER(%s)) AS ok;",
            (table_name,)
        )
        if not cur.fetchone()['ok']:
            return jsonify({'message': f"Table '{table_name}' does not exist in the database."}), 400

        # Fetch column metadata
        cur.execute(
            """
            SELECT column_name, is_generated, column_default, data_type, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'public' AND LOWER(table_name) = LOWER(%s)
            ORDER BY ordinal_position;
            """,
            (table_name,)
        )
        col_rows = cur.fetchall()

        db_columns, serial_cols, optional_cols, required_cols = [], [], [], set()
        for r in col_rows:
            if (r.get('is_generated') or 'NEVER').upper() == 'ALWAYS':
                continue
            default   = r.get('column_default') or ''
            nullable  = (r.get('is_nullable') or 'YES').upper()
            is_serial = default.startswith('nextval(')
            if is_serial:
                serial_cols.append(r['column_name'])
                continue
            if default or nullable == 'YES':
                optional_cols.append(r['column_name'])
            db_columns.append(r['column_name'])
            if nullable == 'NO' and not default:
                required_cols.add(r['column_name'].lower())

        if not db_columns:
            return jsonify({'message': f"No uploadable columns found for '{table_name}'."}), 400

        csv_lower    = [h.lower() for h in csv_headers]
        db_lower     = [c.lower() for c in db_columns]
        all_db_lower = [r['column_name'].lower() for r in col_rows]

        missing = [c for c in required_cols if c not in csv_lower]
        if missing:
            # Debug logging for missing columns
            print(f"\n{'='*80}")
            print(f"COLUMN MISMATCH ERROR - Table: {table_name}")
            print(f"{'='*80}")
            print(f"Missing required columns: {missing}")
            print(f"Expected required columns: {sorted(required_cols)}")
            print(f"CSV provided columns: {csv_headers}")
            print(f"Database required columns: {sorted([c for r in col_rows if (r.get('is_nullable') or 'YES').upper() == 'NO' and not (r.get('column_default') or '') for c in [r['column_name']]])}")
            print(f"{'='*80}\n")
            # Return enhanced error response
            return jsonify({
                'message': 'CSV is missing required columns.',
                'details': {
                    'missing_in_csv': missing,
                    'required_columns': sorted(list(required_cols)),
                    'provided_columns': csv_headers,
                    'expected_required': sorted([r['column_name'] for r in col_rows if (r.get('is_nullable') or 'YES').upper() == 'NO' and not (r.get('column_default') or '')]),
                },
                'error_type': 'missing_columns',
            }), 400

        serial_lower   = [c.lower() for c in serial_cols]
        optional_lower = [c.lower() for c in optional_cols]
        extra = [
            csv_headers[i] for i, h in enumerate(csv_lower)
            if h not in all_db_lower and h not in serial_lower and h not in optional_lower
        ]
        if extra:
            # Debug logging for extra columns
            print(f"\n{'='*80}")
            print(f"COLUMN MISMATCH ERROR - Table: {table_name}")
            print(f"{'='*80}")
            print(f"Total CSV columns: {len(csv_headers)}")
            print(f"Total database columns: {len(col_rows)}")
            print(f"\nExtra/Unknown columns in CSV: {extra}")
            print(f"Number of extra columns: {len(extra)}")
            
            # Show detailed breakdown of each extra column
            print(f"\nDetailed breakdown of problematic columns:")
            for ex_col in extra:
                print(f"  - '{ex_col}' (lowercase: '{ex_col.lower()}')")
                # Try to find similar columns in database (case-insensitive)
                possible_matches = [
                    c for c in [r['column_name'] for r in col_rows]
                    if c.lower() == ex_col.lower()
                ]
                if possible_matches:
                    print(f"    → Found in DB with different case: {possible_matches}")
                else:
                    print(f"    → NOT found in database (even with case variations)")
            
            print(f"\nValid database columns (all {len(col_rows)}): {sorted([r['column_name'] for r in col_rows])}")
            print(f"CSV provided columns ({len(csv_headers)}): {csv_headers}")
            print(f"\nSerial/Auto-generated columns (skipped): {serial_cols}")
            print(f"Optional columns (skipped): {optional_cols}")
            print(f"Expected/Required columns: {db_columns}")
            print(f"{'='*80}\n")
            
            # Return enhanced error response
            return jsonify({
                'message': 'CSV contains columns not present in the database.',
                'details': {
                    'extra_in_csv': extra,
                    'expected_columns': db_columns,
                    'provided_columns': csv_headers,
                    'all_valid_columns': [r['column_name'] for r in col_rows],
                    'suggested_columns': [c for c in csv_headers if c.lower() not in extra],
                    'serial_columns': serial_cols,
                    'optional_columns': optional_cols,
                },
                'error_type': 'extra_columns',
            }), 400

        # Build INSERT … ON CONFLICT query
        conflict_keys = UPDATABLE_TABLES[table_name]
        columns_to_insert = [c for c in db_columns if c.lower() in csv_lower]
        conflict_keys_db  = [
            next((c for c in db_columns if c.lower() == k.lower()), k)
            for k in conflict_keys
        ]
        update_cols = [c for c in columns_to_insert if c not in conflict_keys_db]

        # Check if conflict key columns are actually present in the CSV
        conflict_keys_in_csv = [k for k in conflict_keys_db if k.lower() in csv_lower]

        cols_sql = ', '.join(f'"{c}"' for c in columns_to_insert)

        if conflict_keys_in_csv:
            # Normal upsert: conflict keys are in the CSV
            conflict_sql = ', '.join(f'"{c}"' for c in conflict_keys_db)
            conflict_action = (
                f"DO UPDATE SET {', '.join(f'{chr(34)}{c}{chr(34)} = EXCLUDED.{chr(34)}{c}{chr(34)}' for c in update_cols)}"
                if update_cols and conflict_keys_db else "DO NOTHING"
            )
            query = f'INSERT INTO "{table_name}" ({cols_sql}) VALUES %s ON CONFLICT ({conflict_sql}) {conflict_action};'
            use_truncate = False
        else:
            # Conflict keys not in CSV (e.g. auto-increment PK) — truncate and re-insert
            query = f'INSERT INTO "{table_name}" ({cols_sql}) VALUES %s;'
            use_truncate = True

        # Collect and normalise rows
        csv_text.seek(0)
        reader = csv.DictReader(csv_text)
        data, rows_processed = [], 0
        for i, row in enumerate(reader, start=1):
            row_vals, is_empty = [], True
            for col in columns_to_insert:
                val = next(
                    (row[h] for h in csv_headers if h.lower() == col.lower() and h in row),
                    row.get(col)
                )
                if val is not None and str(val).strip() == '':
                    val = None
                if val is not None:
                    is_empty = False
                if val is None and col.lower() in required_cols:
                    return jsonify({'message': f"Row {i}: '{col}' cannot be empty."}), 400
                row_vals.append(val)

            if is_empty:
                continue

            # Normalise booleans and enums
            norm = list(row_vals)
            BOOL_COLS = {'pwd', 'is_active', 'is_from_iitpkd', 'pwd_exs',
                         'certification_earned', 'is_top_recruiter', 'isactive'}
            for idx, col in enumerate(columns_to_insert):
                v = norm[idx]
                if v is None:
                    continue
                vs = str(v).strip()
                if col.lower() in BOOL_COLS:
                    norm[idx] = 'TRUE' if vs.lower() in {'yes', 'y', 'true', '1'} else (
                                 'FALSE' if vs.lower() in {'no', 'n', 'false', '0'} else v)
                if table_name == 'student_table' and col.lower() == 'program':
                    norm[idx] = vs.replace('.', '')
                if col.lower() == 'category' and vs.lower() == 'general':
                    norm[idx] = 'Gen'
                if table_name == 'student_table' and col.lower() == 'status' and vs.lower() == 'active':
                    norm[idx] = 'Ongoing'

            data.append(tuple(norm))
            rows_processed += 1

        if not data:
            return jsonify({'message': 'CSV contains no data rows.'}), 400

        # Deduplicate on conflict keys — psycopg2 cannot handle duplicates in the same INSERT
        dupes = 0
        if conflict_keys_db:
            key_indices = [
                next((i for i, c in enumerate(columns_to_insert) if c.lower() == k.lower()), None)
                for k in conflict_keys_db
            ]
            key_indices = [i for i in key_indices if i is not None]
            
            # Only deduplicate if we actually have some conflict key indices in the CSV
            if key_indices:
                seen, deduped = set(), []
                for row in data:
                    key = tuple(row[i] for i in key_indices)
                    if key in seen:
                        dupes += 1
                        continue
                    seen.add(key)
                    deduped.append(row)
                data = deduped
                if not data:
                    return jsonify({'message': 'No unique rows after deduplication.'}), 400

        # Validate string lengths before insertion to give precise error
        col_max_lengths = {r['column_name'].lower(): r['character_maximum_length'] for r in col_rows if r.get('character_maximum_length')}
        for row_idx, row in enumerate(data):
            for col_idx, col_name in enumerate(columns_to_insert):
                val = row[col_idx]
                max_len = col_max_lengths.get(col_name.lower())
                if val is not None and max_len is not None and len(str(val)) > max_len:
                    error_details = f"Value '{val}' (length {len(str(val))}) exceeds maximum length {max_len} for column '{col_name}' at row {row_idx + 1}."
                    print(f"\n{'='*80}")
                    print(f"VALIDATION ERROR - String Too Long")
                    print(f"{'='*80}")
                    print(f"Table: {table_name}")
                    print(f"Column: {col_name} (Max: {max_len})")
                    print(f"Value: '{val}' (Length: {len(str(val))})")
                    print(f"Row Index: {row_idx}")
                    print(f"Full Row: {row}")
                    print(f"{'='*80}\n")
                    return jsonify({
                        'message': 'Data Truncation Error', 
                        'details': error_details
                    }), 400

        if use_truncate:
            cur.execute(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE;')
        psycopg2.extras.execute_values(cur, query, data)
        conn.commit()

        if use_truncate:
            msg = f"Successfully replaced all data in '{table_name}' with {len(data)} rows."
        else:
            msg = f"Successfully updated {len(data)} rows in '{table_name}'."
        if dupes > 0:
            msg += f" Removed {dupes} duplicate row(s)."
        
        # Log successful upload
        print(f"\n{'='*80}")
        print(f"CSV UPLOAD SUCCESSFUL")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Rows processed: {rows_processed}")
        print(f"Rows inserted/updated: {len(data)}")
        if dupes > 0:
            print(f"Duplicate rows removed: {dupes}")
        print(f"Columns inserted: {columns_to_insert}")
        print(f"{'='*80}\n")
        
        return jsonify({'message': msg}), 200

    except psycopg2.errors.StringDataRightTruncation as e:
        safe_rollback(conn)
        error_msg = str(e).strip()
        print(f"\n{'='*80}")
        print(f"DATABASE ERROR - String Data Right Truncation")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error: {error_msg}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'Data Too Long For Column', 'details': error_msg}), 400
    except psycopg2.errors.UniqueViolation as e:
        safe_rollback(conn)
        error_msg = str(e).split('DETAIL:')[-1].strip()
        print(f"\n{'='*80}")
        print(f"DATABASE ERROR - Unique Violation")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error: {error_msg}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'Duplicate Entry Error', 'details': error_msg}), 409
    except psycopg2.errors.InvalidTextRepresentation as e:
        safe_rollback(conn)
        error_msg = str(e).strip()
        print(f"\n{'='*80}")
        print(f"DATABASE ERROR - Invalid Text Representation")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error: {error_msg}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'Data Format Error', 'details': error_msg}), 400
    except psycopg2.errors.NotNullViolation as e:
        safe_rollback(conn)
        error_msg = str(e).strip()
        print(f"\n{'='*80}")
        print(f"DATABASE ERROR - Not Null Violation")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error: {error_msg}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'Missing Required Data', 'details': error_msg}), 400
    except psycopg2.errors.DatatypeMismatch as e:
        safe_rollback(conn)
        error_msg = str(e).strip()
        print(f"\n{'='*80}")
        print(f"DATABASE ERROR - Data Type Mismatch")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error: {error_msg}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'Data Type Mismatch', 'details': error_msg}), 400
    except psycopg2.errors.ForeignKeyViolation as e:
        safe_rollback(conn)
        error_msg = str(e).split('DETAIL:')[-1].strip()
        print(f"\n{'='*80}")
        print(f"DATABASE ERROR - Foreign Key Violation")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error: {error_msg}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'Foreign Key Constraint Violation', 'details': error_msg}), 400
    except Exception as e:
        safe_rollback(conn)
        error_msg = str(e)
        print(f"\n{'='*80}")
        print(f"GENERAL ERROR - CSV Upload")
        print(f"{'='*80}")
        print(f"Table: {table_name}")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {error_msg}")
        print(f"Traceback:\n{traceback.format_exc()}")
        print(f"{'='*80}\n")
        return jsonify({'message': 'An error occurred during processing.', 'error': error_msg}), 500
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass