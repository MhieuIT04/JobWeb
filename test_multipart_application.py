#!/usr/bin/env python3
"""
Test application with proper multipart data
"""
import requests
import io

def test_multipart_application():
    """Test ứng tuyển với multipart data đúng cách"""
    print("📤 TESTING MULTIPART APPLICATION UPLOAD")
    print("=" * 50)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Login
    print("1. LOGIN:")
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
    
    # Get jobs
    print(f"\n2. GET JOBS:")
    try:
        jobs_response = requests.get(f"{base_url}/api/jobs/", timeout=10)
        if jobs_response.status_code == 200:
            jobs = jobs_response.json()
            job_list = jobs.get('results', jobs) if isinstance(jobs, dict) else jobs
            
            if job_list and len(job_list) > 1:
                # Try second job to avoid "already applied" error
                job_id = job_list[1]['id']
                job_title = job_list[1]['title']
                print(f"   ✅ Using job: ID {job_id} - {job_title[:40]}...")
                
                # Test multipart upload
                print(f"\n3. TEST MULTIPART UPLOAD:")
                
                # Create CV content
                cv_content = """John Doe - Developer
                
Skills: Python, JavaScript, React
Experience: 3 years
Education: Computer Science"""
                
                cv_file = io.BytesIO(cv_content.encode('utf-8'))
                
                # Prepare multipart data
                data = {
                    'job': str(job_id),
                    'cover_letter': 'I am very interested in this position and believe my skills match the requirements.'
                }
                
                files = {
                    'cv': ('resume.txt', cv_file, 'text/plain')
                }
                
                try:
                    app_response = requests.post(
                        f"{base_url}/api/jobs/applications/",
                        data=data,  # Use data for form fields
                        files=files,  # Use files for file upload
                        headers=headers,
                        timeout=30
                    )
                    
                    print(f"   📝 Status: {app_response.status_code}")
                    
                    if app_response.status_code == 201:
                        app_data = app_response.json()
                        print(f"   ✅ Application created!")
                        print(f"   📋 ID: {app_data.get('id')}")
                        print(f"   📄 CV: {app_data.get('cv', 'No CV field')}")
                        print(f"   💬 Message: {app_data.get('message', 'No message')}")
                        
                    elif app_response.status_code == 400:
                        error_data = app_response.json()
                        print(f"   ❌ Validation error: {error_data}")
                        
                        # If already applied, try without CV
                        if 'đã ứng tuyển' in str(error_data):
                            print(f"   🔄 Already applied, trying different approach...")
                            
                    else:
                        print(f"   ❌ Failed: {app_response.status_code}")
                        print(f"   Response: {app_response.text[:300]}...")
                        
                except Exception as e:
                    print(f"   ❌ Upload error: {e}")
                    
            else:
                print(f"   ❌ Not enough jobs found")
                
        else:
            print(f"   ❌ Can't get jobs: {jobs_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Check final applications
    print(f"\n4. FINAL CHECK:")
    try:
        apps_response = requests.get(
            f"{base_url}/api/jobs/applications/",
            headers=headers,
            timeout=10
        )
        
        if apps_response.status_code == 200:
            apps = apps_response.json()
            print(f"   📋 Total applications: {len(apps)}")
            
            for app in apps[:3]:
                job_title = app.get('job_title', 'Unknown')
                status = app.get('status', 'Unknown')
                match_score = app.get('match_score_display', 'Not analyzed')
                cv_url = app.get('cv', 'No CV')
                
                print(f"      - {job_title[:30]}... | Status: {status} | Score: {match_score}")
                if cv_url and cv_url != 'No CV':
                    print(f"        CV: ✅ Uploaded")
                else:
                    print(f"        CV: ❌ Missing")
                    
        else:
            print(f"   ❌ Can't get applications: {apps_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print(f"\n💡 TROUBLESHOOTING TIPS:")
    print(f"   1. Make sure to use multipart/form-data for file uploads")
    print(f"   2. Use 'data' parameter for form fields, 'files' for file uploads")
    print(f"   3. Each user can only apply once per job")
    print(f"   4. Server may take 30-60 seconds to wake up from cold start")

if __name__ == "__main__":
    test_multipart_application()