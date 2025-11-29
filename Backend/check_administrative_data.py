#!/usr/bin/env python3
"""
Diagnostic script to check what data exists in the employee and designation tables.
This helps identify why the administrative section might not be showing enough data.
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load .env file
load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    sys.exit(1)

def check_data():
    """Check what data exists in the database."""
    conn = None
    try:
        print("=" * 70)
        print("ADMINISTRATIVE SECTION DATA DIAGNOSTIC")
        print("=" * 70)
        
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # 1. Total employees
        cur.execute("SELECT COUNT(*) FROM employee;")
        total_employees = cur.fetchone()[0]
        print(f"\n1. Total Employees: {total_employees}")
        
        # 2. Active vs Inactive
        cur.execute("SELECT isactive, COUNT(*) FROM employee GROUP BY isactive;")
        active_status = cur.fetchall()
        print("\n2. Active Status Distribution:")
        for status, count in active_status:
            status_str = "Active" if status else "Inactive" if status is False else "NULL"
            print(f"   {status_str}: {count}")
        
        # 3. Employees with/without designations
        cur.execute("SELECT COUNT(*) FROM employee WHERE currentdesignationid IS NOT NULL;")
        with_designation = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM employee WHERE currentdesignationid IS NULL;")
        without_designation = cur.fetchone()[0]
        print(f"\n3. Designation Status:")
        print(f"   With Designation: {with_designation}")
        print(f"   Without Designation: {without_designation}")
        
        # 4. Gender distribution
        cur.execute("SELECT gender, COUNT(*) FROM employee GROUP BY gender ORDER BY gender;")
        genders = cur.fetchall()
        print("\n4. Gender Distribution:")
        for gender, count in genders:
            print(f"   {gender}: {count}")
        
        # 5. Department distribution
        cur.execute("""
            SELECT COALESCE(department, 'NULL') as dept, COUNT(*) as cnt 
            FROM employee 
            GROUP BY department 
            ORDER BY cnt DESC 
            LIMIT 10;
        """)
        departments = cur.fetchall()
        print("\n5. Top 10 Departments:")
        for dept, count in departments:
            print(f"   {dept}: {count}")
        
        # 6. Category distribution
        cur.execute("""
            SELECT COALESCE(category, 'NULL') as cat, COUNT(*) as cnt 
            FROM employee 
            GROUP BY category 
            ORDER BY cnt DESC;
        """)
        categories = cur.fetchall()
        print("\n6. Category Distribution:")
        for cat, count in categories:
            print(f"   {cat}: {count}")
        
        # 7. Faculty vs Staff detection
        cur.execute("""
            SELECT 
                CASE 
                    WHEN d.designationcadre ILIKE '%%Faculty%%' OR d.designationcategory ILIKE '%%Faculty%%' 
                        OR d.designationname ILIKE '%%Professor%%' OR d.designationname ILIKE '%%Assistant%%' 
                        OR d.designationname ILIKE '%%Associate%%' THEN 'Faculty'
                    WHEN d.designationcadre IS NULL AND d.designationid IS NULL THEN 'No Designation'
                    ELSE 'Staff'
                END as emp_type,
                COUNT(*) as cnt
            FROM employee e
            LEFT JOIN designation d ON e.currentdesignationid = d.designationid
            GROUP BY emp_type;
        """)
        emp_types = cur.fetchall()
        print("\n7. Employee Type Distribution (Faculty vs Staff):")
        for emp_type, count in emp_types:
            print(f"   {emp_type}: {count}")
        
        # 8. Sample designations
        cur.execute("""
            SELECT designationname, designationcadre, designationcategory 
            FROM designation 
            LIMIT 10;
        """)
        designations = cur.fetchall()
        print("\n8. Sample Designations (first 10):")
        for name, cadre, category in designations:
            print(f"   Name: {name}")
            print(f"      Cadre: {cadre or 'NULL'}")
            print(f"      Category: {category or 'NULL'}")
        
        # 9. Check for potential issues
        print("\n" + "=" * 70)
        print("POTENTIAL ISSUES:")
        print("=" * 70)
        
        issues = []
        
        if total_employees == 0:
            issues.append("❌ No employees in the database. Upload employee data first.")
        
        active_count = sum(count for status, count in active_status if status is True)
        if active_count == 0:
            issues.append("⚠️  No active employees found. The default filter (isactive=true) will show no data.")
            issues.append("   Solution: Set isactive=false in filters or upload employees with isactive=true")
        
        if without_designation > 0:
            issues.append(f"⚠️  {without_designation} employees have no designation. They won't be categorized as Faculty/Staff.")
            issues.append("   Solution: Ensure all employees have a valid currentdesignationid")
        
        if with_designation == 0:
            issues.append("❌ No employees have designations. Faculty/Staff detection won't work.")
            issues.append("   Solution: Upload designation data and link employees to designations")
        
        if not issues:
            print("✓ No obvious issues found. Data looks good!")
        else:
            for issue in issues:
                print(issue)
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if conn:
            cur.close()
            conn.close()
    return True

if __name__ == "__main__":
    success = check_data()
    sys.exit(0 if success else 1)

