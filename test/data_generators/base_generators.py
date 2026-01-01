from __future__ import annotations

import random
import string
from datetime import date, datetime, timedelta
from typing import Iterable, List, Optional, Sequence

DEFAULT_DEPARTMENT_CODES = ['CSE', 'CE', 'EE', 'ME', 'CH', 'AE', 'MA', 'PH', 'CY', 'HS']
DEFAULT_EMPLOYEE_DEPARTMENTS = [
    'Computer Science and Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Chemical Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Humanities and Social Sciences'
]

PROGRAMS = ['BTech', 'MTech', 'MSc', 'MS', 'PhD']
GENDERS = ['Male', 'Female', 'Transgender']
CATEGORIES = ['Gen', 'EWS', 'OBC', 'SC', 'ST']
EMPLOYEE_CATEGORIES = ['GEN', 'EWS', 'OBC', 'SC', 'ST']
BATCHES = ['Jan', 'Jul']
STATES = [
    'Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Delhi', 'Maharashtra', 'Gujarat', 'West Bengal',
    'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Haryana', 'Punjab', 'Bihar', 'Odisha', 'Assam', 'Chhattisgarh',
    'Jharkhand', 'Goa'
]
SECTORS = ['Software', 'Consulting', 'Core Engineering', 'Research', 'Analytics', 'Finance', 'Manufacturing', 'Energy']
BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
STATUS_CHOICES = ['Graduated', 'Ongoing', 'Slowpace']
EMPLOYMENT_APPOINTMENTS = ['Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc']
ROLE_STATUSES = ['Active', 'Relieved']
PLACEMENT_OUTCOMES = ['HigherStudies', 'Corporate', 'Entrepreneurship', 'Other']
ENGAGEMENT_TYPES = ['Adjunct', 'Honorary', 'Visiting', 'FacultyFellow', 'PoP']
FUNDING_AGENCIES = [
    'DST', 'SERB', 'MeitY', 'DRDO', 'CSIR', 'DBT', 'ISRO', 'AICTE', 'UGC', 'Industry CSR', 'World Bank', 'UNDP'
]
CONSULTANCY_CLIENTS = [
    'Kerala PWD', 'Metro Rail Corporation', 'Tata Consultancy Services', 'Infosys', 'ABB India', 'Bosch', 'L&T Construction',
    'Adani Group', 'Reliance Industries', 'Hero Motors', 'Indian Railways', 'Bharat Electronics Limited'
]
COLLABORATION_THEMES = [
    'Joint Research & Development',
    'Student Exchange & Training',
    'Faculty Development Programme',
    'Technology Transfer',
    'Innovation & Entrepreneurship Support',
    'Laboratory Co-Development',
    'Knowledge Sharing'
]
MOU_PARTNERS = [
    'IIT Madras', 'IIT Bombay', 'IISc Bangalore', 'IIM Kozhikode', 'NIT Calicut', 'NIT Trichy', 'Texas A&M University',
    'National University of Singapore', 'Siemens', 'IBM Research', 'Bosch Global Software', 'ISRO Space Applications Centre'
]
PATENT_THEMES = ['Smart Grid', 'Biodegradable Polymers', 'AI Diagnostics', 'Nano Sensors', 'Water Purification', 'Robotics', 'Edge Computing', 'Battery Technology']
JOURNAL_NAMES = [
    'IEEE Transactions on Industrial Electronics',
    'Nature Communications',
    'Journal of Applied Physics',
    'ACM Transactions on Embedded Systems',
    'International Journal of Robotics Research',
    'Renewable Energy Letters',
    'Chemical Engineering Journal',
    'Materials Today',
    'Environmental Science and Technology'
]

FIRST_NAMES = [
    'Arjun', 'Divya', 'Rahul', 'Sneha', 'Pranav', 'Nisha', 'Rohit', 'Lakshmi', 'Kiran', 'Asha', 'Naveen', 'Pooja',
    'Vikram', 'Shreya', 'Harish', 'Aparna', 'Sameer', 'Isha', 'Manoj', 'Deepa'
]
LAST_NAMES = [
    'Menon', 'Pillai', 'Reddy', 'Iyer', 'Das', 'Sharma', 'Verma', 'Gupta', 'Kulkarni', 'Mishra', 'Nair', 'Singh',
    'Chakraborty', 'Joshi', 'Patel', 'Yadav', 'Raman', 'Gopal', 'Mehta', 'Krishnan'
]
COMPANY_FIRST = ['Tech', 'Info', 'Data', 'Prime', 'Aero', 'Green', 'Next', 'Opti', 'Nova', 'Ultra']
COMPANY_SECOND = ['Works', 'Labs', 'Systems', 'Solutions', 'Dynamics', 'Networks', 'Ventures', 'Partners', 'Global', 'Enterprises']


