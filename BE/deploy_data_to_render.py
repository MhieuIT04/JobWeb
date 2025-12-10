#!/usr/bin/env python3
"""
Deploy data to Render production database
"""
import os
import subprocess
import zipfile
import tempfile

def create_data_package():
    """Create a zip package of exported data"""
    print("📦 Creating data package...")
    
    export_dir = "exported_data"
    if not os.path.exists(export_dir):
        print("❌ No exported data found. Run export_data.py first!")
        return None
    
    # Create zip file
    zip_filename = "production_data.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(export_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, export_dir)
                zipf.write(file_path, arcname)
    
    print(f"✅ Data package created: {zip_filename}")
    return zip_filename

def create_deployment_script():
    """Create a script to run on Render"""
    script_content = '''#!/bin/bash
# Render deployment script for importing data

echo "🚀 Starting data import on Render..."

# Extract data package
unzip -o production_data.zip -d exported_data/

# Run import script
python import_data.py

echo "✅ Data import completed!"
'''
    
    with open("deploy_script.sh", "w", encoding="utf-8") as f:
        f.write(script_content)
    
    # Make executable
    os.chmod("deploy_script.sh", 0o755)
    print("✅ Deployment script created: deploy_script.sh")

def create_render_instructions():
    """Create instructions for manual deployment"""
    instructions = """
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
"""
    
    with open("RENDER_IMPORT_INSTRUCTIONS.md", "w", encoding="utf-8") as f:
        f.write(instructions)
    
    print("✅ Instructions created: RENDER_IMPORT_INSTRUCTIONS.md")

def main():
    """Main deployment function"""
    print("🚀 RENDER DATA DEPLOYMENT TOOL")
    print("=" * 50)
    
    # Step 1: Export data if not exists
    if not os.path.exists("exported_data"):
        print("📤 Exporting data first...")
        subprocess.run(["python", "export_data.py"])
    
    # Step 2: Create data package
    zip_file = create_data_package()
    if not zip_file:
        return
    
    # Step 3: Create deployment files
    create_deployment_script()
    create_render_instructions()
    
    print(f"\n✅ DEPLOYMENT PACKAGE READY!")
    print(f"📦 Files created:")
    print(f"   - {zip_file}")
    print(f"   - import_data.py")
    print(f"   - deploy_script.sh")
    print(f"   - RENDER_IMPORT_INSTRUCTIONS.md")
    
    print(f"\n📋 NEXT STEPS:")
    print(f"1. Upload import_data.py and {zip_file} to your Render service")
    print(f"2. Connect to Render shell")
    print(f"3. Run: unzip -o {zip_file} -d exported_data/")
    print(f"4. Run: python import_data.py")
    print(f"5. Check Django admin to verify import")
    
    print(f"\n🔑 Default password for imported users: 'imported123'")

if __name__ == "__main__":
    main()