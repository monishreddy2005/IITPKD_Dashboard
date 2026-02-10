"""
Script to generate employment_history data after employees are uploaded.
This script reads the employee CSV, uploads employees, gets their IDs,
and then creates employment_history records.

Usage:
1. First, upload employees using the CSV file: employee_dummy_for_employment_history.csv
2. Then run this script to generate employment_history records
3. Upload the generated employment_history CSV file
"""

import csv
import sys
import os

# Add parent directory to path to import db module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from Backend.app.db import get_db_connection
import psycopg2.extras

def get_employee_ids_by_email():
    """Get mapping of email to employeeid from database"""
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database")
        return {}
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT employeeid, email FROM employee ORDER BY employeeid")
    rows = cur.fetchall()
    email_to_id = {row['email']: row['employeeid'] for row in rows}
    conn.close()
    return email_to_id

def get_designation_id_by_name(designation_name):
    """Get designationid by designation name"""
    conn = get_db_connection()
    if not conn:
        return None
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Try exact match first
    cur.execute("SELECT designationid FROM designation WHERE LOWER(designationname) LIKE LOWER(%s) LIMIT 1", 
                (f'%{designation_name}%',))
    result = cur.fetchone()
    conn.close()
    
    if result:
        return result['designationid']
    
    # Default mappings if not found
    designation_map = {
        'Assistant Professor': 6,
        'Associate Professor': 1,
        'Professor': 3
    }
    return designation_map.get(designation_name, None)

