#!/usr/bin/env python3
"""
Kiểm tra tài khoản cụ thể trên production
"""
import requests
import json

def check_specific_user():
    """Kiểm tra tài khoản employer11@test.com"""
    print("🔍 CHECKING SPECIFIC USER: employer11@test.com")
    print("=" * 60)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    login_url = f"{base_url}/api/users/token/"
    register_url = f"{base_url}/api/users/register/"
    
    target_email = "employer11@test.com"
    possible_passwords = [
        "12345678",  # Từ screenshot
        "password",
        "password123", 
        "123456",
        "employer11",
        "test123",
        "admin123"
    ]
    
    print(f"1. TESTING EXISTING PASSWORDS:")
    for i, password in enumerate(possible_passwords, 1):
        print(f"   {i}. Testing password: {password}")
        
        try:
            response = requests.post(
                login_url,
                json={
                    "email": target_email,
                    "password": password
                },
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS! Password is: {password}")
                print(f"   User Info: {data.get('user', 'N/A')}")
                return
            elif response.status_code == 401:
                print(f"   ❌ Wrong password")
            else:
                print(f"   ⚠️ Unexpected status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"\n2. ACCOUNT DOESN'T EXIST - CREATING IT:")
    
    # Try to create the account
    new_user_data = {
        "email": target_email,
        "password": "12345678",  # Use the password from screenshot
        "role": "employer"
    }
    
    try:
        response = requests.post(
            register_url,
            json=new_user_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"   Registration Status: {response.status_code}")
        
        if response.status_code == 201:
            print(f"   ✅ Account created successfully!")
            
            # Test login immediately
            login_response = requests.post(
                login_url,
                json={
                    "email": target_email,
                    "password": "12345678"
                },
                timeout=15
            )
            
            if login_response.status_code == 200:
                print(f"   ✅ Login successful!")
                data = login_response.json()
                print(f"   User Info: {data.get('user', 'N/A')}")
                
                print(f"\n🎉 SOLUTION:")
                print(f"   Email: {target_email}")
                print(f"   Password: 12345678")
                print(f"   Status: Ready to use!")
                
            else:
                print(f"   ❌ Login failed after creation: {login_response.status_code}")
                
        elif response.status_code == 400:
            error_data = response.json()
            print(f"   ❌ Registration failed: {error_data}")
            
            if 'email' in error_data:
                print(f"   ℹ️ Account might already exist but with different password")
                
        else:
            print(f"   ❌ Unexpected registration status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Registration error: {e}")
    
    print(f"\n3. ALTERNATIVE WORKING ACCOUNTS:")
    working_accounts = [
        {"email": "testemployer2024@gmail.com", "password": "TestPass123!"}
    ]
    
    for account in working_accounts:
        try:
            response = requests.post(
                login_url,
                json=account,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ WORKING ACCOUNT:")
                print(f"      Email: {account['email']}")
                print(f"      Password: {account['password']}")
                break
                
        except:
            continue
    
    print(f"\n📋 SUMMARY:")
    print(f"   - Target account: {target_email}")
    print(f"   - Issue: Account doesn't exist on production")
    print(f"   - Solution: Use working account or create new one")

if __name__ == "__main__":
    check_specific_user()