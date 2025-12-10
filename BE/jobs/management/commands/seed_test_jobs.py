"""
Management command to create test jobs for AI scoring
Usage: python manage.py seed_test_jobs
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import Job, Category, WorkType
from users.models import City, Profile

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test jobs for AI scoring system'

    def handle(self, *args, **options):
        self.stdout.write('🏗️ Creating test jobs for AI scoring...')
        
        # Get or create test employer
        employer_email = "employer_test@gmail.com"
        employer, created = User.objects.get_or_create(
            email=employer_email,
            defaults={
                'username': 'employer_test',
                'role': 'employer',
                'is_active': True
            }
        )
        
        if created:
            # Create employer profile
            Profile.objects.update_or_create(
                user=employer,
                defaults={
                    'company_name': 'Tech Solutions Ltd',
                    'first_name': 'John',
                    'last_name': 'Employer'
                }
            )
            self.stdout.write(f'✅ Created test employer: {employer_email}')
        
        # Get categories and work types
        it_category = Category.objects.filter(name__icontains='IT').first()
        marketing_category = Category.objects.filter(name__icontains='Marketing').first()
        fulltime_type = WorkType.objects.filter(name='Full-time').first()
        hanoi_city = City.objects.filter(name='Hà Nội').first()
        
        # Test jobs with different skill requirements
        test_jobs = [
            {
                'title': 'Senior Python Developer',
                'description': '''
                We are looking for a Senior Python Developer with strong skills in:
                - Python programming (3+ years)
                - Django framework
                - React.js for frontend
                - PostgreSQL database
                - Git version control
                - Docker containerization
                - Problem solving and analytical thinking
                - Team collaboration and communication
                
                Requirements:
                - Bachelor's degree in Computer Science
                - Experience with web development
                - Knowledge of software engineering best practices
                ''',
                'category': it_category,
                'min_salary': 20000000,
                'max_salary': 35000000,
            },
            {
                'title': 'Full Stack JavaScript Developer',
                'description': '''
                Join our team as a Full Stack JavaScript Developer:
                - JavaScript/TypeScript expertise
                - Node.js backend development
                - React.js frontend development
                - MongoDB or PostgreSQL
                - RESTful API design
                - Git and version control
                - Agile development methodology
                - Strong communication skills
                
                Nice to have:
                - Docker experience
                - AWS cloud services
                - GraphQL knowledge
                ''',
                'category': it_category,
                'min_salary': 18000000,
                'max_salary': 30000000,
            },
            {
                'title': 'Digital Marketing Specialist',
                'description': '''
                We need a Digital Marketing Specialist with:
                - Digital marketing strategy
                - SEO and SEM expertise
                - Social media marketing
                - Google Analytics
                - Content creation
                - Email marketing campaigns
                - Creative thinking
                - Data analysis skills
                - Communication and teamwork
                
                Requirements:
                - 2+ years marketing experience
                - Google Ads certification preferred
                - Strong analytical skills
                ''',
                'category': marketing_category,
                'min_salary': 12000000,
                'max_salary': 20000000,
            }
        ]
        
        created_count = 0
        for job_data in test_jobs:
            job, created = Job.objects.get_or_create(
                title=job_data['title'],
                employer=employer,
                defaults={
                    'description': job_data['description'],
                    'category': job_data['category'],
                    'work_type': fulltime_type,
                    'city': hanoi_city,
                    'min_salary': job_data['min_salary'],
                    'max_salary': job_data['max_salary'],
                    'status': 'approved',
                    'currency': 'VND'
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created job: {job.title}')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Created {created_count} test jobs!')
        )
        
        # Create test candidates
        self.stdout.write('👥 Creating test candidates...')
        
        test_candidates = [
            {
                'email': 'python_dev@gmail.com',
                'username': 'python_dev',
                'first_name': 'Alice',
                'last_name': 'Python',
                'skills': 'Python, Django, React, PostgreSQL, Git, Docker'
            },
            {
                'email': 'js_dev@gmail.com', 
                'username': 'js_dev',
                'first_name': 'Bob',
                'last_name': 'JavaScript',
                'skills': 'JavaScript, Node.js, React, MongoDB, Git'
            },
            {
                'email': 'marketer@gmail.com',
                'username': 'marketer',
                'first_name': 'Carol',
                'last_name': 'Marketing',
                'skills': 'Digital Marketing, SEO, Google Analytics, Social Media'
            }
        ]
        
        candidate_count = 0
        for candidate_data in test_candidates:
            user, created = User.objects.get_or_create(
                email=candidate_data['email'],
                defaults={
                    'username': candidate_data['username'],
                    'role': 'candidate',
                    'is_active': True
                }
            )
            
            if created:
                user.set_password('testpass123')
                user.save()
                
                # Create profile
                Profile.objects.update_or_create(
                    user=user,
                    defaults={
                        'first_name': candidate_data['first_name'],
                        'last_name': candidate_data['last_name'],
                        'bio': f"Experienced professional with skills in: {candidate_data['skills']}"
                    }
                )
                candidate_count += 1
                self.stdout.write(f'✅ Created candidate: {candidate_data["email"]}')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Created {candidate_count} test candidates!')
        )
        
        self.stdout.write(
            self.style.SUCCESS('🎉 Test data creation completed!')
        )
        
        # Print summary
        self.stdout.write('\n📊 TEST DATA SUMMARY:')
        self.stdout.write(f'Employer: {employer_email} (password: use admin to reset)')
        self.stdout.write('Candidates:')
        for candidate in test_candidates:
            self.stdout.write(f'  - {candidate["email"]} (password: testpass123)')
        self.stdout.write(f'Jobs created: {Job.objects.filter(employer=employer).count()}')