import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from jobs.models import Job, Category, WorkType
from users.models import User, City 
import random

class Command(BaseCommand):
    help = 'Imports jobs and categories from a specified CSV file.'

    def add_arguments(self, parser):
        # Thêm argument cho đường dẫn file CSV
        parser.add_argument('csv_file', type=str, help='The path to the CSV file to import.')

    @transaction.atomic # Đảm bảo tất cả các thao tác đều thành công, nếu có lỗi sẽ rollback
    def handle(self, *args, **kwargs):
        csv_file_path = kwargs['csv_file']
        self.stdout.write(self.style.SUCCESS(f'Starting import process from "{csv_file_path}"...'))

        # --- BƯỚC 1: DỌN DẸP DỮ LIỆU CŨ ---
        self.stdout.write(self.style.WARNING('Deleting old Jobs and Categories...'))
        
        # Xóa các Job trước để gỡ bỏ khóa ngoại trỏ đến Category
        Job.objects.all().delete()
        
        # Sau đó mới xóa Category
        Category.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('---> Old data cleared.'))

        # --- BƯỚC 2: CHUẨN BỊ DỮ LIỆU PHỤ THUỘC ---
        self.stdout.write('Loading dependent data (Cities, WorkTypes, Employers)...')
        # Lấy sẵn các đối tượng này để tránh truy vấn CSDL nhiều lần
        cities = list(City.objects.all())
        work_types = list(WorkType.objects.all())
        employers = list(User.objects.filter(role='employer'))

        if not cities or not work_types or not employers:
            self.stdout.write(self.style.ERROR('Import failed: Please create at least one City, WorkType, and Employer in the admin panel first.'))
            return

        # --- BƯỚC 3: ĐỌC VÀ XỬ LÝ FILE CSV ---
        try:
            df = pd.read_csv(csv_file_path)
            # Giả định các tên cột trong file CSV của bạn. HÃY THAY ĐỔI NẾU CẦN.
            # Ví dụ: 'job_title', 'job_description', 'industry_name', 'location_name'
            required_columns = ['description', 'mapped_industry'] 
            if not all(col in df.columns for col in required_columns):
                self.stdout.write(self.style.ERROR(f'CSV file must contain the following columns: {required_columns}'))
                return
            
            self.stdout.write(f'---> Found {len(df)} rows in CSV.')
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found at "{csv_file_path}"'))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading CSV file: {e}'))
            return

        # --- BƯỚC 4: TẠO CATEGORIES VÀ JOBS ---
        self.stdout.write('Creating new Categories and Jobs...')
        
        categories_cache = {} # Dùng cache để tránh tạo Category trùng lặp
        jobs_to_create = []

        for index, row in df.iterrows():
            category_name = row.get('mapped_industry')
            
            # Nếu có tên ngành nghề
            if pd.notna(category_name) and category_name.strip():
                category_name = category_name.strip()
                
                # Kiểm tra cache trước
                if category_name in categories_cache:
                    category = categories_cache[category_name]
                else:
                    # Nếu chưa có trong cache, tìm hoặc tạo mới trong CSDL
                    category, created = Category.objects.get_or_create(name=category_name)
                    categories_cache[category_name] = category
                    if created:
                        self.stdout.write(f'---> Created new category: "{category_name}"')
            else:
                category = None # Bỏ qua nếu không có ngành nghề

             # SỬA LẠI CÁCH LẤY DỮ LIỆU TỪ CỘT
            description_text = str(row.get('description', 'N/A'))
            title_text = ' '.join(description_text.split()[:5]) + '...'
            # Tạo đối tượng Job (chưa lưu vào CSDL)
            job = Job(
                title=title_text,
                description=description_text,
                category=category,
                city=random.choice(cities),
                work_type=random.choice(work_types),
                employer=random.choice(employers),
                min_salary=random.randint(5, 20) * 1000000,
                max_salary=random.randint(21, 50) * 1000000,
                status='approved'
            )
            jobs_to_create.append(job)

        Job.objects.bulk_create(jobs_to_create)

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(jobs_to_create)} jobs and {len(categories_cache)} categories.'))