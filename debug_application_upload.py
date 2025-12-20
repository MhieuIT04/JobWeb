#!/usr/bin/env python3
"""
Debug application upload issue
"""
import requests
import json
import io

def debug_application_upload():
    """Debug lỗi ứng tuyển và upload CV"""
    print("📝 DEBUGGING APPLICATION UPLOAD")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Test với tài khoản đã tạo
    test_credentials = {
        "email": "employer11new@test.com",
        "password": "12345678"
    }
    
    print("1. TESTING LOGIN:")
    try:
        # Login first
        login_response = requests.post(
            f"{base_url}/api/users/token/",
            json=test_credentials,
            timeout=30
        )
        
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return
        
        login_data = login_response.json()
        access_token = login_data.get('access')
        user_info = login_data.get('user', {})
        
        print(f"   ✅ Login successful!")
        print(f"   👤 User: {user_info.get('email')} (ID: {user_info.get('id')})")
        
        # Headers for authenticated requests
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return
    
    print(f"\n2. GETTING AVAILABLE JOBS:")
    try:
        jobs_response = requests.get(
            f"{base_url}/api/jobs/",
            timeout=15
        )
        
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            jobs_list = jobs_data.get('results', jobs_data) if isinstance(jobs_data, dict) else jobs_data
            
            if jobs_list and len(jobs_list) > 0:
                test_job = jobs_list[0]
                test_job_id = test_job.get('id')
                test_job_title = test_job.get('title', 'Unknown')
                
                print(f"   ✅ Found test job: ID {test_job_id} - {test_job_title[:50]}...")
                
                print(f"\n3. TESTING APPLICATION CREATION:")
                
                # Create a fake CV file
                cv_content = """
                Nguyễn Văn A - Software Developer
                
                THÔNG TIN CÁ NHÂN:
                Email: nguyenvana@example.com
                Điện thoại: 0123456789
                
                KỸ NĂNG:
                • Lập trình: Python, Django, JavaScript, React
                • Cơ sở dữ liệu: PostgreSQL, MySQL
                • Công cụ: Git, Docker, VS Code
                • Kỹ năng mềm: Giao tiếp, làm việc nhóm, giải quyết vấn đề
                
                KINH NGHIỆM:
                • 3+ năm phát triển web với Python/Django
                • Xây dựng ứng dụng web full-stack
                • Thiết kế và tối ưu cơ sở dữ liệu
                • Làm việc theo phương pháp Agile
                
                HỌC VẤN:
                • Cử nhân Công nghệ Thông tin
                • Các khóa học online về AI/ML
                """
                
                # Create file-like object
                cv_file = io.BytesIO(cv_content.encode('utf-8'))
                cv_file.name = 'test_cv.txt'
                
                # Test application data
                application_data = {
                    'job': test_job_id,
                    'cover_letter': 'Tôi rất quan tâm đến vị trí này và tin rằng kỹ năng của tôi phù hợp với yêu cầu công việc.'
                }
                
                files = {
                    'cv': ('test_cv.txt', cv_file, 'text/plain')
                }
                
                try:
                    # Test POST application
                    app_response = requests.post(
                        f"{base_url}/api/jobs/applications/",
                        data=application_data,
                        files=files,
                        headers=headers,
                        timeout=30
                    )
                    
                    print(f"   📝 POST Application Status: {app_response.status_code}")
                    
                    if app_response.status_code == 201:
                        app_data = app_response.json()
                        app_id = app_data.get('id')
                        
                        print(f"   ✅ Application created successfully!")
                        print(f"   📋 Application ID: {app_id}")
                        print(f"   📄 CV uploaded: {app_data.get('cv', 'No CV field')}")
                        
                        # Test GET applications
                        print(f"\n4. TESTING GET APPLICATIONS:")
                        get_response = requests.get(
                            f"{base_url}/api/jobs/applications/",
                            headers=headers,
                            timeout=15
                        )
                        
                        print(f"   📋 GET Applications Status: {get_response.status_code}")
                        
                        if get_response.status_code == 200:
                            apps_data = get_response.json()
                            print(f"   ✅ Found {len(apps_data)} applications")
                            
                            if apps_data:
                                latest_app = apps_data[0]
                                print(f"   📝 Latest application: Job '{latest_app.get('job_title', 'Unknown')}'")
                                print(f"   📊 Match score: {latest_app.get('match_score_display', 'Not analyzed')}")
                        
                    elif app_response.status_code == 400:
                        error_data = app_response.json()
                        print(f"   ❌ Validation error: {error_data}")
                        
                        # Check if already applied
                        if 'đã ứng tuyển' in str(error_data):
                            print(f"   ℹ️ User already applied to this job")
                            
                            # Try with different job
                            if len(jobs_list) > 1:
                                test_job_2 = jobs_list[1]
                                test_job_id_2 = test_job_2.get('id')
                                
                                print(f"   🔄 Trying with different job: ID {test_job_id_2}")
                                
                                application_data['job'] = test_job_id_2
                                cv_file.seek(0)  # Reset file pointer
                                
                                app_response_2 = requests.post(
                                    f"{base_url}/api/jobs/applications/",
                                    data=application_data,
                                    files={'cv': ('test_cv.txt', cv_file, 'text/plain')},
                                    headers=headers,
                                    timeout=30
                                )
                                
                                print(f"   📝 Second attempt status: {app_response_2.status_code}")
                                
                                if app_response_2.status_code == 201:
                                    print(f"   ✅ Second application successful!")
                                else:
                                    print(f"   ❌ Second attempt failed: {app_response_2.text}")
                        
                    else:
                        print(f"   ❌ Application failed: {app_response.status_code}")
                        print(f"   Response: {app_response.text}")
                        
                except Exception as e:
                    print(f"   ❌ Application error: {e}")
                    
            else:
                print(f"   ❌ No jobs found to test with")
                
        else:
            print(f"   ❌ Failed to get jobs: {jobs_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Get jobs error: {e}")
    
    print(f"\n💡 COMMON ISSUES AND SOLUTIONS:")
    print(f"   1. File size too large (>10MB) → Use smaller file")
    print(f"   2. Invalid file format → Use PDF, DOC, DOCX, or TXT")
    print(f"   3. Already applied → Each user can only apply once per job")
    print(f"   4. Job not approved → Can only apply to approved jobs")
    print(f"   5. Authentication issues → Make sure token is valid")
    print(f"   6. Server timeout → Wait for server to wake up from cold start")

if __name__ == "__main__":
    debug_application_upload()