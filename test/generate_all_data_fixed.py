from data_generators.base_generators import (
    DEFAULT_DEPARTMENT_CODES,
    DEFAULT_EMPLOYEE_DEPARTMENTS,
    GENDERS,
    PROGRAMS,
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
    generate_ewd_yearwise,
    generate_faculty_engagements,
    generate_placement_summary,
    generate_placement_companies,
    generate_placement_packages,
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
    num_faculty_engagements = int(input("Enter number of faculty engagements (default 40): ") or "40")
    igrc_start_year = int(input("Enter IGRC start year (default 2019): ") or "2019")
    igrc_year_count = int(input("Enter number of IGRC yearly records (default 5): ") or "5")
    icc_start_year = int(input("Enter ICC start year (default 2019): ") or "2019")
    icc_year_count = int(input("Enter number of ICC yearly records (default 5): ") or "5")
    ewd_start_year = int(input("Enter EWD start year (default 2019): ") or "2019")
    ewd_year_count = int(input("Enter number of EWD yearly records (default 5): ") or "5")
    placement_start_year = int(input("Enter placement start year (default 2019): ") or "2019")
    placement_year_count = int(input("Enter number of placement yearly records (default 5): ") or "5")
    companies_per_year = int(input("Enter number of companies per year (default 12): ") or "12")
    
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

    with open('faculty_engagement.csv', 'w', encoding='utf-8') as f:
        generate_faculty_engagements(f, num_faculty_engagements, DEFAULT_DEPARTMENT_CODES)
        print(f"✓ Generated faculty_engagement.csv ({num_faculty_engagements} records)")

    igrc_years = [igrc_start_year + i for i in range(max(igrc_year_count, 0))]
    with open('igrs_yearwise.csv', 'w', encoding='utf-8') as f:
        generate_igrs_yearwise(f, igrc_years)
        print(f"✓ Generated igrs_yearwise.csv ({len(igrc_years)} records)")

    icc_years = [icc_start_year + i for i in range(max(icc_year_count, 0))]
    with open('icc_yearwise.csv', 'w', encoding='utf-8') as f:
        generate_icc_yearwise(f, icc_years)
        print(f"✓ Generated icc_yearwise.csv ({len(icc_years)} records)")

    ewd_years = [ewd_start_year + i for i in range(max(ewd_year_count, 0))]
    with open('ewd_yearwise.csv', 'w', encoding='utf-8') as f:
        generate_ewd_yearwise(f, ewd_years)
        print(f"✓ Generated ewd_yearwise.csv ({len(ewd_years)} records)")

    placement_years = [placement_start_year + i for i in range(max(placement_year_count, 0))]
    if placement_years:
        with open('placement_summary.csv', 'w', encoding='utf-8') as f:
            generate_placement_summary(f, placement_years)
            print(f"✓ Generated placement_summary.csv ({len(placement_years) * len(PROGRAMS) * len(GENDERS)} records)")

        with open('placement_companies.csv', 'w', encoding='utf-8') as f:
            generate_placement_companies(f, placement_years, companies_per_year=companies_per_year)
            print(f"✓ Generated placement_companies.csv ({len(placement_years) * companies_per_year} records)")

        with open('placement_packages.csv', 'w', encoding='utf-8') as f:
            generate_placement_packages(f, placement_years)
            print(f"✓ Generated placement_packages.csv ({len(placement_years) * len(PROGRAMS)} records)")
 
    print("\n✅ All data files generated successfully!")
    print("\nNote: Column names match the exact database schema:")
    print("  - Student: RollNo, Name, Program, YearOfAdmission, Batch, Branch, Department, PwD, State, Category, Gender, Status")
    print("  - Course: CourseCode, CourseName, OfferedByDept, OfferedToProgram, Credit, Coordinator, CoCoordinator, CurrentStatus")
    print("  - Department: DeptCode, DeptName, CoursesOffered, Faculty, CourseList")
    print("  - Employee: employeeId, empName, email, phoneNumber, bloodGroup, dateOfBirth, gender, Department, currentDesignationId, isActive, Category, PWD_EXS, State")
    print("  - Faculty Engagement: engagement_code, faculty_name, engagement_type, department, startdate, enddate, duration_months, year, remarks")
    print("  - Placement Summary: placement_year, program, gender, registered, placed")
    print("  - Placement Companies: company_id, placement_year, company_name, sector, offers, hires, is_top_recruiter")
    print("  - Placement Packages: placement_year, program, highest_package, lowest_package, average_package")
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
    print(" 10. faculty_engagement.csv")
    print(" 11. igrs_yearwise.csv")
    print(" 12. icc_yearwise.csv")
    print(" 13. ewd_yearwise.csv")
    print(" 14. placement_summary.csv")
    print(" 15. placement_companies.csv")
    print(" 16. placement_packages.csv")

if __name__ == "__main__":
    main()

