#!/usr/bin/env python3
"""
Test CV Analysis API endpoint
"""
import requests
import json

def test_cv_analysis():
    url = "https://recruitment-api-jrcr.onrender.com/api/jobs/ai/analyze-cv/"
    
    # Test the API with PDF file
    try:
        with open('test_cv_real.pdf', 'rb') as f:
            files = {'cv_file': ('test_cv_real.pdf', f, 'application/pdf')}
            response = requests.post(url, files=files, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"Skills found: {data.get('cv_analysis', {}).get('skills_count', 0)}")
            print(f"Jobs recommended: {len(data.get('recommended_jobs', []))}")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_cv_analysis()