# recruitment/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from notifications.views import NotificationListView, NotificationDetailView

urlpatterns = [
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