#!/usr/bin/env python3
"""
Create jobs for the fresh employer accounts
"""
import requests
import json
import time
from datetime import datetime, timedelta

def create_jobs_for_employers():
    """Tạo jobs cho các employer đã tạo"""
    print("💼 CREATING JOBS FOR EMPLOYERS")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Load job data
    try:
        with open('jobs_to_create.json', 'r', encoding='utf-8') as f:
            jobs_data = json.load(f)
        print(f"   ✅ Loaded job data for {len(jobs_data)} employers")
    except Exception as e:
        print(f"   ❌ Error loading job data: {e}")
        return
    
    # Load employer credentials
    employers = [
        {"email": "techcorp2024@company.vn", "password": "TechCorp2024!"},
        {"email": "digitalmarketing@company.vn", "password": "Digital2024!"},
        {"email": "frontend@company.vn", "password": "Frontend2024!"},
        {"email": "startup@company.vn", "password": "Startup2024!"},
        {"email": "techsolutions@company.vn", "password": "TechSol2024!"},
        {"email": "fptsoftware@company.vn", "password": "FPTSoft2024!"}
    ]
    
    # Get categories and work types first
    print(f"\n📋 GETTING CATEGORIES AND WORK TYPES:")
    try:
        categories_response = requests.get(f"{base_url}/api/jobs/categories/", timeout=15)
        work_types_response = requests.get(f"{base_url}/api/jobs/work-types/", timeout=15)
        
        if categories_response.status_code == 200:
            categories = categories_response.json()
            print(f"   ✅ Found {len(categories)} categories")
            
            # Create category mapping
            category_map = {}
            for cat in categories:
                name = cat['name'].lower()
                if 'it' in name or 'phần mềm' in name or 'công nghệ' in name:
                    category_map['IT'] = cat['id']
                elif 'marketing' in name:
                    category_map['Marketing'] = cat['id']
                elif 'kinh doanh' in name or 'bán hàng' in name:
                    category_map['Business'] = cat['id']
                elif 'dự án' in name or 'quản lý' in name:
                    category_map['Management'] = cat['id']
            
            # Default category
            if not category_map:
                category_map['Default'] = categories[0]['id']
            
            print(f"   📊 Category mapping: {list(category_map.keys())}")
        else:
            print(f"   ❌ Failed to get categories")
            category_map = {'Default': 1}
        
        if work_types_response.status_code == 200:
            work_types = work_types_response.json()
            print(f"   ✅ Found {len(work_types)} work types")
            default_work_type = work_types[0]['id'] if work_types else 1
        else:
            print(f"   ❌ Failed to get work types")
            default_work_type = 1
            
    except Exception as e:
        print(f"   ❌ Error getting categories/work types: {e}")
        category_map = {'Default': 1}
        default_work_type = 1
    
    # Create jobs for each employer
    total_jobs_created = 0
    
    for i, employer in enumerate(employers, 1):
        email = employer['email']
        password = employer['password']
        
        print(f"\n{i}. Processing employer: {email}")
        
        if email not in jobs_data:
            print(f"   ⚠️ No job data found for this employer")
            continue
        
        try:
            # Login employer
            login_response = requests.post(
                f"{base_url}/api/users/token/",
                json={"email": email, "password": password},
                timeout=15
            )
            
            if login_response.status_code != 200:
                print(f"   ❌ Login failed: {login_response.status_code}")
                continue
            
            access_token = login_response.json().get('access')
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            print(f"   ✅ Login successful")
            
            # Create jobs for this employer
            employer_jobs = jobs_data[email]
            jobs_created = 0
            
            for j, job_data in enumerate(employer_jobs, 1):
                print(f"      {j}. Creating: {job_data['title'][:40]}...")
                
                try:
                    # Determine category
                    job_category_id = category_map.get('Default', 1)
                    title_lower = job_data['title'].lower()
                    desc_lower = job_data['description'].lower()
                    
                    if any(word in title_lower or word in desc_lower for word in ['python', 'javascript', 'react', 'developer', 'lập trình', 'phần mềm']):
                        job_category_id = category_map.get('IT', category_map.get('Default', 1))
                    elif any(word in title_lower or word in desc_lower for word in ['marketing', 'content', 'seo', 'ads']):
                        job_category_id = category_map.get('Marketing', category_map.get('Default', 1))
                    elif any(word in title_lower or word in desc_lower for word in ['bán hàng', 'kinh doanh', 'tư vấn']):
                        job_category_id = category_map.get('Business', category_map.get('Default', 1))
                    elif any(word in title_lower or word in desc_lower for word in ['dự án', 'quản lý', 'manager']):
                        job_category_id = category_map.get('Management', category_map.get('Default', 1))
                    
                    # Prepare job payload
                    job_payload = {
                        "title": job_data["title"],
                        "description": job_data["description"],
                        "min_salary": job_data["min_salary"],
                        "max_salary": job_data["max_salary"],
                        "currency": "VND",
                        "category": job_category_id,
                        "work_type": default_work_type,
                        "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
                    }
                    
                    # Create job via API
                    job_response = requests.post(
                        f"{base_url}/api/jobs/employer/jobs/",
                        json=job_payload,
                        headers=headers,
                        timeout=30
                    )
                    
                    if job_response.status_code == 201:
                        job_info = job_response.json()
                        job_id = job_info.get('id')
                        print(f"         ✅ Created job ID: {job_id}")
                        jobs_created += 1
                        total_jobs_created += 1
                        
                    elif job_response.status_code == 400:
                        error_data = job_response.json()
                        print(f"         ❌ Validation error: {error_data}")
                        
                    else:
                        print(f"         ❌ Creation failed: {job_response.status_code}")
                        print(f"         Response: {job_response.text[:100]}...")
                    
                    # Small delay
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"         ❌ Job creation error: {e}")
            
            print(f"   📊 Jobs created for {email}: {jobs_created}/{len(employer_jobs)}")
            
        except Exception as e:
            print(f"   ❌ Error processing employer: {e}")
    
    # Final summary
    print(f"\n✅ JOB CREATION SUMMARY:")
    print(f"   👥 Employers processed: {len(employers)}")
    print(f"   💼 Total jobs created: {total_jobs_created}")
    
    if total_jobs_created > 0:
        print(f"\n🎉 SUCCESS! Jobs have been created.")
        print(f"\n🚀 TEST THE SYSTEM:")
        print(f"   1. Go to: https://jobwebjobboards.vercel.app")
        print(f"   2. Login with any employer account:")
        for emp in employers[:3]:
            print(f"      📧 {emp['email']} / 🔐 {emp['password']}")
        print(f"   3. Check your posted jobs")
        print(f"   4. Test job seeker features:")
        print(f"      - Browse jobs")
        print(f"      - Upload CV and apply")
        print(f"      - Check AI matching scores")
        
        print(f"\n💡 NEXT STEPS:")
        print(f"   1. Delete old employer accounts via Django Admin")
        print(f"   2. Test CV upload and AI matching")
        print(f"   3. Test application workflow")
        print(f"   4. Verify favorites functionality")
        
    else:
        print(f"\n❌ No jobs were created successfully")
        print(f"   💡 Try creating jobs manually through the web interface")

if __name__ == "__main__":
    create_jobs_for_employers()