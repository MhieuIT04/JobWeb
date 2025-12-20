#!/usr/bin/env python3
"""
Import local employer data to production server via API
"""
import requests
import json
import time
from datetime import datetime

def import_to_production(export_file):
    """Import exported data to production server"""
    print("📤 IMPORTING TO PRODUCTION SERVER")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Load export data
    try:
        with open(export_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"   ✅ Loaded export file: {export_file}")
        print(f"   👥 Employers: {len(data['employers'])}")
        print(f"   💼 Jobs: {sum(len(emp['jobs']) for emp in data['employers'])}")
        
    except Exception as e:
        print(f"   ❌ Error loading file: {e}")
        return
    
    # Login as admin or create admin account
    print(f"\n1. ADMIN LOGIN:")
    admin_credentials = {
        "email": "admin@jobboard.com",
        "password": "admin123456"
    }
    
    try:
        login_response = requests.post(
            f"{base_url}/api/users/token/",
            json=admin_credentials,
            timeout=30
        )
        
        if login_response.status_code == 200:
            admin_token = login_response.json().get('access')
            print(f"   ✅ Admin login successful")
        else:
            print(f"   ⚠️ Admin login failed, trying to create admin account...")
            
            # Try to create admin account
            create_response = requests.post(
                f"{base_url}/api/users/register/",
                json={
                    "email": admin_credentials["email"],
                    "password": admin_credentials["password"],
                    "role": "admin"
                },
                timeout=30
            )
            
            if create_response.status_code == 201:
                print(f"   ✅ Admin account created")
                
                # Login again
                login_response = requests.post(
                    f"{base_url}/api/users/token/",
                    json=admin_credentials,
                    timeout=30
                )
                
                if login_response.status_code == 200:
                    admin_token = login_response.json().get('access')
                    print(f"   ✅ Admin login successful after creation")
                else:
                    print(f"   ❌ Admin login failed after creation")
                    return
            else:
                print(f"   ❌ Failed to create admin account: {create_response.status_code}")
                return
        
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
    except Exception as e:
        print(f"   ❌ Admin login error: {e}")
        return
    
    # Import employers
    print(f"\n2. IMPORTING EMPLOYERS:")
    imported_employers = []
    
    for i, employer_data in enumerate(data['employers'], 1):
        print(f"   {i}/{len(data['employers'])} Importing: {employer_data['email']}")
        
        try:
            # Create employer account
            employer_payload = {
                "email": employer_data['email'],
                "password": "defaultpass123",  # Default password
                "role": "employer"
            }
            
            # Check if employer already exists
            check_response = requests.get(
                f"{base_url}/api/users/search/?email={employer_data['email']}",
                headers=admin_headers,
                timeout=15
            )
            
            if check_response.status_code == 200 and check_response.json():
                print(f"      ⚠️ Employer already exists, skipping creation")
                employer_id = check_response.json()[0]['id']
            else:
                # Create new employer
                create_response = requests.post(
                    f"{base_url}/api/users/register/",
                    json=employer_payload,
                    timeout=30
                )
                
                if create_response.status_code == 201:
                    employer_id = create_response.json().get('id')
                    print(f"      ✅ Employer created (ID: {employer_id})")
                else:
                    print(f"      ❌ Failed to create employer: {create_response.status_code}")
                    continue
            
            # Update profile if exists
            if employer_data.get('profile'):
                profile_data = employer_data['profile']
                
                # Update profile via API (if endpoint exists)
                # For now, we'll skip profile update as it requires specific API endpoints
                print(f"      📝 Profile data available: {profile_data.get('company_name', 'No company')}")
            
            imported_employers.append({
                'email': employer_data['email'],
                'id': employer_id,
                'jobs_count': len(employer_data.get('jobs', []))
            })
            
            # Small delay to avoid overwhelming server
            time.sleep(0.5)
            
        except Exception as e:
            print(f"      ❌ Error importing employer: {e}")
            continue
    
    print(f"\n✅ IMPORT SUMMARY:")
    print(f"   👥 Employers imported: {len(imported_employers)}")
    
    for emp in imported_employers:
        print(f"      • {emp['email']} (ID: {emp['id']}) - {emp['jobs_count']} jobs")
    
    # Create credentials file
    credentials_file = f"production_credentials_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(credentials_file, 'w', encoding='utf-8') as f:
        f.write("PRODUCTION EMPLOYER CREDENTIALS\n")
        f.write("=" * 40 + "\n\n")
        f.write("Default password for all accounts: defaultpass123\n\n")
        
        for emp in imported_employers:
            f.write(f"Email: {emp['email']}\n")
            f.write(f"Password: defaultpass123\n")
            f.write(f"Jobs: {emp['jobs_count']}\n")
            f.write("-" * 30 + "\n")
    
    print(f"\n📁 CREDENTIALS SAVED TO: {credentials_file}")
    
    print(f"\n💡 NEXT STEPS:")
    print(f"   1. Test login with any employer account")
    print(f"   2. Password for all accounts: defaultpass123")
    print(f"   3. Employers can change passwords after first login")
    print(f"   4. Jobs data will need separate import (too large for API)")
    
    print(f"\n🔑 QUICK TEST ACCOUNTS:")
    for emp in imported_employers[:5]:  # Show first 5
        print(f"   • {emp['email']} / defaultpass123")

def main():
    """Main function"""
    import glob
    
    # Find the latest export file
    export_files = glob.glob("local_employers_export_*.json")
    
    if not export_files:
        print("❌ No export files found. Run export_local_employers.py first.")
        return
    
    # Use the latest file
    latest_file = max(export_files)
    print(f"Using latest export file: {latest_file}")
    
    import_to_production(latest_file)

if __name__ == "__main__":
    main()