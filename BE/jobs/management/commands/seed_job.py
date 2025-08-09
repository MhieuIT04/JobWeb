# jobs/management/commands/seed_jobs.py

import random
from django.core.management.base import BaseCommand
from faker import Faker

# Import các model cần thiết
from jobs.models import Job, Category, WorkType
from users.models import User, City


class Command(BaseCommand):
    help = 'Seeds the database with sample job listings.'

    def add_arguments(self, parser):
        # Thêm một argument để chỉ định số lượng job cần tạo
        parser.add_argument('total', type=int, help='Indicates the number of jobs to be created.')

    def handle(self, *args, **kwargs):
        total = kwargs['total']
        faker = Faker()

        # --- Lấy các đối tượng liên quan đã có sẵn ---
        # Lấy tất cả các Category, City, WorkType
        categories = list(Category.objects.all())
        cities = list(City.objects.all())
        work_types = list(WorkType.objects.all())
        
        # Chỉ lấy những user có vai trò là 'employer'
        employers = list(User.objects.filter(role='employer'))

        # --- Kiểm tra xem có đủ dữ liệu phụ thuộc không ---
        if not categories or not cities or not work_types or not employers:
            self.stdout.write(self.style.ERROR('Please create at least one Category, City, WorkType, and Employer first.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting to seed {total} job(s)...'))

        # --- Bắt đầu vòng lặp tạo dữ liệu giả ---
        for _ in range(total):
            # Chọn ngẫu nhiên một đối tượng từ mỗi danh sách
            employer = random.choice(employers)
            category = random.choice(categories)
            city = random.choice(cities)
            work_type = random.choice(work_types)

            # Tạo thông tin giả
            title = faker.job()
            description = faker.text(max_nb_chars=1000)
            min_salary = random.randrange(5000000, 15000000, 1000000)
            max_salary = min_salary + random.randrange(2000000, 10000000, 1000000)
            
            # Tạo và lưu đối tượng Job
            Job.objects.create(
                employer=employer,
                category=category,
                work_type=work_type,
                city=city,
                title=title,
                description=description,
                min_salary=min_salary,
                max_salary=max_salary,
                status='approved' # Mặc định là đã duyệt để hiển thị ngay
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {total} job(s).'))