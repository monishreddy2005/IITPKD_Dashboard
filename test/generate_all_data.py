import random
import string
from datetime import datetime, timedelta

# Helper functions for generating random data

def random_string(length=10):
    """Generate a random string of given length."""
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))

def random_name():
    """Generate a random name."""
    first_names = ['John', 'Jane', 'Robert', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Emma',
                   'William', 'Olivia', 'Richard', 'Sophia', 'Joseph', 'Ava', 'Thomas', 'Isabella', 'Charles', 'Mia',
                   'Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Kavya', 'Arjun', 'Meera', 'Rohan', 'Sneha']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                  'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Menon', 'Pillai', 'Nair', 'Iyer']
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def random_email(name):
    """Generate a random email from name."""
    domains = ['iitpkd.ac.in', 'gmail.com', 'yahoo.com', 'outlook.com']
    name_clean = name.lower().replace(' ', '.')
    return f"{name_clean}@{random.choice(domains)}"

def random_phone():
    """Generate a random phone number."""
    return f"+91{random.randint(7000000000, 9999999999)}"

def random_date(start_year=1980, end_year=2024):
    """Generate a random date."""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    days = random.randint(0, delta.days)
    return start + timedelta(days=days)

def random_date_after(start_date, max_days=365*5):
    """Generate a random date after the given date."""
    days = random.randint(1, max_days)
    return start_date + timedelta(days=days)

# Student generation functions (from original script)
def rollno():
    a = 'b'
    for i in range(9):
        a += str(random.randint(0, 9))
    return a

def program():
    return random.choice(['BTech', 'MTech', 'MSc', 'MS', 'PhD'])

def yearofadmission():
    return random.randint(2015, 2025)

def batch():
    return random.choice(['Jan', 'Jul'])

def branch():
    return random.choice([
        'Civil Engineering',
        'Computer Science and Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Chemical Engineering',
        'Aerospace Engineering'
    ])

def department():
    return random.choice([
        'Civil Engineering',
        'Computer Science and Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Chemical Engineering',
        'Aerospace Engineering',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Humanities and Social Sciences'
    ])

def state():
    states_of_india = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
        "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
        "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]
    return random.choice(states_of_india)

def category():
    return random.choice(['Gen', 'EWS', 'OBC', 'SC', 'ST'])

def gender():
    return random.choice(['Male', 'Female', 'Transgender'])

def emp_gender():
    return random.choice(['Male', 'Female', 'Other'])

def status():
    return random.choice(['Graduated', 'Ongoing', 'Slowpace'])

def blood_group():
    return random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])

# Main generation functions for each table

def generate_roles(file):
    """Generate roles data."""
    roles = ['officials', 'administration', 'admin', 'faculty', 'staff', 'student']
    file.write('id,name\n')
    for i, role in enumerate(roles, 1):
        file.write(f"{i},{role}\n")
    return len(roles)

def generate_designations(file, count):
    """Generate designation data."""
    file.write('designationname,designationcadre,designationcategory,isactive\n')
    
    faculty_designations = [
        ('Professor', 'Faculty', 'Teaching'),
        ('Associate Professor', 'Faculty', 'Teaching'),
        ('Assistant Professor', 'Faculty', 'Teaching'),
        ('Adjunct Professor', 'Faculty', 'Teaching'),
        ('Visiting Professor', 'Faculty', 'Teaching'),
    ]
    
    staff_designations = [
        ('Technical Officer', 'Technical', 'Technical'),
        ('Senior Technical Officer', 'Technical', 'Technical'),
        ('Administrative Officer', 'Administrative', 'Administrative'),
        ('Senior Administrative Officer', 'Administrative', 'Administrative'),
        ('Clerk', 'Administrative', 'Administrative'),
        ('Accountant', 'Administrative', 'Administrative'),
        ('Lab Assistant', 'Technical', 'Technical'),
        ('System Administrator', 'Technical', 'Technical'),
    ]
    
    all_designations = faculty_designations + staff_designations
    
    for i in range(count):
        if i < len(all_designations):
            desig_name, cadre, category = all_designations[i]
        else:
            desig_name = f"Designation {i+1}"
            cadre = random.choice(['Faculty', 'Technical', 'Administrative'])
            category = random.choice(['Teaching', 'Technical', 'Administrative'])
        
        isactive = random.choice([True, True, True, False])  # Mostly active
        file.write(f"{desig_name},{cadre},{category},{isactive}\n")

