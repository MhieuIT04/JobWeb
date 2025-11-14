import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign existing jobs to employer accounts (distribute evenly)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--employer-email',
            type=str,
            default=None,
            help='Assign all jobs to a specific employer email'
        )
        parser.add_argument(
            '--distribute',
            action='store_true',
            help='Distribute jobs evenly among all employers'
        )
        parser.add_argument(
            '--approve-all',
            action='store_true',
            help='Set status to "approved" for all jobs'
        )

    def handle(self, *args, **kwargs):
        employer_email = kwargs.get('employer_email')
        distribute = kwargs['distribute']
        approve_all = kwargs['approve_all']
        
        # Get all jobs that need employer assignment
        jobs_without_employer = Job.objects.filter(employer__isnull=True)
        jobs_count = jobs_without_employer.count()
        
        if jobs_count == 0:
            self.stdout.write(self.style.SUCCESS('All jobs already have employers!'))
            return
        
        self.stdout.write(f'Found {jobs_count} jobs without employer')
        
        # Get employers
        if employer_email:
            # Assign to specific employer
            try:
                employer = User.objects.get(email=employer_email, role='employer')
                employers = [employer]
                self.stdout.write(
                    self.style.SUCCESS(f'Will assign all jobs to: {employer.email}')
                )
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(
                        f'Employer with email {employer_email} not found! '
                        f'Create one with: python manage.py create_test_employers'
                    )
                )
                return
        else:
            # Get all employers
            employers = list(User.objects.filter(role='employer'))
            
            if not employers:
                self.stdout.write(
                    self.style.ERROR(
                        'No employers found! Create some with: '
                        'python manage.py create_test_employers'
                    )
                )
                return
            
            self.stdout.write(
                self.style.SUCCESS(f'Found {len(employers)} employer(s) in database')
            )
        
        # Assign employers to jobs
        updated_count = 0
        
        if distribute and len(employers) > 1:
            # Distribute evenly
            self.stdout.write('Distributing jobs evenly among employers...')
            
            for i, job in enumerate(jobs_without_employer):
                employer = employers[i % len(employers)]
                job.employer = employer
                if approve_all:
                    job.status = 'approved'
                job.save()
                updated_count += 1
                
                if updated_count % 100 == 0:
                    self.stdout.write(f'  Processed {updated_count}/{jobs_count} jobs...')
        else:
            # Assign to single employer (first one or specified)
            employer = employers[0]
            self.stdout.write(f'Assigning all jobs to: {employer.email}...')
            
            for job in jobs_without_employer:
                job.employer = employer
                if approve_all:
                    job.status = 'approved'
                job.save()
                updated_count += 1
                
                if updated_count % 100 == 0:
                    self.stdout.write(f'  Processed {updated_count}/{jobs_count} jobs...')
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully assigned {updated_count} jobs!'))
        
        if len(employers) > 1 and distribute:
            self.stdout.write('\nJobs distribution:')
            for employer in employers:
                count = Job.objects.filter(employer=employer).count()
                self.stdout.write(
                    f'  - {employer.company_name or employer.email}: {count} jobs'
                )
        
        if approve_all:
            self.stdout.write(
                self.style.SUCCESS(f'\n✓ All jobs set to "approved" status')
            )
        
        self.stdout.write('\nEmployers can now login and manage applications!')

