#!/usr/bin/env python3
"""
Simple application test to debug the 500 error
"""
import requests
import json

def simple_application_test():
    """Test ứng tuyển đơn giản để debug lỗi 500"""
    print("🔍 SIMPLE APPLICATION DEBUG TEST")
    print("=" * 50)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Test health at root
    print("1. TESTING ROOT HEALTH:")
    try:
        health_response = requests.get(f"{base_url}/", timeout=10)
        print(f"   Status: {health_response.status_code}")
        if health_response.status_code == 200:
            print(f"   Response: {health_response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Login
    print(f"\n2. LOGIN:")
    try:
        login_response = requests.post(
            f"{base_url}/api/users/token/",
            json={"email": "employer11new@test.com", "password": "12345678"},
            timeout=15
        )
        
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return
        
        access_token = login_response.json().get('access')
        print(f"   ✅ Login OK")
        
        headers = {"Authorization": f"Bearer {access_token}"}
        
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return
    
    # Test without file first
    print(f"\n3. TEST APPLICATION WITHOUT CV:")
    try:
        # Get a job ID
        jobs_response = requests.get(f"{base_url}/api/jobs/", timeout=10)
        if jobs_response.status_code == 200:
            jobs = jobs_response.json()
            job_list = jobs.get('results', jobs) if isinstance(jobs, dict) else jobs
            if job_list:
                job_id = job_list[0]['id']
                print(f"   Using job ID: {job_id}")
                
                # Try application without CV
                app_data = {
                    'job': job_id,
                    'cover_letter': 'Test application'
                }
                
                app_response = requests.post(
                    f"{base_url}/api/jobs/applications/",
                    json=app_data,
                    headers=headers,
                    timeout=15
                )
                
                print(f"   Status: {app_response.status_code}")
                print(f"   Response: {app_response.text[:200]}...")
                
            else:
                print(f"   ❌ No jobs found")
        else:
            print(f"   ❌ Can't get jobs: {jobs_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check existing applications
    print(f"\n4. CHECK EXISTING APPLICATIONS:")
    try:
        apps_response = requests.get(
            f"{base_url}/api/jobs/applications/",
            headers=headers,
            timeout=10
        )
        
        print(f"   Status: {apps_response.status_code}")
        if apps_response.status_code == 200:
            apps = apps_response.json()
            print(f"   Found {len(apps)} applications")
        else:
            print(f"   Response: {apps_response.text[:200]}...")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    simple_application_test()