def generate_departments(file):
    """Generate department data."""
    file.write('deptcode,deptname,coursesoffered,faculty,courselist\n')
    
    departments = [
        ('CE', 'Civil Engineering', 'CE101,CE102,CE201', 'Faculty names', 'CE101,CE102'),
        ('CSE', 'Computer Science and Engineering', 'CSE101,CSE102,CSE201', 'Faculty names', 'CSE101,CSE102'),
        ('EE', 'Electrical Engineering', 'EE101,EE102,EE201', 'Faculty names', 'EE101,EE102'),
        ('ME', 'Mechanical Engineering', 'ME101,ME102,ME201', 'Faculty names', 'ME101,ME102'),
        ('CH', 'Chemical Engineering', 'CH101,CH102,CH201', 'Faculty names', 'CH101,CH102'),
        ('AE', 'Aerospace Engineering', 'AE101,AE102,AE201', 'Faculty names', 'AE101,AE102'),
        ('MA', 'Mathematics', 'MA101,MA102,MA201', 'Faculty names', 'MA101,MA102'),
        ('PH', 'Physics', 'PH101,PH102,PH201', 'Faculty names', 'PH101,PH102'),
        ('CY', 'Chemistry', 'CY101,CY102,CY201', 'Faculty names', 'CY101,CY102'),
        ('HS', 'Humanities and Social Sciences', 'HS101,HS102,HS201', 'Faculty names', 'HS101,HS102'),
    ]
    
    for dept_code, dept_name, courses, faculty, courselist in departments:
        file.write(f"{dept_code},{dept_name},{courses},{faculty},{courselist}\n")

def generate_students(file, count):
    """Generate student data."""
    file.write('rollno,name,program,yearofadmission,batch,branch,department,pwd,state,category,gender,status\n')
    for _ in range(count):
        name = random_name()
        dept = department()
        roll = rollno()
        pwd_val = random.choice([True, False])
        line = ",".join([
            roll,
            name,
            program(),
            str(yearofadmission()),
            batch(),
            branch(),
            dept,
            str(pwd_val),
            state(),
            category(),
            gender(),
            status()
        ])
        file.write(line + "\n")

def generate_courses(file, count, dept_codes):
    """Generate course data."""
    file.write('coursecode,coursename,offeredbydept,offeredtoprogram,credit,coordinator,cocoordinator,currentstatus\n')
    
    course_prefixes = {
        'CE': 'CE', 'CSE': 'CSE', 'EE': 'EE', 'ME': 'ME', 'CH': 'CH',
        'AE': 'AE', 'MA': 'MA', 'PH': 'PH', 'CY': 'CY', 'HS': 'HS'
    }
    
    course_types = ['101', '102', '201', '202', '301', '302', '401', '402']
    
    generated_codes = set()
    
    for i in range(count):
        dept_code = random.choice(dept_codes)
        course_num = random.choice(course_types)
        course_code = f"{course_prefixes.get(dept_code, 'XX')}{course_num}"
        
        # Ensure uniqueness
        while course_code in generated_codes:
            course_num = random.choice(course_types)
            course_code = f"{course_prefixes.get(dept_code, 'XX')}{course_num}"
        generated_codes.add(course_code)
        
        course_name = f"{random.choice(['Introduction to', 'Advanced', 'Fundamentals of', 'Applied'])} {random.choice(['Engineering', 'Science', 'Mathematics', 'Technology'])}"
        program_val = program()
        credit = round(random.uniform(1.0, 4.0), 1)
        coordinator = random_name()
        cocoordinator = random_name() if random.choice([True, False]) else ''
        status_val = random.choice(['Active', 'Active', 'Active', 'Inactive'])
        
        file.write(f"{course_code},{course_name},{dept_code},{program_val},{credit},{coordinator},{cocoordinator},{status_val}\n")

