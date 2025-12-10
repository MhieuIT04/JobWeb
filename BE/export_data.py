#!/usr/bin/env python3
"""
Export data from local database to JSON files for deployment
"""
import os
import django
import json
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from django.core import serializers
from users.models import User, City, Skill, Profile
from jobs.models import Job, Category, WorkType, Application, Favorite
from notifications.models import Notification

def export_data():
    """Export all important data to JSON files"""
    print("🚀 EXPORTING DATA FROM LOCAL DATABASE")
    print("=" * 50)
    
    # Create export directory
    export_dir = "exported_data"
    os.makedirs(export_dir, exist_ok=True)
    
    # Export basic data (cities, skills, categories, work types)
    print("📋 Exporting basic data...")
    
    # Cities
    cities = City.objects.all()
    with open(f"{export_dir}/cities.json", "w", encoding="utf-8") as f:
        f.write(serializers.serialize("json", cities, indent=2))
    print(f"   ✅ Cities: {cities.count()} records")
    
    # Skills
    skills = Skill.objects.all()
    with open(f"{export_dir}/skills.json", "w", encoding="utf-8") as f:
        f.write(serializers.serialize("json", skills, indent=2))
    print(f"   ✅ Skills: {skills.count()} records")
    
    # Categories
    categories = Category.objects.all()
    with open(f"{export_dir}/categories.json", "w", encoding="utf-8") as f:
        f.write(serializers.serialize("json", categories, indent=2))
    print(f"   ✅ Categories: {categories.count()} records")
    
    # Work Types
    work_types = WorkType.objects.all()
    with open(f"{export_dir}/work_types.json", "w", encoding="utf-8") as f:
        f.write(serializers.serialize("json", work_types, indent=2))
    print(f"   ✅ Work Types: {work_types.count()} records")
    
    # Export users (excluding superusers and sensitive data)
    print("\n👥 Exporting users...")
    
    # Employers
    employers = User.objects.filter(role='employer', is_superuser=False)
    employer_data = []
    for user in employers:
        profile = getattr(user, 'profile', None)
        employer_data.append({
            'email': user.email,
            'username': user.username,
            'first_name': profile.first_name if profile else '',
            'last_name': profile.last_name if profile else '',
            'role': user.role,
            'company_name': profile.company_name if profile else '',
            'bio': profile.bio if profile else '',
            'phone_number': profile.phone_number if profile else '',
            'city_id': profile.city.id if profile and profile.city else None,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        })
    
    with open(f"{export_dir}/employers.json", "w", encoding="utf-8") as f:
        json.dump(employer_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Employers: {len(employer_data)} records")
    
    # Candidates
    candidates = User.objects.filter(role='candidate', is_superuser=False)
    candidate_data = []
    for user in candidates:
        profile = getattr(user, 'profile', None)
        candidate_data.append({
            'email': user.email,
            'username': user.username,
            'first_name': profile.first_name if profile else '',
            'last_name': profile.last_name if profile else '',
            'role': user.role,
            'phone_number': profile.phone_number if profile else '',
            'bio': profile.bio if profile else '',
            'city_id': profile.city.id if profile and profile.city else None,
            'skills': [skill.id for skill in profile.skills.all()] if profile else [],
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        })
    
    with open(f"{export_dir}/candidates.json", "w", encoding="utf-8") as f:
        json.dump(candidate_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Candidates: {len(candidate_data)} records")
    
    # Export jobs
    print("\n💼 Exporting jobs...")
    
    jobs = Job.objects.all()
    job_data = []
    for job in jobs:
        job_data.append({
            'employer_email': job.employer.email,
            'category_id': job.category.id if job.category else None,
            'work_type_id': job.work_type.id if job.work_type else None,
            'title': job.title,
            'description': job.description,
            'city_id': job.city.id if job.city else None,
            'min_salary': float(job.min_salary) if job.min_salary else None,
            'max_salary': float(job.max_salary) if job.max_salary else None,
            'currency': job.currency,
            'status': job.status,
            'is_premium': job.is_premium,
            'expires_at': job.expires_at.isoformat() if job.expires_at else None,
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'skills': [js.skill.id for js in job.jobskill_set.all()],
        })
    
    with open(f"{export_dir}/jobs.json", "w", encoding="utf-8") as f:
        json.dump(job_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Jobs: {len(job_data)} records")
    
    # Export applications (without CV files)
    print("\n📝 Exporting applications...")
    
    applications = Application.objects.all()
    application_data = []
    for app in applications:
        application_data.append({
            'user_email': app.user.email,
            'job_id': None,  # Will be mapped during import
            'job_title': app.job.title,
            'employer_email': app.job.employer.email,
            'cover_letter': app.cover_letter,
            'status': app.status,
            'applied_at': app.applied_at.isoformat() if app.applied_at else None,
            'match_score': float(app.match_score) if app.match_score else None,
            'skills_extracted': app.skills_extracted,
            'ai_processed_at': app.ai_processed_at.isoformat() if app.ai_processed_at else None,
        })
    
    with open(f"{export_dir}/applications.json", "w", encoding="utf-8") as f:
        json.dump(application_data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Applications: {len(application_data)} records")
    
    # Create summary
    summary = {
        'export_date': datetime.now().isoformat(),
        'total_records': {
            'cities': cities.count(),
            'skills': skills.count(),
            'categories': categories.count(),
            'work_types': work_types.count(),
            'employers': len(employer_data),
            'candidates': len(candidate_data),
            'jobs': len(job_data),
            'applications': len(application_data),
        }
    }
    
    with open(f"{export_dir}/summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n📊 EXPORT SUMMARY:")
    print(f"   📁 Export directory: {export_dir}/")
    for key, value in summary['total_records'].items():
        print(f"   📋 {key.capitalize()}: {value} records")
    
    print(f"\n✅ Export completed successfully!")
    print(f"📦 Files created in '{export_dir}/' directory")
    
    return export_dir

if __name__ == "__main__":
    export_data()