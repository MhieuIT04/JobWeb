#!/usr/bin/env python3
"""
Test recommendations API endpoint
"""
import requests

def test_recommendations():
    # Test with production API
    base_url = "https://recruitment-api-jrcr.onrender.com"
    
    # Get a job first
    jobs_response = requests.get(f"{base_url}/api/jobs/?limit=1")
    if jobs_response.status_code == 200:
        jobs_data = jobs_response.json()
        if jobs_data.get('results'):
            job_id = jobs_data['results'][0]['id']
            print(f"Testing recommendations for job ID: {job_id}")
            
            # Test recommendations
            rec_response = requests.get(f"{base_url}/api/jobs/{job_id}/recommendations/")
            print(f"Status Code: {rec_response.status_code}")
            
            if rec_response.status_code == 200:
                rec_data = rec_response.json()
                print(f"✅ Success! Found {len(rec_data)} recommendations")
                for i, job in enumerate(rec_data[:3]):
                    print(f"  {i+1}. {job['title']} - {job.get('employer', {}).get('company_name', 'N/A')}")
            else:
                print(f"❌ Error: {rec_response.text}")
        else:
            print("No jobs found")
    else:
        print(f"Failed to get jobs: {jobs_response.status_code}")

if __name__ == "__main__":
    test_recommendations()