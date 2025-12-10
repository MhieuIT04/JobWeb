#!/usr/bin/env python
"""
Get authentication token for testing
"""
import requests
import json

def get_auth_token():
    base_url = "http://127.0.0.1:8000"
    
    # Login credentials
    login_data = {
        "email": "python_dev@gmail.com",
        "password": "testpass123"
    }
    
    try:
        # Login to get token
        response = requests.post(f"{base_url}/api/users/token/", json=login_data)
        
        if response.status_code == 200:
            tokens = response.json()
            print("✅ Login successful!")
            print(f"Access Token: {tokens['access']}")
            print(f"Refresh Token: {tokens['refresh']}")
            
            # Test authenticated API call
            headers = {
                'Authorization': f'Bearer {tokens["access"]}',
                'Content-Type': 'application/json'
            }
            
            # Test AI status API
            test_response = requests.get(f"{base_url}/api/jobs/ai/status/28/", headers=headers)
            print(f"\nAI Status API Test: {test_response.status_code}")
            if test_response.status_code == 200:
                print(f"Response: {json.dumps(test_response.json(), indent=2)}")
            
            return tokens['access']
            
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    get_auth_token()