def random_string(length: int = 6) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


def random_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_email(name: str, domain: str = 'iitpkd.ac.in') -> str:
    slug = ''.join(ch for ch in name.lower() if ch.isalnum())
    return f"{slug}{random.randint(10, 99)}@{domain}"


def random_phone() -> str:
    return '9' + ''.join(random.choices(string.digits, k=9))


def random_date(start_year: int, end_year: int) -> date:
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, max(delta, 1)))


def random_date_after(start_date: date, max_days: int = 365) -> date:
    return start_date + timedelta(days=random.randint(1, max(max_days, 1)))


def gender() -> str:
    return random.choice(GENDERS)


def category_student() -> str:
    return random.choice(CATEGORIES)


def category_employee() -> str:
    return random.choice(EMPLOYEE_CATEGORIES)


def state() -> str:
    return random.choice(STATES)


def program() -> str:
    return random.choice(PROGRAMS)


def yearofadmission() -> int:
    return random.randint(2016, datetime.now().year)


def batch() -> str:
    return random.choice(BATCHES)


def department() -> str:
    return random.choice(DEFAULT_EMPLOYEE_DEPARTMENTS)


def branch(program_name: str) -> str:
    branches = {
        'BTech': ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Chemical'],
        'MTech': ['Data Science', 'Power Systems', 'Structural Engineering', 'Thermal Engineering'],
        'MSc': ['Physics', 'Chemistry', 'Mathematics'],
        'MS': ['Computer Science', 'Materials Science', 'Systems Engineering'],
        'PhD': ['Computer Science', 'Mechanical Engineering', 'Physics', 'Chemistry']
    }
    return random.choice(branches.get(program_name, ['Interdisciplinary']))


def random_designation() -> str:
    return random.choice([
        'Assistant Professor', 'Associate Professor', 'Professor', 'Technical Officer',
        'Administrative Officer', 'Project Officer', 'Visiting Faculty'
    ])


def random_role() -> str:
    return random.choice([
        'HOD', 'Dean', 'Warden', 'Director', 'Registrar', 'Treasurer',
        'Placement Coordinator', 'Faculty Advisor', 'Research Chair', 'Academic Coordinator'
    ])


def random_sector() -> str:
    return random.choice(SECTORS)


def random_outcome() -> str:
    return random.choice(PLACEMENT_OUTCOMES)


def blood_group() -> str:
    return random.choice(BLOOD_GROUPS)


def random_status() -> str:
    return random.choice(STATUS_CHOICES)


def generate_employee_id() -> str:
    return f"EMP{datetime.now().year % 100:02d}{random.randint(1000, 9999)}"


def _iso(value: Optional[date]) -> str:
    return value.isoformat() if isinstance(value, date) else ''


def _timestamp(value: Optional[datetime] = None) -> str:
    return (value or datetime.now()).strftime('%Y-%m-%d %H:%M:%S')


def generate_students(file, count: int) -> List[str]:
    file.write('rollno,name,program,yearofadmission,batch,branch,department,pwd,state,category,gender,status\n')
    rollnos: List[str] = []
    for idx in range(count):
        prog = program()
        year = yearofadmission()
        roll = f"{year}{prog[:2].upper()}{idx + 1:04d}"
        while roll in rollnos:
            roll = f"{year}{prog[:2].upper()}{random.randint(1, 9999):04d}"
        rollnos.append(roll)
        name = random_name()
        pwd_flag = random.choice(['TRUE', 'FALSE'])
        gender_val = gender()
        status_val = random_status()
        file.write(
            f"{roll},{name},{prog},{year},{batch()},{branch(prog)},{department()},{pwd_flag},{state()},"
            f"{category_student()},{gender_val},{status_val}\n"
        )
    return rollnos


