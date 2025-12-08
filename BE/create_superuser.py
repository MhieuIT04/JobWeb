#!/usr/bin/env python
"""
Script to create superuser automatically on deployment
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Get credentials from environment variables
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@jobboard.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123456')

# Create superuser if it doesn't exist
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        email=email,
        password=password,
        role='admin'
    )
    print(f'✅ Superuser created: {email}')
else:
    print(f'ℹ️  Superuser already exists: {email}')
