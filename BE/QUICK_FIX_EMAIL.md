# Quick Fix: Lỗi Email "Username and Password not accepted"

## Lỗi bạn đang gặp:

```
✗ Error sending email: (535, b'5.7.8 Username and Password not accepted...')
```

## Nguyên nhân:

Bạn đang dùng **password Gmail thường** thay vì **App Password**.

Gmail không cho phép ứng dụng bên thứ 3 dùng password thường nữa!

---

## Giải pháp nhanh (5 phút):

### Bước 1: Bật 2-Step Verification

1. Vào: https://myaccount.google.com/security
2. Tìm **"2-Step Verification"**
3. Nhấn **"Turn On"** và làm theo hướng dẫn

### Bước 2: Tạo App Password

1. Vào: https://myaccount.google.com/apppasswords
2. Nhập tên app: **"JobBoard"**
3. Nhấn **"Create"**
4. Copy mật khẩu 16 ký tự (dạng: `xxxx xxxx xxxx xxxx`)

### Bước 3: Cập nhật settings.py

Mở `BE/recruitment/settings.py`, tìm dòng:

```python
EMAIL_HOST_PASSWORD = 'Kcntt@10102004'  # ❌ Password cũ
```

Thay bằng:

```python
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # ✅ App Password mới (16 ký tự)
```

### Bước 4: Restart server

```bash
# Ctrl+C để dừng server
python manage.py runserver
```

### Bước 5: Test

Thử ứng tuyển hoặc accept/reject đơn → Kiểm tra email

---

## Nếu vẫn lỗi:

1. **Kiểm tra App Password:**
   - Đảm bảo copy đúng 16 ký tự
   - Không có khoảng trắng thừa ở đầu/cuối

2. **Kiểm tra 2-Step Verification:**
   - Phải được bật trước khi tạo App Password

3. **Tạo App Password mới:**
   - Xóa App Password cũ
   - Tạo mới và thử lại

4. **Restart server:**
   - Luôn restart sau khi thay đổi settings.py

---

## Xem hướng dẫn đầy đủ:

📖 `BE/SETUP_GMAIL_APP_PASSWORD.md`

---

## Test nhanh trong Django shell:

```bash
cd BE
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test',
    'Test email',
    settings.DEFAULT_FROM_EMAIL,
    ['your-email@gmail.com'],
)
# Nếu thành công sẽ trả về: 1
```

---

## Checklist:

- [ ] Bật 2-Step Verification
- [ ] Tạo App Password
- [ ] Copy vào settings.py
- [ ] Restart Django server
- [ ] Test gửi email
