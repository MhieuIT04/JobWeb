# users/admin.py
from django.contrib import admin
from .models import User, City, Skill # Đảm bảo import User ở đây

# Đăng ký các model
admin.site.register(User)
admin.site.register(City)
admin.site.register(Skill)