#!/usr/bin/env python3
"""
Import data to production database from exported JSON files
"""
import os
import django
import json
from datetime import datetime
from django.utils.dateparse import parse_datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from django.core import serializers
from django.contrib.auth.hashers import make_password
from users.models import User, City, Skill, Profile
from jobs.models import Job, Category, WorkType, Application, JobSkill
from notifications.models import Notification

def import_data(export_dir="exported_data"):
    """Import data from JSON files to production database"""
    print("🚀 IMPORTING DATA TO PRODUCTION DATABASE")
    print("=" * 50)
    
    if not os.path.exists(export_dir):
        print(f"❌ Export directory '{export_dir}' not found!")
        return
    
    # Load summary
    with open(f"{export_dir}/summary.json", "r", encoding="utf-8") as f:
        summary = json.load(f)
    
    print(f"📊 Import Summary (exported on {summary['export_date']}):")
    for key, value in summary['total_records'].items():
        print(f"   📋 {key.capitalize()}: {value} records")
    print()
    
    # Import basic data using Django serializers
    print("📋 Importing basic data...")
    
    # Cities
    if os.path.exists(f"{export_dir}/cities.json"):
        with open(f"{export_dir}/cities.json", "r", encoding="utf-8") as f:
            cities_data = f.read()
        
        existing_cities = set(City.objects.values_list('name', flat=True))
        imported_cities = 0
        
        for obj in serializers.deserialize("json", cities_data):
            if obj.object.name not in existing_cities:
                obj.save()
                imported_cities += 1
        
        print(f"   ✅ Cities: {imported_cities} new records imported")
    
    # Skills
    if os.path.exists(f"{export_dir}/skills.json"):
        with open(f"{export_dir}/skills.json", "r", encoding="utf-8") as f:
            skills_data = f.read()
        
        existing_skills = set(Skill.objects.values_list('name', flat=True))
        imported_skills = 0
        
        for obj in serializers.deserialize("json", skills_data):
            if obj.object.name not in existing_skills:
                obj.save()
                imported_skills += 1
        
        print(f"   ✅ Skills: {imported_skills} new records imported")
    
    # Categories
    if os.path.exists(f"{export_dir}/categories.json"):
        with open(f"{export_dir}/categories.json", "r", encoding="utf-8") as f:
            categories_data = f.read()
        
        existing_categories = set(Category.objects.values_list('name', flat=True))
        imported_categories = 0
        
        for obj in serializers.deserialize("json", categories_data):
            if obj.object.name not in existing_categories:
                obj.save()
                imported_categories += 1
        
        print(f"   ✅ Categories: {imported_categories} new records imported")
    
    # Work Types
    if os.path.exists(f"{export_dir}/work_types.json"):
        with open(f"{export_dir}/work_types.json", "r", encoding="utf-8") as f:
            work_types_data = f.read()
        
        existing_work_types = set(WorkType.objects.values_list('name', flat=True))
        imported_work_types = 0
        
        for obj in serializers.deserialize("json", work_types_data):
            if obj.object.name not in existing_work_types:
                obj.save()
                imported_work_types += 1
        
        print(f"   ✅ Work Types: {imported_work_types} new records imported")
    
    # Import users
    print("\n👥 Importing users...")
    
    # Default password for imported users
    default_password = "imported123"
    hashed_password = make_password(default_password)
    
    # Employers
    if os.path.exists(f"{export_dir}/employers.json"):
        with open(f"{export_dir}/employers.json", "r", encoding="utf-8") as f:
            employers_data = json.load(f)
        
        existing_emails = set(User.objects.values_list('email', flat=True))
        imported_employers = 0
        
        for employer_data in employers_data:
            if employer_data['email'] not in existing_emails:
                city = None
                if employer_data['city_id']:
                    try:
                        city = City.objects.get(id=employer_data['city_id'])
                    except City.DoesNotExist:
                        pass
                
                user = User.objects.create(
                    email=employer_data['email'],
                    username=employer_data['username'],
                    password=hashed_password,
                    role=employer_data['role'],
                    is_active=employer_data['is_active'],
                )
                
                # Create or update profile
                profile, created = Profile.objects.get_or_create(user=user)
                profile.first_name = employer_data['first_name']
                profile.last_name = employer_data['last_name']
                profile.company_name = employer_data['company_name']
                profile.bio = employer_data['bio']
                profile.phone_number = employer_data['phone_number']
                profile.city = city
                profile.save()
                
                imported_employers += 1
        
        print(f"   ✅ Employers: {imported_employers} new records imported")
    
    # Candidates
    if os.path.exists(f"{export_dir}/candidates.json"):
        with open(f"{export_dir}/candidates.json", "r", encoding="utf-8") as f:
            candidates_data = json.load(f)
        
        imported_candidates = 0
        
        for candidate_data in candidates_data:
            if candidate_data['email'] not in existing_emails:
                city = None
                if candidate_data['city_id']:
                    try:
                        city = City.objects.get(id=candidate_data['city_id'])
                    except City.DoesNotExist:
                        pass
                
                user = User.objects.create(
                    email=candidate_data['email'],
                    username=candidate_data['username'],
                    password=hashed_password,
                    role=candidate_data['role'],
                    is_active=candidate_data['is_active'],
                )
                
                # Create or update profile
                profile, created = Profile.objects.get_or_create(user=user)
                profile.first_name = candidate_data['first_name']
                profile.last_name = candidate_data['last_name']
                profile.phone_number = candidate_data['phone_number']
                profile.bio = candidate_data['bio']
                profile.city = city
                profile.save()
                
                # Add skills
                if candidate_data['skills']:
                    skills = Skill.objects.filter(id__in=candidate_data['skills'])
                    profile.skills.set(skills)
                
                imported_candidates += 1
        
        print(f"   ✅ Candidates: {imported_candidates} new records imported")
    
    # Import jobs
    print("\n💼 Importing jobs...")
    
    if os.path.exists(f"{export_dir}/jobs.json"):
        with open(f"{export_dir}/jobs.json", "r", encoding="utf-8") as f:
            jobs_data = json.load(f)
        
        imported_jobs = 0
        job_mapping = {}  # For applications import
        
        for job_data in jobs_data:
            try:
                employer = User.objects.get(email=job_data['employer_email'])
                
                category = None
                if job_data['category_id']:
                    try:
                        category = Category.objects.get(id=job_data['category_id'])
                    except Category.DoesNotExist:
                        pass
                
                work_type = None
                if job_data['work_type_id']:
                    try:
                        work_type = WorkType.objects.get(id=job_data['work_type_id'])
                    except WorkType.DoesNotExist:
                        pass
                
                city = None
                if job_data['city_id']:
                    try:
                        city = City.objects.get(id=job_data['city_id'])
                    except City.DoesNotExist:
                        pass
                
                # Create job
                job = Job.objects.create(
                    employer=employer,
                    category=category,
                    work_type=work_type,
                    title=job_data['title'],
                    description=job_data['description'],
                    city=city,
                    min_salary=job_data['min_salary'],
                    max_salary=job_data['max_salary'],
                    currency=job_data['currency'],
                    status=job_data['status'],
                    is_premium=job_data['is_premium'],
                    expires_at=parse_datetime(job_data['expires_at']) if job_data['expires_at'] else None,
                )
                
                # Add skills
                if job_data['skills']:
                    skills = Skill.objects.filter(id__in=job_data['skills'])
                    for skill in skills:
                        JobSkill.objects.create(job=job, skill=skill)
                
                # Store mapping for applications
                job_key = f"{job_data['employer_email']}:{job_data['title']}"
                job_mapping[job_key] = job.id
                
                imported_jobs += 1
                
            except User.DoesNotExist:
                print(f"   ⚠️  Employer not found: {job_data['employer_email']}")
                continue
        
        print(f"   ✅ Jobs: {imported_jobs} new records imported")
    
    # Import applications
    print("\n📝 Importing applications...")
    
    if os.path.exists(f"{export_dir}/applications.json"):
        with open(f"{export_dir}/applications.json", "r", encoding="utf-8") as f:
            applications_data = json.load(f)
        
        imported_applications = 0
        
        for app_data in applications_data:
            try:
                user = User.objects.get(email=app_data['user_email'])
                job_key = f"{app_data['employer_email']}:{app_data['job_title']}"
                
                if job_key in job_mapping:
                    job = Job.objects.get(id=job_mapping[job_key])
                    
                    # Check if application already exists
                    if not Application.objects.filter(user=user, job=job).exists():
                        Application.objects.create(
                            user=user,
                            job=job,
                            cover_letter=app_data['cover_letter'],
                            status=app_data['status'],
                            applied_at=parse_datetime(app_data['applied_at']) if app_data['applied_at'] else None,
                            match_score=app_data['match_score'],
                            skills_extracted=app_data['skills_extracted'],
                            ai_processed_at=parse_datetime(app_data['ai_processed_at']) if app_data['ai_processed_at'] else None,
                        )
                        imported_applications += 1
                
            except User.DoesNotExist:
                print(f"   ⚠️  User not found: {app_data['user_email']}")
                continue
        
        print(f"   ✅ Applications: {imported_applications} new records imported")
    
    print(f"\n✅ IMPORT COMPLETED SUCCESSFULLY!")
    print(f"🔑 Default password for imported users: '{default_password}'")
    print(f"📧 Users can login with their email and this password")

if __name__ == "__main__":
    import_data()