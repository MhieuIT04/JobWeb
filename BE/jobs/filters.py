# jobs/filters.py
import django_filters
from .models import Job

class JobFilter(django_filters.FilterSet):
    # Thêm search để tìm kiếm trong title và description
    search = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    
    class Meta:
        model = Job
        # Liệt kê các trường bạn muốn lọc chính xác
        fields = ['category', 'city', 'work_type']