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
                   'Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Kavya', 'Arjun', 'Meera', 'Rohan', 'Sneha',
                   'Suresh', 'Lakshmi', 'Karthik', 'Divya', 'Naveen', 'Pooja']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                  'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Nair',
                  'Krishnan', 'Raman', 'Subramanian', 'Venkatesh', 'Raghavan']
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

# Student generation functions - MATCHING EXACT SCHEMA
def rollno():
    """Generate roll number starting with digits."""
    return str(random.randint(100000000, 999999999))

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
        'CSE',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Mechanical',
        'Chemical Engineering',
        'Aerospace Engineering',
        'AI',
        'Data Science'
    ])

def department():
    return random.choice([
        'Civil Engineering',
        'Computer Science',
        'Computer Science and Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Mechanical Engg',
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

def category_student():
    """Category for students"""
    return random.choice(['Gen', 'EWS', 'OBC', 'SC', 'ST'])

def category_employee():
    """Category for employees - matches schema"""
    return random.choice(['UR', 'EWS', 'OBC_NCL', 'SC', 'ST'])

def gender():
    return random.choice(['Male', 'Female', 'Transgender'])

def emp_gender():
    return random.choice(['Male', 'Female', 'Other'])

def status():
    return random.choice(['Graduated', 'Ongoing', 'Slowpace'])

def blood_group():
    return random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])

def generate_employee_id(prefix='IITPKD', num=4):
    """Generate employee ID like IITPKD0010"""
    return f"{prefix}{random.randint(1000, 9999):04d}"

# Main generation functions for each table

def generate_students(file, count):
    """Generate student data - MATCHING EXACT SCHEMA COLUMN NAMES"""
    file.write('RollNo,Name,Program,YearOfAdmission,Batch,Branch,Department,PwD,State,Category,Gender,Status\n')
    for _ in range(count):
        roll = rollno()
        name = random_name()
        dept = department()
        pwd_val = random.choice(['Yes', 'No'])  # ENUM not boolean
        line = ",".join([
            roll,
            name,
            program(),
            str(yearofadmission()),
            batch(),
            branch(),
            dept,
            pwd_val,
            state(),
            category_student(),
            gender(),
            status()
        ])
        file.write(line + "\n")
    return [rollno() for _ in range(count)]

def generate_courses(file, count, dept_codes):
    """Generate course data - MATCHING EXACT SCHEMA"""
    file.write('CourseCode,CourseName,OfferedByDept,OfferedToProgram,Credit,Coordinator,CoCoordinator,CurrentStatus\n')
    
    course_prefixes = {
        'CSE': 'CS', 'CE': 'CE', 'EE': 'EE', 'ME': 'ME', 'CH': 'CH',
        'AE': 'AE', 'MA': 'MA', 'PH': 'PH', 'CY': 'CY', 'HS': 'HS'
    }
    
    course_types = ['101', '201', '301', '401', '501', '5101', '5603', '5202']
    
    generated_codes = set()
    
    for i in range(count):
        dept_code = random.choice(dept_codes)
        course_num = random.choice(course_types)
        course_code = f"{course_prefixes.get(dept_code, 'CS')}{course_num}"
        
        # Ensure uniqueness
        while course_code in generated_codes:
            course_num = random.choice(course_types)
            course_code = f"{course_prefixes.get(dept_code, 'CS')}{course_num}"
        generated_codes.add(course_code)
        
        course_names = [
            'Advanced Algorithms', 'Quantum Mechanics', 'Calculus I', 'Data Structures',
            'Machine Learning', 'Computer Networks', 'Operating Systems', 'Database Systems',
            'Linear Algebra', 'Probability and Statistics', 'Thermodynamics', 'Fluid Mechanics'
        ]
        course_name = random.choice(course_names)
        program_val = program()
        credit = round(random.uniform(1.0, 4.0), 1)
        coordinator = f"Dr. {random_name()}"
        cocoordinator = f"Dr. {random_name()}" if random.choice([True, False]) else ''
        status_val = random.choice(['Active', 'Active', 'Active', 'Inactive'])
        
        file.write(f"{course_code},{course_name},{dept_code},{program_val},{credit},{coordinator},{cocoordinator},{status_val}\n")