def generate_employment_history_csv():
    """Generate employment_history CSV with correct employeeids"""
    
    # Read employee CSV to get emails
    employee_csv_path = os.path.join(os.path.dirname(__file__), 'employee_dummy_for_employment_history.csv')
    
    if not os.path.exists(employee_csv_path):
        print(f"Error: Employee CSV not found at {employee_csv_path}")
        print("Please make sure employee_dummy_for_employment_history.csv exists")
        return
    
    # Get employee IDs from database
    print("Fetching employee IDs from database...")
    email_to_id = get_employee_ids_by_email()
    
    if not email_to_id:
        print("Warning: No employees found in database.")
        print("Please upload employees first using employee_dummy_for_employment_history.csv")
        return
    
    print(f"Found {len(email_to_id)} employees in database")
    
    # Read employee CSV
    employees = []
    with open(employee_csv_path, 'r') as f:
        reader = csv.DictReader(f)
        employees = list(reader)
    
    # Generate employment_history records
    employment_history = []
    
    # Define employment history data for each employee
    # Format: (email, designation, dateofjoining, dateofrelieving, appointmentmode, natureofappointment, isonlien, status, remarks)
    history_data = [
        # Employee 1 (Rajesh) - Assistant Professor -> Associate Professor
        ('rajesh.kumar@iitpkd.ac.in', 'Assistant Professor', '2020-01-15', '', 'Direct', 'Regular', 'No', 'Active', 'Initial appointment as Assistant Professor'),
        ('rajesh.kumar@iitpkd.ac.in', 'Associate Professor', '2023-06-01', '', 'Promotion', 'Regular', 'No', 'Active', 'Promoted to Associate Professor'),
        
        # Employee 2 (Priya) - Assistant Professor
        ('priya.menon@iitpkd.ac.in', 'Assistant Professor', '2021-07-01', '', 'Direct', 'Regular', 'No', 'Active', 'New faculty member joined'),
        
        # Employee 3 (Amit) - Assistant Professor -> Associate Professor
        ('amit.sharma@iitpkd.ac.in', 'Assistant Professor', '2019-08-15', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        ('amit.sharma@iitpkd.ac.in', 'Associate Professor', '2022-01-01', '', 'Promotion', 'Regular', 'No', 'Active', 'Promoted to Associate Professor'),
        
        # Employee 4 (Anjali) - Assistant Professor
        ('anjali.nair@iitpkd.ac.in', 'Assistant Professor', '2020-03-10', '', 'Direct', 'Regular', 'No', 'Active', 'Initial appointment'),
        
        # Employee 5 (Vikram) - Professor with lien
        ('vikram.singh@iitpkd.ac.in', 'Professor', '2018-01-01', '2020-12-31', 'Direct', 'Regular', 'Yes', 'Active', 'On lien for research'),
        ('vikram.singh@iitpkd.ac.in', 'Professor', '2022-01-01', '', 'Direct', 'Regular', 'No', 'Active', 'Returned from lien'),
        
        # Employee 6 (Meera) - Assistant Professor
        ('meera.iyer@iitpkd.ac.in', 'Assistant Professor', '2021-01-20', '', 'Direct', 'Regular', 'No', 'Active', 'New hire'),
        
        # Employee 7 (Suresh) - Assistant Professor -> Associate Professor
        ('suresh.nair@iitpkd.ac.in', 'Assistant Professor', '2020-06-01', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        ('suresh.nair@iitpkd.ac.in', 'Associate Professor', '2023-01-01', '', 'Promotion', 'Regular', 'No', 'Active', 'Promoted to Associate Professor'),
        
        # Employee 8 (Kavita) - Assistant Professor
        ('kavita.menon@iitpkd.ac.in', 'Assistant Professor', '2022-08-15', '', 'Direct', 'Regular', 'No', 'Active', 'Recent faculty addition'),
        
        # Employee 9 (Ramesh) - Assistant Professor -> Associate Professor
        ('ramesh.kumar@iitpkd.ac.in', 'Assistant Professor', '2019-11-01', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        ('ramesh.kumar@iitpkd.ac.in', 'Associate Professor', '2022-07-01', '', 'Promotion', 'Regular', 'No', 'Active', 'Promoted to Associate Professor'),
        
        # Employee 10 (Sunita) - Assistant Professor
        ('sunita.reddy@iitpkd.ac.in', 'Assistant Professor', '2021-03-15', '', 'Direct', 'Regular', 'No', 'Active', 'New faculty member'),
        
        # Employee 11 (Arjun) - Professor with lien
        ('arjun.patel@iitpkd.ac.in', 'Professor', '2017-06-01', '2019-05-31', 'Direct', 'Regular', 'Yes', 'Active', 'On lien'),
        ('arjun.patel@iitpkd.ac.in', 'Professor', '2020-06-01', '', 'Direct', 'Regular', 'No', 'Active', 'Returned from lien'),
        
        # Employee 12 (Divya) - Assistant Professor
        ('divya.nair@iitpkd.ac.in', 'Assistant Professor', '2020-09-01', '', 'Direct', 'Regular', 'No', 'Active', 'Initial appointment'),
        
        # Employee 13 (Manoj) - Assistant Professor -> Associate Professor
        ('manoj.kumar@iitpkd.ac.in', 'Assistant Professor', '2020-01-10', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        ('manoj.kumar@iitpkd.ac.in', 'Associate Professor', '2023-01-15', '', 'Promotion', 'Regular', 'No', 'Active', 'Promoted to Associate Professor'),
        
        # Employee 14 (Neha) - Assistant Professor
        ('neha.sharma@iitpkd.ac.in', 'Assistant Professor', '2022-01-05', '', 'Direct', 'Regular', 'No', 'Active', 'New faculty member'),
        
        # Employee 15 (Karthik) - Assistant Professor
        ('karthik.menon@iitpkd.ac.in', 'Assistant Professor', '2021-05-20', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        
        # Employee 16 (Radha) - Assistant Professor
        ('radha.iyer@iitpkd.ac.in', 'Assistant Professor', '2020-07-10', '', 'Direct', 'Regular', 'No', 'Active', 'Initial appointment'),
        
        # Employee 17 (Sanjay) - Professor with lien
        ('sanjay.nair@iitpkd.ac.in', 'Professor', '2016-01-01', '2018-12-31', 'Direct', 'Regular', 'Yes', 'Active', 'On lien'),
        ('sanjay.nair@iitpkd.ac.in', 'Professor', '2020-01-01', '', 'Direct', 'Regular', 'No', 'Active', 'Returned from lien'),
        
        # Employee 18 (Lakshmi) - Assistant Professor
        ('lakshmi.menon@iitpkd.ac.in', 'Assistant Professor', '2021-09-15', '', 'Direct', 'Regular', 'No', 'Active', 'New hire'),
        
        # Employee 19 (Ganesh) - Assistant Professor -> Associate Professor
        ('ganesh.kumar@iitpkd.ac.in', 'Assistant Professor', '2020-04-01', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        ('ganesh.kumar@iitpkd.ac.in', 'Associate Professor', '2023-03-01', '', 'Promotion', 'Regular', 'No', 'Active', 'Promoted to Associate Professor'),
        
        # Employee 20 (Shilpa) - Assistant Professor
        ('shilpa.nair@iitpkd.ac.in', 'Assistant Professor', '2022-06-01', '', 'Direct', 'Regular', 'No', 'Active', 'Recent faculty addition'),
        
        # Employee 21 (Rohit) - Assistant Professor
        ('rohit.sharma@iitpkd.ac.in', 'Assistant Professor', '2021-11-10', '', 'Direct', 'Regular', 'No', 'Active', 'New faculty member'),
        
        # Employee 22 (Ananya) - Assistant Professor
        ('ananya.menon@iitpkd.ac.in', 'Assistant Professor', '2020-02-15', '', 'Direct', 'Regular', 'No', 'Active', 'Initial appointment'),
        
        # Employee 23 (Nitin) - Assistant Professor
        ('nitin.kumar@iitpkd.ac.in', 'Assistant Professor', '2021-08-01', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        
        # Employee 24 (Pooja) - Professor with lien
        ('pooja.iyer@iitpkd.ac.in', 'Professor', '2015-01-01', '2017-12-31', 'Direct', 'Regular', 'Yes', 'Active', 'On lien'),
        ('pooja.iyer@iitpkd.ac.in', 'Professor', '2019-01-01', '', 'Direct', 'Regular', 'No', 'Active', 'Returned from lien'),
        
        # Employee 25 (Aditya) - Assistant Professor
        ('aditya.nair@iitpkd.ac.in', 'Assistant Professor', '2022-03-20', '', 'Direct', 'Regular', 'No', 'Active', 'New faculty member'),
        
        # Employee 26 (Sneha) - Assistant Professor
        ('sneha.menon@iitpkd.ac.in', 'Assistant Professor', '2020-10-05', '', 'Direct', 'Regular', 'No', 'Active', 'Initial appointment'),
        
        # Employee 27 (Varun) - Assistant Professor
        ('varun.kumar@iitpkd.ac.in', 'Assistant Professor', '2021-12-01', '', 'Direct', 'Regular', 'No', 'Active', 'Joined as Assistant Professor'),
        
        # Employee 28 (Swati) - Assistant Professor
        ('swati.nair@iitpkd.ac.in', 'Assistant Professor', '2020-05-15', '', 'Direct', 'Regular', 'No', 'Active', 'New hire'),
        
        # Employee 29 (Rahul) - Assistant Professor
        ('rahul.sharma@iitpkd.ac.in', 'Assistant Professor', '2022-09-10', '', 'Direct', 'Regular', 'No', 'Active', 'Recent faculty addition'),
        
        # Employee 30 (Tanvi) - Assistant Professor
        ('tanvi.iyer@iitpkd.ac.in', 'Assistant Professor', '2021-04-01', '', 'Direct', 'Regular', 'No', 'Active', 'New faculty member'),
    ]
    
    # Generate employment_history records
    for email, designation, dateofjoining, dateofrelieving, appointmentmode, natureofappointment, isonlien, status, remarks in history_data:
        if email not in email_to_id:
            print(f"Warning: Employee with email {email} not found in database. Skipping...")
            continue
        
        employeeid = email_to_id[email]
        designationid = get_designation_id_by_name(designation)
        
        employment_history.append({
            'employeeid': employeeid,
            'designationid': designationid if designationid else '',
            'designation': designation,
            'dateofjoining': dateofjoining,
            'dateofrelieving': dateofrelieving if dateofrelieving else '',
            'appointmentmode': appointmentmode,
            'natureofappointment': natureofappointment,
            'isonlien': isonlien,
            'lienstartdate': '',
            'lienenddate': '',
            'lienduration': '',
            'status': status,
            'remarks': remarks
        })
    
    # Write to CSV
    output_path = os.path.join(os.path.dirname(__file__), 'employment_history_generated.csv')
    fieldnames = ['employeeid', 'designationid', 'designation', 'dateofjoining', 'dateofrelieving', 
                  'appointmentmode', 'natureofappointment', 'isonlien', 'lienstartdate', 'lienenddate', 
                  'lienduration', 'status', 'remarks']
    
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(employment_history)
    
    print(f"\n✅ Generated employment_history CSV with {len(employment_history)} records")
    print(f"📁 Output file: {output_path}")
    print("\nNext steps:")
    print("1. Review the generated CSV file")
    print("2. Upload it using the 'Upload Employment History' button in the dashboard")

if __name__ == '__main__':
    generate_employment_history_csv()

