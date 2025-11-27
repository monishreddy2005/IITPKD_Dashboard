from flask import Blueprint, jsonify, request
from .db import get_db_connection
from .auth import token_required
import psycopg2.extras

administrative_bp = Blueprint('administrative', __name__)

def build_filter_query(filters, use_aliases=True):
    """
    Builds a WHERE clause dynamically based on provided filters.
    Returns a tuple: (where_clause_string, parameter_list)
    """
    conditions = []
    params = []
    
    # Map filter names to database column names
    if use_aliases:
        filter_mapping = {
            'department': 'e.department',
            'designation': 'd.designationname',
            'gender': 'e.gender',
            'category': 'e.category',
            'cadre': 'd.designationcadre',
            'category_type': 'd.designationcategory',
            'isactive': 'e.isactive'
        }
    else:
        filter_mapping = {
            'department': 'department',
            'designation': 'designationname',
            'gender': 'gender',
            'category': 'category',
            'cadre': 'designationcadre',
            'category_type': 'designationcategory',
            'isactive': 'isactive'
        }
    
    for filter_name, value in filters.items():
        if value is None or value == '' or value == 'All':
            continue
        
        column_name = filter_mapping.get(filter_name)
        if not column_name:
            continue
        
        # Handle boolean filters
        if filter_name == 'isactive':
            if isinstance(value, bool):
                conditions.append(f"{column_name} = %s")
                params.append(value)
            elif value == 'true':
                conditions.append(f"{column_name} = %s")
                params.append(True)
            elif value == 'false':
                conditions.append(f"{column_name} = %s")
                params.append(False)
        else:
            conditions.append(f"{column_name} = %s")
            params.append(value)
    
    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)
    
    return where_clause, params

