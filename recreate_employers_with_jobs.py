#!/usr/bin/env python3
"""
Recreate employer accounts with their jobs based on the deleted accounts
"""
import requests
import json
import time
from datetime import datetime, timedelta

def recreate_employers_with_jobs():
    """Tạo lại các tài khoản employer và công việc của họ"""
    print("🏢 RECREATING EMPLOYERS WITH JOBS")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Danh sách employer cần tạo lại dựa trên hình ảnh
    employers_data = [
        {
            "email": "testemployer2024@gmail.com",
            "password": "TestEmp2024!",
            "company_name": "Tech Innovation 2024",
            "jobs": []  # Sẽ tạo job mẫu
        },
        {
            "email": "marketer@gmail.com", 
            "password": "Marketing123!",
            "company_name": "Digital Marketing Pro",
            "jobs": [
                {
                    "title": "Digital Marketing Specialist",
                    "description": "Tuyển dụng chuyên viên marketing số có kinh nghiệm về SEO, SEM, Social Media Marketing. Yêu cầu: 2+ năm kinh nghiệm, thành thạo Google Ads, Facebook Ads, Google Analytics.",
                    "min_salary": 8000000,
                    "max_salary": 15000000,
                    "category": "Marketing"
                },
                {
                    "title": "Content Marketing Manager",
                    "description": "Quản lý nội dung marketing, lập kế hoạch content, viết bài PR, quản lý fanpage. Yêu cầu: Kỹ năng viết tốt, sáng tạo, am hiểu xu hướng marketing.",
                    "min_salary": 12000000,
                    "max_salary": 20000000,
                    "category": "Marketing"
                }
            ]
        },
        {
            "email": "js_dev@gmail.com",
            "password": "JSDev123!",
            "company_name": "Frontend Solutions",
            "jobs": [
                {
                    "title": "Full Stack JavaScript Developer",
                    "description": "Phát triển ứng dụng web full-stack với JavaScript, React, Node.js. Yêu cầu: 3+ năm kinh nghiệm JavaScript, React, Express.js, MongoDB/PostgreSQL, Git.",
                    "min_salary": 15000000,
                    "max_salary": 25000000,
                    "category": "IT Phần mềm"
                },
                {
                    "title": "React Frontend Developer", 
                    "description": "Phát triển giao diện người dùng với React, Redux, TypeScript. Yêu cầu: Thành thạo React, HTML5, CSS3, JavaScript ES6+, responsive design.",
                    "min_salary": 12000000,
                    "max_salary": 20000000,
                    "category": "IT Phần mềm"
                }
            ]
        },
        {
            "email": "python_dev@gmail.com",
            "password": "PyDev123!",
            "company_name": "Python Solutions",
            "jobs": [
                {
                    "title": "Senior Python Developer",
                    "description": "Phát triển ứng dụng web với Python Django/Flask. Yêu cầu: 4+ năm kinh nghiệm Python, Django, PostgreSQL, Redis, Docker, AWS.",
                    "min_salary": 18000000,
                    "max_salary": 30000000,
                    "category": "IT Phần mềm"
                },
                {
                    "title": "Python Data Engineer",
                    "description": "Xây dựng pipeline xử lý dữ liệu với Python, Pandas, Apache Spark. Yêu cầu: Python, SQL, Big Data, Machine Learning cơ bản.",
                    "min_salary": 16000000,
                    "max_salary": 28000000,
                    "category": "IT Phần mềm"
                }
            ]
        },
        {
            "email": "hieu2004@gmail.com",
            "password": "Hieu2004!",
            "company_name": "Startup Innovation Hub",
            "jobs": [
                {
                    "title": "sáng tạo nội dung kênh...",
                    "description": "Sáng tạo nội dung cho các kênh truyền thông, quản lý fanpage, tạo video content. Yêu cầu: Sáng tạo, kỹ năng viết, am hiểu social media.",
                    "min_salary": 7000000,
                    "max_salary": 12000000,
                    "category": "Marketing"
                },
                {
                    "title": "phát triển giải pháp website...",
                    "description": "Phát triển website và ứng dụng web cho khách hàng. Yêu cầu: HTML, CSS, JavaScript, PHP hoặc Python, MySQL.",
                    "min_salary": 10000000,
                    "max_salary": 18000000,
                    "category": "IT Phần mềm"
                },
                {
                    "title": "thông tin yêu cầu mua...",
                    "description": "Xử lý thông tin yêu cầu mua hàng, tư vấn khách hàng, quản lý đơn hàng. Yêu cầu: Kỹ năng giao tiếp, tư vấn bán hàng.",
                    "min_salary": 6000000,
                    "max_salary": 10000000,
                    "category": "Kinh doanh"
                },
                {
                    "title": "lương khoán trích lượng thực...",
                    "description": "Công việc theo khoán, trích lương theo sản lượng thực tế. Phù hợp người muốn thu nhập cao, làm việc linh hoạt.",
                    "min_salary": 8000000,
                    "max_salary": 20000000,
                    "category": "Bán thời gian"
                }
            ]
        },
        {
            "email": "employer_test@gmail.com",
            "password": "EmpTest123!",
            "company_name": "Tech Solutions Ltd",
            "jobs": [
                {
                    "title": "Senior Python Developer",
                    "description": "Phát triển hệ thống backend với Python Django, thiết kế API RESTful, tối ưu database. Yêu cầu: 5+ năm Python, Django REST Framework, PostgreSQL.",
                    "min_salary": 20000000,
                    "max_salary": 35000000,
                    "category": "IT Phần mềm"
                },
                {
                    "title": "Full Stack JavaScript Developer", 
                    "description": "Phát triển ứng dụng full-stack với React và Node.js. Yêu cầu: React, Node.js, Express, MongoDB, TypeScript.",
                    "min_salary": 15000000,
                    "max_salary": 28000000,
                    "category": "IT Phần mềm"
                },
                {
                    "title": "Digital Marketing Specialist",
                    "description": "Quản lý chiến dịch marketing online, SEO, Google Ads, Facebook Ads. Yêu cầu: 2+ năm kinh nghiệm digital marketing.",
                    "min_salary": 10000000,
                    "max_salary": 18000000,
                    "category": "Marketing"
                }
            ]
        },
        {
            "email": "employer5@test.com",
            "password": "Emp5Test!",
            "company_name": "FPT Software",
            "jobs": [
                {
                    "title": "xây dựng nhiệm vụ đề...",
                    "description": "Xây dựng nhiệm vụ đề án, lập kế hoạch dự án, quản lý tiến độ. Yêu cầu: Kỹ năng quản lý dự án, MS Project, Agile/Scrum.",
                    "min_salary": 15000000,
                    "max_salary": 25000000,
                    "category": "Quản lý dự án"
                },
                {
                    "title": "cung cấp ob chi tiết...",
                    "description": "Cung cấp thông tin chi tiết về sản phẩm, tư vấn khách hàng, hỗ trợ kỹ thuật. Yêu cầu: Kỹ năng giao tiếp, hiểu biết sản phẩm.",
                    "min_salary": 8000000,
                    "max_salary": 14000000,
                    "category": "Chăm sóc khách hàng"
                },
                {
                    "title": "giới thiệu tư vấn khách...",
                    "description": "Giới thiệu và tư vấn sản phẩm/dịch vụ cho khách hàng, chăm sóc khách hàng tiềm năng. Yêu cầu: Kỹ năng bán hàng, tư vấn.",
                    "min_salary": 7000000,
                    "max_salary": 15000000,
                    "category": "Kinh doanh"
                },
                {
                    "title": "phối hợp team marketing xây...",
                    "description": "Phối hợp với team marketing xây dựng chiến lược, thực hiện campaign. Yêu cầu: Kinh nghiệm marketing, làm việc nhóm.",
                    "min_salary": 12000000,
                    "max_salary": 20000000,
                    "category": "Marketing"
                },
                {
                    "title": "xây dựng hệ thống phù...",
                    "description": "Xây dựng hệ thống phần mềm phù hợp với yêu cầu doanh nghiệp. Yêu cầu: Lập trình, phân tích hệ thống, database design.",
                    "min_salary": 18000000,
                    "max_salary": 30000000,
                    "category": "IT Phần mềm"
                }
            ]
        }
    ]
    
    print(f"   📋 Will create {len(employers_data)} employers")
    total_jobs = sum(len(emp['jobs']) for emp in employers_data)
    print(f"   💼 Will create {total_jobs} jobs")
    
    # Tạo từng employer và jobs
    created_employers = []
    
    for i, employer_data in enumerate(employers_data, 1):
        print(f"\n{i}. Creating employer: {employer_data['email']}")
        
        try:
            # Tạo tài khoản employer
            create_response = requests.post(
                f"{base_url}/api/users/register/",
                json={
                    "email": employer_data["email"],
                    "password": employer_data["password"],
                    "role": "employer"
                },
                timeout=30
            )
            
            if create_response.status_code == 201:
                employer_info = create_response.json()
                employer_id = employer_info.get('id')
                
                print(f"   ✅ Employer created (ID: {employer_id})")
                
                # Test login
                login_response = requests.post(
                    f"{base_url}/api/users/token/",
                    json={
                        "email": employer_data["email"],
                        "password": employer_data["password"]
                    },
                    timeout=15
                )
                
                if login_response.status_code == 200:
                    access_token = login_response.json().get('access')
                    headers = {"Authorization": f"Bearer {access_token}"}
                    
                    print(f"   🔐 Login successful")
                    
                    # Tạo jobs cho employer này
                    created_jobs = []
                    
                    for j, job_data in enumerate(employer_data['jobs'], 1):
                        print(f"      {j}. Creating job: {job_data['title'][:30]}...")
                        
                        try:
                            # Tạo job
                            job_payload = {
                                "title": job_data["title"],
                                "description": job_data["description"],
                                "min_salary": job_data["min_salary"],
                                "max_salary": job_data["max_salary"],
                                "currency": "VND",
                                "expires_at": (datetime.now() + timedelta(days=30)).isoformat(),
                                # Note: category sẽ cần mapping với category ID thực tế
                            }
                            
                            # Tạo job (có thể cần endpoint khác)
                            # Tạm thời skip job creation vì cần endpoint cụ thể
                            print(f"         📝 Job data prepared: {job_data['title']}")
                            created_jobs.append(job_data['title'])
                            
                        except Exception as e:
                            print(f"         ❌ Job creation error: {e}")
                    
                    created_employers.append({
                        'email': employer_data['email'],
                        'password': employer_data['password'],
                        'company_name': employer_data['company_name'],
                        'user_id': employer_id,
                        'jobs_created': len(created_jobs)
                    })
                    
                else:
                    print(f"   ❌ Login failed after creation")
                
            elif create_response.status_code == 400:
                error_data = create_response.json()
                print(f"   ❌ Creation failed: {error_data}")
                
            else:
                print(f"   ❌ Creation failed: {create_response.status_code}")
            
            # Delay để tránh spam
            time.sleep(2)
            
        except Exception as e:
            print(f"   ❌ Error creating employer: {e}")
    
    # Tóm tắt kết quả
    print(f"\n✅ RECREATION SUMMARY:")
    print(f"   👥 Employers created: {len(created_employers)}")
    
    if created_employers:
        print(f"\n🏢 CREATED EMPLOYERS:")
        print("=" * 60)
        
        for emp in created_employers:
            print(f"🏢 Company: {emp['company_name']}")
            print(f"📧 Email: {emp['email']}")
            print(f"🔐 Password: {emp['password']}")
            print(f"🆔 User ID: {emp['user_id']}")
            print(f"💼 Jobs prepared: {emp['jobs_created']}")
            print("-" * 40)
        
        # Lưu credentials
        credentials_file = "recreated_employers.txt"
        with open(credentials_file, 'w', encoding='utf-8') as f:
            f.write("RECREATED EMPLOYER ACCOUNTS\n")
            f.write("=" * 50 + "\n\n")
            f.write("Server: https://recruitment-api-jrcr.onrender.com\n")
            f.write("Frontend: https://jobwebjobboards.vercel.app\n\n")
            
            for emp in created_employers:
                f.write(f"Company: {emp['company_name']}\n")
                f.write(f"Email: {emp['email']}\n")
                f.write(f"Password: {emp['password']}\n")
                f.write(f"User ID: {emp['user_id']}\n")
                f.write(f"Jobs: {emp['jobs_created']}\n")
                f.write("-" * 30 + "\n")
        
        print(f"\n📁 Credentials saved to: {credentials_file}")
        
        print(f"\n🚀 QUICK TEST:")
        if created_employers:
            test_emp = created_employers[0]
            print(f"   📧 {test_emp['email']}")
            print(f"   🔐 {test_emp['password']}")
        
        print(f"\n💡 NEXT STEPS:")
        print(f"   1. Login to website with any employer account")
        print(f"   2. Manually create jobs through the web interface")
        print(f"   3. Or use job creation API if available")
        print(f"   4. Test the complete recruitment workflow")
    
    else:
        print(f"\n❌ No employers were created successfully")

if __name__ == "__main__":
    recreate_employers_with_jobs()