import random
import string
from datetime import datetime, timedelta
from pathlib import Path
from typing import Iterable, List, Optional, Sequence

# -----------------------------
# Shared helper utilities
# -----------------------------

DEFAULT_DEPARTMENT_CODES = ['CSE', 'CE', 'EE', 'ME', 'CH', 'AE', 'MA', 'PH', 'CY', 'HS']
DEFAULT_EMPLOYEE_DEPARTMENTS = [
    'Computer Science',
    'Physics',
    'Mathematics',
    'Chemistry',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
]


def random_string(length: int = 10) -> str:
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))


def random_name() -> str:
    first_names = [
        'John', 'Jane', 'Robert', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Emma',
        'William', 'Olivia', 'Richard', 'Sophia', 'Joseph', 'Ava', 'Thomas', 'Isabella', 'Charles', 'Mia',
        'Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Kavya', 'Arjun', 'Meera', 'Rohan', 'Sneha',
        'Suresh', 'Lakshmi', 'Karthik', 'Divya', 'Naveen', 'Pooja'
    ]
    last_names = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Nair',
        'Krishnan', 'Raman', 'Subramanian', 'Venkatesh', 'Raghavan'
    ]
    return f"{random.choice(first_names)} {random.choice(last_names)}"


def random_email(name: str) -> str:
    domains = ['iitpkd.ac.in', 'gmail.com', 'yahoo.com', 'outlook.com']
    name_clean = name.lower().replace(' ', '.')
    return f"{name_clean}@{random.choice(domains)}"


def random_phone() -> str:
    return f"+91{random.randint(7000000000, 9999999999)}"


def random_date(start_year: int = 1980, end_year: int = 2024) -> datetime:
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    days = random.randint(0, delta.days)
    return start + timedelta(days=days)


def random_date_after(start_date: datetime, max_days: int = 365 * 5) -> datetime:
    days = random.randint(1, max_days)
    return start_date + timedelta(days=days)


def rollno() -> str:
    return str(random.randint(100000000, 999999999))


def program() -> str:
    return random.choice(['BTech', 'MTech', 'MSc', 'MS', 'PhD'])


def yearofadmission() -> int:
    return random.randint(2015, 2025)


def batch() -> str:
    return random.choice(['Jan', 'Jul'])


def branch() -> str:
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


def department() -> str:
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


def state() -> str:
    states_of_india = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
        "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
        "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]
    return random.choice(states_of_india)


def category_student() -> str:
    return random.choice(['Gen', 'EWS', 'OBC', 'SC', 'ST'])


def category_employee() -> str:
    return random.choice(['UR', 'EWS', 'OBC_NCL', 'SC', 'ST'])


def gender() -> str:
    return random.choice(['Male', 'Female', 'Transgender'])


def emp_gender() -> str:
    return random.choice(['Male', 'Female', 'Other'])


def status() -> str:
    return random.choice(['Graduated', 'Ongoing', 'Slowpace'])


def blood_group() -> str:
    return random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])


def generate_employee_id(prefix: str = 'IITPKD', minimum: int = 1000, maximum: int = 9999) -> str:
    return f"{prefix}{random.randint(minimum, maximum):04d}"


# -----------------------------
# Table generators
# -----------------------------

def generate_students(file, count: int) -> List[str]:
    file.write('RollNo,Name,Program,YearOfAdmission,Batch,Branch,Department,PwD,State,Category,Gender,Status\n')
    generated_rollnos: List[str] = []
    for _ in range(count):
        roll = rollno()
        name = random_name()
        dept = department()
        pwd_val = random.choice(['Yes', 'No'])
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
        generated_rollnos.append(roll)
    return generated_rollnos


def generate_courses(file, count: int, dept_codes: Optional[Sequence[str]] = None):
    dept_codes = list(dept_codes) if dept_codes else DEFAULT_DEPARTMENT_CODES
    file.write('CourseCode,CourseName,OfferedByDept,OfferedToProgram,Credit,Coordinator,CoCoordinator,CurrentStatus\n')

    course_prefixes = {
        'CSE': 'CS', 'CE': 'CE', 'EE': 'EE', 'ME': 'ME', 'CH': 'CH',
        'AE': 'AE', 'MA': 'MA', 'PH': 'PH', 'CY': 'CY', 'HS': 'HS'
    }
    course_types = ['101', '201', '301', '401', '501', '5101', '5603', '5202']
    generated_codes = set()

    for _ in range(count):
        dept_code = random.choice(dept_codes)
        course_num = random.choice(course_types)
        course_code = f"{course_prefixes.get(dept_code, 'CS')}{course_num}"

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


