#!/usr/bin/env python3
"""
Debug application creation error step by step
"""
import sys
import os
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')

import django
django.setup()

from jobs.models import Job, Application
from users.models import User
from jobs.serializers import ApplicationCreateSerializer
import io

def debug_application_error():
    """Debug lỗi tạo application locally"""
    print("🔍 DEBUGGING APPLICATION CREATION ERROR")
    print("=" * 60)
    
    # Test locally first
    print("1. TESTING LOCAL APPLICATION CREATION:")
    
    try:
        # Get test user
        user = User.objects.filter(email="employer11new@test.com").first()
        if not user:
            print("   ❌ Test user not found")
            return
        
        print(f"   ✅ Found user: {user.email} (ID: {user.id})")
        
        # Get a job
        job = Job.objects.filter(status='approved').first()
        if not job:
            print("   ❌ No approved jobs found")
            return
        
        print(f"   ✅ Found job: {job.title} (ID: {job.id})")
        
        # Check if already applied
        existing = Application.objects.filter(user=user, job=job).first()
        if existing:
            print(f"   ⚠️ User already applied to this job (Application ID: {existing.id})")
            
            # Try with different job
            other_job = Job.objects.filter(status='approved').exclude(id=job.id).first()
            if other_job:
                job = other_job
                print(f"   🔄 Trying different job: {job.title} (ID: {job.id})")
                
                existing = Application.objects.filter(user=user, job=job).first()
                if existing:
                    print(f"   ❌ User already applied to all available jobs")
                    return
            else:
                print(f"   ❌ No other jobs available")
                return
        
        # Test serializer validation
        print(f"\n2. TESTING SERIALIZER VALIDATION:")
        
        # Create fake request context
        class FakeRequest:
            def __init__(self, user):
                self.user = user
        
        fake_request = FakeRequest(user)
        
        # Test data
        data = {
            'job': job.id,
            'cover_letter': 'Test cover letter'
        }
        
        # Test without CV first
        print(f"   📝 Testing without CV...")
        serializer = ApplicationCreateSerializer(
            data=data,
            context={'request': fake_request}
        )
        
        if serializer.is_valid():
            print(f"   ✅ Serializer validation passed")
            
            try:
                application = serializer.save()
                print(f"   ✅ Application created successfully: ID {application.id}")
                print(f"   📋 Status: {application.status}")
                print(f"   📄 CV: {application.cv}")
                
            except Exception as e:
                print(f"   ❌ Error saving application: {e}")
                import traceback
                traceback.print_exc()
                
        else:
            print(f"   ❌ Serializer validation failed: {serializer.errors}")
        
        # Test with CV
        print(f"\n3. TESTING WITH CV FILE:")
        
        # Create fake CV file
        cv_content = "Test CV content"
        cv_file = io.BytesIO(cv_content.encode('utf-8'))
        cv_file.name = 'test_cv.txt'
        cv_file.content_type = 'text/plain'
        cv_file.size = len(cv_content)
        
        # Try with different job to avoid duplicate
        another_job = Job.objects.filter(status='approved').exclude(
            id__in=Application.objects.filter(user=user).values_list('job_id', flat=True)
        ).first()
        
        if another_job:
            data_with_cv = {
                'job': another_job.id,
                'cover_letter': 'Test cover letter with CV',
                'cv': cv_file
            }
            
            serializer_cv = ApplicationCreateSerializer(
                data=data_with_cv,
                context={'request': fake_request}
            )
            
            if serializer_cv.is_valid():
                print(f"   ✅ Serializer with CV validation passed")
                
                try:
                    application_cv = serializer_cv.save()
                    print(f"   ✅ Application with CV created: ID {application_cv.id}")
                    print(f"   📄 CV file: {application_cv.cv}")
                    
                except Exception as e:
                    print(f"   ❌ Error saving application with CV: {e}")
                    import traceback
                    traceback.print_exc()
                    
            else:
                print(f"   ❌ Serializer with CV validation failed: {serializer_cv.errors}")
        else:
            print(f"   ⚠️ No more jobs available for CV test")
        
    except Exception as e:
        print(f"   ❌ General error: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"\n💡 COMMON ISSUES:")
    print(f"   1. User already applied to job → Use different job")
    print(f"   2. Job not approved → Only approved jobs accept applications")
    print(f"   3. File upload issues → Check file size and format")
    print(f"   4. Database constraints → Check unique_together constraints")

if __name__ == "__main__":
    debug_application_error()