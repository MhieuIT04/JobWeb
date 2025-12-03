# Hướng dẫn cấu hình Gmail App Password

## Vấn đề hiện tại

Lỗi: `Username and Password not accepted`

**Nguyên nhân:** Bạn đang dùng password Gmail thường, nhưng Gmail yêu cầu phải dùng **App Password** để cho phép ứng dụng bên thứ 3 gửi email.

---

## Bước 1: Bật 2-Step Verification

1. Truy cập: https://myaccount.google.com/security
2. Tìm mục **"2-Step Verification"** (Xác minh 2 bước)
3. Nhấn **"Get Started"** hoặc **"Turn On"**
4. Làm theo hướng dẫn để bật 2-Step Verification

**Lưu ý:** Bạn PHẢI bật 2-Step Verification trước khi có thể tạo App Password!

---

## Bước 2: Tạo App Password

1. Sau khi bật 2-Step Verification, truy cập:
   ```
   https://myaccount.google.com/apppasswords
   ```

2. Đăng nhập lại nếu được yêu cầu

3. Tại trang **"App passwords"**:
   - **App name:** Nhập tên (ví dụ: "JobBoard Django")
   - Nhấn **"Create"**

4. Google sẽ hiển thị một mật khẩu 16 ký tự (dạng: `xxxx xxxx xxxx xxxx`)

5. **QUAN TRỌNG:** Copy mật khẩu này ngay! Bạn sẽ không thể xem lại sau này.

---

## Bước 3: Cập nhật settings.py

Mở file `BE/recruitment/settings.py` và cập nhật:

```python
# EMAIL CONFIGURATION
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = '2200003087@nttu.edu.vn'  # Email của bạn
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # <-- Paste App Password ở đây (16 ký tự)
DEFAULT_FROM_EMAIL = 'JobBoard <2200003087@nttu.edu.vn>'
```

**Lưu ý:** 
- Có thể giữ hoặc bỏ dấu cách trong App Password (cả 2 đều work)
- Ví dụ: `abcd efgh ijkl mnop` hoặc `abcdefghijklmnop`

---

## Bước 4: Khởi động lại Django Server

```bash
cd BE
# Ctrl+C để dừng server
python manage.py runserver
```

---

## Bước 5: Test gửi email

### Test 1: Gửi email thử nghiệm

```bash
cd BE
python manage.py shell
```

Trong Django shell:

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    subject='Test Email từ JobBoard',
    message='Đây là email test. Nếu bạn nhận được email này, cấu hình đã thành công!',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=['your-test-email@gmail.com'],  # Thay bằng email test của bạn
    fail_silently=False,
)
```

Nếu thành công, bạn sẽ thấy: `1` (số email đã gửi)

### Test 2: Test thông báo ứng tuyển

1. Đăng nhập với tài khoản ứng viên
2. Ứng tuyển vào một công việc
3. Kiểm tra email của nhà tuyển dụng

### Test 3: Test thông báo accept/reject

1. Đăng nhập với tài khoản nhà tuyển dụng
2. Vào trang quản lý ứng viên
3. Accept hoặc Reject một đơn ứng tuyển
4. Kiểm tra email của ứng viên

---

## Troubleshooting

### Lỗi: "Username and Password not accepted"

**Giải pháp:**
1. Kiểm tra lại App Password đã copy đúng chưa
2. Đảm bảo 2-Step Verification đã được bật
3. Thử tạo App Password mới
4. Khởi động lại Django server

### Lỗi: "SMTPAuthenticationError"

**Giải pháp:**
1. Kiểm tra `EMAIL_HOST_USER` có đúng email không
2. Kiểm tra `EMAIL_HOST_PASSWORD` có đúng App Password không
3. Đảm bảo không có khoảng trắng thừa

### Lỗi: "Connection refused" hoặc "Timeout"

**Giải pháp:**
1. Kiểm tra firewall có block port 587 không
2. Kiểm tra internet connection
3. Thử đổi `EMAIL_PORT = 465` và `EMAIL_USE_SSL = True` (thay vì TLS)

### Email vào Spam

**Giải pháp:**
1. Đánh dấu "Not Spam" trong Gmail
2. Thêm email sender vào Contacts
3. Kiểm tra nội dung email không chứa từ ngữ spam

---

## Sử dụng Environment Variables (Khuyến nghị)

Thay vì hard-code password trong settings.py, nên dùng environment variables:

### 1. Tạo file `.env` trong thư mục BE:

```bash
# BE/.env
EMAIL_HOST_USER=2200003087@nttu.edu.vn
EMAIL_HOST_PASSWORD=your-app-password-here
```

### 2. Cài đặt python-decouple:

```bash
pip install python-decouple
```

### 3. Cập nhật settings.py:

```python
from decouple import config

# EMAIL CONFIGURATION
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = f'JobBoard <{EMAIL_HOST_USER}>'
```

### 4. Thêm `.env` vào `.gitignore`:

```bash
echo ".env" >> .gitignore
```

**Lợi ích:**
- Bảo mật hơn (không commit password lên Git)
- Dễ thay đổi giữa các môi trường (dev/staging/production)
- Tuân thủ best practices

---

## Alternative: Sử dụng dịch vụ Email khác

Nếu Gmail gặp vấn đề, có thể dùng:

### 1. SendGrid (Free tier: 100 emails/day)
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = 'your-sendgrid-api-key'
```

### 2. Mailgun (Free tier: 5,000 emails/month)
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'postmaster@your-domain.mailgun.org'
EMAIL_HOST_PASSWORD = 'your-mailgun-password'
```

### 3. AWS SES (Pay as you go)
```python
EMAIL_BACKEND = 'django_ses.SESBackend'
AWS_ACCESS_KEY_ID = 'your-access-key'
AWS_SECRET_ACCESS_KEY = 'your-secret-key'
AWS_SES_REGION_NAME = 'us-east-1'
AWS_SES_REGION_ENDPOINT = 'email.us-east-1.amazonaws.com'
```

---

## Tham khảo

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Django Email Documentation](https://docs.djangoproject.com/en/5.2/topics/email/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

---

## Checklist

- [ ] Bật 2-Step Verification cho Gmail
- [ ] Tạo App Password
- [ ] Copy App Password vào settings.py
- [ ] Khởi động lại Django server
- [ ] Test gửi email trong Django shell
- [ ] Test thông báo ứng tuyển
- [ ] Test thông báo accept/reject
- [ ] (Optional) Chuyển sang dùng environment variables
- [ ] (Optional) Thêm .env vào .gitignore
