# Employment History Data Upload Guide

## Overview
This guide explains how to upload dummy data for the Faculty Gender Trend chart.

## Files Provided

1. **employee_dummy_for_employment_history.csv** - Contains 30 faculty members
2. **employment_history_dummy_complete.csv** - Contains employment history records (needs employeeid mapping)
3. **generate_employment_history_data.py** - Python script to auto-generate employment_history CSV with correct employeeids

## Method 1: Automated Approach (Recommended)

### Step 1: Upload Employees
1. Go to **People & Campus → Administrative Section**
2. Click **"Upload Employees"** button
3. Select `employee_dummy_for_employment_history.csv`
4. Click **Upload**
5. Wait for confirmation message

### Step 2: Generate Employment History CSV
1. Open terminal in the project root directory
2. Activate virtual environment (if using one):
   ```bash
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate  # Windows
   ```
3. Run the generation script:
   ```bash
   cd test
   python3 generate_employment_history_data.py
   ```
4. This will create `employment_history_generated.csv` with correct employeeids

### Step 3: Upload Employment History
1. Go back to **People & Campus → Administrative Section**
2. Click **"Upload Employment History"** button
3. Select `employment_history_generated.csv` (from test folder)
4. Click **Upload**
5. Wait for confirmation message

### Step 4: Verify
1. Refresh the page
2. Check the **Faculty Gender Trend (Last 5 Years)** chart
3. You should see data for years 2020-2024

## Method 2: Manual Approach

If you prefer to do it manually:

### Step 1: Upload Employees
Same as Method 1, Step 1

### Step 2: Get Employee IDs
1. After uploading employees, note down the employeeids
2. You can check them in the database or use the Python script to list them:
   ```python
   from Backend.app.db import get_db_connection
   import psycopg2.extras
   
   conn = get_db_connection()
   cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
   cur.execute("SELECT employeeid, email, empname FROM employee ORDER BY employeeid")
   for row in cur.fetchall():
       print(f"ID: {row['employeeid']}, Email: {row['email']}, Name: {row['empname']}")
   conn.close()
   ```

### Step 3: Update Employment History CSV
1. Open `employment_history_dummy_complete.csv`
2. Replace the `employeeid` column values with actual employeeids from Step 2
3. Make sure each employeeid matches the correct employee

### Step 4: Upload Employment History
Same as Method 1, Step 3

## Data Details

### Employee CSV Contains:
- **30 faculty members** with diverse:
  - Genders: Male, Female (balanced distribution)
  - Departments: CSE, EE, ME, Chemical, Physics, Mathematics
  - Designations: Assistant Professor, Associate Professor, Professor
  - Years: Joining dates from 2015-2022

### Employment History CSV Contains:
- **Multiple records per employee** showing:
  - Promotions (Assistant → Associate → Professor)
  - Lien periods (for some senior faculty)
  - Various joining dates spanning 2015-2022
  - All records marked as "Active" or with proper relieving dates

### Chart Coverage:
The data is designed to show:
- **2020**: ~15 faculty members
- **2021**: ~20 faculty members  
- **2022**: ~25 faculty members
- **2023**: ~28 faculty members (with promotions)
- **2024**: ~30 faculty members

## Troubleshooting

### "Employee ID not found" error:
- Make sure you uploaded employees first
- Check that employeeids in employment_history CSV match actual employeeids in database

### "Invalid enum value" error:
- Check that enum fields match exactly:
  - `natureofappointment`: Regular, Contract, Temporary, Visiting, Adhoc
  - `isonlien`: Yes, No, NA
  - `status`: Active, Relieved, Transferred

### Chart shows no data:
- Verify designations contain: "Professor", "Assistant", "Associate", or "Faculty"
- Check that `dateofjoining` dates are within last 5 years
- Ensure employees have valid gender values

### Designation ID mismatch:
- The script tries to match designations automatically
- If designationid is empty in CSV, the system will use the designation name
- Make sure designation names match what's in your designation table

## Notes

- **Designation IDs**: The script maps designations to IDs automatically. If your designation table has different IDs, you may need to update the `get_designation_id_by_name()` function in the script.

- **Email Uniqueness**: Each employee email must be unique. If you get duplicate email errors, modify the emails in the CSV.

- **Date Format**: All dates must be in YYYY-MM-DD format (e.g., 2020-01-15)

- **Empty Fields**: Leave fields empty (no spaces) for NULL values

## Need Help?

If you encounter issues:
1. Check the backend console for detailed error messages
2. Verify database connection is working
3. Ensure all required tables exist (employee, designation, employment_history)
4. Check that enum types are created correctly

