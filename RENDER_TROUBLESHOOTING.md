# Render Deployment Troubleshooting

## 🔴 Lỗi 500 khi đăng nhập Admin

### Bước 1: Bật DEBUG để xem lỗi chi tiết

Vào **Render Dashboard** → Your Service → **Environment**:

```bash
DEBUG=True
```

Sau đó **Manual Deploy** hoặc đợi auto-deploy.

### Bước 2: Kiểm tra Environment Variables

Đảm bảo các biến sau đã được set:

```bash
# Required
DATABASE_URL=postgresql://...  (Render tự tạo)
SECRET_KEY=your-secret-key-here

# Superuser credentials
DJANGO_SUPERUSER_EMAIL=hieu1010@gmail.com
DJANGO_SUPERUSER_PASSWORD=123456789

# Optional but recommended
DEBUG=False  (sau khi fix xong)
ALLOWED_HOSTS=recruitment-api-jrcr.onrender.com
CORS_ALLOWED_ORIGINS=https://jobwebjobboards.vercel.app
```

### Bước 3: Xem Logs chi tiết

Vào **Render Dashboard** → Your Service → **Logs**

Tìm các dòng có:
- `ERROR`
- `Traceback`
- `Exception`

### Bước 4: Test endpoints

#### Test health check:
```
https://recruitment-api-jrcr.onrender.com/health/
```

Nên trả về:
```json
{
  "status": "ok",
  "debug": true,
  "database": "connected"
}
```

#### Test API:
```
https://recruitment-api-jrcr.onrender.com/api/jobs/
```

### Bước 5: Tạo superuser thủ công

Nếu script tự động không hoạt động, có thể dùng Render Shell (cần upgrade) hoặc:

1. Tạo một endpoint tạm thời để tạo superuser
2. Hoặc kết nối database trực tiếp

## 🔧 Các lỗi thường gặp

### 1. "CSRF verification failed"

**Nguyên nhân**: Cookie settings không đúng

**Giải pháp**: Kiểm tra trong `settings.py`:
```python
CSRF_TRUSTED_ORIGINS = [
    'https://recruitment-api-jrcr.onrender.com',
]
SESSION_COOKIE_SECURE = False  # Tạm thời để test
CSRF_COOKIE_SECURE = False     # Tạm thời để test
```

### 2. "relation does not exist"

**Nguyên nhân**: Migrations chưa chạy

**Giải pháp**: Kiểm tra build logs xem migrations có chạy không:
```bash
python manage.py migrate --no-input
```

### 3. "No such table: django_session"

**Nguyên nhân**: Session table chưa được tạo

**Giải pháp**: Chạy migrations:
```bash
python manage.py migrate sessions
```

### 4. Static files không load

**Nguyên nhân**: WhiteNoise chưa được cấu hình đúng

**Giải pháp**: Kiểm tra:
```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Phải ở đây
    ...
]

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
```

## 🐛 Debug với Python Shell (nếu có Shell access)

```python
# Test database connection
from django.db import connection
connection.ensure_connection()
print("Database connected!")

# Check superuser
from django.contrib.auth import get_user_model
User = get_user_model()
users = User.objects.filter(is_superuser=True)
for user in users:
    print(f"Superuser: {user.email}")

# Create superuser manually
User.objects.create_superuser(
    email='hieu1010@gmail.com',
    password='123456789',
    role='admin'
)
```

## 📊 Kiểm tra Database trực tiếp

Vào **Render Dashboard** → PostgreSQL Database → **Info**

Copy **External Database URL** và dùng tool như:
- pgAdmin
- DBeaver
- psql command line

Kết nối và kiểm tra:
```sql
-- Check users table
SELECT id, email, is_superuser, is_staff, role FROM users_user;

-- Check if superuser exists
SELECT * FROM users_user WHERE is_superuser = true;
```

## ✅ Checklist sau khi fix

- [ ] Health check endpoint hoạt động
- [ ] API endpoints trả về data
- [ ] Static files load đúng (CSS/JS trong admin)
- [ ] Có thể đăng nhập admin
- [ ] Database có superuser
- [ ] Logs không có ERROR

## 🆘 Nếu vẫn không được

1. **Set DEBUG=True** tạm thời
2. **Copy toàn bộ error message** từ logs
3. **Kiểm tra database** có superuser chưa
4. **Test từng endpoint** một

## 📞 Quick Commands

```bash
# Check migrations status
python manage.py showmigrations

# Run specific migration
python manage.py migrate users

# Create superuser
python manage.py ensure_superuser

# Collect static
python manage.py collectstatic --no-input

# Check settings
python manage.py diffsettings
```