def generate_courses(file, count: int, department_codes: Sequence[str]) -> None:
    file.write('coursecode,coursename,offeredbydept,offeredtoprogram,credit,coordinator,cocoordinator,currentstatus\n')
    for idx in range(count):
        dept_code = random.choice(list(department_codes))
        prog = program()
        code = f"{dept_code}{500 + idx:03d}"
        course_name = f"Advanced {random.choice(['Systems', 'Analytics', 'Design', 'Theory', 'Laboratory', 'Topics'])} {idx + 1}"
        credit = random.choice([2.0, 3.0, 4.0])
        coordinator = random_name()
        cocoordinator = random.choice([random_name(), ''])
        status_val = random.choice(['Active', 'Inactive'])
        file.write(
            f"{code},{course_name},{dept_code},{prog},{credit},{coordinator},{cocoordinator},{status_val}\n"
        )


def generate_departments(file) -> None:
    file.write('deptcode,deptname,coursesoffered,faculty,courselist\n')
    for code in DEFAULT_DEPARTMENT_CODES:
        dept_name = {
            'CSE': 'Computer Science and Engineering',
            'CE': 'Civil Engineering',
            'EE': 'Electrical Engineering',
            'ME': 'Mechanical Engineering',
            'CH': 'Chemical Engineering',
            'AE': 'Aerospace Engineering',
            'MA': 'Mathematics',
            'PH': 'Physics',
            'CY': 'Chemistry',
            'HS': 'Humanities and Social Sciences'
        }.get(code, f'Department {code}')
        courses = '; '.join([f"{code}{500 + i}" for i in range(1, 4)])
        faculty = '; '.join([random_name() for _ in range(3)])
        course_list = '; '.join([f"{dept_name} Course {i}" for i in range(1, 4)])
        file.write(f"{code},{dept_name},{courses},{faculty},{course_list}\n")


def generate_alumni(
    file,
    count: int,
    student_rollnos: Optional[Sequence[str]] = None,
    existing_alumni_ids: Optional[Sequence[str]] = None
) -> List[str]:
    file.write(
        'rollno,name,alumniidno,currentdesignation,jobcountry,jobplace,yearofgraduation,department,program,'
        'category,gender,homestate,jobstate,outcome,employer_or_institution,updated_at\n'
    )
    alumni_ids = set(existing_alumni_ids or [])
    generated_ids: List[str] = []
    available_rolls = list(student_rollnos or [])
    for _ in range(count):
        if available_rolls:
            roll = random.choice(available_rolls)
        else:
            prog = program()
            grad_year = random.randint(2018, datetime.now().year)
            roll = f"{grad_year}{prog[:2].upper()}{random.randint(1000, 9999)}"
        name = random_name()
        alumni_id = f"ALU{random.randint(2018, datetime.now().year)}-{random.randint(100, 999)}"
        while alumni_id in alumni_ids:
            alumni_id = f"ALU{random.randint(2018, datetime.now().year)}-{random.randint(100, 999)}"
        alumni_ids.add(alumni_id)
        generated_ids.append(alumni_id)
        designation = random.choice([
            'Software Engineer', 'Research Fellow', 'Consultant', 'Data Scientist', 'Product Manager',
            'Hardware Engineer', 'Project Lead', 'Entrepreneur'
        ])
        job_country = random.choice(['India', 'USA', 'Germany', 'Canada', 'Singapore', 'UK'])
        job_place = random.choice(['Bengaluru', 'Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Seattle', 'Berlin', 'London', 'Toronto'])
        graduation_year = random.randint(2018, datetime.now().year)
        dept = department()
        prog = random.choice(PROGRAMS)
        category_val = category_student()
        gender_val = gender()
        home_state = state()
        job_state = state() if job_country == 'India' else ''
        outcome = random_outcome()
        employer = random.choice([
            'Amazon', 'Google', 'Microsoft', 'Infosys', 'TCS', 'Reliance', 'IIT Palakkad', 'BOSCH', 'Byju\'s', 'Oracle'
        ])
        updated_at = _timestamp()
        file.write(
            f"{roll},{name},{alumni_id},{designation},{job_country},{job_place},{graduation_year},{dept},{prog},"
            f"{category_val},{gender_val},{home_state},{job_state},{outcome},{employer},{updated_at}\n"
        )
    return generated_ids