def generate_departments(file):
    """Generate department data - MATCHING EXACT SCHEMA"""
    file.write('DeptCode,DeptName,CoursesOffered,Faculty,CourseList\n')
    
    departments = [
        ('CE', 'Civil Engineering', 'CE101,CE102,CE201', 'Dr. Jasine, Dr. Krithika', 'CE101,CE102'),
        ('CSE', 'Computer Science and Engineering', 'MTech-DS, BTech-DS, CS501, CS5101', 'Dr. Jasine, Dr. Krithika, Dr. Sandeep', 'CS5101,CS5603,CS5202'),
        ('EE', 'Electrical Engineering', 'EE101,EE102,EE201', 'Dr. Faculty1, Dr. Faculty2', 'EE101,EE102'),
        ('ME', 'Mechanical Engineering', 'ME101,ME102,ME201', 'Dr. Faculty3, Dr. Faculty4', 'ME101,ME102'),
        ('CH', 'Chemical Engineering', 'CH101,CH102,CH201', 'Dr. Faculty5', 'CH101,CH102'),
        ('AE', 'Aerospace Engineering', 'AE101,AE102,AE201', 'Dr. Faculty6', 'AE101,AE102'),
        ('MA', 'Mathematics', 'MA101,MA102,MA201', 'Dr. Faculty7', 'MA101,MA102'),
        ('PH', 'Physics', 'PH101,PH201,PH301', 'Dr. YYYY, Dr. Faculty8', 'PH201,PH101'),
        ('CY', 'Chemistry', 'CY101,CY102,CY201', 'Dr. Faculty9', 'CY101,CY102'),
        ('HS', 'Humanities and Social Sciences', 'HS101,HS102,HS201', 'Dr. Faculty10', 'HS101,HS102'),
    ]
    
    for dept_code, dept_name, courses, faculty, courselist in departments:
        file.write(f"{dept_code},{dept_name},{courses},{faculty},{courselist}\n")

def generate_alumni(file, count, student_rollnos):
    """Generate alumni data - MATCHING EXACT SCHEMA"""
    file.write('RollNo,Name,AluminiIDNo,CurrentDesignation,JobCountry,JobPlace\n')
    
    designations = ['Software Engineer', 'Data Scientist', 'Research Scientist', 'Product Manager',
                   'Senior Engineer', 'Principal Engineer', 'Manager', 'Director', 'Professor',
                   'Assistant Professor', 'Consultant', 'Entrepreneur', 'Research Fellow']
    countries = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'Singapore', 'Japan']
    
    used_rollnos = set()
    alumni_ids = set()
    
    for i in range(min(count, len(student_rollnos))):
        rollno_val = student_rollnos[i] if i < len(student_rollnos) else rollno()
        
        # Ensure unique rollno
        while rollno_val in used_rollnos:
            rollno_val = random.choice(student_rollnos) if student_rollnos else rollno()
        used_rollnos.add(rollno_val)
        
        name = random_name()
        alumni_id = f"ALU{random.randint(2020, 2024)}-{random.randint(1, 999):03d}"
        while alumni_id in alumni_ids:
            alumni_id = f"ALU{random.randint(2020, 2024)}-{random.randint(1, 999):03d}"
        alumni_ids.add(alumni_id)
        
        desig = random.choice(designations)
        country = random.choice(countries)
        places = {
            'India': ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata'],
            'USA': ['New York', 'San Francisco', 'Seattle', 'Boston'],
            'UK': ['London', 'Manchester'],
            'Canada': ['Toronto', 'Vancouver'],
            'Germany': ['Berlin', 'Munich'],
            'Australia': ['Sydney', 'Melbourne'],
            'Singapore': ['Singapore'],
            'Japan': ['Tokyo', 'Osaka']
        }
        place = random.choice(places.get(country, ['Unknown']))
        
        file.write(f"{rollno_val},{name},{alumni_id},{desig},{country},{place}\n")