def generate_alumni(file, count: int, student_rollnos: Optional[Sequence[str]] = None):
    file.write('RollNo,Name,AluminiIDNo,CurrentDesignation,JobCountry,JobPlace\n')
    designations = [
        'Software Engineer', 'Data Scientist', 'Research Scientist', 'Product Manager',
        'Senior Engineer', 'Principal Engineer', 'Manager', 'Director', 'Professor',
        'Assistant Professor', 'Consultant', 'Entrepreneur', 'Research Fellow'
    ]
    countries = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'Singapore', 'Japan']
    used_rollnos = set()
    alumni_ids = set()
    student_rollnos = list(student_rollnos or [])

    for i in range(count):
        if student_rollnos:
            rollno_val = student_rollnos[i % len(student_rollnos)]
        else:
            rollno_val = rollno()

        while rollno_val in used_rollnos:
            rollno_val = rollno()
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


def generate_designations(file, count: int):
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
            desig_name = f"Designation {i + 1}"
            cadre = random.choice(['NA', 'Technical', 'Admin'])
            category = random.choice(['Teaching', 'Non-Teaching', 'Visiting'])

        isactive = random.choice([True, True, True, False])
        file.write(f"{desig_name},{cadre},{category},{isactive}\n")


def generate_employees(
    file,
    count: int,
    designation_ids: Optional[Sequence[int]] = None,
    departments: Optional[Sequence[str]] = None
) -> List[str]:
    file.write('employeeId,empName,email,phoneNumber,bloodGroup,dateOfBirth,gender,Department,currentDesignationId,isActive,Category,PWD_EXS,State\n')
    generated_emails = set()
    generated_employee_ids: List[str] = []
    designation_ids = list(designation_ids) if designation_ids else list(range(1, max(count, 1) + 1))
    departments = list(departments) if departments else DEFAULT_EMPLOYEE_DEPARTMENTS

    for _ in range(count):
        emp_id = generate_employee_id()
        while emp_id in generated_employee_ids:
            emp_id = generate_employee_id()
        generated_employee_ids.append(emp_id)

        name = random_name()
        email = random_email(name)
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
        cat = category_employee()
        pwd = random.choice(['True', 'False', ''])
        state_val = state()

        file.write(
            f"{emp_id},{name},{email},{phone},{bg},{dob.strftime('%Y-%m-%d')},{gen},{dept},"
            f"{desig_id},{isactive},{cat},{pwd},{state_val}\n"
        )

    return generated_employee_ids


def generate_employment_history(
    file,
    count: int,
    employee_ids: Sequence[str],
    designation_ids: Sequence[int]
) -> List[int]:
    file.write('employeeId,designationId,designation,dateOfJoining,dateOfRelieving,appointmentMode,natureOfAppointment,isOnLien,lienStartDate,lienEndDate,lienDuration,status,remarks\n')
    natures = ['Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc']
    lien_types = ['Yes', 'No', 'NA']
    statuses = ['Active', 'Relieved', 'Transferred']
    appointment_modes = ['Direct Recruitment', 'LDE', 'Upgradation', 'Promotion', 'Transfer']
    history_ids: List[int] = []

    for idx in range(count):
        emp_id = random.choice(employee_ids)
        desig_id = random.choice(designation_ids)
        desig_name = random.choice(['Assistant Professor', 'Associate Professor', 'Professor', 'Technical Officer', 'Administrative Officer'])
        join_date = random_date(2010, 2023)

        if random.choice([True, True, False]):
            relieve_date = ''
            emp_status = 'Active'
        else:
            relieve_dt = random_date_after(join_date, 365 * 3)
            relieve_date = relieve_dt.strftime('%Y-%m-%d')
            emp_status = random.choice(['Relieved', 'Transferred'])

        appointment = random.choice(appointment_modes)
        nature = random.choice(natures)
        lien = random.choice(lien_types)

        lien_start = ''
        lien_end = ''
        lien_duration = ''
        if lien == 'Yes':
            lien_start_dt = random_date_after(join_date, 365)
            lien_end_dt = random_date_after(lien_start_dt, 365)
            lien_start = lien_start_dt.strftime('%Y-%m-%d')
            lien_end = lien_end_dt.strftime('%Y-%m-%d')
            lien_duration = str((lien_end_dt - lien_start_dt).days)

        remarks = random.choice(['', 'Good performance', 'Promoted', 'Transferred', ''])

        file.write(
            f"{emp_id},{desig_id},{desig_name},{join_date.strftime('%Y-%m-%d')},"
            f"{relieve_date},{appointment},{nature},{lien},{lien_start},"
            f"{lien_end},{lien_duration},{emp_status},{remarks}\n"
        )
        history_ids.append(idx + 1)

    return history_ids


