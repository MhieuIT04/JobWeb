# Hướng dẫn sửa lỗi giao diện Django Admin

## Vấn đề
Giao diện Django Admin không hiển thị CSS/styling đúng cách, chỉ hiển thị text thuần.

## Nguyên nhân
- Static files (CSS, JavaScript) của Django Admin không được serve đúng cách
- Chưa chạy lệnh `collectstatic` để thu thập static files
- Cấu hình static files trong settings.py chưa đầy đủ

## Giải pháp đã áp dụng

### 0. Sửa DEBUG mode
**Vấn đề chính:** DEBUG mặc định là False, nên Django không serve static files trong development.

**Giải pháp:**
```python
# Thay đổi từ:
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Thành:
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
```

Bây giờ DEBUG mặc định là True cho development, chỉ set `DEBUG=False` trong production.

### 1. Cập nhật settings.py
Đã thêm cấu hình đầy đủ cho static files:

```python
# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Additional locations of static files
STATICFILES_DIRS = [
    # Add any additional static file directories here if needed
]

# Static files finders
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]
```

### 2. Cập nhật urls.py
Đã thêm route để serve static files trong development:

```python
# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 3. Chạy collectstatic
Đã chạy lệnh để thu thập tất cả static files:

```bash
python manage.py collectstatic --noinput
```

Kết quả: 173 static files đã được copy vào thư mục `staticfiles/`

## Kiểm tra

1. **QUAN TRỌNG:** Khởi động lại Django development server:
```bash
cd BE
# Dừng server hiện tại (Ctrl+C)
python manage.py runserver
```

2. Truy cập Django Admin:
```
http://127.0.0.1:8000/admin/
```

3. Xác nhận:
   - CSS được load đúng (kiểm tra Network tab trong DevTools)
   - Giao diện hiển thị đẹp với màu xanh dương Django
   - Các nút, form, table hiển thị đúng
   - Không còn lỗi MIME type trong Console

## Lưu ý cho Production

Khi deploy lên production:

1. **Sử dụng web server riêng cho static files:**
   - Nginx hoặc Apache để serve static files
   - Không nên dùng Django để serve static files

2. **Cấu hình Nginx (ví dụ):**
```nginx
location /static/ {
    alias /path/to/your/staticfiles/;
}

location /media/ {
    alias /path/to/your/media/;
}
```

3. **Chạy collectstatic trước khi deploy:**
```bash
python manage.py collectstatic --noinput
```

4. **Cập nhật STATIC_ROOT trong settings:**
```python
STATIC_ROOT = '/var/www/your-project/staticfiles/'
```

## Troubleshooting

### Nếu vẫn không hiển thị CSS:

1. **Kiểm tra DEBUG mode:**
```python
DEBUG = True  # Trong development
```

2. **Kiểm tra ALLOWED_HOSTS:**
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
```

3. **Xóa cache browser:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

4. **Kiểm tra console browser:**
   - F12 > Console tab
   - Xem có lỗi 404 cho static files không

5. **Kiểm tra thư mục staticfiles:**
```bash
ls -la BE/staticfiles/admin/
```
Phải có các thư mục: css/, js/, img/

6. **Chạy lại collectstatic:**
```bash
python manage.py collectstatic --clear --noinput
```

## Files đã thay đổi

- `BE/recruitment/settings.py` - Sửa DEBUG default, thêm STATICFILES_FINDERS
- `BE/recruitment/urls.py` - Thêm route serve static files
- `BE/staticfiles/` - Thư mục chứa static files (đã tạo)
- `BE/.env.example` - File mẫu cho environment variables

## Tham khảo

- [Django Static Files Documentation](https://docs.djangoproject.com/en/5.2/howto/static-files/)
- [Django Admin Static Files](https://docs.djangoproject.com/en/5.2/howto/static-files/deployment/)
