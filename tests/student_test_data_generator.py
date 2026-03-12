import csv
import random
import argparse
from datetime import datetime, timedelta

# ----------------------------
# Helper functions
# ----------------------------

def random_date(start_year=1995, end_year=2024):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).date()

def random_phone():
    return random.randint(6000000000, 9999999999)

def random_email(name):
    domains = ["gmail.com", "yahoo.com", "outlook.com"]
    return f"{name.lower()}{random.randint(1,999)}@{random.choice(domains)}"

# ----------------------------
# Categorical values
# ----------------------------

programmes = ["BTech", "MTech", "PhD"]
departments = ["CSE", "ECE", "ME", "CE", "EE"]
streams = ["AI", "DS", "Networks", "Systems", "Robotics"]
genders = ["Male", "Female", "Other"]
categories = ["GEN", "OBC", "SC", "ST"]
hostel_status = ["Hosteller", "Day Scholar"]
states = ["Kerala", "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi"]
blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+"]
status_types = ["Active", "Graduated", "Break", "Dropped"]
break_types = ["Medical", "Personal", "Academic"]

names = [
    "Aarav","Vivaan","Aditya","Arjun","Sai","Reyansh",
    "Krishna","Ishaan","Ananya","Diya","Riya","Meera"
]

# ----------------------------
# Row generator
# ----------------------------

def generate_row(i):

    name = random.choice(names)
    admission_year = random.randint(2018, 2024)

    dob = random_date(1995, 2006)
    join_date = random_date(admission_year, admission_year)

    roll_admission = 1000 + i
    roll_current = roll_admission

    parent_name = random.choice(names)

    return [
        roll_admission,
        roll_current,
        name,
        random.choice(programmes),
        random.choice(programmes),
        admission_year,
        "Monsoon",
        admission_year,
        join_date,
        join_date + timedelta(days=365*6),
        random.choice(departments),
        random.choice(departments),
        random.choice(streams),
        random.choice(streams),
        random.randint(1,10),
        random.choice(genders),
        random.choice(categories),
        random.choice(categories),
        random.choice(hostel_status),
        dob,
        "Some residential address",
        "Indian",
        random.choice(states),
        random.choice(["Yes","No"]),
        "None",
        random.choice(blood_groups),
        random.randint(10**11, 10**12-1),
        "JEE",
        random.randint(50,100),
        random_phone(),
        f"{name.lower()}@institute.edu",
        random_email(name),
        parent_name,
        random_phone(),
        random_email(parent_name),
        "Dr. Faculty",
        random.choice(["Yes","No"]),
        random.choice(["Yes","No"]),
        random.choice(["Yes","No"]),
        random.choice(["Yes","No"]),
        "",
        random.choice(["Yes","No"]),
        random.choice(["Yes","No"]),
        random_date(2020,2024),
        random.choice(["Yes","No"]),
        random.randint(0,5),
        "",
        random.choice(["None","Medical","Personal"]),
        "",
        "",
        "",
        random.choice(status_types),
        random_date(2022,2025),
        "",
        random.choice(["None","Institute Fellowship"]),
        random.choice(["None","Institute Fellowship"]),
        "Prof. Chair",
        "Prof A, Prof B",
        "",
        ""
    ]

# ----------------------------
# Main program
# ----------------------------

def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("rows", type=int, help="Number of dummy rows")
    parser.add_argument("--output", default="students.csv")
    args = parser.parse_args()

    headers = [
        "roll_no_admission","roll_no_current","name_of_student",
        "programme_admission","programme_current","admission_year",
        "admission_cycle","admission_batch","date_of_joining",
        "date_of_validity","department_admission","department_current",
        "stream_admission","stream_current","current_semester","gender",
        "original_category","admission_category","hosteller_day_scholar",
        "date_of_birth","residential_address","nationality","state",
        "pwd_status","disability_type","blood_group","apaar_id",
        "qualifying_exam","qualifying_exam_score","student_contact_no",
        "institute_email","personal_email","parent_name",
        "parent_contact_no","parent_email","faculty_advisor",
        "institute_scholarship","nsp_scholarship_recipient","preparatory",
        "branch_change","branch_change_remarks","slowpaced","upgraded",
        "date_of_upgradation","idc_current","number_of_total_idcs",
        "idc_history","break_type","break_from_date","break_to_date",
        "break_history","student_status","student_status_date",
        "student_status_remarks","fellowship_status_admission",
        "fellowship_status_current","dc_chairperson","dc_members",
        "thesis_submission_date","viva_voice_date"
    ]

    with open(args.output, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for i in range(args.rows):
            writer.writerow(generate_row(i))

    print(f"{args.rows} rows written to {args.output}")

if __name__ == "__main__":
    main()