@administrative_bp.route('/stats/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    """Fetches distinct values for each filter field."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get distinct values for each field
        filter_options = {}
        
        # Department
        cur.execute("SELECT DISTINCT department FROM employee WHERE department IS NOT NULL ORDER BY department;")
        filter_options['department'] = [row['department'] for row in cur.fetchall()]
        
        # Designation
        cur.execute("""
            SELECT DISTINCT d.designationname 
            FROM designation d
            JOIN employee e ON d.designationid = e.currentdesignationid
            WHERE d.designationname IS NOT NULL
            ORDER BY d.designationname;
        """)
        filter_options['designation'] = [row['designationname'] for row in cur.fetchall()]
        
        # Gender
        cur.execute("SELECT DISTINCT gender FROM employee ORDER BY gender;")
        filter_options['gender'] = [row['gender'] for row in cur.fetchall()]
        
        # Category
        cur.execute("SELECT DISTINCT category FROM employee WHERE category IS NOT NULL ORDER BY category;")
        filter_options['category'] = [row['category'] for row in cur.fetchall()]
        
        # Cadre (Faculty/Staff distinction)
        cur.execute("""
            SELECT DISTINCT designationcadre 
            FROM designation 
            WHERE designationcadre IS NOT NULL
            ORDER BY designationcadre;
        """)
        filter_options['cadre'] = [row['designationcadre'] for row in cur.fetchall()]
        
        # Category Type
        cur.execute("""
            SELECT DISTINCT designationcategory 
            FROM designation 
            WHERE designationcategory IS NOT NULL
            ORDER BY designationcategory;
        """)
        filter_options['category_type'] = [row['designationcategory'] for row in cur.fetchall()]
        
        return jsonify(filter_options), 200
        
    except Exception as e:
        print(f"Error fetching filter options: {e}")
        return jsonify({'message': 'An error occurred while fetching filter options.'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

@administrative_bp.route('/stats/faculty-by-department-designation', methods=['GET'])
@token_required
def get_faculty_by_department_designation(current_user_id):
    """Fetches faculty count by department and designation."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        # Get filter parameters
        filters = {
            'department': request.args.get('department', type=str),
            'designation': request.args.get('designation', type=str),
            'gender': request.args.get('gender', type=str),
            'category': request.args.get('category', type=str),
            'cadre': request.args.get('cadre', type=str),
            'isactive': request.args.get('isactive', type=str)
        }
        
        # Convert isactive string to boolean
        if filters['isactive'] == 'true':
            filters['isactive'] = True
        elif filters['isactive'] == 'false':
            filters['isactive'] = False
        elif filters['isactive'] == '' or filters['isactive'] is None:
            filters['isactive'] = None
        
        # Build WHERE clause
        where_clause, params = build_filter_query(filters)
        
        # Default to active employees if not specified
        if filters['isactive'] is None:
            if where_clause:
                where_clause += " AND e.isactive = %s"
            else:
                where_clause = "WHERE e.isactive = %s"
            params.append(True)
        
        # Query to get faculty by department and designation
        # Assuming faculty is identified by cadre containing 'Faculty' or designationcategory
        faculty_condition = "(d.designationcadre ILIKE '%%Faculty%%' OR d.designationcategory ILIKE '%%Faculty%%' OR d.designationname ILIKE '%%Professor%%' OR d.designationname ILIKE '%%Assistant%%' OR d.designationname ILIKE '%%Associate%%')"
        if where_clause:
            where_clause += f" AND {faculty_condition}"
        else:
            where_clause = f"WHERE {faculty_condition}"
        
        query = """
            SELECT 
                COALESCE(e.department, 'Unknown') as department,
                COALESCE(d.designationname, 'Unknown') as designation,
                COUNT(*) as count
            FROM employee e
            LEFT JOIN designation d ON e.currentdesignationid = d.designationid
            """ + where_clause + """
            GROUP BY e.department, d.designationname
            ORDER BY e.department, d.designationname;
        """
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Organize data for stacked bar chart
        department_data = {}
        for row in results:
            dept = row['department']
            designation = row['designation']
            count = row['count']
            
            if dept not in department_data:
                department_data[dept] = {}
            
            department_data[dept][designation] = count
        
        # Convert to list format for chart
        data = []
        for dept, designations in department_data.items():
            entry = {'name': dept}
            for desig, count in designations.items():
                entry[desig] = count
            data.append(entry)
        
        total = sum(sum(designations.values()) for designations in department_data.values())
        
        return jsonify({
            'data': data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v is not None and v != '' and v != 'All'}
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching faculty by department: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching faculty data: {str(e)}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@administrative_bp.route('/stats/staff-count', methods=['GET'])
@token_required
def get_staff_count(current_user_id):
    """Fetches staff count (technical and administrative)."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        # Get filter parameters
        filters = {
            'department': request.args.get('department', type=str),
            'gender': request.args.get('gender', type=str),
            'category': request.args.get('category', type=str),
            'isactive': request.args.get('isactive', type=str)
        }
        
        # Convert isactive string to boolean
        if filters['isactive'] == 'true':
            filters['isactive'] = True
        elif filters['isactive'] == 'false':
            filters['isactive'] = False
        elif filters['isactive'] == '' or filters['isactive'] is None:
            filters['isactive'] = None
        
        # Build WHERE clause
        where_clause, params = build_filter_query(filters)
        
        # Default to active employees if not specified
        if filters['isactive'] is None:
            if where_clause:
                where_clause += " AND e.isactive = %s"
            else:
                where_clause = "WHERE e.isactive = %s"
            params.append(True)
        
        # Query to get staff count by type (technical vs administrative)
        # Assuming staff is identified by NOT being faculty
        staff_condition = "(d.designationcadre NOT ILIKE '%%Faculty%%' AND d.designationcategory NOT ILIKE '%%Faculty%%' AND d.designationname NOT ILIKE '%%Professor%%' AND d.designationname NOT ILIKE '%%Assistant%%' AND d.designationname NOT ILIKE '%%Associate%%' OR d.designationcadre IS NULL)"
        if where_clause:
            where_clause += f" AND {staff_condition}"
        else:
            where_clause = f"WHERE {staff_condition}"
        
        query = """
            SELECT 
                CASE 
                    WHEN d.designationcategory ILIKE '%%Technical%%' OR d.designationname ILIKE '%%Technical%%' THEN 'Technical'
                    WHEN d.designationcategory ILIKE '%%Administrative%%' OR d.designationname ILIKE '%%Administrative%%' THEN 'Administrative'
                    WHEN d.designationcadre NOT ILIKE '%%Faculty%%' AND d.designationcategory NOT ILIKE '%%Faculty%%' 
                        AND d.designationname NOT ILIKE '%%Professor%%' AND d.designationname NOT ILIKE '%%Assistant%%' 
                        AND d.designationname NOT ILIKE '%%Associate%%' THEN 'Administrative'
                    ELSE 'Other'
                END as staff_type,
                COUNT(*) as count
            FROM employee e
            LEFT JOIN designation d ON e.currentdesignationid = d.designationid
            """ + where_clause + """
            GROUP BY staff_type
            ORDER BY staff_type;
        """
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Organize data
        staff_data = {
            'Technical': 0,
            'Administrative': 0,
            'Other': 0
        }
        
        for row in results:
            staff_type = row['staff_type']
            count = row['count']
            if staff_type in staff_data:
                staff_data[staff_type] = count
        
        total = sum(staff_data.values())
        
        return jsonify({
            'data': staff_data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v is not None and v != '' and v != 'All'}
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching staff count: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching staff data: {str(e)}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@administrative_bp.route('/stats/gender-distribution', methods=['GET'])
@token_required
def get_gender_distribution(current_user_id):
    """Fetches gender-wise distribution for faculty and staff."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        # Get filter parameters
        employee_type = request.args.get('employee_type', type=str)  # 'Faculty' or 'Staff' or 'All'
        filters = {
            'department': request.args.get('department', type=str),
            'category': request.args.get('category', type=str),
            'isactive': request.args.get('isactive', type=str)
        }
        
        # Convert isactive string to boolean
        if filters['isactive'] == 'true':
            filters['isactive'] = True
        elif filters['isactive'] == 'false':
            filters['isactive'] = False
        elif filters['isactive'] == '' or filters['isactive'] is None:
            filters['isactive'] = None
        
        # Build WHERE clause
        where_clause, params = build_filter_query(filters)
        
        # Default to active employees if not specified
        if filters['isactive'] is None:
            if where_clause:
                where_clause += " AND e.isactive = %s"
            else:
                where_clause = "WHERE e.isactive = %s"
            params.append(True)
        
        # Add employee type filter
        faculty_condition = "(d.designationcadre ILIKE '%%Faculty%%' OR d.designationcategory ILIKE '%%Faculty%%' OR d.designationname ILIKE '%%Professor%%' OR d.designationname ILIKE '%%Assistant%%' OR d.designationname ILIKE '%%Associate%%')"
        staff_condition = "(d.designationcadre NOT ILIKE '%%Faculty%%' AND d.designationcategory NOT ILIKE '%%Faculty%%' AND d.designationname NOT ILIKE '%%Professor%%' AND d.designationname NOT ILIKE '%%Assistant%%' AND d.designationname NOT ILIKE '%%Associate%%' OR d.designationcadre IS NULL)"
        
        if employee_type == 'Faculty':
            if where_clause:
                where_clause += f" AND {faculty_condition}"
            else:
                where_clause = f"WHERE {faculty_condition}"
        elif employee_type == 'Staff':
            if where_clause:
                where_clause += f" AND {staff_condition}"
            else:
                where_clause = f"WHERE {staff_condition}"
        
        # Query to get gender distribution
        query = """
            SELECT 
                e.gender,
                COUNT(*) as count
            FROM employee e
            LEFT JOIN designation d ON e.currentdesignationid = d.designationid
            """ + where_clause + """
            GROUP BY e.gender
            ORDER BY e.gender;
        """
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Initialize gender counts
        gender_data = {
            'Male': 0,
            'Female': 0,
            'Other': 0
        }
        
        # Populate gender counts from results
        for row in results:
            gender = row['gender']
            if gender in gender_data:
                gender_data[gender] = row['count']
        
        total = sum(gender_data.values())
        
        return jsonify({
            'data': gender_data,
            'total': total,
            'employee_type': employee_type or 'All',
            'filters_applied': {k: v for k, v in filters.items() if v is not None and v != '' and v != 'All'}
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching gender distribution: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching gender distribution: {str(e)}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@administrative_bp.route('/stats/category-distribution', methods=['GET'])
@token_required
def get_category_distribution(current_user_id):
    """Fetches category-wise distribution for faculty and staff."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        # Get filter parameters
        employee_type = request.args.get('employee_type', type=str)  # 'Faculty' or 'Staff' or 'All'
        filters = {
            'department': request.args.get('department', type=str),
            'gender': request.args.get('gender', type=str),
            'isactive': request.args.get('isactive', type=str)
        }
        
        # Convert isactive string to boolean
        if filters['isactive'] == 'true':
            filters['isactive'] = True
        elif filters['isactive'] == 'false':
            filters['isactive'] = False
        elif filters['isactive'] == '' or filters['isactive'] is None:
            filters['isactive'] = None
        
        # Build WHERE clause
        where_clause, params = build_filter_query(filters)
        
        # Default to active employees if not specified
        if filters['isactive'] is None:
            if where_clause:
                where_clause += " AND e.isactive = %s"
            else:
                where_clause = "WHERE e.isactive = %s"
            params.append(True)
        
        # Add employee type filter
        faculty_condition = "(d.designationcadre ILIKE '%%Faculty%%' OR d.designationcategory ILIKE '%%Faculty%%' OR d.designationname ILIKE '%%Professor%%' OR d.designationname ILIKE '%%Assistant%%' OR d.designationname ILIKE '%%Associate%%')"
        staff_condition = "(d.designationcadre NOT ILIKE '%%Faculty%%' AND d.designationcategory NOT ILIKE '%%Faculty%%' AND d.designationname NOT ILIKE '%%Professor%%' AND d.designationname NOT ILIKE '%%Assistant%%' AND d.designationname NOT ILIKE '%%Associate%%' OR d.designationcadre IS NULL)"
        
        if employee_type == 'Faculty':
            if where_clause:
                where_clause += f" AND {faculty_condition}"
            else:
                where_clause = f"WHERE {faculty_condition}"
        elif employee_type == 'Staff':
            if where_clause:
                where_clause += f" AND {staff_condition}"
            else:
                where_clause = f"WHERE {staff_condition}"
        
        # Query to get category distribution
        query = """
            SELECT 
                COALESCE(e.category, 'Not Specified') as category,
                COUNT(*) as count
            FROM employee e
            LEFT JOIN designation d ON e.currentdesignationid = d.designationid
            """ + where_clause + """
            GROUP BY e.category
            ORDER BY e.category;
        """
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Organize data
        category_data = {}
        for row in results:
            category = row['category']
            count = row['count']
            category_data[category] = count
        
        total = sum(category_data.values())
        
        return jsonify({
            'data': category_data,
            'total': total,
            'employee_type': employee_type or 'All',
            'filters_applied': {k: v for k, v in filters.items() if v is not None and v != '' and v != 'All'}
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching category distribution: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching category distribution: {str(e)}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@administrative_bp.route('/stats/department-breakdown', methods=['GET'])
@token_required
def get_department_breakdown(current_user_id):
    """Fetches department-wise breakdown with gender and employee type."""
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        # Get filter parameters
        filters = {
            'category': request.args.get('category', type=str),
            'isactive': request.args.get('isactive', type=str)
        }
        
        # Convert isactive string to boolean
        if filters['isactive'] == 'true':
            filters['isactive'] = True
        elif filters['isactive'] == 'false':
            filters['isactive'] = False
        elif filters['isactive'] == '' or filters['isactive'] is None:
            filters['isactive'] = None
        
        # Build WHERE clause
        where_clause, params = build_filter_query(filters)
        
        # Default to active employees if not specified
        if filters['isactive'] is None:
            if where_clause:
                where_clause += " AND e.isactive = %s"
            else:
                where_clause = "WHERE e.isactive = %s"
            params.append(True)
        
        # Query to get department breakdown with gender and employee type
        query = """
            SELECT 
                COALESCE(e.department, 'Unknown') as department,
                e.gender,
                CASE 
                    WHEN d.designationcadre ILIKE '%%Faculty%%' OR d.designationcategory ILIKE '%%Faculty%%' 
                        OR d.designationname ILIKE '%%Professor%%' OR d.designationname ILIKE '%%Assistant%%' 
                        OR d.designationname ILIKE '%%Associate%%' THEN 'Faculty'
                    ELSE 'Staff'
                END as employee_type,
                COUNT(*) as count
            FROM employee e
            LEFT JOIN designation d ON e.currentdesignationid = d.designationid
            """ + where_clause + """
            GROUP BY e.department, e.gender, employee_type
            ORDER BY e.department, e.gender, employee_type;
        """
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Organize data for stacked bar chart
        department_data = {}
        for row in results:
            dept = row['department']
            gender = row['gender']
            emp_type = row['employee_type']
            count = row['count']
            
            if dept not in department_data:
                department_data[dept] = {
                    'Faculty_Male': 0,
                    'Faculty_Female': 0,
                    'Faculty_Other': 0,
                    'Staff_Male': 0,
                    'Staff_Female': 0,
                    'Staff_Other': 0
                }
            
            key = f"{emp_type}_{gender}"
            if key in department_data[dept]:
                department_data[dept][key] = count
        
        # Convert to list format for chart
        data = []
        for dept, counts in department_data.items():
            entry = {'name': dept, **counts}
            data.append(entry)
        
        total = sum(sum(dept.values()) for dept in department_data.values())
        
        return jsonify({
            'data': data,
            'total': total,
            'filters_applied': {k: v for k, v in filters.items() if v is not None and v != '' and v != 'All'}
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching department breakdown: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'message': f'An error occurred while fetching department breakdown: {str(e)}'}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

