# Employment History Data Upload Guide

## Overview
The `employment_history` table tracks the employment history of all employees (faculty and staff) over time. This data is used to generate the **Faculty Gender Trend (Last 5 Years)** chart in the Administrative Section.

## Table Structure

The `employment_history` table has the following columns:

### Required Columns:
- **employeeid** (INTEGER): References `employee.employeeid` - Must exist in the `employee` table
- **dateofjoining** (DATE): Date when the employee joined in this role (format: YYYY-MM-DD)
- **designation** (VARCHAR): The designation/role name (e.g., "Assistant Professor", "Associate Professor", "Professor")

### Optional Columns:
- **designationid** (INTEGER): References `designation.designationid` - Can be NULL
- **dateofrelieving** (DATE): Date when the employee left this role (NULL if still active)
- **appointmentmode** (VARCHAR): How they were appointed (e.g., "Direct", "Promotion", "Transfer")
- **natureofappointment** (ENUM): One of: 'Regular', 'Contract', 'Temporary', 'Visiting', 'Adhoc'
- **isonlien** (ENUM): One of: 'Yes', 'No', 'NA'
- **lienstartdate** (DATE): Start date of lien period
- **lienenddate** (DATE): End date of lien period
- **lienduration** (VARCHAR): Duration description (e.g., "12 months")
- **status** (ENUM): One of: 'Active', 'Relieved', 'Transferred'
- **remarks** (TEXT): Additional notes

### Auto-generated Columns (Don't include in CSV):
- **historyid**: Auto-generated primary key
- **createddate**: Auto-generated timestamp
- **modifieddate**: Auto-generated timestamp

## CSV Format

### Sample CSV Structure:
```csv
employeeid,designationid,designation,dateofjoining,dateofrelieving,appointmentmode,natureofappointment,isonlien,lienstartdate,lienenddate,lienduration,status,remarks
1,2,Assistant Professor,2020-01-15,,Direct,Regular,No,,,,Active,Initial appointment
1,3,Associate Professor,2023-06-01,,Promotion,Regular,No,,,,Active,Promoted to Associate Professor
2,2,Assistant Professor,2021-07-01,,Direct,Regular,No,,,,Active,New faculty member
```

### Important Notes:

1. **Employee ID**: Must match an existing `employeeid` in the `employee` table
2. **Date Format**: Use YYYY-MM-DD format (e.g., 2020-01-15)
3. **Empty Fields**: Leave empty (no space) for NULL values
4. **Designation**: Should contain keywords like "Professor", "Assistant", "Associate", or "Faculty" for the chart to recognize them as faculty
5. **Date of Relieving**: Leave empty if the employee is still in that role
6. **Multiple Records**: One employee can have multiple records (one for each role change/promotion)

## How to Upload Data

1. **Prepare your CSV file** following the format above
2. **Go to People & Campus → Administrative Section**
3. **Click "Upload Employment History"** button (visible to admin users)
4. **Select your CSV file**
5. **Review the preview** to ensure columns match
6. **Click Upload**

## Data Requirements for Faculty Gender Trend Chart

For the chart to display data correctly:

1. **Faculty Designations**: The `designation` field should contain:
   - "Professor" OR
   - "Assistant" OR
   - "Associate" OR
   - "Faculty"

2. **Date Range**: Ensure `dateofjoining` covers the last 5 years:
   - Current year: 2025
   - Should include data from: 2020, 2021, 2022, 2023, 2024

3. **Gender**: Employees must have a valid gender in the `employee` table:
   - 'Male'
   - 'Female'
   - 'Other'
   - 'Transgender'

4. **Employment Overlap**: An employee is counted for a year if:
   - `dateofjoining` <= December 31 of that year
   - `dateofrelieving` is NULL OR `dateofrelieving` >= January 1 of that year

## Example Scenarios

### Scenario 1: New Faculty Member
```csv
employeeid,designationid,designation,dateofjoining,dateofrelieving,appointmentmode,natureofappointment,isonlien,status,remarks
10,2,Assistant Professor,2023-08-01,,Direct,Regular,No,Active,New hire
```

### Scenario 2: Promotion
```csv
employeeid,designationid,designation,dateofjoining,dateofrelieving,appointmentmode,natureofappointment,isonlien,status,remarks
10,2,Assistant Professor,2020-01-15,2023-05-31,Direct,Regular,No,Relieved,Promoted
10,3,Associate Professor,2023-06-01,,Promotion,Regular,No,Active,Promoted
```

### Scenario 3: Employee on Lien
```csv
employeeid,designationid,designation,dateofjoining,dateofrelieving,appointmentmode,natureofappointment,isonlien,lienstartdate,lienenddate,status,remarks
15,2,Assistant Professor,2021-01-01,2021-12-31,Direct,Regular,Yes,2021-01-01,2021-12-31,Active,On lien
15,2,Assistant Professor,2022-01-01,,Direct,Regular,No,,,Active,Returned from lien
```

## Troubleshooting

### Chart shows no data:
1. Check if `employee` table has records with valid `employeeid`
2. Verify `designation` contains faculty keywords (Professor/Assistant/Associate/Faculty)
3. Ensure `dateofjoining` dates are within the last 5 years
4. Verify employees have valid gender values in the `employee` table

### Upload errors:
1. **"Employee ID not found"**: Ensure `employeeid` exists in the `employee` table
2. **"Invalid enum value"**: Check that enum fields match exact values:
   - `natureofappointment`: Regular, Contract, Temporary, Visiting, Adhoc
   - `isonlien`: Yes, No, NA
   - `status`: Active, Relieved, Transferred
3. **"Invalid date format"**: Use YYYY-MM-DD format

## Best Practices

1. **One record per role change**: Create a new record for each promotion/role change
2. **Complete date ranges**: If an employee left, set `dateofrelieving`
3. **Consistent designations**: Use consistent designation names across records
4. **Link to designations table**: Use `designationid` when possible for better data integrity
5. **Regular updates**: Update employment history when employees change roles

