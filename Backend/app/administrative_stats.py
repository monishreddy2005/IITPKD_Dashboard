from flask import Blueprint, jsonify, request
from .db import get_db_connection
from .auth import token_required
import psycopg2.extras
from datetime import date

administrative_bp = Blueprint('administrative', __name__)


# ---------------------------------------------------------------------------
# Helper: build dynamic WHERE clause from filter dict
# ---------------------------------------------------------------------------

def build_filter_query(filters):
    """
    Builds a WHERE clause dynamically based on provided filters.
    All queries now target the flat ``employees`` table (no JOINs).
    Returns a tuple: (where_clause_string, parameter_list)
    """
    conditions = []
    params = []

    filter_mapping = {
        'department': 'department',
        'designation': 'designation',
        'gender': 'gender',
        'emp_type': 'emp_type',
        'empstatus': 'empstatus',
        'group_name': 'group_name',
    }

    for filter_name, value in filters.items():
        if value is None or value == '' or value == 'All':
            continue

        column_name = filter_mapping.get(filter_name)
        if not column_name:
            continue

        conditions.append(f"{column_name} = %s")
        params.append(value)

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    return where_clause, params


def _append_active_default(where_clause, params, empstatus_value):
    """If the caller hasn't explicitly set empstatus, default to Active."""
    if empstatus_value is not None and empstatus_value != '' and empstatus_value != 'All':
        return where_clause, params          # already filtered
    if where_clause:
        where_clause += " AND empstatus = %s"
    else:
        where_clause = "WHERE empstatus = %s"
    params.append('Active')
    return where_clause, params


def _append_emp_type(where_clause, params, employee_type):
    """Append emp_type condition (Teaching / Non Teaching) if given."""
    if employee_type and employee_type != 'All':
        if where_clause:
            where_clause += " AND emp_type = %s"
        else:
            where_clause = "WHERE emp_type = %s"
        params.append(employee_type)
    return where_clause, params


def _read_common_filters():
    """Read filter query‑params shared by most endpoints."""
    return {
        'department': request.args.get('department', type=str),
        'designation': request.args.get('designation', type=str),
        'gender': request.args.get('gender', type=str),
        'emp_type': request.args.get('emp_type', type=str),
        'empstatus': request.args.get('empstatus', type=str),
        'group_name': request.args.get('group_name', type=str),
    }


# ======================================================================== #
#  ENDPOINTS                                                                #
# ======================================================================== #


