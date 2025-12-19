#!/usr/bin/env python3
"""
Debug script để test login issue
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from users.backends import EmailBackend

User = get_user_model()

def test_login_debug():
    """Debug login issues"""
    print("🔍 DEBUGGING LOGIN ISSUES")
    print("=" * 50)
    
    # 1. Check User model
    print("1. CHECKING USER MODEL:")
    print(f"   User model: {User}")
    print(f"   USERNAME_FIELD: {User.USERNAME_FIELD}")
    print(f"   REQUIRED_FIELDS: {User.REQUIRED_FIELDS}")
    
    # 2. Check users in database
    print(f"\n2. USERS IN DATABASE:")
    users = User.objects.all()
    print(f"   Total users: {users.count()}")
    
    for user in users[:5]:  # Show first 5 users
        print(f"   - ID: {user.id}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
    
    # 3. Check employers specifically
    print(f"\n3. EMPLOYERS:")
    employers = User.objects.filter(role='employer')
    print(f"   Total employers: {employers.count()}")
    
    for emp in employers[:3]:
        print(f"   - Email: {emp.email}, Active: {emp.is_active}, Has password: {bool(emp.password)}")
    
    # 4. Test authentication backend
    print(f"\n4. TESTING AUTHENTICATION BACKEND:")
    backend = EmailBackend()
    
    # Try to authenticate with a known employer
    if employers.exists():
        test_employer = employers.first()
        print(f"   Testing with employer: {test_employer.email}")
        
        # Test with wrong password
        result = backend.authenticate(None, test_employer.email, 'wrongpassword')
        print(f"   Wrong password result: {result}")
        
        # Test with empty password
        result = backend.authenticate(None, test_employer.email, '')
        print(f"   Empty password result: {result}")
        
        # Check if user can authenticate
        can_auth = backend.user_can_authenticate(test_employer)
        print(f"   User can authenticate: {can_auth}")
        print(f"   User is_active: {test_employer.is_active}")
        print(f"   User password hash: {test_employer.password[:20]}...")
    
    # 5. Test Django's authenticate function
    print(f"\n5. TESTING DJANGO AUTHENTICATE:")
    if employers.exists():
        test_employer = employers.first()
        
        # Test with Django's authenticate
        user = authenticate(username=test_employer.email, password='wrongpassword')
        print(f"   Django authenticate result: {user}")
    
    # 6. Create a test employer if none exists
    print(f"\n6. CREATING TEST EMPLOYER:")
    test_email = "test_employer@example.com"
    test_password = "testpass123"
    
    try:
        # Delete if exists
        User.objects.filter(email=test_email).delete()
        
        # Create new test employer
        test_user = User.objects.create_user(
            username=test_email,
            email=test_email,
            password=test_password,
            role='employer'
        )
        print(f"   ✅ Created test employer: {test_email}")
        print(f"   Password hash: {test_user.password[:20]}...")
        
        # Test authentication with correct password
        auth_result = authenticate(username=test_email, password=test_password)
        print(f"   ✅ Authentication test: {auth_result}")
        
        if auth_result:
            print(f"   ✅ SUCCESS: Can authenticate test employer")
        else:
            print(f"   ❌ FAILED: Cannot authenticate test employer")
            
    except Exception as e:
        print(f"   ❌ Error creating test employer: {e}")
    
    print(f"\n📊 SUMMARY:")
    print(f"   - Total users: {User.objects.count()}")
    print(f"   - Active users: {User.objects.filter(is_active=True).count()}")
    print(f"   - Employers: {User.objects.filter(role='employer').count()}")
    print(f"   - Job seekers: {User.objects.filter(role='job_seeker').count()}")

if __name__ == "__main__":
    test_login_debug()