def generate_designations(file, count: int) -> List[int]:
    file.write('designationid,designationname,designationcadre,designationcategory,isactive,createddate,modifieddate\n')
    ids: List[int] = []
    for idx in range(count):
        designation_id = idx + 1
        ids.append(designation_id)
        designation_name = random_designation() + f" {idx + 1}"
        cadre = random.choice(['Technical', 'Admin', 'Teaching', 'Visiting', 'NA'])
        category_val = random.choice(['Teaching', 'Non-Teaching', 'Visiting'])
        is_active = random.choice(['TRUE', 'FALSE'])
        created = _timestamp()
        modified = created
        file.write(
            f"{designation_id},{designation_name},{cadre},{category_val},{is_active},{created},{modified}\n"
        )
    return ids


def generate_employees(
    file,
    count: int,
    designation_ids: Optional[Sequence[int]] = None,
    departments: Optional[Sequence[str]] = None
) -> List[str]:
    file.write(
        'employeeid,empname,email,phonenumber,bloodgroup,dateofbirth,gender,department,currentdesignationid,'
        'isactive,category,pwd_exs,state,createddate,modifieddate\n'
    )
    generated_ids: List[str] = []
    designation_pool = list(designation_ids or range(1, count + 1))
    department_pool = list(departments or DEFAULT_EMPLOYEE_DEPARTMENTS)
    for _ in range(count):
        emp_id = generate_employee_id()
        while emp_id in generated_ids:
            emp_id = generate_employee_id()
        generated_ids.append(emp_id)
        name = random_name()
        email = random_email(name)
        phone = random_phone()
        bg = blood_group()
        dob = random_date(1970, 1995)
        gender_val = gender()
        dept = random.choice(department_pool)
        designation_id = random.choice(designation_pool)
        is_active = random.choice(['TRUE', 'FALSE'])
        category_val = category_employee()
        pwd_status = random.choice(['TRUE', 'FALSE'])
        state_val = state()
        created = _timestamp()
        modified = created
        file.write(
            f"{emp_id},{name},{email},{phone},{bg},{_iso(dob)},{gender_val},{dept},{designation_id},{is_active},"
            f"{category_val},{pwd_status},{state_val},{created},{modified}\n"
        )
    return generated_ids


def generate_employment_history(
    file,
    count: int,
    employee_ids: Sequence[str],
    designation_ids: Sequence[int]
) -> List[int]:
    file.write(
        'historyid,employeeid,designationid,designation,dateofjoining,dateofrelieving,appointmentmode,natureofappointment,'
        'isonlien,lienstartdate,lienenddate,lienduration,status,remarks,createddate,modifieddate\n'
    )
    history_ids: List[int] = []
    for idx in range(count):
        history_id = idx + 1
        history_ids.append(history_id)
        emp_id = random.choice(employee_ids)
        designation_id = random.choice(designation_ids)
        designation_name = random_designation()
        join_date = random_date(2010, 2023)
        if random.choice([True, False]):
            relieve_date = ''
            status_val = 'Active'
        else:
            relieve_dt = random_date_after(join_date, 365 * 3)
            relieve_date = _iso(relieve_dt)
            status_val = random.choice(['Relieved', 'Transferred'])
        appointment_mode = random.choice(['Direct Recruitment', 'LDE', 'Upgradation', 'Promotion', 'Transfer'])
        nature = random.choice(EMPLOYMENT_APPOINTMENTS)
        lien = random.choice(['Yes', 'No', 'NA'])
        lien_start = ''
        lien_end = ''
        lien_duration = ''
        if lien == 'Yes':
            lien_start_dt = random_date_after(join_date, 365)
            lien_end_dt = random_date_after(lien_start_dt, 365)
            lien_start = _iso(lien_start_dt)
            lien_end = _iso(lien_end_dt)
            lien_duration = str((lien_end_dt - lien_start_dt).days)
        remarks = random.choice(['', 'Excellent performer', 'Promoted', 'Transferred'])
        created = _timestamp()
        modified = created
        file.write(
            f"{history_id},{emp_id},{designation_id},{designation_name},{_iso(join_date)},{relieve_date},{appointment_mode},"
            f"{nature},{lien},{lien_start},{lien_end},{lien_duration},{status_val},{remarks},{created},{modified}\n"
        )
    return history_ids


