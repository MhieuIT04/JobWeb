#!/usr/bin/env python3
"""
Create new employer accounts on production server
"""
import requests
import json
import time

def create_production_employers():
    """Tạo tài khoản employer mới trên production"""
    print("👥 CREATING PRODUCTION EMPLOYER ACCOUNTS")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Danh sách employer mới để tạo
    new_employers = [
        {
            "email": "techcorp@company.com",
            "password": "TechCorp123!",
            "company_name": "TechCorp Solutions",
            "role": "employer"
        },
        {
            "email": "digitalvn@company.com", 
            "password": "Digital123!",
            "company_name": "Digital Vietnam",
            "role": "employer"
        },
        {
            "email": "startup@company.com",
            "password": "StartUp123!",
            "company_name": "Startup Innovation",
            "role": "employer"
        },
        {
            "email": "fintech@company.com",
            "password": "FinTech123!",
            "company_name": "FinTech Solutions",
            "role": "employer"
        },
        {
            "email": "ecommerce@company.com",
            "password": "ECom123!",
            "company_name": "E-Commerce Plus",
            "role": "employer"
        }
    ]
    
    created_accounts = []
    
    print(f"   📝 Creating {len(new_employers)} new employer accounts...")
    
    for i, employer in enumerate(new_employers, 1):
        print(f"\n{i}. Creating: {employer['email']}")
        
        try:
            # Tạo tài khoản employer
            create_response = requests.post(
                f"{base_url}/api/users/register/",
                json={
                    "email": employer["email"],
                    "password": employer["password"],
                    "role": employer["role"]
                },
                timeout=30
            )
            
            print(f"   📤 Registration status: {create_response.status_code}")
            
            if create_response.status_code == 201:
                response_data = create_response.json()
                print(f"   ✅ Account created successfully!")
                print(f"   👤 User ID: {response_data.get('id', 'Unknown')}")
                
                created_accounts.append({
                    "email": employer["email"],
                    "password": employer["password"],
                    "company_name": employer["company_name"],
                    "user_id": response_data.get('id')
                })
                
                # Test login ngay
                print(f"   🔐 Testing login...")
                login_response = requests.post(
                    f"{base_url}/api/users/token/",
                    json={
                        "email": employer["email"],
                        "password": employer["password"]
                    },
                    timeout=15
                )
                
                if login_response.status_code == 200:
                    print(f"   ✅ Login test successful!")
                    
                    # Get user info
                    login_data = login_response.json()
                    user_info = login_data.get('user', {})
                    print(f"   📋 Role: {user_info.get('role')}")
                    print(f"   📧 Email: {user_info.get('email')}")
                    
                else:
                    print(f"   ❌ Login test failed: {login_response.status_code}")
                
            elif create_response.status_code == 400:
                error_data = create_response.json()
                print(f"   ❌ Validation error: {error_data}")
                
                # Check if email already exists
                if 'email' in error_data and 'already exists' in str(error_data['email']):
                    print(f"   ℹ️ Email already exists, testing login...")
                    
                    # Test login with existing account
                    login_response = requests.post(
                        f"{base_url}/api/users/token/",
                        json={
                            "email": employer["email"],
                            "password": employer["password"]
                        },
                        timeout=15
                    )
                    
                    if login_response.status_code == 200:
                        print(f"   ✅ Existing account login successful!")
                        created_accounts.append({
                            "email": employer["email"],
                            "password": employer["password"],
                            "company_name": employer["company_name"],
                            "user_id": "existing"
                        })
                    else:
                        print(f"   ❌ Existing account login failed")
                
            else:
                print(f"   ❌ Creation failed: {create_response.status_code}")
                print(f"   Response: {create_response.text[:200]}...")
            
            # Delay để tránh spam server
            time.sleep(2)
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Tóm tắt kết quả
    print(f"\n✅ CREATION SUMMARY:")
    print(f"   👥 Total accounts processed: {len(new_employers)}")
    print(f"   ✅ Successfully created/verified: {len(created_accounts)}")
    
    if created_accounts:
        print(f"\n🔑 WORKING EMPLOYER ACCOUNTS:")
        print("=" * 50)
        
        for account in created_accounts:
            print(f"📧 Email: {account['email']}")
            print(f"🔐 Password: {account['password']}")
            print(f"🏢 Company: {account['company_name']}")
            print(f"🆔 User ID: {account['user_id']}")
            print("-" * 30)
        
        # Lưu vào file
        credentials_file = "production_employer_credentials.txt"
        with open(credentials_file, 'w', encoding='utf-8') as f:
            f.write("PRODUCTION EMPLOYER ACCOUNTS\n")
            f.write("=" * 40 + "\n\n")
            f.write("Server: https://recruitment-api-jrcr.onrender.com\n")
            f.write("Frontend: https://jobwebjobboards.vercel.app\n\n")
            
            for account in created_accounts:
                f.write(f"Company: {account['company_name']}\n")
                f.write(f"Email: {account['email']}\n")
                f.write(f"Password: {account['password']}\n")
                f.write(f"User ID: {account['user_id']}\n")
                f.write("-" * 30 + "\n")
        
        print(f"\n📁 Credentials saved to: {credentials_file}")
        
        print(f"\n💡 NEXT STEPS:")
        print(f"   1. Login to https://jobwebjobboards.vercel.app")
        print(f"   2. Use any of the above email/password combinations")
        print(f"   3. Create job postings to test the system")
        print(f"   4. Test CV analysis and matching features")
        
        print(f"\n🚀 QUICK TEST:")
        if created_accounts:
            test_account = created_accounts[0]
            print(f"   Email: {test_account['email']}")
            print(f"   Password: {test_account['password']}")
    
    else:
        print(f"\n❌ No accounts were successfully created")
        print(f"   💡 Try using existing account: employer11new@test.com / 12345678")

if __name__ == "__main__":
    create_production_employers()