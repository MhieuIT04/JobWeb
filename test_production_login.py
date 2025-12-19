#!/usr/bin/env python3
"""
Test login API trực tiếp với production server
"""
import requests
import json

def test_production_login():
    """Test login với production API"""
    print("🌐 TESTING PRODUCTION LOGIN API")
    print("=" * 50)
    
    # Production API URL
    base_url = "https://recruitment-api-jrcr.onrender.com"
    login_url = f"{base_url}/api/users/token/"
    
    # Test cases
    test_cases = [
        {
            "name": "Test Employer (created in debug)",
            "email": "test_employer@example.com",
            "password": "testpass123"
        },
        {
            "name": "Known Employer",
            "email": "DuongPhan@gmail.com", 
            "password": "123456"  # Common test password
        },
        {
            "name": "Another Test",
            "email": "employer6@test.com",
            "password": "password123"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. TESTING: {test_case['name']}")
        print(f"   Email: {test_case['email']}")
        
        try:
            # Make login request
            response = requests.post(
                login_url,
                json={
                    "email": test_case['email'],
                    "password": test_case['password']
                },
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout=30
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS!")
                print(f"   Access Token: {data.get('access', 'N/A')[:50]}...")
                print(f"   User Info: {data.get('user', 'N/A')}")
                
            elif response.status_code == 401:
                print(f"   ❌ UNAUTHORIZED (401)")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                    
            else:
                print(f"   ❌ ERROR ({response.status_code})")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT - Server may be sleeping")
            
        except requests.exceptions.ConnectionError:
            print(f"   🔌 CONNECTION ERROR - Server may be down")
            
        except Exception as e:
            print(f"   ❌ EXCEPTION: {e}")
    
    # Test server health
    print(f"\n🏥 TESTING SERVER HEALTH:")
    try:
        health_response = requests.get(f"{base_url}/", timeout=30)
        print(f"   Server Status: {health_response.status_code}")
        if health_response.status_code == 200:
            print(f"   ✅ Server is running")
        else:
            print(f"   ⚠️ Server returned: {health_response.status_code}")
    except Exception as e:
        print(f"   ❌ Server health check failed: {e}")
    
    # Test with wrong endpoint
    print(f"\n🧪 TESTING WRONG CREDENTIALS:")
    try:
        response = requests.post(
            login_url,
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            timeout=30
        )
        print(f"   Wrong credentials status: {response.status_code}")
        if response.status_code == 401:
            print(f"   ✅ Correctly returns 401 for wrong credentials")
        else:
            print(f"   ⚠️ Unexpected status for wrong credentials")
    except Exception as e:
        print(f"   ❌ Error testing wrong credentials: {e}")

if __name__ == "__main__":
    test_production_login()