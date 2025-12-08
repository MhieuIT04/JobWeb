"""
Management command to ensure superuser exists
Usage: python manage.py ensure_superuser
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Ensures a superuser exists (creates if not exists)'

    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@jobboard.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123456')
        
        self.stdout.write(f'Checking for superuser: {email}')
        
        try:
            user = User.objects.filter(email=email).first()
            
            if user:
                self.stdout.write(self.style.WARNING(f'User {email} already exists'))
                # Update to ensure it's a superuser
                if not user.is_superuser or not user.is_staff:
                    user.is_superuser = True
                    user.is_staff = True
                    user.role = 'admin'
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'Updated {email} to superuser'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Superuser {email} is already configured'))
            else:
                # Create new superuser
                User.objects.create_superuser(
                    email=email,
                    password=password,
                    role='admin'
                )
                self.stdout.write(self.style.SUCCESS(f'✅ Created superuser: {email}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            raise