@administrative_bp.route('/stats/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    """Fetches distinct values for each filter field from the employees table."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        filter_options = {}

        # Department
        cur.execute("SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department;")
        filter_options['department'] = [row['department'] for row in cur.fetchall()]

        # Designation
        cur.execute("SELECT DISTINCT designation FROM employees WHERE designation IS NOT NULL ORDER BY designation;")
        filter_options['designation'] = [row['designation'] for row in cur.fetchall()]

        # Gender
        cur.execute("SELECT DISTINCT gender FROM employees WHERE gender IS NOT NULL ORDER BY gender;")
        filter_options['gender'] = [row['gender'] for row in cur.fetchall()]

        # Employee Type (Teaching / Non Teaching)
        cur.execute("SELECT DISTINCT emp_type FROM employees WHERE emp_type IS NOT NULL ORDER BY emp_type;")
        filter_options['emp_type'] = [row['emp_type'] for row in cur.fetchall()]

        # Employee Status
        cur.execute("SELECT DISTINCT empstatus FROM employees WHERE empstatus IS NOT NULL ORDER BY empstatus;")
        filter_options['empstatus'] = [row['empstatus'] for row in cur.fetchall()]

        # Group Name
        cur.execute("SELECT DISTINCT group_name FROM employees WHERE group_name IS NOT NULL ORDER BY group_name;")
        filter_options['group_name'] = [row['group_name'] for row in cur.fetchall()]

        return jsonify(filter_options), 200

    except Exception as e:
        print(f"Error fetching filter options: {e}")
        return jsonify({'message': 'An error occurred while fetching filter options.'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/employee-overview', methods=['GET'])
@token_required
def get_employee_overview(current_user_id):
    """
    Department-wise breakdown by gender.
    Returns data suitable for a stacked bar chart.
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        filters = _read_common_filters()
        employee_type = filters.pop('emp_type', None)

        where_clause, params = build_filter_query(filters)
        where_clause, params = _append_active_default(where_clause, params, filters.get('empstatus'))
        where_clause, params = _append_emp_type(where_clause, params, employee_type)

        query = f"""
            SELECT
                COALESCE(department, 'Unknown') AS department,
                gender,
                COUNT(*) AS count
            FROM employees
            {where_clause}
            GROUP BY department, gender
            ORDER BY department, gender;
        """

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()

        # Organise into {dept: {Male: n, Female: n, ...}}
        department_data = {}
        for row in results:
            dept = row['department']
            gender = row['gender'] or 'Unknown'
            count = row['count']

            if dept not in department_data:
                department_data[dept] = {'Male': 0, 'Female': 0, 'Other': 0, 'Transgender': 0}

            if gender in ('Male', 'Female', 'Transgender'):
                department_data[dept][gender] = count
            else:
                department_data[dept]['Other'] += count

        data = [{'name': dept, **counts} for dept, counts in department_data.items()]
        total = sum(sum(d.values()) for d in department_data.values())

        return jsonify({
            'data': data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v and v != 'All'}
        }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching employee overview: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching employee overview: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/faculty-gender-last-five-years', methods=['GET'])
@token_required
def get_faculty_gender_last_five_years(current_user_id):
    """
    Faculty (Teaching) gender distribution for the last five calendar years.
    An employee is counted for a year if their doj <= year-end AND (dor IS NULL OR dor >= year-start).
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        current_year = date.today().year
        genders = ['Male', 'Female', 'Other', 'Transgender']

        year_labels = []
        for i in range(5, 0, -1):
            yr = current_year - i
            label = f"{yr}-{str((yr + 1) % 100).zfill(2)}"
            year_labels.append((yr, label))

        rows = []
        for year_start, label in year_labels:
            for gender in genders:
                cur.execute(
                    """
                    SELECT COUNT(*) AS count
                    FROM employees
                    WHERE doj <= make_date(%s, 12, 31)
                      AND (dor IS NULL OR dor >= make_date(%s, 1, 1))
                      AND gender = %s
                      AND emp_type = 'Teaching';
                    """,
                    (year_start, year_start, gender)
                )
                result = cur.fetchone()
                count = int(result['count']) if result and result.get('count') else 0
                rows.append({
                    'label': label,
                    'gender': gender,
                    'count': count
                })

        # Build per-year dict
        year_map = {}
        for row in rows:
            label = row['label']
            gender = row['gender']
            count = row['count']
            if label not in year_map:
                year_map[label] = {g: 0 for g in genders}
            if gender in genders:
                year_map[label][gender] = count

        labels = [label for _, label in year_labels]
        for _, label in year_labels:
            if label not in year_map:
                year_map[label] = {g: 0 for g in genders}

        data = []
        for label in labels:
            entry = {'year_label': label}
            entry.update(year_map[label])
            entry['total'] = sum(year_map[label].values())
            data.append(entry)

        return jsonify({'data': data}), 200

    except Exception as e:
        import traceback
        print(f"Error fetching faculty gender last five years: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'Failed to fetch faculty gender distribution: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/faculty-by-department-designation', methods=['GET'])
@token_required
def get_faculty_by_department_designation(current_user_id):
    """Department × designation breakdown."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        filters = _read_common_filters()
        employee_type = filters.pop('emp_type', None)

        where_clause, params = build_filter_query(filters)
        where_clause, params = _append_active_default(where_clause, params, filters.get('empstatus'))
        where_clause, params = _append_emp_type(where_clause, params, employee_type)

        query = f"""
            SELECT
                COALESCE(department, 'Unknown') AS department,
                COALESCE(designation, 'Unknown') AS designation,
                COUNT(*) AS count
            FROM employees
            {where_clause}
            GROUP BY department, designation
            ORDER BY department, designation;
        """

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()

        department_data = {}
        for row in results:
            dept = row['department']
            desig = row['designation']
            count = row['count']
            if dept not in department_data:
                department_data[dept] = {}
            department_data[dept][desig] = count

        data = []
        for dept, designations in department_data.items():
            entry = {'name': dept}
            for desig, count in designations.items():
                entry[desig] = count
            data.append(entry)

        total = sum(sum(d.values()) for d in department_data.values())

        return jsonify({
            'data': data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v and v != 'All'}
        }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching faculty by department: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching faculty data: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/staff-count', methods=['GET'])
@token_required
def get_staff_count(current_user_id):
    """
    Staff count grouped by emp_type (Teaching / Non Teaching).
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        filters = _read_common_filters()
        # Don't pop emp_type here — we want to allow filtering
        where_clause, params = build_filter_query(filters)
        where_clause, params = _append_active_default(where_clause, params, filters.get('empstatus'))

        query = f"""
            SELECT
                COALESCE(emp_type, 'Unknown') AS emp_type,
                COUNT(*) AS count
            FROM employees
            {where_clause}
            GROUP BY emp_type
            ORDER BY emp_type;
        """

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()

        staff_data = {}
        for row in results:
            staff_data[row['emp_type']] = row['count']

        total = sum(staff_data.values())

        return jsonify({
            'data': staff_data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v and v != 'All'}
        }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching staff count: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching staff data: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/gender-distribution', methods=['GET'])
@token_required
def get_gender_distribution(current_user_id):
    """Gender-wise distribution with optional emp_type filtering."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        filters = _read_common_filters()
        employee_type = filters.pop('emp_type', None)

        where_clause, params = build_filter_query(filters)
        where_clause, params = _append_active_default(where_clause, params, filters.get('empstatus'))
        where_clause, params = _append_emp_type(where_clause, params, employee_type)

        query = f"""
            SELECT gender, COUNT(*) AS count
            FROM employees
            {where_clause}
            GROUP BY gender
            ORDER BY gender;
        """

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()

        gender_data = {'Male': 0, 'Female': 0, 'Other': 0, 'Transgender': 0}
        for row in results:
            g = row['gender']
            if g in gender_data:
                gender_data[g] = row['count']
            else:
                gender_data[g] = row['count']

        total = sum(gender_data.values())

        return jsonify({
            'data': gender_data,
            'total': total,
            'employee_type': employee_type or 'All',
            'filters_applied': {k: v for k, v in filters.items() if v and v != 'All'}
        }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching gender distribution: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching gender distribution: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/category-distribution', methods=['GET'])
@token_required
def get_category_distribution(current_user_id):
    """
    Group-wise distribution (group_name: A, B, C …).
    Replaces the old category distribution (the category column no longer exists).
    """
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        filters = _read_common_filters()
        employee_type = filters.pop('emp_type', None)

        where_clause, params = build_filter_query(filters)
        where_clause, params = _append_active_default(where_clause, params, filters.get('empstatus'))
        where_clause, params = _append_emp_type(where_clause, params, employee_type)

        query = f"""
            SELECT
                COALESCE(group_name, 'Not Specified') AS group_name,
                COUNT(*) AS count
            FROM employees
            {where_clause}
            GROUP BY group_name
            ORDER BY group_name;
        """

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()

        group_data = {}
        for row in results:
            group_data[row['group_name']] = row['count']

        total = sum(group_data.values())

        return jsonify({
            'data': group_data,
            'total': total,
            'employee_type': employee_type or 'All',
            'filters_applied': {k: v for k, v in filters.items() if v and v != 'All'}
        }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching group distribution: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching group distribution: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/data-summary', methods=['GET'])
@token_required
def get_data_summary(current_user_id):
    """Diagnostic endpoint — quick stats from the employees table."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        summary = {}

        # Total employees
        cur.execute("SELECT COUNT(*) AS total FROM employees;")
        summary['total_employees'] = cur.fetchone()['total']

        # Active vs Relieved
        cur.execute("SELECT empstatus, COUNT(*) AS count FROM employees GROUP BY empstatus;")
        summary['status_distribution'] = {row['empstatus'] or 'Unknown': row['count'] for row in cur.fetchall()}

        # Gender distribution
        cur.execute("SELECT gender, COUNT(*) AS count FROM employees GROUP BY gender ORDER BY gender;")
        summary['gender_distribution'] = {row['gender'] or 'Unknown': row['count'] for row in cur.fetchall()}

        # Employee type distribution
        cur.execute("SELECT emp_type, COUNT(*) AS count FROM employees GROUP BY emp_type;")
        summary['employee_type_distribution'] = {row['emp_type'] or 'Unknown': row['count'] for row in cur.fetchall()}

        # Top departments
        cur.execute("""
            SELECT COALESCE(department, 'Unknown') AS dept, COUNT(*) AS count
            FROM employees
            GROUP BY department
            ORDER BY count DESC
            LIMIT 10;
        """)
        summary['top_departments'] = {row['dept']: row['count'] for row in cur.fetchall()}

        # Sample designations
        cur.execute("SELECT DISTINCT designation FROM employees WHERE designation IS NOT NULL LIMIT 10;")
        summary['sample_designations'] = [row['designation'] for row in cur.fetchall()]

        return jsonify(summary), 200

    except Exception as e:
        import traceback
        print(f"Error fetching data summary: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@administrative_bp.route('/stats/department-breakdown', methods=['GET'])
@token_required
def get_department_breakdown(current_user_id):
    """Department-wise breakdown with gender and employee type."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500

        filters = _read_common_filters()
        employee_type = filters.pop('emp_type', None)

        where_clause, params = build_filter_query(filters)
        where_clause, params = _append_active_default(where_clause, params, filters.get('empstatus'))
        where_clause, params = _append_emp_type(where_clause, params, employee_type)

        query = f"""
            SELECT
                COALESCE(department, 'Unknown') AS department,
                gender,
                COALESCE(emp_type, 'Unknown') AS employee_type,
                COUNT(*) AS count
            FROM employees
            {where_clause}
            GROUP BY department, gender, emp_type
            ORDER BY department, gender, emp_type;
        """

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()

        department_data = {}
        for row in results:
            dept = row['department']
            gender = row['gender'] or 'Unknown'
            emp_type = row['employee_type']
            count = row['count']

            if dept not in department_data:
                department_data[dept] = {
                    'Teaching_Male': 0, 'Teaching_Female': 0,
                    'Teaching_Other': 0, 'Teaching_Transgender': 0,
                    'Non Teaching_Male': 0, 'Non Teaching_Female': 0,
                    'Non Teaching_Other': 0, 'Non Teaching_Transgender': 0,
                }

            key = f"{emp_type}_{gender}"
            if key not in department_data[dept]:
                department_data[dept][key] = 0
            department_data[dept][key] = count

        data = [{'name': dept, **counts} for dept, counts in department_data.items()]
        total = sum(sum(d.values()) for d in department_data.values())

        return jsonify({
            'data': data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v and v != 'All'}
        }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching department breakdown: {e}\n{traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching department breakdown: {e}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()