def generate_employees(file, count, designation_ids, departments):
    """Generate employee data."""
    file.write('empname,email,phonenumber,bloodgroup,dateofbirth,gender,department,currentdesignationid,isactive,category,pwd_exs,state\n')
    
    generated_emails = set()
    
    for i in range(count):
        name = random_name()
        email = random_email(name)
        
        # Ensure unique email
        while email in generated_emails:
            email = random_email(name)
        generated_emails.add(email)
        
        phone = random_phone()
        bg = blood_group()
        dob = random_date(1970, 1995)
        gen = emp_gender()
        dept = random.choice(departments)
        desig_id = random.choice(designation_ids)
        isactive = random.choice([True, True, True, False])
        cat = category()
        pwd = random.choice([True, False])
        state_val = state()
        
        file.write(f"{name},{email},{phone},{bg},{dob.strftime('%Y-%m-%d')},{gen},{dept},{desig_id},{isactive},{cat},{pwd},{state_val}\n")

def generate_employment_history(file, count, employee_ids, designation_ids):
    """Generate employment history data."""
    file.write('employeeid,designationid,designation,dateofjoining,dateofrelieving,appointmentmode,natureofappointment,isonlien,lienstartdate,lienenddate,lienduration,status,remarks\n')
    
    natures = ['Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc']
    lien_types = ['Yes', 'No', 'NA']
    statuses = ['Active', 'Relieved', 'Transferred']
    appointment_modes = ['Direct', 'Promotion', 'Transfer', 'Contract']
    
    for i in range(count):
        emp_id = random.choice(employee_ids)
        desig_id = random.choice(designation_ids)
        desig_name = f"Designation {desig_id}"
        join_date = random_date(2010, 2023)
        
        # Some employees might be relieved
        if random.choice([True, True, False]):
            relieve_date = None
            emp_status = 'Active'
        else:
            relieve_date = random_date_after(join_date, 365*3)
            emp_status = random.choice(['Relieved', 'Transferred'])
        
        appointment = random.choice(appointment_modes)
        nature = random.choice(natures)
        lien = random.choice(lien_types)
        
        lien_start = None
        lien_end = None
        lien_duration = None
        if lien == 'Yes':
            lien_start = random_date_after(join_date, 365)
            lien_end = random_date_after(lien_start, 365)
            lien_duration = (lien_end - lien_start).days
        
        remarks = random.choice(['', 'Good performance', 'Promoted', 'Transferred'])
        
        file.write(f"{emp_id},{desig_id},{desig_name},{join_date.strftime('%Y-%m-%d')}," +
                  f"{relieve_date.strftime('%Y-%m-%d') if relieve_date else ''}," +
                  f"{appointment},{nature},{lien}," +
                  f"{lien_start.strftime('%Y-%m-%d') if lien_start else ''}," +
                  f"{lien_end.strftime('%Y-%m-%d') if lien_end else ''}," +
                  f"{lien_duration if lien_duration else ''}," +
                  f"{emp_status},{remarks}\n")

def generate_additional_roles(file, count, history_ids, employee_ids):
    """Generate additional roles data."""
    file.write('historyid,employeeid,roletype,department,startdate,enddate,status,remarks\n')
    
    role_types = ['Dean', 'Head of Department', 'Registrar', 'Treasurer', 'Examination Controller', 
                  'Placement Officer', 'Library Incharge', 'Lab Incharge', 'Sports Coordinator']
    statuses = ['Active', 'Relieved']
    
    for i in range(count):
        history_id = random.choice(history_ids)
        emp_id = random.choice(employee_ids)
        role_type = random.choice(role_types)
        dept = department()
        start_date = random_date(2020, 2024)
        
        if random.choice([True, False]):
            end_date = None
            status_val = 'Active'
        else:
            end_date = random_date_after(start_date, 365)
            status_val = 'Relieved'
        
        remarks = random.choice(['', 'Additional responsibility', 'Temporary assignment'])
        
        file.write(f"{history_id},{emp_id},{role_type},{dept},{start_date.strftime('%Y-%m-%d')}," +
                  f"{end_date.strftime('%Y-%m-%d') if end_date else ''}," +
                  f"{status_val},{remarks}\n")