def generate_additional_roles(
    file,
    count: int,
    history_ids: Sequence[int],
    employee_ids: Sequence[str]
) -> None:
    file.write(
        'roleid,historyid,employeeid,roletype,department,startdate,enddate,status,remarks,createddate,modifieddate\n'
    )
    for idx in range(count):
        role_id = idx + 1
        history_id = random.choice(history_ids)
        emp_id = random.choice(employee_ids)
        role_type = random_role()
        dept = department()
        start_date = random_date(2016, 2024)
        if random.choice([True, False]):
            end_date = ''
            status_val = 'Active'
        else:
            end_date_dt = random_date_after(start_date, 365)
            end_date = _iso(end_date_dt)
            status_val = random.choice(ROLE_STATUSES)
        remarks = random.choice(['', 'Additional responsibilities', 'Interim role'])
        created = _timestamp()
        modified = created
        file.write(
            f"{role_id},{history_id},{emp_id},{role_type},{dept},{_iso(start_date)},{end_date},{status_val},{remarks},{created},{modified}\n"
        )


def generate_externship_info(file, count: int, employee_ids: Optional[Sequence[str]] = None) -> None:
    file.write(
        'externid,employeeid,empname,department,industry_name,startdate,enddate,type,remarks,createddate,modifieddate\n'
    )
    for idx in range(count):
        extern_id = idx + 1
        emp_id = random.choice(employee_ids) if employee_ids else ''
        emp_name = random_name()
        dept = department()
        industry = random.choice([
            'Google', 'Microsoft', 'Amazon', 'Infosys', 'Wipro', 'TCS', 'Accenture', 'Bosch', 'Intel', 'Siemens'
        ])
        start_date = random_date(2020, 2023)
        end_date_dt = random_date_after(start_date, 180)
        extern_type = random.choice(['Training', 'Research Collaboration', 'Industrial Visit'])
        remarks = random.choice(['', 'Completed successfully', 'Ongoing', 'Extended engagement'])
        created = _timestamp()
        modified = created
        file.write(
            f"{extern_id},{emp_id},{emp_name},{dept},{industry},{_iso(start_date)},{_iso(end_date_dt)},{extern_type},{remarks},{created},{modified}\n"
        )


def generate_igrs_yearwise(file, years: Iterable[int]) -> None:
    file.write('grievance_year,total_grievances_filed,grievances_resolved,grievances_pending\n')
    for year in years:
        total = random.randint(5, 60)
        resolved = random.randint(0, total)
        pending = total - resolved
        file.write(f"{year},{total},{resolved},{pending}\n")


def generate_icc_yearwise(file, years: Iterable[int]) -> None:
    file.write('complaints_year,total_complaints,complaints_resolved,complaints_pending\n')
    for year in years:
        total = random.randint(1, 40)
        resolved = random.randint(0, total)
        pending = total - resolved
        file.write(f"{year},{total},{resolved},{pending}\n")


def generate_ewd_yearwise(file, years: Iterable[int]) -> None:
    file.write(
        'ewd_year,annual_electricity_consumption,per_capita_electricity_consumption,per_capita_water_consumption,'
        'per_capita_recycled_water,green_coverage\n'
    )
    for year in years:
        annual_electricity = random.randint(150_000, 600_000)
        per_capita_electricity = round(random.uniform(400, 1200), 2)
        per_capita_water = round(random.uniform(60, 180), 2)
        per_capita_recycled = round(random.uniform(10, 90), 2)
        green_coverage = round(random.uniform(25, 80), 2)
        file.write(
            f"{year},{annual_electricity},{per_capita_electricity},{per_capita_water},{per_capita_recycled},{green_coverage}\n"
        )


def generate_faculty_engagements(file, count: int, departments: Optional[Sequence[str]] = None) -> None:
    file.write(
        'engagement_code,faculty_name,engagement_type,department,startdate,enddate,duration_months,year,remarks,created_at\n'
    )
    dept_pool = list(departments or DEFAULT_EMPLOYEE_DEPARTMENTS)
    used_codes = set()
    for _ in range(count):
        eng_type = random.choice(ENGAGEMENT_TYPES)
        year = random.randint(2016, datetime.now().year)
        engagement_code = f"ENG-{year}-{random.randint(1000, 9999)}"
        while engagement_code in used_codes:
            engagement_code = f"ENG-{year}-{random.randint(1000, 9999)}"
        used_codes.add(engagement_code)
        faculty_name = random_name()
        dept = random.choice(dept_pool)
        start_date = random_date(year, year)
        end_date = ''
        duration_months = ''
        if eng_type == 'Visiting':
            duration_months = random.randint(1, 12)
            if random.choice([True, False]):
                end_date_dt = random_date_after(start_date, duration_months * 30)
                end_date = _iso(end_date_dt)
        else:
            if random.choice([True, False]):
                end_date_dt = random_date_after(start_date, 365)
                end_date = _iso(end_date_dt)
                duration_months = max(1, int((end_date_dt - start_date).days / 30))
        remarks = random.choice([
            '',
            'MoU partner collaboration',
            'Industry-sponsored engagement',
            'Short-term teaching assignment',
            'Research mentorship program'
        ])
        created_at = _timestamp()
        file.write(
            f"{engagement_code},{faculty_name},{eng_type},{dept},{_iso(start_date)},{end_date},{duration_months},{year},{remarks},{created_at}\n"
        )


