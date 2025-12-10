#!/usr/bin/env python
"""
Test script for AI scoring system
"""
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from django.contrib.auth import get_user_model
from jobs.models import Job, Application
from jobs.ai_services import job_matching_service

User = get_user_model()

def test_ai_scoring():
    print("🧪 TESTING AI SCORING SYSTEM")
    print("=" * 50)
    
    # Get test data
    try:
        python_dev = User.objects.get(email='python_dev@gmail.com')
        python_job = Job.objects.get(title='Senior Python Developer')
        js_job = Job.objects.get(title='Full Stack JavaScript Developer')
        marketing_job = Job.objects.get(title='Digital Marketing Specialist')
        
        print(f"✅ Found test users and jobs")
    except Exception as e:
        print(f"❌ Error getting test data: {e}")
        print("Run 'python manage.py seed_test_jobs' first!")
        return
    
    # Test 1: Direct AI service test
    print("\n🔬 TEST 1: Direct AI Service")
    print("-" * 30)
    
    # Create a test application
    test_app, created = Application.objects.get_or_create(
        user=python_dev,
        job=python_job,
        defaults={
            'cover_letter': 'I am interested in this position',
            'status': 'pending'
        }
    )
    
    if created:
        print(f"✅ Created test application: {test_app.id}")
    else:
        print(f"✅ Using existing application: {test_app.id}")
    
    # Test AI analysis
    try:
        result = job_matching_service.analyze_application(test_app)
        print(f"AI Analysis Result: {json.dumps(result, indent=2)}")
        
        # Refresh from database
        test_app.refresh_from_db()
        print(f"Match Score: {test_app.match_score}")
        print(f"Skills Extracted: {test_app.skills_extracted}")
        
    except Exception as e:
        print(f"❌ AI Analysis failed: {e}")
    
    # Test 2: API endpoints
    print("\n🌐 TEST 2: API Endpoints")
    print("-" * 30)
    
    base_url = "http://127.0.0.1:8000"
    
    # Test AI status endpoint
    try:
        response = requests.get(f"{base_url}/api/jobs/ai/status/{test_app.id}/")
        print(f"AI Status API: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ API test failed: {e}")
    
    # Test 3: Different job matches
    print("\n🎯 TEST 3: Different Job Matches")
    print("-" * 30)
    
    test_cases = [
        (python_dev, python_job, "Python Dev → Python Job (High match expected)"),
        (python_dev, js_job, "Python Dev → JS Job (Medium match expected)"),
        (python_dev, marketing_job, "Python Dev → Marketing Job (Low match expected)")
    ]
    
    for user, job, description in test_cases:
        print(f"\n{description}")
        
        # Create or get application
        app, created = Application.objects.get_or_create(
            user=user,
            job=job,
            defaults={
                'cover_letter': f'Application for {job.title}',
                'status': 'pending'
            }
        )
        
        # Reset AI fields for fresh test
        app.ai_processed_at = None
        app.match_score = None
        app.skills_extracted = None
        app.save()
        
        # Run AI analysis
        try:
            result = job_matching_service.analyze_application(app)
            app.refresh_from_db()
            
            print(f"  Match Score: {app.match_score}/5.0")
            print(f"  Skills Found: {app.skills_extracted[:5] if app.skills_extracted else 'None'}")
            print(f"  Success: {result['success']}")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n🎉 AI SCORING TEST COMPLETED!")
    print("=" * 50)

if __name__ == "__main__":
    test_ai_scoring()