
# 🚀 RENDER DEPLOYMENT INSTRUCTIONS

## Step 1: Export Local Data
```bash
cd BE
python export_data.py
```

## Step 2: Upload Files to Render
Upload these files to your Render service:
- `import_data.py`
- `production_data.zip` (created by export_data.py)

## Step 3: Run Import on Render
Connect to your Render shell and run:
```bash
# Extract data
unzip -o production_data.zip -d exported_data/

# Import data
python import_data.py
```

## Step 4: Verify Import
Check your Django admin to verify data was imported correctly.

## Default Login Credentials
All imported users have the default password: `imported123`
Users can login with their email and this password.

## Files Included:
- `cities.json` - Cities data
- `skills.json` - Skills data  
- `categories.json` - Job categories
- `work_types.json` - Work types
- `employers.json` - Employer accounts
- `candidates.json` - Candidate accounts
- `jobs.json` - Job postings
- `applications.json` - Job applications
- `summary.json` - Import summary

## Notes:
- Existing data will not be duplicated
- Only new records will be imported
- CV files are not included (users need to re-upload)
- All imported users need to reset their passwords
