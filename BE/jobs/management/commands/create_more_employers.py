from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import City
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create additional test employer accounts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=8,
            help='Number of employers to create (default: 8)'
        )

    def handle(self, *args, **kwargs):
        count = kwargs['count']
        
        # Lấy hoặc tạo city mặc định
        default_city, _ = City.objects.get_or_create(
            name='Hà Nội',
            defaults={'slug': 'ha-noi'}
        )
        
        # Danh sách tên công ty và thông tin mẫu
        companies = [
            {'name': 'VinaTech Solutions', 'first_name': 'Nguyễn', 'last_name': 'Văn D'},
            {'name': 'FPT Software', 'first_name': 'Trần', 'last_name': 'Thị E'},
            {'name': 'Viettel Digital', 'first_name': 'Lê', 'last_name': 'Minh F'},
            {'name': 'VNPT Technology', 'first_name': 'Phạm', 'last_name': 'Văn G'},
            {'name': 'MoMo Fintech', 'first_name': 'Hoàng', 'last_name': 'Thị H'},
            {'name': 'VNG Corporation', 'first_name': 'Đặng', 'last_name': 'Văn I'},
            {'name': 'Tiki Trading', 'first_name': 'Vũ', 'last_name': 'Thị K'},
            {'name': 'Shopee Vietnam', 'first_name': 'Bùi', 'last_name': 'Văn L'},
            {'name': 'Grab Vietnam', 'first_name': 'Cao', 'last_name': 'Thị M'},
            {'name': 'ZaloPay Tech', 'first_name': 'Đỗ', 'last_name': 'Văn N'},
        ]
        
        created_count = 0
        start_index = 4  # employer1, employer2, employer3 đã tồn tại
        
        for i in range(count):
            if i >= len(companies):
                break
                
            company = companies[i]
            employer_num = start_index + i
            email = f'employer{employer_num}@test.com'
            username = f'employer{employer_num}'
            
            # Kiểm tra xem email đã tồn tại chưa
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'⚠ Email {email} đã tồn tại, bỏ qua...')
                )
                continue
            
            try:
                # Tạo user
                user = User.objects.create_user(
                    email=email,
                    username=username,
                    password='employer123',
                    role='employer',
                )
                
                # Cập nhật profile
                profile = user.profile
                profile.first_name = company['first_name']
                profile.last_name = company['last_name']
                profile.phone_number = f'090{random.randint(1000000, 9999999)}'
                profile.company_name = company['name']
                profile.city = default_city
                profile.save()
                
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Created: {company["name"]} ({email})'
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating {email}: {str(e)}')
                )
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(
            self.style.SUCCESS(f'✓ Created {created_count} new employers!')
        )
        
        self.stdout.write('\nAll employers can login with:')
        for i in range(created_count):
            employer_num = start_index + i
            self.stdout.write(f'  - employer{employer_num}@test.com / employer123')

