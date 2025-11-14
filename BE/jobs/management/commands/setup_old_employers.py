from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup old employers: reset password and redistribute jobs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help='Reset password for old employers to "oldpass123"'
        )
        parser.add_argument(
            '--redistribute',
            action='store_true',
            help='Redistribute jobs to old employers (DuongPhan & DuongNguyen)'
        )

    def handle(self, *args, **kwargs):
        reset_password = kwargs['reset_password']
        redistribute = kwargs['redistribute']
        
        # Old employer emails
        old_employers = [
            'DuongPhan@gmail.com',
            'DuongNguyen@gmail.com',
        ]
        
        # Reset password
        if reset_password:
            self.stdout.write('\n🔑 Resetting passwords for old employers...')
            for email in old_employers:
                try:
                    user = User.objects.get(email=email, role='employer')
                    user.set_password('oldpass123')
                    user.save()
                    company = user.profile.company_name if hasattr(user, 'profile') and user.profile.company_name else email
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Reset password for: {company} ({email})')
                    )
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'⚠ Employer not found: {email}')
                    )
            
            self.stdout.write('\n' + '='*60)
            self.stdout.write('New password for old employers: oldpass123')
        
        # Redistribute jobs
        if redistribute:
            self.stdout.write('\n📦 Redistributing jobs to old employers...')
            
            employers = []
            for email in old_employers:
                try:
                    user = User.objects.get(email=email, role='employer')
                    employers.append(user)
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'⚠ Employer not found: {email}')
                    )
            
            if not employers:
                self.stdout.write(self.style.ERROR('No old employers found!'))
                return
            
            # Get all jobs
            all_jobs = Job.objects.all()
            total_jobs = all_jobs.count()
            
            self.stdout.write(f'Redistributing {total_jobs} jobs among {len(employers)} old employers...')
            
            # Prepare jobs for bulk update
            jobs_to_update = []
            for i, job in enumerate(all_jobs):
                employer = employers[i % len(employers)]
                job.employer = employer
                job.status = 'approved'
                jobs_to_update.append(job)
                
                if (i + 1) % 1000 == 0:
                    self.stdout.write(f'  Prepared {i+1}/{total_jobs} jobs...')
            
            # Bulk update
            self.stdout.write('Saving to database...')
            Job.objects.bulk_update(jobs_to_update, ['employer', 'status'], batch_size=500)
            
            self.stdout.write('\n' + '='*60)
            self.stdout.write(self.style.SUCCESS(f'✓ Redistributed {total_jobs} jobs!'))
            
            self.stdout.write('\n📋 New distribution:')
            for employer in employers:
                count = Job.objects.filter(employer=employer).count()
                company = employer.profile.company_name if hasattr(employer, 'profile') and employer.profile.company_name else employer.email
                self.stdout.write(f'  • {company}: {count} jobs')
        
        # Summary
        if reset_password or redistribute:
            self.stdout.write('\n' + '='*60)
            self.stdout.write('✅ Setup completed! You can now login with:')
            for email in old_employers:
                self.stdout.write(f'  - {email} / oldpass123')

