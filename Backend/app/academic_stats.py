from flask import Blueprint, jsonify, request
from .db import get_db_connection
from .auth import token_required

academic_bp = Blueprint('academic', __name__)

def get_latest_year():
    """Returns the maximum yearofadmission from the student table."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        
        cur = conn.cursor()
        cur.execute("SELECT MAX(yearofadmission) as latest_year FROM student;")
        result = cur.fetchone()
        
        if result and result['latest_year']:
            return result['latest_year']
        return None
    except Exception as e:
        print(f"Error getting latest year: {e}")
        return None
    finally:
        if conn:
            cur.close()
            conn.close()

def build_filter_query(filters):
    """
    Builds a WHERE clause dynamically based on provided filters.
    Returns a tuple: (where_clause_string, parameter_list)
    """
    conditions = []
    params = []
    
    # Map filter names to database column names
    filter_mapping = {
        'yearofadmission': 'yearofadmission',
        'program': 'program',
        'batch': 'batch',
        'branch': 'branch',
        'department': 'department',
        'category': 'category',
        'pwd': 'pwd'
    }
    
    for filter_name, value in filters.items():
        if value is None or value == '' or value == 'All':
            continue
        
        column_name = filter_mapping.get(filter_name)
        if not column_name:
            continue
        
        # Handle boolean PWD filter
        if filter_name == 'pwd':
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

@academic_bp.route('/stats/filter-options', methods=['GET'])
@token_required
def get_filter_options(current_user_id):
    """Fetches distinct values for each filter field."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        cur = conn.cursor()
        
        # Get distinct values for each field
        filter_options = {}
        
        # Year of Admission
        cur.execute("SELECT DISTINCT yearofadmission FROM student ORDER BY yearofadmission DESC;")
        filter_options['yearofadmission'] = [row['yearofadmission'] for row in cur.fetchall()]
        
        # Program
        cur.execute("SELECT DISTINCT program FROM student ORDER BY program;")
        filter_options['program'] = [row['program'] for row in cur.fetchall()]
        
        # Batch
        cur.execute("SELECT DISTINCT batch FROM student ORDER BY batch;")
        filter_options['batch'] = [row['batch'] for row in cur.fetchall()]
        
        # Branch
        cur.execute("SELECT DISTINCT branch FROM student WHERE branch IS NOT NULL ORDER BY branch;")
        filter_options['branch'] = [row['branch'] for row in cur.fetchall()]
        
        # Department
        cur.execute("SELECT DISTINCT department FROM student WHERE department IS NOT NULL ORDER BY department;")
        filter_options['department'] = [row['department'] for row in cur.fetchall()]
        
        # Category
        cur.execute("SELECT DISTINCT category FROM student WHERE category IS NOT NULL ORDER BY category;")
        filter_options['category'] = [row['category'] for row in cur.fetchall()]
        
        # Get latest year
        latest_year = get_latest_year()
        filter_options['latest_year'] = latest_year
        
        return jsonify(filter_options), 200
        
    except Exception as e:
        print(f"Error fetching filter options: {e}")
        return jsonify({'message': 'An error occurred while fetching filter options.'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

@academic_bp.route('/stats/gender-distribution-filtered', methods=['GET'])
@token_required
def get_gender_distribution_filtered(current_user_id):
    """Fetches gender distribution based on provided filters."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'message': 'Database connection failed!'}), 500
        
        # Get filter parameters from query string
        filters = {
            'yearofadmission': request.args.get('yearofadmission', type=int),
            'program': request.args.get('program', type=str),
            'batch': request.args.get('batch', type=str),
            'branch': request.args.get('branch', type=str),
            'department': request.args.get('department', type=str),
            'category': request.args.get('category', type=str),
            'pwd': request.args.get('pwd', type=str)  # Will be "true", "false", or None
        }
        
        # Convert PWD string to boolean if provided
        if filters['pwd'] == 'true':
            filters['pwd'] = True
        elif filters['pwd'] == 'false':
            filters['pwd'] = False
        elif filters['pwd'] == '' or filters['pwd'] is None:
            filters['pwd'] = None
        
        # If yearofadmission is not provided, use latest year
        if filters['yearofadmission'] is None:
            latest_year = get_latest_year()
            if latest_year:
                filters['yearofadmission'] = latest_year
        
        # Build WHERE clause dynamically
        where_clause, params = build_filter_query(filters)
        
        # Build the query
        query = f"""
            SELECT gender, COUNT(*) as count
            FROM student
            {where_clause}
            GROUP BY gender
            ORDER BY gender;
        """
        
        cur = conn.cursor()
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Initialize gender counts
        gender_data = {
            'Male': 0,
            'Female': 0,
            'Transgender': 0
        }
        
        # Populate gender counts from results
        for row in results:
            gender = row['gender']
            if gender in gender_data:
                gender_data[gender] = row['count']
        
        # Calculate total
        total = sum(gender_data.values())
        
        # Build filters_applied dict (only include non-null filters)
        filters_applied = {
            k: v for k, v in filters.items() 
            if v is not None and v != '' and v != 'All'
        }
        
        return jsonify({
            'data': gender_data,
            'total': total,
            'filters_applied': filters_applied
        }), 200
        
    except Exception as e:
        print(f"Error fetching gender distribution: {e}")
        return jsonify({'message': 'An error occurred while fetching gender distribution.'}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

