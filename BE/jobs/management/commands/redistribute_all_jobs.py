from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job

User = get_user_model()


class Command(BaseCommand):
    help = 'Redistribute all jobs evenly among all employers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--approve-all',
            action='store_true',
            help='Set all jobs status to approved'
        )

    def handle(self, *args, **kwargs):
        approve_all = kwargs['approve_all']
        
        # Lấy tất cả employers
        employers = list(User.objects.filter(role='employer').order_by('id'))
        
        if not employers:
            self.stdout.write(
                self.style.ERROR('No employers found!')
            )
            return
        
        self.stdout.write(f'\n📋 Found {len(employers)} employers:')
        for employer in employers:
            company = employer.profile.company_name if hasattr(employer, 'profile') and employer.profile.company_name else employer.email
            self.stdout.write(f'  • {company} ({employer.email})')
        
        # Lấy tất cả jobs
        all_jobs = Job.objects.all()
        total_jobs = all_jobs.count()
        
        self.stdout.write(f'\n📦 Redistributing {total_jobs} jobs among {len(employers)} employers...\n')
        
        # Prepare jobs for bulk update
        jobs_to_update = []
        for i, job in enumerate(all_jobs):
            employer = employers[i % len(employers)]
            job.employer = employer
            if approve_all:
                job.status = 'approved'
            jobs_to_update.append(job)
            
            if (i + 1) % 1000 == 0:
                self.stdout.write(f'  Prepared {i+1}/{total_jobs} jobs...')
        
        # Bulk update
        self.stdout.write('Saving to database (bulk update)...')
        fields_to_update = ['employer', 'status'] if approve_all else ['employer']
        Job.objects.bulk_update(jobs_to_update, fields_to_update, batch_size=500)
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'✓ Redistributed {total_jobs} jobs!'))
        
        self.stdout.write('\n📋 New distribution:')
        for employer in employers:
            count = Job.objects.filter(employer=employer).count()
            company = employer.profile.company_name if hasattr(employer, 'profile') and employer.profile.company_name else employer.email
            self.stdout.write(f'  • {company}: {count} jobs')
        
        if approve_all:
            approved_count = Job.objects.filter(status='approved').count()
            self.stdout.write(
                self.style.SUCCESS(f'\n✓ {approved_count} jobs set to "approved" status')
            )

