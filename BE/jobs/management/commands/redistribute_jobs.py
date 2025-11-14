from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Redistribute jobs among specific employers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-employers-only',
            action='store_true',
            help='Redistribute jobs only among the 3 test employers'
        )
        parser.add_argument(
            '--approve-all',
            action='store_true',
            help='Set all jobs status to approved'
        )

    def handle(self, *args, **kwargs):
        test_employers_only = kwargs['test_employers_only']
        approve_all = kwargs['approve_all']
        
        # Get test employers
        test_emails = ['employer1@test.com', 'employer2@test.com', 'employer3@test.com']
        test_employers = list(User.objects.filter(email__in=test_emails, role='employer'))
        
        if len(test_employers) < 3:
            self.stdout.write(
                self.style.ERROR(
                    f'Only found {len(test_employers)} test employers. '
                    'Make sure you run: python manage.py create_test_employers first'
                )
            )
            return
        
        # Get all jobs
        all_jobs = Job.objects.all()
        total_jobs = all_jobs.count()
        
        if test_employers_only:
            # Redistribute evenly among 3 test employers
            employers = test_employers
            self.stdout.write(
                f'Redistributing {total_jobs} jobs among 3 test employers...'
            )
        else:
            # Get all employers
            employers = list(User.objects.filter(role='employer'))
            self.stdout.write(
                f'Redistributing {total_jobs} jobs among {len(employers)} employers...'
            )
        
        if not employers:
            self.stdout.write(self.style.ERROR('No employers found!'))
            return
        
        # Redistribute jobs using bulk update (MUCH FASTER!)
        updated_count = 0
        jobs_to_update = []
        
        self.stdout.write('Preparing jobs for bulk update...')
        for i, job in enumerate(all_jobs):
            employer = employers[i % len(employers)]
            job.employer = employer
            if approve_all:
                job.status = 'approved'
            jobs_to_update.append(job)
            updated_count += 1
            
            if updated_count % 1000 == 0:
                self.stdout.write(f'  Prepared {updated_count}/{total_jobs} jobs...')
        
        # Bulk update all jobs at once
        self.stdout.write('Saving all jobs to database (bulk update)...')
        fields_to_update = ['employer', 'status'] if approve_all else ['employer']
        Job.objects.bulk_update(jobs_to_update, fields_to_update, batch_size=500)
        self.stdout.write('✓ Bulk update completed!')
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'✓ Redistributed {updated_count} jobs!'))
        
        self.stdout.write('\n📋 New distribution:')
        for employer in employers:
            count = Job.objects.filter(employer=employer).count()
            company = employer.profile.company_name if hasattr(employer, 'profile') and employer.profile.company_name else employer.email
            self.stdout.write(
                f'  • {company}: {count} jobs'
            )
        
        if approve_all:
            approved_count = Job.objects.filter(status='approved').count()
            self.stdout.write(
                self.style.SUCCESS(f'\n✓ {approved_count} jobs set to "approved" status')
            )
        
        self.stdout.write('\nTest employers can now login:')
        for email in test_emails:
            self.stdout.write(f'  - {email} / testpass123')

