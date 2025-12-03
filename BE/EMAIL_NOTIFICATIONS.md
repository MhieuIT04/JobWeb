# Hệ thống Email Notifications

## Tổng quan

Hệ thống gửi email tự động cho 2 trường hợp:

1. **Nhà tuyển dụng nhận thông báo** khi có ứng viên mới ứng tuyển
2. **Ứng viên nhận thông báo** khi đơn ứng tuyển được chấp nhận/từ chối

## 1. Thông báo cho Nhà tuyển dụng

### Khi nào gửi?
- Khi ứng viên ứng tuyển vào công việc (tạo Application mới)

### Nội dung email:
- **Subject:** "Có ứng viên mới ứng tuyển!"
- **Thông tin:**
  - Tên ứng viên
  - Email ứng viên
  - Vị trí ứng tuyển
  - Thời gian ứng tuyển
  - Link xem chi tiết CV

### Code implementation:
```python
# BE/jobs/serializers.py - ApplicationCreateSerializer.create()
from notifications.utils import notify_employer_new_application

application = Application.objects.create(user=user, **validated_data)
notify_employer_new_application(application)
```

### Email template:
- HTML email với styling đẹp
- Button "Xem chi tiết ứng viên" link đến trang quản lý
- Thông tin ứng viên trong box highlight

---

## 2. Thông báo cho Ứng viên

### Khi nào gửi?
- Khi nhà tuyển dụng thay đổi trạng thái đơn ứng tuyển:
  - `accepted` - Đơn được chấp nhận
  - `rejected` - Đơn bị từ chối

### Nội dung email:

#### Khi được chấp nhận:
- **Subject:** "🎉 Chúc mừng! Đơn ứng tuyển của bạn đã được chấp nhận"
- **Icon:** ✅
- **Màu:** Xanh lá (#10b981)
- **Message:** Thông báo chúc mừng + thông tin công ty sẽ liên hệ

#### Khi bị từ chối:
- **Subject:** "Cập nhật trạng thái ứng tuyển"
- **Icon:** ❌
- **Màu:** Đỏ (#ef4444)
- **Message:** Động viên + khuyến khích tiếp tục tìm việc

### Code implementation:
```python
# BE/jobs/views.py - ApplicationUpdateView.perform_update()
from notifications.utils import create_and_send_notification

updated_instance = serializer.save()
create_and_send_notification(updated_instance)
```

### Email template:
- HTML email responsive
- Thông tin chi tiết: Vị trí, Công ty, Trạng thái
- Button "Xem lịch sử ứng tuyển"
- Màu sắc phù hợp với trạng thái

---

## Cấu hình Email

### Settings.py
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'JobBoard <your-email@example.com>'
FRONTEND_URL = 'http://localhost:3000'
```

### Sử dụng Gmail App Password

1. Truy cập: https://myaccount.google.com/apppasswords
2. Tạo App Password mới cho "Mail"
3. Copy password và paste vào `EMAIL_HOST_PASSWORD`

**Lưu ý:** Không dùng password Gmail thường, phải dùng App Password!

---

## Testing

### Test gửi email thủ công:

```python
# Django shell
python manage.py shell

from django.core.mail import send_mail
from django.conf import settings

send_mail(
    subject='Test Email',
    message='This is a test email',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=['test@example.com'],
    fail_silently=False,
)
```

### Test thông báo ứng tuyển:

1. **Test nhà tuyển dụng nhận email:**
   - Đăng nhập với tài khoản ứng viên
   - Ứng tuyển vào một công việc
   - Kiểm tra email của nhà tuyển dụng

2. **Test ứng viên nhận email:**
   - Đăng nhập với tài khoản nhà tuyển dụng
   - Vào trang quản lý ứng viên
   - Thay đổi trạng thái đơn ứng tuyển (Accept/Reject)
   - Kiểm tra email của ứng viên

---

## Troubleshooting

### Email không được gửi:

1. **Kiểm tra console logs:**
```bash
# Xem output khi chạy server
✓ Email sent to employer employer@example.com
✗ Error sending email: [error message]
```

2. **Kiểm tra cấu hình email:**
```python
# Django shell
from django.conf import settings
print(settings.EMAIL_HOST_USER)
print(settings.EMAIL_HOST_PASSWORD)
```

3. **Kiểm tra Gmail settings:**
   - 2-Step Verification phải được bật
   - App Password phải được tạo
   - "Less secure app access" KHÔNG cần bật (deprecated)

4. **Kiểm tra firewall/network:**
   - Port 587 phải được mở
   - TLS/SSL connection phải được cho phép

### Email vào Spam:

1. **Thêm SPF record** (nếu dùng domain riêng)
2. **Thêm DKIM signature**
3. **Kiểm tra nội dung email** - tránh từ ngữ spam
4. **Yêu cầu người nhận** đánh dấu "Not Spam"

---

## Files liên quan

- `BE/notifications/utils.py` - Logic gửi email và thông báo
- `BE/jobs/serializers.py` - Gọi notify khi tạo application
- `BE/jobs/views.py` - Gọi notify khi update status
- `BE/recruitment/settings.py` - Cấu hình email

---

## Future Improvements

1. **Email templates riêng biệt:**
   - Tách HTML templates ra file riêng
   - Sử dụng Django template engine
   - Dễ customize và maintain

2. **Queue system:**
   - Sử dụng Celery để gửi email async
   - Tránh block request khi gửi email
   - Retry mechanism khi gửi thất bại

3. **Email tracking:**
   - Track email open rate
   - Track link click rate
   - Analytics dashboard

4. **Personalization:**
   - Thêm logo công ty vào email
   - Customize theo preferences của user
   - Multi-language support

5. **More notification types:**
   - Nhắc nhở deadline ứng tuyển
   - Thông báo công việc mới phù hợp
   - Weekly digest email
