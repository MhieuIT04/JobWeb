from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import City, Profile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test employer accounts for managing Kaggle jobs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=3,
            help='Number of test employers to create (default: 3)'
        )

    def handle(self, *args, **kwargs):
        count = kwargs['count']
        
        # Get or create a default city
        default_city, _ = City.objects.get_or_create(
            name='Hồ Chí Minh',
            defaults={'name_en': 'Ho Chi Minh City'}
        )
        
        employers_data = [
            {
                'email': 'employer1@test.com',
                'username': 'employer1',
                'password': 'testpass123',
                'company_name': 'Tech Solutions VN',
                'first_name': 'Nguyễn',
                'last_name': 'Văn A',
                'phone_number': '0901234567',
            },
            {
                'email': 'employer2@test.com', 
                'username': 'employer2',
                'password': 'testpass123',
                'company_name': 'Digital Marketing Pro',
                'first_name': 'Trần',
                'last_name': 'Thị B',
                'phone_number': '0907654321',
            },
            {
                'email': 'employer3@test.com',
                'username': 'employer3', 
                'password': 'testpass123',
                'company_name': 'Finance Experts Co.',
                'first_name': 'Lê',
                'last_name': 'Minh C',
                'phone_number': '0909876543',
            },
        ]
        
        created_count = 0
        existing_count = 0
        
        for i, data in enumerate(employers_data[:count]):
            email = data['email']
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                existing_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Employer {email} already exists, skipping...')
                )
                continue
            
            # Create employer user
            user = User.objects.create_user(
                email=email,
                username=data['username'],
                password=data['password'],
                role='employer',
            )
            
            # Update profile with additional information
            profile = user.profile
            profile.first_name = data['first_name']
            profile.last_name = data['last_name']
            profile.phone_number = data['phone_number']
            profile.company_name = data['company_name']
            profile.city = default_city
            profile.save()
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Created employer: {email} | Company: {data["company_name"]}'
                )
            )
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'Summary:'))
        self.stdout.write(f'  - Created: {created_count} employers')
        self.stdout.write(f'  - Already existed: {existing_count} employers')
        self.stdout.write('\n' + self.style.WARNING('Login credentials for all test employers:'))
        self.stdout.write('  - Password: testpass123')
        self.stdout.write('\nYou can now re-import jobs with:')
        self.stdout.write(self.style.SUCCESS(
            '  python manage.py import_jobs data/train.csv --employer-email employer1@test.com'
        ))

