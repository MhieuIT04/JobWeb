#!/usr/bin/env python3
"""
Test script for CV Analysis API
"""
import requests
import json
import os

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/users/token/"
CV_ANALYSIS_URL = f"{BASE_URL}/api/jobs/ai/analyze-cv/"

# Test credentials
TEST_EMAIL = "python_dev@gmail.com"
TEST_PASSWORD = "testpass123"

def get_auth_token():
    """Get authentication token"""
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(LOGIN_URL, json=login_data)
    if response.status_code == 200:
        data = response.json()
        return data.get('access')
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def create_test_cv_file():
    """Use the real PDF file created by create_test_pdf.py"""
    return 'test_cv_real.pdf'

def test_cv_analysis():
    """Test CV analysis API"""
    print("🧪 TESTING CV ANALYSIS API")
    print("=" * 50)
    
    # Get auth token
    token = get_auth_token()
    if not token:
        return
    
    print("✅ Authentication successful")
    
    # Create test CV file
    cv_file_path = create_test_cv_file()
    print(f"✅ Created test CV file: {cv_file_path}")
    
    # Prepare request
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    try:
        with open(cv_file_path, 'rb') as cv_file:
            files = {
                'cv_file': ('test_cv_real.pdf', cv_file, 'application/pdf')
            }
            
            print("🔄 Sending CV analysis request...")
            response = requests.post(CV_ANALYSIS_URL, headers=headers, files=files)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ CV Analysis successful!")
                print("\n📋 CV Analysis Results:")
                print(f"   Skills found: {data['cv_analysis']['skills_count']}")
                print(f"   Skills: {', '.join(data['cv_analysis']['skills_extracted'][:10])}")
                print(f"   Recommended jobs: {len(data['recommended_jobs'])}")
                print(f"   Total matches: {data['total_matches']}")
                
                if data['recommended_jobs']:
                    print("\n🎯 Top 3 Recommended Jobs:")
                    for i, job in enumerate(data['recommended_jobs'][:3], 1):
                        print(f"   {i}. {job['title']} - {job['match_percentage']:.1f}% match")
                        print(f"      Company: {job.get('employer', {}).get('company_name', 'N/A')}")
                        print(f"      Score: {job['match_score']}/5.0")
                        print()
                
            else:
                print("❌ CV Analysis failed")
                print(f"Error: {response.text}")
                
    except Exception as e:
        print(f"❌ Error during CV analysis: {e}")
    
    finally:
        # Cleanup
        if os.path.exists(cv_file_path):
            os.remove(cv_file_path)
            print(f"🧹 Cleaned up test file: {cv_file_path}")

if __name__ == "__main__":
    test_cv_analysis()