# Fix: Foreign Key Constraint Error for Designation ID

## Problem
Error: `insert or update on table "employee" violates foreign key constraint "employee_currentdesignationid_fkey"`
- The CSV file references `designationid` values (like 6, 1, 3) that don't exist in your database

## Solution

I've updated the CSV file to remove the `currentdesignationid` values (set them to empty/NULL). This is safe because:

1. **`currentdesignationid` is optional** - The employee table allows NULL for this field
2. **Employment history doesn't need it** - The `employment_history` table uses the text `designation` field, not the ID
3. **You can add it later** - Once you know which designation IDs exist, you can update employees later

## What I Changed

✅ Updated `employee_dummy_for_employment_history.csv`:
- Removed all `currentdesignationid` values (set to empty)
- All other fields remain the same

## Now You Can:

1. **Upload the fixed CSV** - It should work without foreign key errors
2. **Or check your designations first** (optional):
   - Upload `designation.csv` first if you haven't already
   - Then check which IDs exist using the script below

## Check Available Designations (Optional)

If you want to use designation IDs, first check what exists:

### Option 1: Using psql
```bash
psql -U postgres -d iitpkd_dashboard -c "SELECT designationid, designationname FROM designation ORDER BY designationid;"
```

### Option 2: Using Python script
```bash
cd test
source ../venv/bin/activate  # Activate virtual environment first
python3 check_designations.py
```

Then update the CSV with valid IDs if needed.

## Important Notes

- **The chart will still work** - Employment history uses the text `designation` field, not the ID
- **You can leave it empty** - `currentdesignationid` is optional in the employee table
- **Update later if needed** - You can always update employees later with correct designation IDs

## Next Steps

1. ✅ Use the updated `employee_dummy_for_employment_history.csv` (already fixed)
2. Upload employees
3. Generate employment history CSV
4. Upload employment history
5. Check the chart!

