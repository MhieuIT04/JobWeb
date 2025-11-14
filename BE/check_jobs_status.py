import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from jobs.models import Job
from django.contrib.auth import get_user_model

User = get_user_model()

print('='*60)
print('📊 JOB & EMPLOYER STATUS')
print('='*60)

total_jobs = Job.objects.count()
jobs_without_employer = Job.objects.filter(employer__isnull=True).count()

print(f'\nTotal jobs: {total_jobs}')
print(f'Jobs without employer: {jobs_without_employer}')

employers = User.objects.filter(role='employer')
print(f'\nTotal employers: {employers.count()}')

print('\n📋 Jobs distribution:')
for employer in employers:
    count = Job.objects.filter(employer=employer).count()
    company = employer.profile.company_name if hasattr(employer, 'profile') and employer.profile.company_name else employer.email
    print(f'  • {company}: {count} jobs')

print('\n✅ Done!')

