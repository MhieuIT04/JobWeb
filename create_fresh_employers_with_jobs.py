#!/usr/bin/env python3
"""
Create fresh employer accounts with new emails and their jobs
"""
import requests
import json
import time
from datetime import datetime, timedelta

def create_fresh_employers_with_jobs():
    """Tạo tài khoản employer mới với email mới và công việc tương ứng"""
    print("🆕 CREATING FRESH EMPLOYERS WITH JOBS")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Danh sách employer mới với email mới
    fresh_employers = [
        {
            "email": "techcorp2024@company.vn",
            "password": "TechCorp2024!",
            "company_name": "TechCorp Innovation",
            "jobs": [
                {
                    "title": "Senior Python Developer",
                    "description": "Phát triển ứng dụng web với Python Django/Flask. Yêu cầu: 4+ năm kinh nghiệm Python, Django, PostgreSQL, Redis, Docker, AWS. Làm việc với team quốc tế, môi trường startup năng động.",
                    "min_salary": 18000000,
                    "max_salary": 30000000
                },
                {
                    "title": "Full Stack JavaScript Developer",
                    "description": "Phát triển ứng dụng full-stack với React và Node.js. Yêu cầu: 3+ năm kinh nghiệm JavaScript, React, Node.js, Express, MongoDB, TypeScript. Thành thạo Git, Agile/Scrum.",
                    "min_salary": 15000000,
                    "max_salary": 25000000
                }
            ]
        },
        {
            "email": "digitalmarketing@company.vn",
            "password": "Digital2024!",
            "company_name": "Digital Marketing Solutions",
            "jobs": [
                {
                    "title": "Digital Marketing Specialist",
                    "description": "Quản lý chiến dịch marketing online, SEO, SEM, Social Media Marketing. Yêu cầu: 2+ năm kinh nghiệm, thành thạo Google Ads, Facebook Ads, Google Analytics, Zalo Ads.",
                    "min_salary": 10000000,
                    "max_salary": 18000000
                },
                {
                    "title": "Content Marketing Manager",
                    "description": "Quản lý nội dung marketing, lập kế hoạch content, viết bài PR, quản lý fanpage. Yêu cầu: Kỹ năng viết tốt, sáng tạo, am hiểu xu hướng marketing, Photoshop/Canva.",
                    "min_salary": 12000000,
                    "max_salary": 20000000
                }
            ]
        },
        {
            "email": "frontend@company.vn",
            "password": "Frontend2024!",
            "company_name": "Frontend Solutions Ltd",
            "jobs": [
                {
                    "title": "React Frontend Developer",
                    "description": "Phát triển giao diện người dùng với React, Redux, TypeScript. Yêu cầu: Thành thạo React, HTML5, CSS3, JavaScript ES6+, responsive design, UI/UX cơ bản.",
                    "min_salary": 12000000,
                    "max_salary": 20000000
                },
                {
                    "title": "Vue.js Developer",
                    "description": "Phát triển ứng dụng web với Vue.js, Vuex, Nuxt.js. Yêu cầu: 2+ năm Vue.js, JavaScript, CSS frameworks, RESTful API integration.",
                    "min_salary": 11000000,
                    "max_salary": 18000000
                }
            ]
        },
        {
            "email": "startup@company.vn",
            "password": "Startup2024!",
            "company_name": "Innovation Startup Hub",
            "jobs": [
                {
                    "title": "sáng tạo nội dung kênh truyền thông",
                    "description": "Sáng tạo nội dung cho các kênh truyền thông, quản lý fanpage, tạo video content, livestream. Yêu cầu: Sáng tạo, kỹ năng viết, am hiểu social media, Adobe Creative Suite.",
                    "min_salary": 7000000,
                    "max_salary": 12000000
                },
                {
                    "title": "phát triển giải pháp website",
                    "description": "Phát triển website và ứng dụng web cho khách hàng. Yêu cầu: HTML, CSS, JavaScript, PHP hoặc Python, MySQL, WordPress, responsive design.",
                    "min_salary": 10000000,
                    "max_salary": 18000000
                },
                {
                    "title": "thông tin yêu cầu mua hàng",
                    "description": "Xử lý thông tin yêu cầu mua hàng, tư vấn khách hàng, quản lý đơn hàng. Yêu cầu: Kỹ năng giao tiếp tốt, tư vấn bán hàng, Excel, CRM.",
                    "min_salary": 6000000,
                    "max_salary": 10000000
                },
                {
                    "title": "lương khoán trích lượng thực hiện",
                    "description": "Công việc theo khoán, trích lương theo sản lượng thực tế. Phù hợp người muốn thu nhập cao, làm việc linh hoạt, tự chủ thời gian.",
                    "min_salary": 8000000,
                    "max_salary": 20000000
                }
            ]
        },
        {
            "email": "techsolutions@company.vn",
            "password": "TechSol2024!",
            "company_name": "Tech Solutions Enterprise",
            "jobs": [
                {
                    "title": "Senior Python Developer",
                    "description": "Phát triển hệ thống backend với Python Django, thiết kế API RESTful, tối ưu database. Yêu cầu: 5+ năm Python, Django REST Framework, PostgreSQL, Redis, Celery.",
                    "min_salary": 20000000,
                    "max_salary": 35000000
                },
                {
                    "title": "Full Stack JavaScript Developer",
                    "description": "Phát triển ứng dụng full-stack với React và Node.js. Yêu cầu: React, Node.js, Express, MongoDB, TypeScript, Docker, AWS/GCP.",
                    "min_salary": 15000000,
                    "max_salary": 28000000
                },
                {
                    "title": "Digital Marketing Specialist",
                    "description": "Quản lý chiến dịch marketing online, SEO, Google Ads, Facebook Ads. Yêu cầu: 2+ năm kinh nghiệm digital marketing, Google Analytics, conversion optimization.",
                    "min_salary": 10000000,
                    "max_salary": 18000000
                }
            ]
        },
        {
            "email": "fptsoftware@company.vn",
            "password": "FPTSoft2024!",
            "company_name": "FPT Software Solutions",
            "jobs": [
                {
                    "title": "xây dựng nhiệm vụ đề án dự án",
                    "description": "Xây dựng nhiệm vụ đề án, lập kế hoạch dự án, quản lý tiến độ, phối hợp các bộ phận. Yêu cầu: Kỹ năng quản lý dự án, MS Project, Agile/Scrum, PMP là lợi thế.",
                    "min_salary": 15000000,
                    "max_salary": 25000000
                },
                {
                    "title": "cung cấp thông tin chi tiết sản phẩm",
                    "description": "Cung cấp thông tin chi tiết về sản phẩm, tư vấn khách hàng, hỗ trợ kỹ thuật, training khách hàng. Yêu cầu: Kỹ năng giao tiếp, hiểu biết sản phẩm IT.",
                    "min_salary": 8000000,
                    "max_salary": 14000000
                },
                {
                    "title": "giới thiệu tư vấn khách hàng",
                    "description": "Giới thiệu và tư vấn sản phẩm/dịch vụ IT cho khách hàng doanh nghiệp, chăm sóc khách hàng tiềm năng. Yêu cầu: Kỹ năng bán hàng B2B, tư vấn giải pháp.",
                    "min_salary": 7000000,
                    "max_salary": 15000000
                },
                {
                    "title": "phối hợp team marketing xây dựng chiến lược",
                    "description": "Phối hợp với team marketing xây dựng chiến lược, thực hiện campaign, phân tích hiệu quả. Yêu cầu: Kinh nghiệm marketing, làm việc nhóm, data analysis.",
                    "min_salary": 12000000,
                    "max_salary": 20000000
                },
                {
                    "title": "xây dựng hệ thống phần mềm",
                    "description": "Xây dựng hệ thống phần mềm phù hợp với yêu cầu doanh nghiệp, phân tích nghiệp vụ, thiết kế kiến trúc. Yêu cầu: Lập trình, phân tích hệ thống, database design.",
                    "min_salary": 18000000,
                    "max_salary": 30000000
                }
            ]
        }
    ]
    
    print(f"   📋 Will create {len(fresh_employers)} fresh employers")
    total_jobs = sum(len(emp['jobs']) for emp in fresh_employers)
    print(f"   💼 Will create {total_jobs} jobs")
    
    # Login as admin để có quyền tạo jobs
    print(f"\n🔐 ADMIN LOGIN:")
    try:
        admin_login = requests.post(
            f"{base_url}/api/users/token/",
            json={
                "email": "admin@jobboard.com",
                "password": "admin123456"
            },
            timeout=15
        )
        
        if admin_login.status_code == 200:
            admin_token = admin_login.json().get('access')
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            print(f"   ✅ Admin login successful")
        else:
            print(f"   ❌ Admin login failed")
            admin_headers = None
    except Exception as e:
        print(f"   ❌ Admin login error: {e}")
        admin_headers = None
    
    # Tạo từng employer
    created_employers = []
    
    for i, employer_data in enumerate(fresh_employers, 1):
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
                
                # Login employer để tạo jobs
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
                    employer_headers = {"Authorization": f"Bearer {access_token}"}
                    
                    print(f"   🔐 Employer login successful")
                    
                    # Lưu thông tin employer
                    created_employers.append({
                        'email': employer_data['email'],
                        'password': employer_data['password'],
                        'company_name': employer_data['company_name'],
                        'user_id': employer_id,
                        'jobs': employer_data['jobs'],
                        'headers': employer_headers
                    })
                    
                    print(f"   📝 Prepared {len(employer_data['jobs'])} jobs for manual creation")
                    
                else:
                    print(f"   ❌ Employer login failed")
                
            elif create_response.status_code == 400:
                error_data = create_response.json()
                print(f"   ❌ Creation failed: {error_data}")
                
            else:
                print(f"   ❌ Creation failed: {create_response.status_code}")
            
            # Delay
            time.sleep(1)
            
        except Exception as e:
            print(f"   ❌ Error creating employer: {e}")
    
    # Tóm tắt kết quả
    print(f"\n✅ CREATION SUMMARY:")
    print(f"   👥 Employers created: {len(created_employers)}")
    
    if created_employers:
        print(f"\n🏢 CREATED FRESH EMPLOYERS:")
        print("=" * 70)
        
        for emp in created_employers:
            print(f"🏢 Company: {emp['company_name']}")
            print(f"📧 Email: {emp['email']}")
            print(f"🔐 Password: {emp['password']}")
            print(f"🆔 User ID: {emp['user_id']}")
            print(f"💼 Jobs to create: {len(emp['jobs'])}")
            
            # Hiển thị danh sách jobs
            for j, job in enumerate(emp['jobs'], 1):
                print(f"   {j}. {job['title']}")
                print(f"      💰 {job['min_salary']:,} - {job['max_salary']:,} VND")
            
            print("-" * 50)
        
        # Lưu credentials và job data
        credentials_file = "fresh_employers_complete.txt"
        with open(credentials_file, 'w', encoding='utf-8') as f:
            f.write("FRESH EMPLOYER ACCOUNTS WITH JOBS\n")
            f.write("=" * 60 + "\n\n")
            f.write("Server: https://recruitment-api-jrcr.onrender.com\n")
            f.write("Frontend: https://jobwebjobboards.vercel.app\n\n")
            
            for emp in created_employers:
                f.write(f"Company: {emp['company_name']}\n")
                f.write(f"Email: {emp['email']}\n")
                f.write(f"Password: {emp['password']}\n")
                f.write(f"User ID: {emp['user_id']}\n")
                f.write(f"Jobs to create: {len(emp['jobs'])}\n\n")
                
                for j, job in enumerate(emp['jobs'], 1):
                    f.write(f"  Job {j}: {job['title']}\n")
                    f.write(f"  Salary: {job['min_salary']:,} - {job['max_salary']:,} VND\n")
                    f.write(f"  Description: {job['description'][:100]}...\n\n")
                
                f.write("-" * 60 + "\n")
        
        # Lưu job data riêng để dễ copy-paste
        jobs_file = "jobs_to_create.json"
        with open(jobs_file, 'w', encoding='utf-8') as f:
            jobs_data = {}
            for emp in created_employers:
                jobs_data[emp['email']] = emp['jobs']
            json.dump(jobs_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n📁 Files created:")
        print(f"   📋 Credentials: {credentials_file}")
        print(f"   💼 Jobs data: {jobs_file}")
        
        print(f"\n🚀 QUICK TEST ACCOUNTS:")
        for emp in created_employers[:3]:
            print(f"   📧 {emp['email']} / 🔐 {emp['password']}")
        
        print(f"\n💡 NEXT STEPS:")
        print(f"   1. Login to https://jobwebjobboards.vercel.app")
        print(f"   2. Use any employer account above")
        print(f"   3. Create jobs manually through web interface")
        print(f"   4. Or use the job data from {jobs_file}")
        print(f"   5. Test CV upload and matching functionality")
        
        print(f"\n🗑️ OLD ACCOUNTS TO DELETE:")
        old_accounts = [
            "testemployer2024@gmail.com",
            "marketer@gmail.com", 
            "js_dev@gmail.com",
            "python_dev@gmail.com",
            "hieu2004@gmail.com",
            "employer_test@gmail.com",
            "employer5@test.com"
        ]
        
        print(f"   Delete these via Django Admin:")
        for old_email in old_accounts:
            print(f"   ❌ {old_email}")
    
    else:
        print(f"\n❌ No employers were created successfully")

if __name__ == "__main__":
    create_fresh_employers_with_jobs()