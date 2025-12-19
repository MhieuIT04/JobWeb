#!/usr/bin/env python3
"""
Tạo tài khoản test trên production server
"""
import requests
import json

def create_production_user():
    """Tạo tài khoản employer mới trên production"""
    print("👤 CREATING PRODUCTION USER")
    print("=" * 50)
    
    base_url = "https://recruitment-api-jrcr.onrender.com"
    register_url = f"{base_url}/api/users/register/"
    login_url = f"{base_url}/api/users/token/"
    
    # Test user data
    test_user = {
        "email": "testemployer2024@gmail.com",
        "password": "TestPass123!",
        "role": "employer"
    }
    
    print(f"1. CREATING USER:")
    print(f"   Email: {test_user['email']}")
    print(f"   Role: {test_user['role']}")
    
    try:
        # Create user
        response = requests.post(
            register_url,
            json=test_user,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=30
        )
        
        print(f"   Registration Status: {response.status_code}")
        
        if response.status_code == 201:
            print(f"   ✅ User created successfully!")
            
            # Try to login immediately
            print(f"\n2. TESTING LOGIN:")
            login_response = requests.post(
                login_url,
                json={
                    "email": test_user['email'],
                    "password": test_user['password']
                },
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout=30
            )
            
            print(f"   Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                data = login_response.json()
                print(f"   ✅ LOGIN SUCCESS!")
                print(f"   Access Token: {data.get('access', 'N/A')[:50]}...")
                print(f"   User Info: {data.get('user', 'N/A')}")
                
                print(f"\n🎉 SOLUTION FOUND!")
                print(f"   Use these credentials to test:")
                print(f"   Email: {test_user['email']}")
                print(f"   Password: {test_user['password']}")
                
            else:
                print(f"   ❌ Login failed: {login_response.status_code}")
                try:
                    error_data = login_response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {login_response.text}")
                    
        elif response.status_code == 400:
            try:
                error_data = response.json()
                print(f"   ❌ Registration failed: {error_data}")
                
                # Check if user already exists
                if 'email' in error_data and 'already exists' in str(error_data['email']):
                    print(f"   ℹ️ User already exists, trying to login...")
                    
                    # Try login with existing user
                    login_response = requests.post(
                        login_url,
                        json={
                            "email": test_user['email'],
                            "password": test_user['password']
                        },
                        timeout=30
                    )
                    
                    if login_response.status_code == 200:
                        print(f"   ✅ Existing user login successful!")
                        data = login_response.json()
                        print(f"   User Info: {data.get('user', 'N/A')}")
                    else:
                        print(f"   ❌ Existing user login failed: {login_response.status_code}")
                        
            except:
                print(f"   Error response: {response.text}")
                
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print(f"   ⏰ TIMEOUT - Server may be sleeping, try again in 30 seconds")
        
    except Exception as e:
        print(f"   ❌ EXCEPTION: {e}")
    
    # Also try some common test credentials
    print(f"\n3. TESTING COMMON CREDENTIALS:")
    common_creds = [
        {"email": "admin@test.com", "password": "admin123"},
        {"email": "test@test.com", "password": "test123"},
        {"email": "employer@test.com", "password": "password"},
    ]
    
    for cred in common_creds:
        try:
            response = requests.post(
                login_url,
                json=cred,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ FOUND WORKING CREDENTIALS:")
                print(f"      Email: {cred['email']}")
                print(f"      Password: {cred['password']}")
                break
            else:
                print(f"   ❌ {cred['email']}: {response.status_code}")
                
        except:
            print(f"   ❌ {cred['email']}: Connection error")

if __name__ == "__main__":
    create_production_user()