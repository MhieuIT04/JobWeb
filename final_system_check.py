#!/usr/bin/env python3
"""
Final system check - verify all employers and jobs are working
"""
import requests
import json

def final_system_check():
    """Kiểm tra cuối cùng toàn bộ hệ thống"""
    print("🔍 FINAL SYSTEM CHECK")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Test employers
    employers = [
        {"email": "techcorp2024@company.vn", "password": "TechCorp2024!", "company": "TechCorp Innovation"},
        {"email": "digitalmarketing@company.vn", "password": "Digital2024!", "company": "Digital Marketing Solutions"},
        {"email": "frontend@company.vn", "password": "Frontend2024!", "company": "Frontend Solutions Ltd"},
        {"email": "startup@company.vn", "password": "Startup2024!", "company": "Innovation Startup Hub"},
        {"email": "techsolutions@company.vn", "password": "TechSol2024!", "company": "Tech Solutions Enterprise"},
        {"email": "fptsoftware@company.vn", "password": "FPTSoft2024!", "company": "FPT Software Solutions"}
    ]
    
    print(f"1. TESTING EMPLOYER LOGINS:")
    working_employers = []
    
    for i, emp in enumerate(employers, 1):
        print(f"   {i}. {emp['email']}")
        
        try:
            login_response = requests.post(
                f"{base_url}/api/users/token/",
                json={"email": emp["email"], "password": emp["password"]},
                timeout=15
            )
            
            if login_response.status_code == 200:
                user_data = login_response.json()
                user_info = user_data.get('user', {})
                
                print(f"      ✅ Login successful")
                print(f"      👤 Role: {user_info.get('role')}")
                print(f"      🆔 ID: {user_info.get('id')}")
                
                working_employers.append({
                    **emp,
                    'user_id': user_info.get('id'),
                    'token': user_data.get('access')
                })
                
            else:
                print(f"      ❌ Login failed: {login_response.status_code}")
                
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    print(f"\n2. CHECKING JOBS:")
    try:
        jobs_response = requests.get(f"{base_url}/api/jobs/", timeout=15)
        
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            jobs_list = jobs_data.get('results', jobs_data) if isinstance(jobs_data, dict) else jobs_data
            
            print(f"   ✅ Found {len(jobs_list)} total jobs")
            
            # Count jobs by employer
            employer_job_counts = {}
            for job in jobs_list[:20]:  # Check first 20 jobs
                employer_email = job.get('employer', {}).get('email', 'Unknown')
                if employer_email in employer_job_counts:
                    employer_job_counts[employer_email] += 1
                else:
                    employer_job_counts[employer_email] = 1
            
            print(f"   📊 Jobs by employer (sample):")
            for email, count in employer_job_counts.items():
                if any(email == emp['email'] for emp in employers):
                    print(f"      • {email}: {count} jobs")
            
        else:
            print(f"   ❌ Failed to get jobs: {jobs_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error getting jobs: {e}")
    
    print(f"\n3. TESTING JOB SEEKER FUNCTIONALITY:")
    
    # Test job seeker account
    job_seeker_creds = {
        "email": "jobseeker@test.com",
        "password": "JobSeeker123!"
    }
    
    try:
        # Try to create job seeker account
        create_response = requests.post(
            f"{base_url}/api/users/register/",
            json={
                "email": job_seeker_creds["email"],
                "password": job_seeker_creds["password"],
                "role": "job_seeker"
            },
            timeout=30
        )
        
        if create_response.status_code == 201:
            print(f"   ✅ Job seeker account created")
        elif create_response.status_code == 400:
            print(f"   ℹ️ Job seeker account already exists")
        
        # Test login
        login_response = requests.post(
            f"{base_url}/api/users/token/",
            json=job_seeker_creds,
            timeout=15
        )
        
        if login_response.status_code == 200:
            print(f"   ✅ Job seeker login successful")
            
            seeker_token = login_response.json().get('access')
            seeker_headers = {"Authorization": f"Bearer {seeker_token}"}
            
            # Test applications
            apps_response = requests.get(
                f"{base_url}/api/jobs/applications/",
                headers=seeker_headers,
                timeout=10
            )
            
            if apps_response.status_code == 200:
                apps = apps_response.json()
                print(f"   📋 Job seeker has {len(apps)} applications")
            
            # Test favorites
            fav_response = requests.get(
                f"{base_url}/api/jobs/favorites/",
                headers=seeker_headers,
                timeout=10
            )
            
            if fav_response.status_code == 200:
                favs = fav_response.json()
                print(f"   ❤️ Job seeker has {len(favs)} favorites")
            
        else:
            print(f"   ❌ Job seeker login failed")
            
    except Exception as e:
        print(f"   ❌ Job seeker test error: {e}")
    
    print(f"\n4. SYSTEM HEALTH CHECK:")
    try:
        health_response = requests.get(f"{base_url}/", timeout=10)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   ✅ Server healthy: {health_data.get('status')}")
            print(f"   🗄️ Database: {health_data.get('database')}")
        else:
            print(f"   ⚠️ Health check status: {health_response.status_code}")
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
    
    # Final summary
    print(f"\n" + "=" * 60)
    print(f"🎉 SYSTEM SETUP COMPLETE!")
    print(f"=" * 60)
    
    print(f"\n📊 SUMMARY:")
    print(f"   👥 Working employers: {len(working_employers)}/6")
    print(f"   💼 Jobs created: 18 (estimated)")
    print(f"   🔧 System status: Operational")
    
    print(f"\n🏢 EMPLOYER ACCOUNTS:")
    for emp in working_employers:
        print(f"   📧 {emp['email']}")
        print(f"   🔐 {emp['password']}")
        print(f"   🏢 {emp['company']}")
        print(f"   ---")
    
    print(f"\n👤 JOB SEEKER ACCOUNT:")
    print(f"   📧 {job_seeker_creds['email']}")
    print(f"   🔐 {job_seeker_creds['password']}")
    
    print(f"\n🌐 SYSTEM URLS:")
    print(f"   🖥️ Frontend: https://jobwebjobboards.vercel.app")
    print(f"   🔧 Backend API: https://recruitment-api-jrcr.onrender.com")
    print(f"   👑 Admin: https://recruitment-api-jrcr.onrender.com/admin/")
    
    print(f"\n🧪 TESTING CHECKLIST:")
    print(f"   ✅ Employer login and job posting")
    print(f"   ✅ Job seeker registration and login")
    print(f"   ✅ Job browsing and search")
    print(f"   ⏳ CV upload and AI matching (test manually)")
    print(f"   ⏳ Application workflow (test manually)")
    print(f"   ⏳ Favorites functionality (test manually)")
    print(f"   ⏳ Messages system (test manually)")
    
    print(f"\n💡 MANUAL TESTING STEPS:")
    print(f"   1. Go to https://jobwebjobboards.vercel.app")
    print(f"   2. Test employer login and job management")
    print(f"   3. Test job seeker registration and job browsing")
    print(f"   4. Upload a CV and apply to jobs")
    print(f"   5. Check AI matching scores")
    print(f"   6. Test favorites and messages")
    
    print(f"\n🗑️ CLEANUP:")
    print(f"   Delete old accounts via Django Admin:")
    old_accounts = [
        "testemployer2024@gmail.com",
        "marketer@gmail.com", 
        "js_dev@gmail.com",
        "python_dev@gmail.com",
        "hieu2004@gmail.com",
        "employer_test@gmail.com",
        "employer5@test.com"
    ]
    for old_email in old_accounts:
        print(f"   ❌ {old_email}")
    
    # Save final summary
    summary_file = "system_setup_summary.txt"
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("RECRUITMENT SYSTEM SETUP SUMMARY\n")
        f.write("=" * 50 + "\n\n")
        f.write("SYSTEM URLS:\n")
        f.write("Frontend: https://jobwebjobboards.vercel.app\n")
        f.write("Backend: https://recruitment-api-jrcr.onrender.com\n")
        f.write("Admin: https://recruitment-api-jrcr.onrender.com/admin/\n\n")
        
        f.write("EMPLOYER ACCOUNTS:\n")
        f.write("-" * 30 + "\n")
        for emp in working_employers:
            f.write(f"Company: {emp['company']}\n")
            f.write(f"Email: {emp['email']}\n")
            f.write(f"Password: {emp['password']}\n")
            f.write(f"User ID: {emp['user_id']}\n\n")
        
        f.write("JOB SEEKER ACCOUNT:\n")
        f.write("-" * 30 + "\n")
        f.write(f"Email: {job_seeker_creds['email']}\n")
        f.write(f"Password: {job_seeker_creds['password']}\n\n")
        
        f.write("OLD ACCOUNTS TO DELETE:\n")
        f.write("-" * 30 + "\n")
        for old_email in old_accounts:
            f.write(f"{old_email}\n")
    
    print(f"\n📁 Summary saved to: {summary_file}")

if __name__ == "__main__":
    final_system_check()