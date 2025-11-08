from data_generators.base_generators import (
    DEFAULT_DEPARTMENT_CODES,
    DEFAULT_EMPLOYEE_DEPARTMENTS,
    generate_students,
    generate_courses,
    generate_departments,
    generate_alumni,
    generate_designations,
    generate_employees,
    generate_employment_history,
    generate_additional_roles,
    generate_externship_info,
    generate_igrs_yearwise,
    generate_icc_yearwise,
)
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
    igrc_start_year = int(input("Enter IGRC start year (default 2019): ") or "2019")
    igrc_year_count = int(input("Enter number of IGRC yearly records (default 5): ") or "5")
    icc_start_year = int(input("Enter ICC start year (default 2019): ") or "2019")
    icc_year_count = int(input("Enter number of ICC yearly records (default 5): ") or "5")
    
    print("\nGenerating data files...")
    
    # Generate students first (needed for alumni)
    student_rollnos = []
    with open('Student.csv', 'w', encoding='utf-8') as f:
        student_rollnos = generate_students(f, num_students)
        print(f"✓ Generated Student.csv ({num_students} records)")
    
    # Generate courses
    with open('Course.csv', 'w', encoding='utf-8') as f:
        generate_courses(f, num_courses, DEFAULT_DEPARTMENT_CODES)
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
    with open('employee.csv', 'w', encoding='utf-8') as f:
        employee_ids = generate_employees(
            f,
            num_employees,
            designation_ids=designation_ids,
            departments=DEFAULT_EMPLOYEE_DEPARTMENTS
        )
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

    igrc_years = [igrc_start_year + i for i in range(max(igrc_year_count, 0))]
    with open('igrs_yearwise.csv', 'w', encoding='utf-8') as f:
        generate_igrs_yearwise(f, igrc_years)
        print(f"✓ Generated igrs_yearwise.csv ({len(igrc_years)} records)")

    icc_years = [icc_start_year + i for i in range(max(icc_year_count, 0))]
    with open('icc_yearwise.csv', 'w', encoding='utf-8') as f:
        generate_icc_yearwise(f, icc_years)
        print(f"✓ Generated icc_yearwise.csv ({len(icc_years)} records)")
    
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
    print("  10. igrs_yearwise.csv")
    print("  11. icc_yearwise.csv")

if __name__ == "__main__":
    main()

