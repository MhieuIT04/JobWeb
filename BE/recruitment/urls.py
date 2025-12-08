# recruitment/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from notifications.views import NotificationListView, NotificationDetailView

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'ok',
        'debug': settings.DEBUG,
        'database': 'connected'
    })

urlpatterns = [
    path('', health_check, name='health-check'),  # Root endpoint
    path('health/', health_check, name='health'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')), # <-- URL sẽ bắt đầu bằng /api/jobs/
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)