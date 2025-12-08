#!/usr/bin/env python
"""
Script to seed initial data (categories, cities, work types)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from jobs.models import Category, WorkType
from users.models import City

def seed_categories():
    """Create initial job categories"""
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
    
    print(f'✅ Categories: {created_count} created, {len(categories) - created_count} already exist')

def seed_cities():
    """Create initial cities"""
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
    
    print(f'✅ Cities: {created_count} created, {len(cities) - created_count} already exist')

def seed_work_types():
    """Create initial work types"""
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
    
    print(f'✅ Work Types: {created_count} created, {len(work_types) - created_count} already exist')

if __name__ == '__main__':
    print('🌱 Seeding initial data...')
    seed_categories()
    seed_cities()
    seed_work_types()
    print('✅ Seeding completed!')