def generate_placement_summary(
    file,
    years: Sequence[int],
    programs: Optional[Sequence[str]] = None,
    genders: Optional[Sequence[str]] = None
) -> None:
    file.write('placement_year,program,gender,registered,placed\n')
    program_pool = list(programs or PROGRAMS)
    gender_pool = list(genders or GENDERS)
    for year in years:
        for prog in program_pool:
            for gender_val in gender_pool:
                registered = random.randint(20, 300)
                placed = max(0, min(registered, int(registered * random.uniform(0.6, 0.98))))
                file.write(f"{year},{prog},{gender_val},{registered},{placed}\n")


def generate_placement_companies(
    file,
    years: Sequence[int],
    sectors: Optional[Sequence[str]] = None,
    companies_per_year: int = 12
) -> None:
    file.write('company_id,placement_year,company_name,sector,offers,hires,is_top_recruiter,created_at\n')
    sectors_pool = list(sectors or SECTORS)
    company_id = 1
    for year in years:
        year_companies = set()
        for _ in range(companies_per_year):
            name = f"{random.choice(COMPANY_FIRST)}{random.choice(COMPANY_SECOND)}"
            while (year, name) in year_companies:
                name = f"{random.choice(COMPANY_FIRST)}{random.choice(COMPANY_SECOND)}"
            year_companies.add((year, name))
            sector_val = random.choice(sectors_pool)
            offers = random.randint(1, 25)
            hires = random.randint(max(1, offers // 2), offers)
            top_flag = 'TRUE' if offers >= 15 else 'FALSE'
            created = _timestamp()
            file.write(f"{company_id},{year},{name},{sector_val},{offers},{hires},{top_flag},{created}\n")
            company_id += 1


def generate_placement_packages(
    file,
    years: Sequence[int],
    programs: Optional[Sequence[str]] = None
) -> None:
    file.write('placement_year,program,highest_package,lowest_package,average_package\n')
    program_pool = list(programs or PROGRAMS)
    for year in years:
        for prog in program_pool:
            highest = round(random.uniform(18, 45), 2)
            lowest = round(random.uniform(3, 8), 2)
            if lowest > highest:
                lowest, highest = highest, lowest
            average = round(random.uniform(lowest, highest), 2)
            file.write(f"{year},{prog},{highest},{lowest},{average}\n")


def generate_research_projects(
    file,
    count: int,
    start_year: int = 2016,
    end_year: Optional[int] = None
) -> None:
    file.write(
        'project_id,project_title,principal_investigator,department,project_type,funding_agency,client_organization,'
        'amount_sanctioned,start_date,end_date,status,created_at\n'
    )
    current_year = end_year or datetime.now().year
    for idx in range(count):
        project_id = idx + 1
        proj_type = random.choice(['Funded', 'Consultancy'])
        pi_name = random_name()
        dept = random.choice(DEFAULT_EMPLOYEE_DEPARTMENTS)
        start_dt = random_date(start_year, current_year)
        status_val = random.choice(['Ongoing', 'Completed'])
        end_date_str = ''
        if status_val == 'Completed':
            potential_end = random_date_after(start_dt, max_days=720)
            if potential_end.year <= current_year:
                end_date_str = _iso(potential_end)
        if proj_type == 'Funded':
            funding_agency = random.choice(FUNDING_AGENCIES)
            client = ''
        else:
            funding_agency = ''
            client = random.choice(CONSULTANCY_CLIENTS)
        amount = round(random.uniform(1_000_000, 75_000_000), 2)
        project_title = f"{proj_type} Project on {random.choice(PATENT_THEMES)} {project_id:03d}"
        created_at = _timestamp()
        file.write(
            f"{project_id},{project_title},{pi_name},{dept},{proj_type},{funding_agency},{client},{amount},"
            f"{_iso(start_dt)},{end_date_str},{status_val},{created_at}\n"
        )


def generate_research_mous(
    file,
    count: int,
    start_year: int = 2016,
    end_year: Optional[int] = None
) -> None:
    file.write('mou_id,partner_name,collaboration_nature,date_signed,validity_end,remarks\n')
    current_year = end_year or datetime.now().year
    for idx in range(count):
        mou_id = idx + 1
        partner = random.choice(MOU_PARTNERS)
        nature = random.choice(COLLABORATION_THEMES)
        date_signed = random_date(start_year, current_year)
        validity_end = ''
        if random.choice([True, False]):
            validity_years = random.randint(1, 5)
            validity_date = date_signed + timedelta(days=365 * validity_years)
            validity_end = _iso(validity_date)
        remarks = random.choice(['', 'Focus on joint labs', 'Student exchange pathway', 'Industry immersion modules'])
        file.write(f"{mou_id},{partner},{nature},{_iso(date_signed)},{validity_end},{remarks}\n")


def generate_research_patents(
    file,
    count: int,
    start_year: int = 2016,
    end_year: Optional[int] = None
) -> None:
    file.write('patent_id,patent_title,inventors,patent_status,filing_date,grant_date,remarks\n')
    current_year = end_year or datetime.now().year
    statuses = ['Filed', 'Granted', 'Published']
    for idx in range(count):
        patent_id = idx + 1
        theme = random.choice(PATENT_THEMES)
        title = f"{theme} System {patent_id:03d}"
        inventor_count = random.randint(2, 4)
        inventors = '; '.join([random_name() for _ in range(inventor_count)])
        status_val = random.choice(statuses)
        filing_dt = random_date(start_year, current_year)
        grant_str = ''
        if status_val == 'Granted':
            grant_dt = random_date_after(filing_dt, max_days=720)
            if grant_dt.year <= current_year:
                grant_str = _iso(grant_dt)
        remarks = random.choice(['', 'Technology transfer in progress', 'International filing'])
        file.write(
            f"{patent_id},{title},{inventors},{status_val},{_iso(filing_dt)},{grant_str},{remarks}\n"
        )


def generate_research_publications(
    file,
    years: Sequence[int],
    departments: Optional[Sequence[str]] = None,
    publications_per_year: int = 40
) -> None:
    file.write(
        'publication_id,publication_title,journal_name,department,faculty_name,publication_year,publication_type,created_at\n'
    )
    dept_pool = list(departments or DEFAULT_EMPLOYEE_DEPARTMENTS)
    publication_id = 1
    publication_types = ['Journal', 'Conference', 'Book Chapter', 'Monograph']
    for year in years:
        for idx in range(publications_per_year):
            pub_type = random.choice(publication_types)
            dept = random.choice(dept_pool)
            faculty = random_name()
            title = f"{pub_type} on {random.choice(PATENT_THEMES)} {year}-{idx:02d}"
            journal = random.choice(JOURNAL_NAMES)
            created = _timestamp()
            file.write(
                f"{publication_id},{title},{journal},{dept},{faculty},{year},{pub_type},{created}\n"
            )
            publication_id += 1


def generate_industry_courses(
    file,
    years: Sequence[int],
    departments: Optional[Sequence[str]] = None,
    courses_per_year: int = 10
) -> None:
    file.write('course_id,course_title,department,industry_partner,year_offered,is_active\n')
    dept_pool = list(departments or DEFAULT_EMPLOYEE_DEPARTMENTS)
    course_id = 1
    for year in years:
        for _ in range(courses_per_year):
            dept = random.choice(dept_pool)
            course_title = f"Industry Project on {random.choice(['AI', 'Robotics', 'Energy', 'Materials', 'Analytics', 'Automation'])} {course_id}"
            industry_partner = random.choice([
                'Infosys', 'TCS', 'Bosch', 'Wipro', 'Honeywell', 'Reliance Industries', 'L&T', 'IBM', 'Siemens', 'Caterpillar',
                'Shell', 'GE Healthcare', 'ABB', 'Hitachi', 'Schneider Electric'
            ])
            is_active = random.choice(['TRUE', 'FALSE', 'TRUE'])
            file.write(f"{course_id},{course_title},{dept},{industry_partner},{year},{is_active}\n")
            course_id += 1


def generate_academic_program_launch(
    file,
    years: Sequence[int],
    program_types: Optional[Sequence[str]] = None,
    programs_per_year: int = 6
) -> None:
    file.write('program_code,program_name,program_type,department,launch_year,oelp_students\n')
    type_pool = list(program_types or ['UG', 'PG', 'Certificate', 'Interdisciplinary'])
    for year in years:
        for idx in range(programs_per_year):
            program_type = random.choice(type_pool)
            dept = random.choice(DEFAULT_EMPLOYEE_DEPARTMENTS + ['Interdisciplinary Studies'])
            program_code = f"PROG{year}{idx:02d}"
            program_name = f"{program_type} Programme in {random.choice(['Data Science', 'Cybersecurity', 'Robotics', 'Clean Energy', 'Smart Manufacturing', 'AI Ethics', 'Sustainable Design', 'Quantum Computing'])}"
            oelp_students = random.randint(0, 40) if program_type in ('UG', 'PG') else random.randint(0, 15)
            file.write(f"{program_code},{program_name},{program_type},{dept},{year},{oelp_students}\n")


INNOVATION_SECTORS = [
    'Software & IT', 'Clean Energy', 'Biotechnology', 'Healthcare Technology', 'Robotics & Automation',
    'Manufacturing', 'Agricultural Technology', 'FinTech', 'EdTech', 'IoT & Smart Devices',
    'Materials Science', 'Environmental Technology', 'Data Analytics', 'AI & Machine Learning'
]
STARTUP_STATUSES = ['Active', 'Graduated', 'Inactive']
INNOVATION_FOCUS_AREAS = [
    'AI-Powered Healthcare Solutions', 'Renewable Energy Systems', 'Smart Manufacturing',
    'Agricultural IoT', 'Financial Technology', 'Educational Platforms', 'Robotics Automation',
    'Sustainable Materials', 'Water Purification', 'Waste Management', 'Precision Agriculture',
    'Medical Diagnostics', 'Supply Chain Optimization', 'Smart Cities', 'Cybersecurity'
]


def generate_startups(
    file,
    years: Sequence[int],
    startups_per_year: int = 15,
    iitpkd_ratio: float = 0.4
) -> None:
    """Generate startups/incubatees data."""
    file.write('startup_name,founder_name,innovation_focus_area,year_of_incubation,status,sector,is_from_iitpkd\n')
    startup_id = 1
    for year in years:
        for _ in range(startups_per_year):
            startup_name = f"{random.choice(COMPANY_FIRST)}{random.choice(COMPANY_SECOND)}"
            founder_name = random_name()
            innovation_area = random.choice(INNOVATION_FOCUS_AREAS)
            status_val = random.choice(STARTUP_STATUSES)
            sector_val = random.choice(INNOVATION_SECTORS)
            is_iitpkd = random.random() < iitpkd_ratio
            file.write(
                f"{startup_name},{founder_name},{innovation_area},{year},{status_val},{sector_val},"
                f"{'TRUE' if is_iitpkd else 'FALSE'}\n"
            )
            startup_id += 1


def generate_innovation_projects(
    file,
    years: Sequence[int],
    projects_per_year: int = 8
) -> None:
    """Generate innovation projects data (non-startup projects)."""
    file.write('project_title,project_type,sector,year_started,status,description\n')
    project_id = 1
    project_types = ['Funded', 'Mentored']
    for year in years:
        for _ in range(projects_per_year):
            project_type = random.choice(project_types)
            sector_val = random.choice(INNOVATION_SECTORS)
            status_val = random.choice(['Ongoing', 'Completed'])
            focus = random.choice(INNOVATION_FOCUS_AREAS)
            project_title = f"{project_type} Innovation Project: {focus} {project_id}"
            description = f"Project focusing on {focus.lower()} in the {sector_val.lower()} sector"
            file.write(
                f"{project_title},{project_type},{sector_val},{year},{status_val},{description}\n"
            )
            project_id += 1


__all__ = [
    'DEFAULT_DEPARTMENT_CODES',
    'DEFAULT_EMPLOYEE_DEPARTMENTS',
    'PROGRAMS',
    'GENDERS',
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
    'generate_ewd_yearwise',
    'generate_faculty_engagements',
    'generate_placement_summary',
    'generate_placement_companies',
    'generate_placement_packages',
    'generate_research_projects',
    'generate_research_mous',
    'generate_research_patents',
    'generate_research_publications',
    'generate_industry_courses',
    'generate_academic_program_launch',
    'generate_startups',
    'generate_innovation_projects',
    'generate_employee_id',
    'random_name',
]