def generate_designations(file, count):
    """Generate designation data - MATCHING EXACT SCHEMA"""
    file.write('designationName,designationCadre,designationCategory,isActive\n')
    
    faculty_designations = [
        ('Assistant Professor', 'NA', 'Teaching'),
        ('Associate Professor', 'NA', 'Teaching'),
        ('Professor', 'NA', 'Teaching'),
        ('Adjunct Professor', 'NA', 'Teaching'),
        ('Visiting Professor', 'NA', 'Teaching'),
    ]
    
    staff_designations = [
        ('Technical Officer', 'Technical', 'Non-Teaching'),
        ('Senior Technical Officer', 'Technical', 'Non-Teaching'),
        ('Administrative Officer', 'Admin', 'Non-Teaching'),
        ('Senior Administrative Officer', 'Admin', 'Non-Teaching'),
        ('Clerk', 'Admin', 'Non-Teaching'),
        ('Accountant', 'Admin', 'Non-Teaching'),
        ('Lab Assistant', 'Technical', 'Non-Teaching'),
        ('System Administrator', 'Technical', 'Non-Teaching'),
    ]
    
    all_designations = faculty_designations + staff_designations
    
    for i in range(count):
        if i < len(all_designations):
            desig_name, cadre, category = all_designations[i]
        else:
            desig_name = f"Designation {i+1}"
            cadre = random.choice(['NA', 'Technical', 'Admin'])
            category = random.choice(['Teaching', 'Non-Teaching', 'Visiting'])
        
        isactive = random.choice([True, True, True, False])  # Mostly active
        file.write(f"{desig_name},{cadre},{category},{isactive}\n")

def generate_employees(file, count, designation_ids, departments):
    """Generate employee data - MATCHING EXACT SCHEMA"""
    file.write('employeeId,empName,email,phoneNumber,bloodGroup,dateOfBirth,gender,Department,currentDesignationId,isActive,Category,PWD_EXS,State\n')
    
    generated_emails = set()
    generated_employee_ids = set()
    
    for i in range(count):
        # Generate unique employee ID
        emp_id = generate_employee_id()
        while emp_id in generated_employee_ids:
            emp_id = generate_employee_id()
        generated_employee_ids.add(emp_id)
        
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
        cat = category_employee()  # Uses UR, EWS, OBC_NCL, SC, ST
        pwd = random.choice([True, False, None])
        state_val = state()
        
        file.write(f"{emp_id},{name},{email},{phone},{bg},{dob.strftime('%Y-%m-%d')},{gen},{dept},{desig_id},{isactive},{cat},{pwd},{state_val}\n")
    
    return list(generated_employee_ids)

def generate_employment_history(file, count, employee_ids, designation_ids):
    """Generate employment history data - MATCHING EXACT SCHEMA"""
    file.write('employeeId,designationId,designation,dateOfJoining,dateOfRelieving,appointmentMode,natureOfAppointment,isOnLien,lienStartDate,lienEndDate,lienDuration,status,remarks\n')
    
    natures = ['Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc']
    lien_types = ['Yes', 'No', 'NA']
    statuses = ['Active', 'Relieved', 'Transferred']
    appointment_modes = ['Direct Recruitment', 'LDE', 'Upgradation', 'Promotion', 'Transfer']
    
    history_ids = []
    
    for i in range(count):
        emp_id = random.choice(employee_ids)
        desig_id = random.choice(designation_ids)
        desig_name = random.choice(['Assistant Professor', 'Associate Professor', 'Professor', 'Technical Officer', 'Administrative Officer'])
        join_date = random_date(2010, 2023)
        
        # Some employees might be relieved
        if random.choice([True, True, False]):
            relieve_date = ''
            emp_status = 'Active'
        else:
            relieve_date = random_date_after(join_date, 365*3).strftime('%Y-%m-%d')
            emp_status = random.choice(['Relieved', 'Transferred'])
        
        appointment = random.choice(appointment_modes)
        nature = random.choice(natures)
        lien = random.choice(lien_types)
        
        lien_start = ''
        lien_end = ''
        lien_duration = ''
        if lien == 'Yes':
            lien_start = random_date_after(join_date, 365).strftime('%Y-%m-%d')
            lien_end = random_date_after(datetime.strptime(lien_start, '%Y-%m-%d'), 365).strftime('%Y-%m-%d')
            lien_duration = str((datetime.strptime(lien_end, '%Y-%m-%d') - datetime.strptime(lien_start, '%Y-%m-%d')).days)
        
        remarks = random.choice(['', 'Good performance', 'Promoted', 'Transferred', ''])
        
        file.write(f"{emp_id},{desig_id},{desig_name},{join_date.strftime('%Y-%m-%d')}," +
                  f"{relieve_date}," +
                  f"{appointment},{nature},{lien}," +
                  f"{lien_start}," +
                  f"{lien_end}," +
                  f"{lien_duration}," +
                  f"{emp_status},{remarks}\n")
        
        history_ids.append(i + 1)
    
    return history_ids

