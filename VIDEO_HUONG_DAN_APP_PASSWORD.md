# 🎥 Video Script: Cấu hình Gmail App Password

## Thời lượng: 5 phút

---

## [00:00 - 00:30] Giới thiệu

**Màn hình:** Logo JobBoard

**Voice over:**
"Chào bạn! Trong video này, tôi sẽ hướng dẫn bạn cấu hình Gmail App Password để hệ thống JobBoard có thể gửi email thông báo tự động.

Thời gian: chỉ 5 phút.
Độ khó: rất dễ.

Hãy cùng bắt đầu!"

---

## [00:30 - 01:30] Bước 1: Bật 2-Step Verification

**Màn hình:** Browser mở https://myaccount.google.com/security

**Voice over:**
"Bước 1: Bật xác minh 2 bước.

Đầu tiên, mở trình duyệt và vào địa chỉ: myaccount.google.com/security

Đăng nhập với tài khoản Gmail của bạn.

Tìm mục '2-Step Verification' - Xác minh 2 bước.

Nhấn 'Get Started' hoặc 'Turn On'.

Làm theo hướng dẫn: nhập số điện thoại, nhận mã OTP, xác nhận.

Đợi đến khi thấy trạng thái 'ON' màu xanh.

Lưu ý: Bước này BẮT BUỘC phải làm trước khi tạo App Password."

**Action:**
- Click vào 2-Step Verification
- Nhấn Get Started
- Nhập số điện thoại
- Nhập mã OTP
- Xác nhận

---

## [01:30 - 03:00] Bước 2: Tạo App Password

**Màn hình:** Browser mở https://myaccount.google.com/apppasswords

**Voice over:**
"Bước 2: Tạo App Password.

Sau khi bật xác minh 2 bước, vào địa chỉ: myaccount.google.com/apppasswords

Nếu không thấy link này, quay lại trang Security và tìm 'App passwords'.

Tại trang App passwords:
- Select app: chọn 'Mail'
- Select device: chọn 'Other'
- Nhập tên: 'JobBoard Django'
- Nhấn 'Generate'

Google sẽ hiển thị một mật khẩu 16 ký tự.

Ví dụ: a-b-c-d e-f-g-h i-j-k-l m-n-o-p

QUAN TRỌNG: Copy ngay mật khẩu này! Bạn sẽ không thể xem lại sau này.

Tôi sẽ copy và paste vào Notepad để dùng ở bước tiếp theo."

**Action:**
- Click vào App passwords
- Select app: Mail
- Select device: Other
- Nhập tên: JobBoard Django
- Click Generate
- Copy password
- Paste vào Notepad

---

## [03:00 - 04:00] Bước 3: Cập nhật settings.py

**Màn hình:** VS Code mở file BE/recruitment/settings.py

**Voice over:**
"Bước 3: Cập nhật code.

Mở VS Code hoặc editor của bạn.

Mở file: BE/recruitment/settings.py

Tìm dòng EMAIL_HOST_PASSWORD.

Bạn sẽ thấy password cũ, ví dụ: 'Kcntt@10102004'

Xóa password cũ này đi.

Paste App Password 16 ký tự vừa copy.

Có thể giữ hoặc bỏ dấu cách, cả hai đều OK.

Ví dụ: 'abcd efgh ijkl mnop' hoặc 'abcdefghijklmnop'

Lưu file: Ctrl+S hoặc Cmd+S."

**Action:**
- Mở VS Code
- Navigate đến BE/recruitment/settings.py
- Tìm EMAIL_HOST_PASSWORD
- Xóa password cũ
- Paste App Password mới
- Save file

---

## [04:00 - 04:30] Bước 4: Restart Server

**Màn hình:** Terminal

**Voice over:**
"Bước 4: Khởi động lại server.

Mở terminal đang chạy Django server.

Nhấn Ctrl+C để dừng server.

Chạy lại lệnh: python manage.py runserver

Đợi server khởi động xong.

Bước này rất quan trọng! Nếu không restart, settings mới sẽ không có hiệu lực."

**Action:**
- Switch to terminal
- Ctrl+C
- python manage.py runserver
- Đợi server start

---

## [04:30 - 05:00] Bước 5: Test

**Màn hình:** Split screen - Terminal và Gmail

**Voice over:**
"Bước 5: Test thử.

Mở terminal mới, vào thư mục BE.

Chạy: python manage.py shell

Paste đoạn code test này:

from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email',
    'Nếu nhận được email này, cấu hình thành công!',
    settings.DEFAULT_FROM_EMAIL,
    ['your-email@gmail.com'],
)

Nếu thành công, sẽ trả về số 1.

Kiểm tra email - bạn sẽ thấy email test!

Vậy là xong! Giờ hệ thống có thể gửi email tự động rồi."

**Action:**
- Mở terminal mới
- cd BE
- python manage.py shell
- Paste code test
- Enter
- Thấy output: 1
- Switch to Gmail
- Refresh
- Thấy email test

---

## [05:00 - 05:30] Kết thúc

**Màn hình:** Checklist animation

**Voice over:**
"Tóm tắt lại:

✓ Bật 2-Step Verification
✓ Tạo App Password
✓ Cập nhật settings.py
✓ Restart server
✓ Test thành công

Giờ đây:
- Nhà tuyển dụng sẽ nhận email khi có ứng viên ứng tuyển
- Ứng viên sẽ nhận email khi đơn được accept hoặc reject

Nếu có vấn đề, xem file FIX_EMAIL_NOW.md trong project.

Cảm ơn bạn đã xem! Chúc bạn thành công!"

**Màn hình:** 
- Checklist với tick marks
- Logo JobBoard
- Text: "Cảm ơn bạn đã xem!"

---

## Ghi chú cho người quay:

### Chuẩn bị:
- [ ] Tài khoản Gmail test
- [ ] VS Code với project mở sẵn
- [ ] Terminal sẵn sàng
- [ ] Screen recording software
- [ ] Microphone tốt

### Tips:
- Nói chậm, rõ ràng
- Pause giữa các bước
- Zoom in khi cần
- Highlight các phần quan trọng
- Thêm text overlay cho các bước

### Editing:
- Thêm intro/outro
- Thêm background music nhẹ
- Thêm captions
- Speed up các phần chờ đợi
- Thêm annotations/arrows

### Upload:
- Title: "Cấu hình Gmail App Password cho Django | JobBoard Tutorial"
- Description: Link đến FIX_EMAIL_NOW.md
- Tags: Django, Gmail, App Password, Email, Tutorial
- Thumbnail: Attractive với text "5 phút"
