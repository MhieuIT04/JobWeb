"""
Management command to seed initial data (categories, cities, work types)
Usage: python manage.py seed_initial_data
"""
from django.core.management.base import BaseCommand
from jobs.models import Category, WorkType
from users.models import City


class Command(BaseCommand):
    help = 'Seeds initial data for categories, cities, and work types'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding initial data...')
        
        # Seed Categories
        categories = [
            'IT - Phần mềm',
            'Marketing - PR',
            'Kinh doanh - Bán hàng',
            'Kế toán - Kiểm toán',
            'Nhân sự',
            'Hành chính - Văn phòng',
            'Thiết kế - Đồ họa',
            'Xây dựng',
            'Giáo dục - Đào tạo',
            'Y tế - Dược',
            'Du lịch - Khách sạn',
            'Luật - Pháp lý',
        ]
        
        created_count = 0
        for name in categories:
            category, created = Category.objects.get_or_create(name=name)
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Categories: {created_count} created, {len(categories) - created_count} already exist'
        ))
        
        # Seed Cities
        cities = [
            'Hà Nội',
            'Hồ Chí Minh',
            'Đà Nẵng',
            'Hải Phòng',
            'Cần Thơ',
            'Biên Hòa',
            'Nha Trang',
            'Huế',
            'Vũng Tàu',
            'Buôn Ma Thuột',
        ]
        
        created_count = 0
        for name in cities:
            city, created = City.objects.get_or_create(name=name)
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Cities: {created_count} created, {len(cities) - created_count} already exist'
        ))
        
        # Seed Work Types
        work_types = [
            'Full-time',
            'Part-time',
            'Remote',
            'Freelance',
            'Internship',
            'Contract',
        ]
        
        created_count = 0
        for name in work_types:
            work_type, created = WorkType.objects.get_or_create(name=name)
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Work Types: {created_count} created, {len(work_types) - created_count} already exist'
        ))
        
        self.stdout.write(self.style.SUCCESS('✅ Seeding completed!'))
