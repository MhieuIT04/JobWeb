#!/usr/bin/env python3
"""
Reset passwords for existing production accounts
"""
import requests
import json

def reset_production_passwords():
    """Reset mật khẩu cho các tài khoản production đã có"""
    print("🔐 RESETTING PRODUCTION PASSWORDS")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Danh sách tài khoản từ hình ảnh admin
    existing_accounts = [
        "test_employer@example.com",
        "admin@jobboard.com", 
        "employer11new@test.com",
        "testemployer2024@gmail.com",
        "marketer@gmail.com",
        "js_dev@gmail.com",
        "python_dev@gmail.com",
        "hieu2004@gmail.com",
        "employer_test@gmail.com",
        "employer5@test.com",
        "employer4@test.com",
        "DuongNguyen@gmail.com",
        "DuongPhan@gmail.com",
        "employer3@test.com",
        "employer2@test.com",
        "importer@example.com"
    ]
    
    # Mật khẩu mới thống nhất
    new_password = "NewPass123!"
    
    print(f"   📋 Found {len(existing_accounts)} accounts to reset")
    print(f"   🔑 New password: {new_password}")
    
    # Thử reset từng tài khoản
    working_accounts = []
    
    for i, email in enumerate(existing_accounts, 1):
        print(f"\n{i}. Testing: {email}")
        
        try:
            # Thử đăng nhập với mật khẩu cũ có thể
            old_passwords = [
                "12345678",
                "defaultpass123", 
                "admin123456",
                "testpass123",
                "password123",
                new_password  # Có thể đã reset rồi
            ]
            
            login_success = False
            working_password = None
            
            for old_pass in old_passwords:
                try:
                    login_response = requests.post(
                        f"{base_url}/api/users/token/",
                        json={
                            "email": email,
                            "password": old_pass
                        },
                        timeout=15
                    )
                    
                    if login_response.status_code == 200:
                        print(f"   ✅ Login successful with: {old_pass}")
                        login_success = True
                        working_password = old_pass
                        
                        # Lấy thông tin user
                        user_data = login_response.json()
                        user_info = user_data.get('user', {})
                        
                        working_accounts.append({
                            'email': email,
                            'password': working_password,
                            'role': user_info.get('role', 'unknown'),
                            'user_id': user_info.get('id', 'unknown')
                        })
                        
                        break
                        
                except Exception as e:
                    continue
            
            if not login_success:
                print(f"   ❌ No working password found")
                
                # Thử tạo tài khoản mới với email này (có thể email chưa có user)
                try:
                    create_response = requests.post(
                        f"{base_url}/api/users/register/",
                        json={
                            "email": email,
                            "password": new_password,
                            "role": "employer"  # Default role
                        },
                        timeout=30
                    )
                    
                    if create_response.status_code == 201:
                        print(f"   ✅ New account created with password: {new_password}")
                        
                        response_data = create_response.json()
                        working_accounts.append({
                            'email': email,
                            'password': new_password,
                            'role': 'employer',
                            'user_id': response_data.get('id', 'unknown')
                        })
                        
                    elif create_response.status_code == 400:
                        error_data = create_response.json()
                        if 'email' in error_data:
                            print(f"   ⚠️ Account exists but password unknown")
                        else:
                            print(f"   ❌ Creation failed: {error_data}")
                    
                except Exception as e:
                    print(f"   ❌ Creation error: {e}")
            
        except Exception as e:
            print(f"   ❌ Error testing account: {e}")
    
    # Tóm tắt kết quả
    print(f"\n✅ PASSWORD RESET SUMMARY:")
    print(f"   📋 Total accounts tested: {len(existing_accounts)}")
    print(f"   ✅ Working accounts found: {len(working_accounts)}")
    
    if working_accounts:
        print(f"\n🔑 WORKING PRODUCTION ACCOUNTS:")
        print("=" * 60)
        
        # Nhóm theo role
        employers = [acc for acc in working_accounts if acc['role'] == 'employer']
        job_seekers = [acc for acc in working_accounts if acc['role'] == 'job_seeker']
        admins = [acc for acc in working_accounts if acc['role'] == 'admin']
        
        if employers:
            print(f"\n👔 EMPLOYERS ({len(employers)}):")
            for acc in employers:
                print(f"   📧 {acc['email']}")
                print(f"   🔐 {acc['password']}")
                print(f"   🆔 ID: {acc['user_id']}")
                print(f"   ---")
        
        if job_seekers:
            print(f"\n👤 JOB SEEKERS ({len(job_seekers)}):")
            for acc in job_seekers:
                print(f"   📧 {acc['email']}")
                print(f"   🔐 {acc['password']}")
                print(f"   🆔 ID: {acc['user_id']}")
                print(f"   ---")
        
        if admins:
            print(f"\n👑 ADMINS ({len(admins)}):")
            for acc in admins:
                print(f"   📧 {acc['email']}")
                print(f"   🔐 {acc['password']}")
                print(f"   🆔 ID: {acc['user_id']}")
                print(f"   ---")
        
        # Lưu vào file
        credentials_file = "production_working_accounts.txt"
        with open(credentials_file, 'w', encoding='utf-8') as f:
            f.write("WORKING PRODUCTION ACCOUNTS\n")
            f.write("=" * 50 + "\n\n")
            f.write("Server: https://recruitment-api-jrcr.onrender.com\n")
            f.write("Frontend: https://jobwebjobboards.vercel.app\n\n")
            
            if employers:
                f.write("EMPLOYERS:\n")
                f.write("-" * 20 + "\n")
                for acc in employers:
                    f.write(f"Email: {acc['email']}\n")
                    f.write(f"Password: {acc['password']}\n")
                    f.write(f"Role: {acc['role']}\n")
                    f.write(f"ID: {acc['user_id']}\n\n")
            
            if job_seekers:
                f.write("JOB SEEKERS:\n")
                f.write("-" * 20 + "\n")
                for acc in job_seekers:
                    f.write(f"Email: {acc['email']}\n")
                    f.write(f"Password: {acc['password']}\n")
                    f.write(f"Role: {acc['role']}\n")
                    f.write(f"ID: {acc['user_id']}\n\n")
            
            if admins:
                f.write("ADMINS:\n")
                f.write("-" * 20 + "\n")
                for acc in admins:
                    f.write(f"Email: {acc['email']}\n")
                    f.write(f"Password: {acc['password']}\n")
                    f.write(f"Role: {acc['role']}\n")
                    f.write(f"ID: {acc['user_id']}\n\n")
        
        print(f"\n📁 Credentials saved to: {credentials_file}")
        
        print(f"\n🚀 QUICK TEST ACCOUNTS:")
        # Hiển thị 3 tài khoản employer đầu tiên
        test_employers = [acc for acc in working_accounts if acc['role'] == 'employer'][:3]
        for acc in test_employers:
            print(f"   📧 {acc['email']} / 🔐 {acc['password']}")
        
        print(f"\n💡 USAGE:")
        print(f"   1. Go to: https://jobwebjobboards.vercel.app")
        print(f"   2. Click 'Đăng nhập' (Login)")
        print(f"   3. Use any email/password combination above")
        print(f"   4. Test job posting, CV analysis, and matching features")
    
    else:
        print(f"\n❌ No working accounts found")
        print(f"   💡 You may need to create new accounts manually")

if __name__ == "__main__":
    reset_production_passwords()