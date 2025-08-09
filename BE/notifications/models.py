# notifications/models.py
from django.db import models
from django.conf import settings

class Notification(models.Model):
    # User nhận thông báo
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Nội dung thông báo
    message = models.TextField()
    
    # Trạng thái đã đọc hay chưa
    is_read = models.BooleanField(default=False)
    
    # Thời gian tạo
    created_at = models.DateTimeField(auto_now_add=True)

    # (Tùy chọn) Link để khi nhấp vào sẽ chuyển hướng
    link = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at'] # Sắp xếp thông báo mới nhất lên đầu

    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.message[:30]}"