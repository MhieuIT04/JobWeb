# Hướng dẫn Deploy JobBoard lên Render

## 🚀 Backend (Django) - Đã Deploy

### 1. Cấu hình Environment Variables trên Render

Vào Render Dashboard → Backend Service → Environment, thêm các biến:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here-change-this
ALLOWED_HOSTS=recruitment-api-jrcr.onrender.com

# Database (Render tự động tạo DATABASE_URL)
# DATABASE_URL=postgresql://... (đã có sẵn)

# CORS - Frontend URL
CORS_ALLOWED_ORIGINS=https://jobwebjobboards.vercel.app

# Email Settings (Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here

# Cloudinary (nếu dùng)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Thêm Environment Variables cho Superuser

Vào Render Dashboard → Backend Service → Environment, thêm:

```bash
# Superuser credentials (sẽ tự động tạo khi deploy)
DJANGO_SUPERUSER_EMAIL=admin@jobboard.com
DJANGO_SUPERUSER_PASSWORD=YourStrongPassword123!
```

**Lưu ý**: Build script sẽ tự động:
- Chạy migrations
- Collect static files
- Tạo superuser
- Seed dữ liệu mẫu (categories, cities, work types)

### 3. Kiểm tra Backend

Truy cập: `https://recruitment-api-jrcr.onrender.com/admin/`
- Đăng nhập bằng superuser vừa tạo
- Kiểm tra static files có load không

## 🎨 Frontend (React) - Deploy lên Vercel

### 1. Cấu hình Environment Variables trên Vercel

Vào Vercel Dashboard → Project → Settings → Environment Variables:

```bash
REACT_APP_API_URL=https://recruitment-api-jrcr.onrender.com
DISABLE_ESLINT_PLUGIN=true
CI=false
```

### 2. Deploy Frontend

```bash
cd FE
npm install
npm run build

# Deploy lên Vercel
vercel --prod
```

### 3. Cập nhật CORS trên Backend

Sau khi có URL Vercel, cập nhật lại `CORS_ALLOWED_ORIGINS` trên Render:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

## ✅ Checklist sau khi Deploy

- [ ] Backend API hoạt động: `https://recruitment-api-jrcr.onrender.com/api/jobs/`
- [ ] Django Admin load CSS/JS đúng
- [ ] Frontend kết nối được Backend
- [ ] Đăng nhập/Đăng ký hoạt động
- [ ] Upload file (CV, avatar) hoạt động
- [ ] Email notification gửi được
- [ ] CORS không bị lỗi

## 🐛 Troubleshooting

### Lỗi Static Files không load
```bash
# Chạy lại collectstatic
python manage.py collectstatic --no-input --clear
```

### Lỗi CORS
- Kiểm tra `CORS_ALLOWED_ORIGINS` có đúng URL frontend không
- Đảm bảo không có khoảng trắng thừa
- URL phải có `https://` prefix

### Lỗi Database
```bash
# Kiểm tra migrations
python manage.py showmigrations

# Chạy lại migrations
python manage.py migrate
```

### Lỗi 500 Internal Server Error
- Kiểm tra logs trên Render Dashboard
- Set `DEBUG=True` tạm thời để xem chi tiết lỗi
- Nhớ set lại `DEBUG=False` sau khi fix

## 📝 Tạo dữ liệu mẫu

```bash
# Vào Render Shell
python manage.py shell

# Tạo categories, cities, work_types
from jobs.models import Category, WorkType
from users.models import City

# Tạo categories
categories = ['IT - Phần mềm', 'Marketing', 'Kinh doanh', 'Kế toán', 'Nhân sự']
for name in categories:
    Category.objects.get_or_create(name=name)

# Tạo cities
cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng']
for name in cities:
    City.objects.get_or_create(name=name)

# Tạo work types
work_types = ['Full-time', 'Part-time', 'Remote', 'Freelance']
for name in work_types:
    WorkType.objects.get_or_create(name=name)
```

## 🔐 Bảo mật

1. **Không commit** các file:
   - `.env`
   - `.env.local`
   - `db.sqlite3`

2. **Thay đổi SECRET_KEY** trên production

3. **Sử dụng HTTPS** cho cả frontend và backend

4. **Set DEBUG=False** trên production

5. **Giới hạn ALLOWED_HOSTS** chỉ domain thực tế

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Render logs: Dashboard → Service → Logs
2. Browser console (F12)
3. Network tab để xem API requests