def generate_additional_roles(
    file,
    count: int,
    history_ids: Sequence[int],
    employee_ids: Sequence[str]
):
    file.write('historyId,employeeId,roleType,department,startDate,endDate,status,remarks\n')
    role_types = [
        'HOD', 'Dean', 'Warden', 'Director', 'Registrar', 'Treasurer',
        'Examination Controller', 'Placement Officer', 'Library Incharge',
        'Lab Incharge', 'Sports Coordinator', 'Coordinator'
    ]
    statuses = ['Active', 'Relieved']
    departments_list = ['Hostel', 'CSE', 'EE', 'ME', 'Physics', 'Mathematics', 'Chemistry']

    for _ in range(count):
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

        file.write(
            f"{history_id},{emp_id},{role_type},{dept},{start_date.strftime('%Y-%m-%d')},"
            f"{end_date},{status_val},{remarks}\n"
        )


def generate_externship_info(file, count: int, employee_ids: Sequence[str]):
    file.write('employeeId,empName,department,industry_name,startDate,endDate,Type,remarks\n')
    industries = [
        'Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'IBM', 'Oracle',
        'Intel', 'Samsung', 'HCL', 'Accenture', 'Cognizant', 'Tech Mahindra', 'Xyz'
    ]
    types = ['Training', 'Research Collaboration']
    employee_names = {}

    for _ in range(count):
        emp_id = random.choice(employee_ids)
        if emp_id not in employee_names:
            employee_names[emp_id] = random_name()
        emp_name = employee_names[emp_id]
        dept = department()
        industry = random.choice(industries)
        start_date = random_date(2020, 2023)
        end_date = random_date_after(start_date, 180)
        type_val = random.choice(types)
        remarks = random.choice(['', 'Successful completion', 'Ongoing', 'Extended', 'NA'])

        file.write(
            f"{emp_id},{emp_name},{dept},{industry},{start_date.strftime('%Y-%m-%d')},"
            f"{end_date.strftime('%Y-%m-%d')},{type_val},{remarks}\n"
        )


def generate_igrs_yearwise(file, years: Iterable[int]):
    file.write('grievance_year,total_grievances_filed,grievances_resolved,grievances_pending\n')
    for year in years:
        total = random.randint(5, 60)
        resolved = random.randint(0, total)
        pending = total - resolved
        file.write(f"{year},{total},{resolved},{pending}\n")


def generate_icc_yearwise(file, years: Iterable[int]):
    file.write('complaints_year,total_complaints,complaints_resolved,complaints_pending\n')
    for year in years:
        total = random.randint(1, 40)
        resolved = random.randint(0, total)
        pending = total - resolved
        file.write(f"{year},{total},{resolved},{pending}\n")


def ensure_directory(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)


__all__ = [
    'DEFAULT_DEPARTMENT_CODES',
    'DEFAULT_EMPLOYEE_DEPARTMENTS',
    'generate_students',
    'generate_courses',
    'generate_departments',
    'generate_alumni',
    'generate_designations',
    'generate_employees',
    'generate_employment_history',
    'generate_additional_roles',
    'generate_externship_info',
    'generate_igrs_yearwise',
    'generate_icc_yearwise',
    'generate_employee_id',
    'random_name',
    'random_email',
    'random_phone',
]

