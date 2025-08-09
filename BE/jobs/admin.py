# jobs/admin.py - FILE HOÀN CHỈNH
from django.contrib import admin

# Import các model từ app 'jobs'
from .models import Job, Application, Favorite, Category, WorkType

# Import model City từ app 'users'
from users.models import City 

# Đăng ký các model
admin.site.register(Job)
admin.site.register(Application)
admin.site.register(Favorite)
admin.site.register(Category)
admin.site.register(WorkType)

# Dòng này vẫn cần thiết nếu bạn muốn quản lý City trong Admin,
# nhưng tốt hơn là nên chuyển nó sang users/admin.py
# admin.site.register(City) # Tạm thời comment dòng này
# @admin.register(Job)
# class JobAdmin(admin.ModelAdmin):
#     list_display = ['title', 'employer', 'status', 'created_at','city']
#     list_filter = ['status', 'category', 'work_type']
#     search_fields = ['title', 'description']