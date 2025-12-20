#!/usr/bin/env python3
"""
Create local test user for debugging
"""
import sys
import os
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')

import django
django.setup()

from users.models import User
from django.contrib.auth.hashers import make_password

def create_local_test_user():
    """Tạo user test local để debug"""
    print("👤 CREATING LOCAL TEST USER")
    print("=" * 40)
    
    email = "testuser@example.com"
    password = "testpass123"
    
    try:
        # Check if user exists
        user = User.objects.filter(email=email).first()
        if user:
            print(f"   ✅ User already exists: {user.email} (ID: {user.id})")
        else:
            # Create new user
            user = User.objects.create(
                email=email,
                password=make_password(password),
                role='job_seeker',
                is_active=True
            )
            print(f"   ✅ Created new user: {user.email} (ID: {user.id})")
        
        # Test application creation with this user
        from jobs.models import Job, Application
        from jobs.serializers import ApplicationCreateSerializer
        
        print(f"\n📋 TESTING APPLICATION CREATION:")
        
        # Get an approved job
        job = Job.objects.filter(status='approved').first()
        if not job:
            print(f"   ❌ No approved jobs found")
            return
        
        print(f"   ✅ Found job: {job.title} (ID: {job.id})")
        
        # Check if already applied
        existing = Application.objects.filter(user=user, job=job).first()
        if existing:
            print(f"   ⚠️ Already applied, deleting existing application...")
            existing.delete()
        
        # Create fake request
        class FakeRequest:
            def __init__(self, user):
                self.user = user
        
        fake_request = FakeRequest(user)
        
        # Test data
        data = {
            'job': job.id,
            'cover_letter': 'This is a test application for debugging purposes.'
        }
        
        # Test serializer
        serializer = ApplicationCreateSerializer(
            data=data,
            context={'request': fake_request}
        )
        
        if serializer.is_valid():
            print(f"   ✅ Serializer validation passed")
            
            try:
                application = serializer.save()
                print(f"   ✅ Application created successfully!")
                print(f"   📋 Application ID: {application.id}")
                print(f"   👤 User: {application.user.email}")
                print(f"   💼 Job: {application.job.title}")
                print(f"   📝 Status: {application.status}")
                print(f"   📄 CV: {application.cv or 'No CV uploaded'}")
                print(f"   🕐 Applied at: {application.applied_at}")
                
                # Test with CV file
                print(f"\n📄 TESTING WITH CV FILE:")
                
                import io
                cv_content = """John Doe - Software Developer

PERSONAL INFORMATION:
Email: john.doe@example.com
Phone: +84 123 456 789

SKILLS:
• Programming: Python, Django, JavaScript, React
• Database: PostgreSQL, MySQL, MongoDB
• Tools: Git, Docker, VS Code
• Soft Skills: Communication, Teamwork, Problem Solving

EXPERIENCE:
• 3+ years in web development
• Built scalable applications with Django
• Frontend development with React
• Database design and optimization

EDUCATION:
• Bachelor of Computer Science
• Online courses in AI/ML"""
                
                cv_file = io.BytesIO(cv_content.encode('utf-8'))
                cv_file.name = 'john_doe_cv.txt'
                cv_file.content_type = 'text/plain'
                cv_file.size = len(cv_content)
                
                # Get another job for CV test
                other_job = Job.objects.filter(status='approved').exclude(id=job.id).first()
                if other_job:
                    data_with_cv = {
                        'job': other_job.id,
                        'cover_letter': 'Application with CV attached.',
                        'cv': cv_file
                    }
                    
                    serializer_cv = ApplicationCreateSerializer(
                        data=data_with_cv,
                        context={'request': fake_request}
                    )
                    
                    if serializer_cv.is_valid():
                        print(f"   ✅ CV serializer validation passed")
                        
                        try:
                            app_with_cv = serializer_cv.save()
                            print(f"   ✅ Application with CV created!")
                            print(f"   📋 Application ID: {app_with_cv.id}")
                            print(f"   📄 CV file: {app_with_cv.cv}")
                            
                        except Exception as e:
                            print(f"   ❌ Error creating application with CV: {e}")
                            import traceback
                            traceback.print_exc()
                            
                    else:
                        print(f"   ❌ CV serializer validation failed: {serializer_cv.errors}")
                else:
                    print(f"   ⚠️ No other job available for CV test")
                
            except Exception as e:
                print(f"   ❌ Error creating application: {e}")
                import traceback
                traceback.print_exc()
                
        else:
            print(f"   ❌ Serializer validation failed: {serializer.errors}")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_local_test_user()