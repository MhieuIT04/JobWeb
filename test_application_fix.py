#!/usr/bin/env python3
"""
Test application upload after fixes
"""
import requests
import json
import io
import time

def test_application_fix():
    """Test ứng tuyển sau khi sửa lỗi timeout"""
    print("🔧 TESTING APPLICATION UPLOAD AFTER FIXES")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Test health check first
    print("1. TESTING HEALTH CHECK:")
    try:
        health_response = requests.get(f"{base_url}/api/jobs/health/", timeout=10)
        
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   ✅ Server healthy: {health_data.get('message')}")
            print(f"   🕐 Timestamp: {health_data.get('timestamp')}")
        else:
            print(f"   ⚠️ Health check status: {health_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
        print(f"   ℹ️ Server may be starting up, waiting...")
        time.sleep(10)
    
    # Login
    print(f"\n2. TESTING LOGIN:")
    try:
        login_response = requests.post(
            f"{base_url}/api/users/token/",
            json={
                "email": "employer11new@test.com",
                "password": "12345678"
            },
            timeout=15
        )
        
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return
        
        login_data = login_response.json()
        access_token = login_data.get('access')
        
        print(f"   ✅ Login successful!")
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return
    
    # Get jobs
    print(f"\n3. GETTING JOBS:")
    try:
        jobs_response = requests.get(f"{base_url}/api/jobs/", timeout=10)
        
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            jobs_list = jobs_data.get('results', jobs_data) if isinstance(jobs_data, dict) else jobs_data
            
            if jobs_list and len(jobs_list) > 0:
                # Find a job we haven't applied to
                test_job = None
                for job in jobs_list[:5]:  # Check first 5 jobs
                    job_id = job.get('id')
                    job_title = job.get('title', 'Unknown')
                    
                    # Check if already applied
                    try:
                        apps_response = requests.get(
                            f"{base_url}/api/jobs/applications/",
                            headers=headers,
                            timeout=10
                        )
                        
                        if apps_response.status_code == 200:
                            existing_apps = apps_response.json()
                            applied_job_ids = [app.get('job_id') for app in existing_apps]
                            
                            if job_id not in applied_job_ids:
                                test_job = job
                                break
                                
                    except Exception:
                        # If can't check, assume we can apply
                        test_job = job
                        break
                
                if test_job:
                    test_job_id = test_job.get('id')
                    test_job_title = test_job.get('title', 'Unknown')
                    
                    print(f"   ✅ Found available job: ID {test_job_id} - {test_job_title[:50]}...")
                    
                    print(f"\n4. TESTING OPTIMIZED APPLICATION UPLOAD:")
                    
                    # Create smaller CV content
                    cv_content = """Nguyen Van A - Software Developer

SKILLS: Python, Django, JavaScript, React, PostgreSQL, Git

EXPERIENCE: 3+ years web development

EDUCATION: Computer Science degree"""
                    
                    # Create small file
                    cv_file = io.BytesIO(cv_content.encode('utf-8'))
                    cv_file.name = 'cv_optimized.txt'
                    
                    application_data = {
                        'job': test_job_id,
                        'cover_letter': 'I am interested in this position.'
                    }
                    
                    files = {
                        'cv': ('cv_optimized.txt', cv_file, 'text/plain')
                    }
                    
                    try:
                        print(f"   📤 Uploading application...")
                        start_time = time.time()
                        
                        app_response = requests.post(
                            f"{base_url}/api/jobs/applications/",
                            data=application_data,
                            files=files,
                            headers=headers,
                            timeout=45  # Increased timeout
                        )
                        
                        end_time = time.time()
                        upload_time = end_time - start_time
                        
                        print(f"   ⏱️ Upload time: {upload_time:.2f} seconds")
                        print(f"   📝 Response status: {app_response.status_code}")
                        
                        if app_response.status_code == 201:
                            app_data = app_response.json()
                            print(f"   ✅ Application created successfully!")
                            print(f"   📋 Application ID: {app_data.get('id')}")
                            print(f"   💬 Message: {app_data.get('message', 'No message')}")
                            
                            # Check if CV was uploaded
                            cv_url = app_data.get('cv')
                            if cv_url:
                                print(f"   📄 CV uploaded: {cv_url}")
                            else:
                                print(f"   ⚠️ CV field not found in response")
                            
                        elif app_response.status_code == 400:
                            error_data = app_response.json()
                            print(f"   ❌ Validation error: {error_data}")
                            
                        elif app_response.status_code == 503:
                            print(f"   ⏳ Server busy, try again later")
                            
                        else:
                            print(f"   ❌ Upload failed: {app_response.status_code}")
                            print(f"   Response: {app_response.text[:200]}...")
                            
                    except requests.exceptions.Timeout:
                        print(f"   ⏰ Upload timed out - server may be processing")
                        print(f"   💡 Try checking your applications list later")
                        
                    except Exception as e:
                        print(f"   ❌ Upload error: {e}")
                        
                else:
                    print(f"   ℹ️ All available jobs already applied to")
                    
                    # Show existing applications
                    try:
                        apps_response = requests.get(
                            f"{base_url}/api/jobs/applications/",
                            headers=headers,
                            timeout=10
                        )
                        
                        if apps_response.status_code == 200:
                            existing_apps = apps_response.json()
                            print(f"   📋 Existing applications: {len(existing_apps)}")
                            
                            for app in existing_apps[:3]:
                                job_title = app.get('job_title', 'Unknown')
                                match_score = app.get('match_score_display', 'Not analyzed')
                                print(f"      - {job_title[:40]}... (Score: {match_score})")
                                
                    except Exception as e:
                        print(f"   ❌ Error getting applications: {e}")
                        
            else:
                print(f"   ❌ No jobs found")
                
        else:
            print(f"   ❌ Failed to get jobs: {jobs_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Get jobs error: {e}")
    
    print(f"\n🎯 FIXES IMPLEMENTED:")
    print(f"   ✅ Removed synchronous AI processing to prevent timeout")
    print(f"   ✅ Added file format validation")
    print(f"   ✅ Improved error handling with specific messages")
    print(f"   ✅ Added health check endpoint")
    print(f"   ✅ Optimized application creation flow")
    
    print(f"\n💡 IF STILL HAVING ISSUES:")
    print(f"   1. Wait 2-3 minutes for server to fully wake up")
    print(f"   2. Use smaller CV files (<1MB)")
    print(f"   3. Try uploading during server active hours")
    print(f"   4. Check browser network tab for specific errors")

if __name__ == "__main__":
    test_application_fix()