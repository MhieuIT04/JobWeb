# notifications/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination if not needed

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint để xem, cập nhật (đánh dấu đã đọc), hoặc xóa một thông báo cụ thể.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Chỉ cho phép user truy cập thông báo của chính họ
        return Notification.objects.filter(recipient=self.request.user)