#!/usr/bin/env python3
"""
Export local employer accounts to production
"""
import sys
import os
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')

import django
django.setup()

from users.models import User, Profile, City
from jobs.models import Job, Category, WorkType
import json
from datetime import datetime

def export_local_employers():
    """Export local employer accounts and their jobs"""
    print("📤 EXPORTING LOCAL EMPLOYER ACCOUNTS")
    print("=" * 60)
    
    # Get all employers from local database
    employers = User.objects.filter(role='employer')
    
    if not employers.exists():
        print("   ❌ No employers found in local database")
        return
    
    print(f"   ✅ Found {employers.count()} employers")
    
    export_data = {
        'employers': [],
        'jobs': [],
        'categories': [],
        'work_types': [],
        'cities': [],
        'export_date': datetime.now().isoformat()
    }
    
    # Export categories
    categories = Category.objects.all()
    for category in categories:
        export_data['categories'].append({
            'id': category.id,
            'name': category.name,
            'name_en': category.name_en,
            'is_hot': category.is_hot
        })
    
    print(f"   📋 Exported {len(export_data['categories'])} categories")
    
    # Export work types
    work_types = WorkType.objects.all()
    for work_type in work_types:
        export_data['work_types'].append({
            'id': work_type.id,
            'name': work_type.name
        })
    
    print(f"   💼 Exported {len(export_data['work_types'])} work types")
    
    # Export cities
    cities = City.objects.all()
    for city in cities:
        export_data['cities'].append({
            'id': city.id,
            'name': city.name
        })
    
    print(f"   🏙️ Exported {len(export_data['cities'])} cities")
    
    # Export employers
    for employer in employers:
        employer_data = {
            'email': employer.email,
            'role': employer.role,
            'is_active': employer.is_active,
            'date_joined': employer.date_joined.isoformat(),
            'profile': None,
            'jobs': []
        }
        
        # Export profile if exists
        if hasattr(employer, 'profile'):
            profile = employer.profile
            employer_data['profile'] = {
                'first_name': profile.first_name,
                'last_name': profile.last_name,
                'phone_number': profile.phone_number,
                'company_name': profile.company_name,
                'bio': profile.bio,
                'city_id': profile.city.id if profile.city else None
            }
        
        # Export jobs for this employer
        jobs = Job.objects.filter(employer=employer)
        for job in jobs:
            job_data = {
                'title': job.title,
                'title_en': job.title_en,
                'description': job.description,
                'description_en': job.description_en,
                'min_salary': float(job.min_salary) if job.min_salary else None,
                'max_salary': float(job.max_salary) if job.max_salary else None,
                'currency': job.currency,
                'status': job.status,
                'is_premium': job.is_premium,
                'expires_at': job.expires_at.isoformat() if job.expires_at else None,
                'category_id': job.category.id if job.category else None,
                'work_type_id': job.work_type.id if job.work_type else None,
                'city_id': job.city.id if job.city else None,
                'created_at': job.created_at.isoformat(),
                'updated_at': job.updated_at.isoformat()
            }
            employer_data['jobs'].append(job_data)
        
        export_data['employers'].append(employer_data)
        print(f"   👤 Exported employer: {employer.email} ({len(employer_data['jobs'])} jobs)")
    
    # Save to file
    filename = f"local_employers_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ EXPORT COMPLETED!")
    print(f"   📁 File: {filename}")
    print(f"   👥 Employers: {len(export_data['employers'])}")
    print(f"   💼 Jobs: {sum(len(emp['jobs']) for emp in export_data['employers'])}")
    print(f"   📋 Categories: {len(export_data['categories'])}")
    print(f"   🏙️ Cities: {len(export_data['cities'])}")
    
    # Show summary
    print(f"\n📊 EMPLOYER SUMMARY:")
    for employer_data in export_data['employers']:
        company_name = "Unknown Company"
        if employer_data['profile'] and employer_data['profile']['company_name']:
            company_name = employer_data['profile']['company_name']
        
        print(f"   • {employer_data['email']} - {company_name} ({len(employer_data['jobs'])} jobs)")
    
    print(f"\n💡 NEXT STEPS:")
    print(f"   1. Upload {filename} to production server")
    print(f"   2. Run import script on production")
    print(f"   3. Test login with exported accounts")
    
    return filename

if __name__ == "__main__":
    export_local_employers()