def generate_externship_info(file, count, employee_ids):
    """Generate externship info data."""
    file.write('employeeid,empname,department,industry_name,startdate,enddate,type,remarks\n')
    
    industries = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'IBM', 'Oracle', 
                  'Intel', 'Samsung', 'HCL', 'Accenture', 'Cognizant', 'Tech Mahindra']
    types = ['Sabbatical', 'Research Collaboration', 'Industry Visit', 'Consulting', 'Training']
    
    for i in range(count):
        emp_id = random.choice(employee_ids)
        emp_name = random_name()
        dept = department()
        industry = random.choice(industries)
        start_date = random_date(2020, 2023)
        end_date = random_date_after(start_date, 180)  # Max 6 months
        type_val = random.choice(types)
        remarks = random.choice(['', 'Successful completion', 'Ongoing', 'Extended'])
        
        file.write(f"{emp_id},{emp_name},{dept},{industry},{start_date.strftime('%Y-%m-%d')}," +
                  f"{end_date.strftime('%Y-%m-%d')},{type_val},{remarks}\n")

def generate_alumni(file, count, student_rollnos):
    """Generate alumni data."""
    file.write('rollno,name,alumniidno,currentdesignation,jobcountry,jobplace\n')
    
    designations = ['Software Engineer', 'Data Scientist', 'Research Scientist', 'Product Manager',
                   'Senior Engineer', 'Principal Engineer', 'Manager', 'Director', 'Professor',
                   'Assistant Professor', 'Consultant', 'Entrepreneur']
    countries = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'Singapore', 'Japan']
    
    used_rollnos = set()
    
    for i in range(min(count, len(student_rollnos))):
        rollno_val = student_rollnos[i]
        
        # Ensure unique rollno
        while rollno_val in used_rollnos:
            rollno_val = random.choice(student_rollnos)
        used_rollnos.add(rollno_val)
        
        name = random_name()
        alumni_id = f"AL{random.randint(100000, 999999)}"
        desig = random.choice(designations)
        country = random.choice(countries)
        place = random.choice(['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 
                              'New York', 'London', 'Toronto', 'Sydney', 'Berlin'])
        
        file.write(f"{rollno_val},{name},{alumni_id},{desig},{country},{place}\n")

def generate_users(file, count, role_ids):
    """Generate users data."""
    file.write('email,username,password_hash,display_name,status,last_login_at,failed_login_attempts,role_id\n')
    
    # Note: In production, passwords should be properly hashed
    # For dummy data, we'll use placeholder hashes
    password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Z5Y5Y5Y5"  # Placeholder
    
    statuses = ['active', 'pending_verification', 'deactivated']
    
    generated_emails = set()
    
    for i in range(count):
        name = random_name()
        email = random_email(name)
        
        # Ensure unique email
        while email in generated_emails:
            email = random_email(name)
        generated_emails.add(email)
        
        username = email.split('@')[0]
        display_name = name
        status_val = random.choice(statuses)
        last_login = random_date(2023, 2024) if random.choice([True, False]) else None
        failed_attempts = random.randint(0, 3)
        role_id = random.choice(role_ids)
        
        file.write(f"{email},{username},{password_hash},{display_name}," +
                  f"{status_val},{last_login.strftime('%Y-%m-%d %H:%M:%S') if last_login else ''}," +
                  f"{failed_attempts},{role_id}\n")