def generate_additional_roles(file, count, history_ids, employee_ids):
    """Generate additional roles data - MATCHING EXACT SCHEMA"""
    file.write('historyId,employeeId,roleType,department,startDate,endDate,status,remarks\n')
    
    role_types = ['HOD', 'Dean', 'Warden', 'Director', 'Registrar', 'Treasurer', 
                  'Examination Controller', 'Placement Officer', 'Library Incharge', 
                  'Lab Incharge', 'Sports Coordinator', 'Coordinator']
    statuses = ['Active', 'Relieved']
    departments_list = ['Hostel', 'CSE', 'EE', 'ME', 'Physics', 'Mathematics', 'Chemistry']
    
    for i in range(count):
        history_id = random.choice(history_ids)
        emp_id = random.choice(employee_ids)
        role_type = random.choice(role_types)
        dept = random.choice(departments_list)
        start_date = random_date(2020, 2024)
        
        if random.choice([True, False]):
            end_date = ''
            status_val = 'Active'
        else:
            end_date = random_date_after(start_date, 365).strftime('%Y-%m-%d')
            status_val = 'Relieved'
        
        remarks = random.choice(['', 'Additional responsibility', 'Temporary assignment', 'Direct Recruitment'])
        
        file.write(f"{history_id},{emp_id},{role_type},{dept},{start_date.strftime('%Y-%m-%d')}," +
                  f"{end_date}," +
                  f"{status_val},{remarks}\n")

def generate_externship_info(file, count, employee_ids):
    """Generate externship info data - MATCHING EXACT SCHEMA"""
    file.write('employeeId,empName,department,industry_name,startDate,endDate,Type,remarks\n')
    
    industries = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'IBM', 'Oracle', 
                  'Intel', 'Samsung', 'HCL', 'Accenture', 'Cognizant', 'Tech Mahindra', 'Xyz']
    types = ['Training', 'Research Collaboration']
    
    # Store employee names (we'll need to generate them)
    employee_names = {}
    
    for i in range(count):
        emp_id = random.choice(employee_ids)
        if emp_id not in employee_names:
            employee_names[emp_id] = random_name()
        emp_name = employee_names[emp_id]
        dept = department()
        industry = random.choice(industries)
        start_date = random_date(2020, 2023)
        end_date = random_date_after(start_date, 180)  # Max 6 months
        type_val = random.choice(types)
        remarks = random.choice(['', 'Successful completion', 'Ongoing', 'Extended', 'NA'])
        
        # Calculate duration
        duration = (end_date - start_date).days
        
        file.write(f"{emp_id},{emp_name},{dept},{industry},{start_date.strftime('%Y-%m-%d')}," +
                  f"{end_date.strftime('%Y-%m-%d')}," +
                  f"{type_val},{remarks}\n")

