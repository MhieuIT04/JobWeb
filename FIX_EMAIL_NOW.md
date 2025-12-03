# ⚠️ SỬA LỖI EMAIL NGAY (5 PHÚT)

## Vấn đề hiện tại:

```
✗ Error sending email: Username and Password not accepted
```

Email: `2200003087@nttu.edu.vn` không nhận được thông báo vì **chưa cấu hình App Password**.

---

## GIẢI PHÁP NHANH (5 bước):

### Bước 1: Bật 2-Step Verification (1 phút)

1. Vào: https://myaccount.google.com/security
2. Tìm **"2-Step Verification"** (Xác minh 2 bước)
3. Nhấn **"Get Started"** hoặc **"Turn On"**
4. Làm theo hướng dẫn (nhập số điện thoại, nhận mã OTP)

**⚠️ BẮT BUỘC:** Phải bật 2-Step Verification trước!

---

### Bước 2: Tạo App Password (2 phút)

1. Sau khi bật 2-Step, vào: https://myaccount.google.com/apppasswords

2. Nếu không thấy link, vào:
   - https://myaccount.google.com/security
   - Scroll xuống tìm **"App passwords"**

3. Tại trang App passwords:
   - **Select app:** Chọn "Mail"
   - **Select device:** Chọn "Other (Custom name)"
   - Nhập tên: **"JobBoard Django"**
   - Nhấn **"Generate"**

4. Google sẽ hiển thị mật khẩu 16 ký tự:
   ```
   xxxx xxxx xxxx xxxx
   ```

5. **QUAN TRỌNG:** Copy ngay! Không thể xem lại sau này.

---

### Bước 3: Cập nhật settings.py (1 phút)

Mở file `BE/recruitment/settings.py`, tìm dòng:

```python
EMAIL_HOST_PASSWORD = 'Kcntt@10102004'  # ❌ Password cũ
```

Thay bằng App Password vừa tạo:

```python
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # ✅ App Password 16 ký tự
```

**Ví dụ:**
```python
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'
```

Hoặc không có dấu cách:
```python
EMAIL_HOST_PASSWORD = 'abcdefghijklmnop'
```

---

### Bước 4: Restart Django Server (30 giây)

```bash
# Trong terminal đang chạy Django
Ctrl + C  # Dừng server

# Chạy lại
python manage.py runserver
```

**⚠️ QUAN TRỌNG:** Phải restart server sau khi thay đổi settings!

---

### Bước 5: Test ngay (30 giây)

**Option 1: Test trong Django shell**

```bash
cd BE
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    subject='Test Email',
    message='Nếu nhận được email này, cấu hình đã thành công!',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=['2200003087@nttu.edu.vn'],
    fail_silently=False,
)
# Nếu thành công sẽ trả về: 1
```

**Option 2: Test bằng accept/reject đơn**

1. Đăng nhập với tài khoản nhà tuyển dụng
2. Vào trang quản lý ứng viên
3. Accept hoặc Reject một đơn ứng tuyển
4. Kiểm tra email `2200003087@nttu.edu.vn`

---

## Checklist:

- [ ] Bật 2-Step Verification cho Gmail
- [ ] Tạo App Password (16 ký tự)
- [ ] Copy App Password vào settings.py
- [ ] Restart Django server (Ctrl+C rồi chạy lại)
- [ ] Test gửi email trong Django shell
- [ ] Kiểm tra email đã nhận được

---

## Nếu vẫn lỗi:

### Lỗi: "App passwords" không hiện

**Nguyên nhân:** 2-Step Verification chưa được bật

**Giải pháp:**
1. Vào https://myaccount.google.com/security
2. Đảm bảo "2-Step Verification" đã ON (màu xanh)
3. Đợi vài phút rồi thử lại

### Lỗi: App Password không work

**Giải pháp:**
1. Xóa App Password cũ trong Google Account
2. Tạo App Password mới
3. Copy chính xác 16 ký tự
4. Paste vào settings.py
5. Restart server

### Lỗi: Email vào Spam

**Giải pháp:**
1. Kiểm tra thư mục Spam trong Gmail
2. Đánh dấu "Not Spam"
3. Thêm email sender vào Contacts

---

## Screenshot hướng dẫn:

### 1. Bật 2-Step Verification:
```
Google Account > Security > 2-Step Verification > Turn On
```

### 2. Tạo App Password:
```
Google Account > Security > App passwords > 
Select app: Mail > 
Select device: Other > 
Name: JobBoard > 
Generate
```

### 3. Copy password:
```
Your app password for JobBoard:
xxxx xxxx xxxx xxxx

Copy this password and paste it into settings.py
```

---

## Tham khảo:

📖 Hướng dẫn chi tiết: `BE/SETUP_GMAIL_APP_PASSWORD.md`
🔧 Quick fix: `BE/QUICK_FIX_EMAIL.md`

---

## Support:

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn:

1. Kiểm tra console log khi gửi email
2. Kiểm tra `EMAIL_HOST_USER` có đúng không
3. Kiểm tra không có khoảng trắng thừa trong password
4. Thử tạo App Password mới

---

## ✅ Sau khi hoàn thành:

Email sẽ được gửi tự động khi:
- ✅ Ứng viên ứng tuyển → Nhà tuyển dụng nhận email
- ✅ Nhà tuyển dụng accept/reject → Ứng viên nhận email
- ✅ Email gửi đến đúng Gmail đã đăng ký

**Thời gian:** 5 phút
**Độ khó:** Dễ
**Kết quả:** Email notifications hoạt động hoàn hảo! 🎉