def main():
    print("=== Database Dummy Data Generator ===\n")
    
    # Get counts for each table
    num_designations = int(input("Enter number of designations (default 10): ") or "10")
    num_students = int(input("Enter number of students (default 100): ") or "100")
    num_courses = int(input("Enter number of courses (default 50): ") or "50")
    num_employees = int(input("Enter number of employees (default 50): ") or "50")
    num_employment_history = int(input("Enter number of employment history records (default 60): ") or "60")
    num_additional_roles = int(input("Enter number of additional roles (default 20): ") or "20")
    num_externships = int(input("Enter number of externships (default 15): ") or "15")
    num_alumni = int(input("Enter number of alumni (default 30): ") or "30")
    num_users = int(input("Enter number of users (default 20): ") or "20")
    
    print("\nGenerating data files...")
    
    # Generate roles
    with open('roles.csv', 'w', encoding='utf-8') as f:
        num_roles = generate_roles(f)
        print(f"✓ Generated roles.csv ({num_roles} records)")
    
    # Generate designations
    with open('designations.csv', 'w', encoding='utf-8') as f:
        generate_designations(f, num_designations)
        print(f"✓ Generated designations.csv ({num_designations} records)")
    
    # Generate departments
    with open('departments.csv', 'w', encoding='utf-8') as f:
        generate_departments(f)
        print(f"✓ Generated departments.csv")
    
    # Generate students
    student_rollnos = []
    with open('students.csv', 'w', encoding='utf-8') as f:
        for i in range(num_students):
            roll = rollno()
            student_rollnos.append(roll)
        # Write header
        f.write('rollno,name,program,yearofadmission,batch,branch,department,pwd,state,category,gender,status\n')
        # Generate and write students
        for i in range(num_students):
            name = random_name()
            dept = department()
            pwd_val = random.choice([True, False])
            line = ",".join([
                student_rollnos[i],
                name,
                program(),
                str(yearofadmission()),
                batch(),
                branch(),
                dept,
                str(pwd_val),
                state(),
                category(),
                gender(),
                status()
            ])
            f.write(line + "\n")
        print(f"✓ Generated students.csv ({num_students} records)")
    
    # Get department codes for courses
    dept_codes = ['CE', 'CSE', 'EE', 'ME', 'CH', 'AE', 'MA', 'PH', 'CY', 'HS']
    
    # Generate courses
    with open('courses.csv', 'w', encoding='utf-8') as f:
        generate_courses(f, num_courses, dept_codes)
        print(f"✓ Generated courses.csv ({num_courses} records)")
    
    # Generate employees (need designation IDs)
    designation_ids = list(range(1, num_designations + 1))
    departments_list = ['Civil Engineering', 'Computer Science and Engineering', 'Electrical Engineering',
                       'Mechanical Engineering', 'Chemical Engineering', 'Aerospace Engineering',
                       'Mathematics', 'Physics', 'Chemistry', 'Humanities and Social Sciences']
    
    with open('employees.csv', 'w', encoding='utf-8') as f:
        generate_employees(f, num_employees, designation_ids, departments_list)
        print(f"✓ Generated employees.csv ({num_employees} records)")
        employee_ids = list(range(1, num_employees + 1))
    
    # Generate employment history
    with open('employment_history.csv', 'w', encoding='utf-8') as f:
        generate_employment_history(f, num_employment_history, employee_ids, designation_ids)
        print(f"✓ Generated employment_history.csv ({num_employment_history} records)")
        history_ids = list(range(1, num_employment_history + 1))
    
    # Generate additional roles
    with open('additional_roles.csv', 'w', encoding='utf-8') as f:
        generate_additional_roles(f, num_additional_roles, history_ids, employee_ids)
        print(f"✓ Generated additional_roles.csv ({num_additional_roles} records)")
    
    # Generate externship info
    with open('externship_info.csv', 'w', encoding='utf-8') as f:
        generate_externship_info(f, num_externships, employee_ids)
        print(f"✓ Generated externship_info.csv ({num_externships} records)")
    
    # Generate alumni
    with open('alumni.csv', 'w', encoding='utf-8') as f:
        generate_alumni(f, num_alumni, student_rollnos)
        print(f"✓ Generated alumni.csv ({num_alumni} records)")
    
    # Generate users
    role_ids = list(range(1, num_roles + 1))
    with open('users.csv', 'w', encoding='utf-8') as f:
        generate_users(f, num_users, role_ids)
        print(f"✓ Generated users.csv ({num_users} records)")
    
    print("\n✅ All data files generated successfully!")
    print("\nNote: Remember to import these files in the correct order to maintain foreign key relationships:")
    print("  1. roles.csv")
    print("  2. designations.csv")
    print("  3. departments.csv")
    print("  4. students.csv")
    print("  5. courses.csv")
    print("  6. employees.csv")
    print("  7. employment_history.csv")
    print("  8. additional_roles.csv")
    print("  9. externship_info.csv")
    print("  10. alumni.csv")
    print("  11. users.csv")

if __name__ == "__main__":
    main()

