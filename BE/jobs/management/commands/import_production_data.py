#!/usr/bin/env python3
"""
Django management command to import production data
Usage: python manage.py import_production_data
"""
from django.core.management.base import BaseCommand
import os
import zipfile
import json
from datetime import datetime
from django.utils.dateparse import parse_datetime
from django.contrib.auth.hashers import make_password
from django.core import serializers

from users.models import User, City, Skill, Profile
from jobs.models import Job, Category, WorkType, Application, JobSkill

class Command(BaseCommand):
    help = 'Import production data from production_data.zip'

    def handle(self, *args, **options):
        self.stdout.write("🚀 IMPORTING PRODUCTION DATA")
        self.stdout.write("=" * 50)
        
        # Check if files exist
        if not os.path.exists('production_data.zip'):
            self.stdout.write(self.style.WARNING("❌ production_data.zip not found"))
            return
        
        # Extract data
        self.stdout.write("📦 Extracting data package...")
        with zipfile.ZipFile('production_data.zip', 'r') as zip_ref:
            zip_ref.extractall('exported_data')
        self.stdout.write("✅ Data extracted")
        
        # Import data
        self.import_basic_data()
        self.import_users()
        job_mapping = self.import_jobs()
        self.import_applications(job_mapping)
        
        self.stdout.write(self.style.SUCCESS("✅ IMPORT COMPLETED!"))
        self.stdout.write("🔑 Default password: 'imported123'")
    
    def import_basic_data(self):
        """Import cities, skills, categories, work types"""
        self.stdout.write("📋 Importing basic data...")
        
        # Cities
        if os.path.exists("exported_data/cities.json"):
            with open("exported_data/cities.json", "r", encoding="utf-8") as f:
                cities_data = f.read()
            
            existing_cities = set(City.objects.values_list('name', flat=True))
            imported = 0
            
            for obj in serializers.deserialize("json", cities_data):
                if obj.object.name not in existing_cities:
                    obj.save()
                    imported += 1
            
            self.stdout.write(f"   ✅ Cities: {imported} new records")
        
        # Skills
        if os.path.exists("exported_data/skills.json"):
            with open("exported_data/skills.json", "r", encoding="utf-8") as f:
                skills_data = f.read()
            
            existing_skills = set(Skill.objects.values_list('name', flat=True))
            imported = 0
            
            for obj in serializers.deserialize("json", skills_data):
                if obj.object.name not in existing_skills:
                    obj.save()
                    imported += 1
            
            self.stdout.write(f"   ✅ Skills: {imported} new records")
        
        # Categories
        if os.path.exists("exported_data/categories.json"):
            with open("exported_data/categories.json", "r", encoding="utf-8") as f:
                categories_data = f.read()
            
            existing_categories = set(Category.objects.values_list('name', flat=True))
            imported = 0
            
            for obj in serializers.deserialize("json", categories_data):
                if obj.object.name not in existing_categories:
                    obj.save()
                    imported += 1
            
            self.stdout.write(f"   ✅ Categories: {imported} new records")
        
        # Work Types
        if os.path.exists("exported_data/work_types.json"):
            with open("exported_data/work_types.json", "r", encoding="utf-8") as f:
                work_types_data = f.read()
            
            existing_work_types = set(WorkType.objects.values_list('name', flat=True))
            imported = 0
            
            for obj in serializers.deserialize("json", work_types_data):
                if obj.object.name not in existing_work_types:
                    obj.save()
                    imported += 1
            
            self.stdout.write(f"   ✅ Work Types: {imported} new records")
    
    def import_users(self):
        """Import employers and candidates"""
        self.stdout.write("👥 Importing users...")
        
        default_password = "imported123"
        hashed_password = make_password(default_password)
        existing_emails = set(User.objects.values_list('email', flat=True))
        
        # Employers
        if os.path.exists("exported_data/employers.json"):
            with open("exported_data/employers.json", "r", encoding="utf-8") as f:
                employers_data = json.load(f)
            
            imported = 0
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
                    
                    profile, created = Profile.objects.get_or_create(user=user)
                    profile.first_name = employer_data['first_name']
                    profile.last_name = employer_data['last_name']
                    profile.company_name = employer_data['company_name']
                    profile.bio = employer_data['bio']
                    profile.phone_number = employer_data['phone_number']
                    profile.city = city
                    profile.save()
                    
                    imported += 1
            
            self.stdout.write(f"   ✅ Employers: {imported} new records")
        
        # Candidates
        if os.path.exists("exported_data/candidates.json"):
            with open("exported_data/candidates.json", "r", encoding="utf-8") as f:
                candidates_data = json.load(f)
            
            imported = 0
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
                    
                    profile, created = Profile.objects.get_or_create(user=user)
                    profile.first_name = candidate_data['first_name']
                    profile.last_name = candidate_data['last_name']
                    profile.phone_number = candidate_data['phone_number']
                    profile.bio = candidate_data['bio']
                    profile.city = city
                    profile.save()
                    
                    if candidate_data['skills']:
                        skills = Skill.objects.filter(id__in=candidate_data['skills'])
                        profile.skills.set(skills)
                    
                    imported += 1
            
            self.stdout.write(f"   ✅ Candidates: {imported} new records")
    
    def import_jobs(self):
        """Import jobs"""
        self.stdout.write("💼 Importing jobs...")
        
        if not os.path.exists("exported_data/jobs.json"):
            self.stdout.write("   ⚠️  No jobs data found")
            return {}
        
        with open("exported_data/jobs.json", "r", encoding="utf-8") as f:
            jobs_data = json.load(f)
        
        imported = 0
        job_mapping = {}
        
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
                
                if job_data['skills']:
                    skills = Skill.objects.filter(id__in=job_data['skills'])
                    for skill in skills:
                        JobSkill.objects.create(job=job, skill=skill)
                
                job_key = f"{job_data['employer_email']}:{job_data['title']}"
                job_mapping[job_key] = job.id
                
                imported += 1
                
                if imported % 1000 == 0:
                    self.stdout.write(f"   📊 Imported {imported} jobs so far...")
                    
            except User.DoesNotExist:
                continue
        
        self.stdout.write(f"   ✅ Jobs: {imported} new records")
        return job_mapping
    
    def import_applications(self, job_mapping):
        """Import applications"""
        self.stdout.write("📝 Importing applications...")
        
        if not os.path.exists("exported_data/applications.json"):
            self.stdout.write("   ⚠️  No applications data found")
            return
        
        with open("exported_data/applications.json", "r", encoding="utf-8") as f:
            applications_data = json.load(f)
        
        imported = 0
        
        for app_data in applications_data:
            try:
                user = User.objects.get(email=app_data['user_email'])
                job_key = f"{app_data['employer_email']}:{app_data['job_title']}"
                
                if job_key in job_mapping:
                    job = Job.objects.get(id=job_mapping[job_key])
                    
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
                        imported += 1
                
            except User.DoesNotExist:
                continue
        
        self.stdout.write(f"   ✅ Applications: {imported} new records")