def main():
    print("=== Database Dummy Data Generator (Fixed Schema) ===\n")
    
    # Get counts for each table
    num_designations = int(input("Enter number of designations (default 10): ") or "10")
    num_students = int(input("Enter number of students (default 100): ") or "100")
    num_courses = int(input("Enter number of courses (default 50): ") or "50")
    num_employees = int(input("Enter number of employees (default 50): ") or "50")
    num_employment_history = int(input("Enter number of employment history records (default 60): ") or "60")
    num_additional_roles = int(input("Enter number of additional roles (default 20): ") or "20")
    num_externships = int(input("Enter number of externships (default 15): ") or "15")
    num_alumni = int(input("Enter number of alumni (default 30): ") or "30")
    
    print("\nGenerating data files...")
    
    # Generate students first (needed for alumni)
    student_rollnos = []
    with open('Student.csv', 'w', encoding='utf-8') as f:
        student_rollnos = generate_students(f, num_students)
        print(f"✓ Generated Student.csv ({num_students} records)")
    
    # Generate courses
    dept_codes = ['CSE', 'CE', 'EE', 'ME', 'CH', 'AE', 'MA', 'PH', 'CY', 'HS']
    with open('Course.csv', 'w', encoding='utf-8') as f:
        generate_courses(f, num_courses, dept_codes)
        print(f"✓ Generated Course.csv ({num_courses} records)")
    
    # Generate departments
    with open('Department.csv', 'w', encoding='utf-8') as f:
        generate_departments(f)
        print(f"✓ Generated Department.csv")
    
    # Generate designations
    with open('designation.csv', 'w', encoding='utf-8') as f:
        generate_designations(f, num_designations)
        print(f"✓ Generated designation.csv ({num_designations} records)")
    designation_ids = list(range(1, num_designations + 1))
    
    # Generate employees
    departments_list = ['Computer Science', 'Physics', 'Mathematics', 'Chemistry', 
                       'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering']
    with open('employee.csv', 'w', encoding='utf-8') as f:
        employee_ids = generate_employees(f, num_employees, designation_ids, departments_list)
        print(f"✓ Generated employee.csv ({num_employees} records)")
    
    # Generate employment history
    with open('employment_history.csv', 'w', encoding='utf-8') as f:
        history_ids = generate_employment_history(f, num_employment_history, employee_ids, designation_ids)
        print(f"✓ Generated employment_history.csv ({num_employment_history} records)")
    
    # Generate additional roles
    with open('additional_roles.csv', 'w', encoding='utf-8') as f:
        generate_additional_roles(f, num_additional_roles, history_ids, employee_ids)
        print(f"✓ Generated additional_roles.csv ({num_additional_roles} records)")
    
    # Generate externship info
    with open('externship_info.csv', 'w', encoding='utf-8') as f:
        generate_externship_info(f, num_externships, employee_ids)
        print(f"✓ Generated externship_info.csv ({num_externships} records)")
    
    # Generate alumni
    with open('Alumini.csv', 'w', encoding='utf-8') as f:
        generate_alumni(f, num_alumni, student_rollnos)
        print(f"✓ Generated Alumini.csv ({num_alumni} records)")
    
    print("\n✅ All data files generated successfully!")
    print("\nNote: Column names match the exact database schema:")
    print("  - Student: RollNo, Name, Program, YearOfAdmission, Batch, Branch, Department, PwD, State, Category, Gender, Status")
    print("  - Course: CourseCode, CourseName, OfferedByDept, OfferedToProgram, Credit, Coordinator, CoCoordinator, CurrentStatus")
    print("  - Department: DeptCode, DeptName, CoursesOffered, Faculty, CourseList")
    print("  - Employee: employeeId, empName, email, phoneNumber, bloodGroup, dateOfBirth, gender, Department, currentDesignationId, isActive, Category, PWD_EXS, State")
    print("\nImport order:")
    print("  1. designation.csv")
    print("  2. Department.csv")
    print("  3. Student.csv")
    print("  4. Course.csv")
    print("  5. employee.csv")
    print("  6. employment_history.csv")
    print("  7. additional_roles.csv")
    print("  8. externship_info.csv")
    print("  9. Alumini.csv")

if __name__ == "__main__":
    main()

