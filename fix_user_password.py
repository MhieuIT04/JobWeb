#!/usr/bin/env python3
"""
Tạo tài khoản mới với email khác hoặc hướng dẫn user
"""
import requests
import json

def fix_user_password():
    """Tạo tài khoản thay thế hoặc hướng dẫn"""
    print("🔧 FIXING USER LOGIN ISSUE")
    print("=" * 50)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    register_url = f"{base_url}/api/users/register/"
    login_url = f"{base_url}/api/users/token/"
    
    # Tạo tài khoản mới với email tương tự
    alternative_accounts = [
        {
            "email": "employer11new@test.com",
            "password": "12345678",
            "role": "employer"
        },
        {
            "email": "testemployer11@gmail.com", 
            "password": "12345678",
            "role": "employer"
        },
        {
            "email": "demo.employer@test.com",
            "password": "12345678", 
            "role": "employer"
        }
    ]
    
    print("1. CREATING ALTERNATIVE ACCOUNTS:")
    
    for i, account in enumerate(alternative_accounts, 1):
        print(f"\n   {i}. Creating: {account['email']}")
        
        try:
            # Try to create account
            response = requests.post(
                register_url,
                json=account,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 201:
                print(f"      ✅ Account created!")
                
                # Test login
                login_response = requests.post(
                    login_url,
                    json={
                        "email": account['email'],
                        "password": account['password']
                    },
                    timeout=15
                )
                
                if login_response.status_code == 200:
                    print(f"      ✅ Login works!")
                    print(f"      🎯 USE THIS ACCOUNT:")
                    print(f"         Email: {account['email']}")
                    print(f"         Password: {account['password']}")
                    
                    # This is our solution
                    return account
                    
            elif response.status_code == 400:
                error_data = response.json()
                if 'email' in error_data:
                    print(f"      ⚠️ Account already exists")
                    
                    # Try login with existing account
                    login_response = requests.post(
                        login_url,
                        json={
                            "email": account['email'],
                            "password": account['password']
                        },
                        timeout=15
                    )
                    
                    if login_response.status_code == 200:
                        print(f"      ✅ Existing account works!")
                        print(f"      🎯 USE THIS ACCOUNT:")
                        print(f"         Email: {account['email']}")
                        print(f"         Password: {account['password']}")
                        return account
                    else:
                        print(f"      ❌ Existing account has different password")
                else:
                    print(f"      ❌ Other error: {error_data}")
                    
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    print(f"\n2. TESTING KNOWN WORKING ACCOUNT:")
    working_account = {
        "email": "testemployer2024@gmail.com",
        "password": "TestPass123!"
    }
    
    try:
        response = requests.post(
            login_url,
            json=working_account,
            timeout=15
        )
        
        if response.status_code == 200:
            print(f"   ✅ CONFIRMED WORKING ACCOUNT:")
            print(f"      Email: {working_account['email']}")
            print(f"      Password: {working_account['password']}")
            return working_account
        else:
            print(f"   ❌ Known account not working: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing known account: {e}")
    
    print(f"\n3. INSTRUCTIONS FOR USER:")
    print(f"   🔴 PROBLEM: employer11@test.com exists but password is wrong")
    print(f"   🟢 SOLUTIONS:")
    print(f"      Option 1: Use testemployer2024@gmail.com / TestPass123!")
    print(f"      Option 2: Register new account with different email")
    print(f"      Option 3: Contact admin to reset password")
    
    return None

if __name__ == "__main__":
    result = fix_user_password()
    
    if result:
        print(f"\n🎉 SUCCESS! Use these credentials:")
        print(f"   Email: {result['email']}")
        print(f"   Password: {result['password']}")
    else:
        print(f"\n⚠️ Please use the working account mentioned above")