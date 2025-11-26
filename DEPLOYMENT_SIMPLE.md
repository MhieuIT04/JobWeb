# 🚀 Hướng dẫn Deploy Đơn giản (Chỉ Backend + Frontend)

Hướng dẫn này giúp bạn deploy nhanh chỉ Backend và Frontend, không cần setup database riêng.

---

## 📋 Tổng quan

**Stack đơn giản:**
- **Backend**: Render (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: SQLite (local) hoặc Neon Free
- **Media**: Cloudinary Free

**Thời gian**: 15-30 phút
**Chi phí**: $0 (hoàn toàn miễn phí)

---

## 🔧 Bước 1: Chuẩn bị Backend

### 1.1. Sửa file build.sh

File `BE/build.sh` đã được đơn giản hóa. Chỉ cần commit:

```bash
git add BE/build.sh
git commit -m "Simplify build script"
git push
```

### 1.2. Tạo file start.sh (nếu chưa có)

Tạo file `BE/start.sh`:

```bash
#!/usr/bin/env bash
python manage.py migrate --no-input
gunicorn recruitment.wsgi:application
```

Cấp quyền thực thi:

```bash
chmod +x BE/build.sh BE/start.sh
git add BE/build.sh BE/start.sh
git commit -m "Add executable permissions"
git push
```

### 1.3. Cấu hình settings.py cho production

Đảm bảo `BE/recruitment/settings.py` có:

```python
import os
from pathlib import Path

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-this')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database - SQLite for simple deployment
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Or use DATABASE_URL if provided
import dj_database_url
if 'DATABASE_URL' in os.environ:
    DATABASES['default'] = dj_database_url.parse(os.environ['DATABASE_URL'])

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173'
).split(',')
```

---

## 🎨 Bước 2: Deploy Backend lên Render

### 2.1. Tạo tài khoản Render

1. Truy cập https://render.com
2. Sign up với GitHub
3. Authorize Render

### 2.2. Tạo Web Service

1. Click **New** → **Web Service**
2. Connect repository của bạn
3. Cấu hình:

```
Name: recruitment-backend
Region: Singapore
Branch: main
Root Directory: BE
Runtime: Python 3
Build Command: pip install -r requirements.txt && python manage.py collectstatic --no-input
Start Command: python manage.py migrate --no-input && gunicorn recruitment.wsgi:application
```

### 2.3. Cấu hình Environment Variables

Thêm các biến sau (tối thiểu):

```env
SECRET_KEY=your-random-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.onrender.com
PYTHON_VERSION=3.10.0
```

**Tạo SECRET_KEY ngẫu nhiên:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.4. Deploy

1. Click **Create Web Service**
2. Đợi 5-10 phút để build
3. Kiểm tra logs nếu có lỗi

### 2.5. Test Backend

Sau khi deploy thành công, test API:

```bash
# Thay YOUR-APP-NAME bằng tên app của bạn
curl https://YOUR-APP-NAME.onrender.com/api/jobs/
```

---

## 🌐 Bước 3: Deploy Frontend lên Vercel

### 3.1. Chuẩn bị Frontend

Cập nhật `FE/.env.production`:

```env
VITE_API_URL=https://YOUR-APP-NAME.onrender.com
```

Commit:
```bash
git add FE/.env.production
git commit -m "Update API URL for production"
git push
```

### 3.2. Deploy lên Vercel

**Cách 1: Qua Dashboard**

1. Truy cập https://vercel.com
2. Sign up với GitHub
3. Click **Add New** → **Project**
4. Import repository
5. Cấu hình:

```
Framework Preset: Vite
Root Directory: FE
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. Thêm Environment Variable:
```
VITE_API_URL=https://YOUR-APP-NAME.onrender.com
```

7. Click **Deploy**

**Cách 2: Qua CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd FE
vercel --prod
```

### 3.3. Test Frontend

Sau khi deploy, truy cập URL Vercel và test:
- Trang chủ load được
- API calls hoạt động
- Login/Register hoạt động

---

## 🔗 Bước 4: Kết nối Backend và Frontend

### 4.1. Cập nhật CORS

Trong Render Dashboard:

1. Vào Backend service → **Environment**
2. Thêm/cập nhật:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```
3. Click **Save Changes**
4. Service sẽ tự động redeploy

### 4.2. Test Integration

1. Mở frontend URL
2. Thử đăng ký tài khoản mới
3. Thử đăng nhập
4. Thử browse jobs
5. Check browser console không có CORS errors

---

## 🐛 Troubleshooting

### Lỗi: "build.sh: No such file or directory"

**Giải pháp 1**: Không dùng build.sh

Trong Render, thay đổi Build Command thành:
```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input
```

**Giải pháp 2**: Cấp quyền thực thi

```bash
git update-index --chmod=+x BE/build.sh
git commit -m "Make build.sh executable"
git push
```

### Lỗi: "ModuleNotFoundError"

Đảm bảo `requirements.txt` có đầy đủ dependencies:

```txt
Django>=4.2.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
gunicorn>=21.2.0
dj-database-url>=2.0.0
psycopg2-binary>=2.9.0
Pillow>=10.0.0
```

### Lỗi: "CORS policy"

Cập nhật CORS_ALLOWED_ORIGINS trong Render Environment Variables:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Lỗi: "Static files not found"

Đảm bảo trong settings.py:
```python
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
```

### Render Free Tier "spins down"

Render free tier sẽ sleep sau 15 phút không dùng. Giải pháp:

1. **Upgrade lên Paid plan** ($7/tháng)
2. **Dùng UptimeRobot** để ping mỗi 14 phút
3. **Chấp nhận cold start** (30s-1 phút)

---

## 📊 Monitoring

### Render Logs

1. Vào service → **Logs**
2. Xem real-time logs
3. Filter by level (info, error)

### Vercel Analytics

1. Vào project → **Analytics**
2. Xem page views, performance

---

## 🔄 Update và Redeploy

### Update Backend

```bash
# Make changes
git add .
git commit -m "Update backend"
git push

# Render tự động redeploy
```

### Update Frontend

```bash
# Make changes
git add .
git commit -m "Update frontend"
git push

# Vercel tự động redeploy
```

---

## 💾 Backup (SQLite)

Nếu dùng SQLite, backup database:

```bash
# Download từ Render
render ssh recruitment-backend
sqlite3 db.sqlite3 .dump > backup.sql
exit

# Hoặc dùng Render Disk
# Render free tier không có persistent disk
# Khuyến nghị: Dùng PostgreSQL cho production
```

---

## 🚀 Nâng cấp lên PostgreSQL (Optional)

Nếu muốn dùng database thật:

### Option 1: Neon (Khuyến nghị)

1. Tạo database tại https://neon.tech (Free)
2. Copy connection string
3. Thêm vào Render Environment:
```
DATABASE_URL=postgresql://user:pass@host/db
```
4. Redeploy

### Option 2: Render PostgreSQL

1. Trong Render Dashboard → **New** → **PostgreSQL**
2. Tạo database
3. Link với Web Service
4. DATABASE_URL tự động được inject

---

## ✅ Checklist Deploy

### Backend (Render)
- [ ] Repository connected
- [ ] Build command đúng
- [ ] Start command đúng
- [ ] Environment variables đã set
- [ ] Deploy thành công
- [ ] API endpoints hoạt động
- [ ] Logs không có errors

### Frontend (Vercel)
- [ ] Repository connected
- [ ] VITE_API_URL đã set
- [ ] Build thành công
- [ ] Trang web load được
- [ ] API calls hoạt động
- [ ] Không có CORS errors

### Integration
- [ ] Frontend gọi được Backend
- [ ] Login/Register hoạt động
- [ ] CRUD operations hoạt động
- [ ] File upload hoạt động (nếu có)

---

## 💰 Chi phí

**Free Tier (Đủ cho MVP):**
- Render Backend: Free (750 hours)
- Vercel Frontend: Free (unlimited)
- Neon Database: Free (0.5GB)
- **Total: $0/tháng**

**Paid (Production):**
- Render Backend: $7/tháng
- Vercel Frontend: Free
- Neon Database: $19/tháng
- **Total: $26/tháng**

---

## 🎯 Next Steps

Sau khi deploy thành công:

1. **Setup Custom Domain** (optional)
   - Render: Settings → Custom Domain
   - Vercel: Settings → Domains

2. **Enable HTTPS** (tự động)
   - Render và Vercel tự động cung cấp SSL

3. **Setup Monitoring**
   - UptimeRobot cho uptime monitoring
   - Sentry cho error tracking

4. **Optimize Performance**
   - Enable caching
   - Optimize images
   - Minify assets

---

## 📚 Tài liệu tham khảo

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/

---

## 🆘 Cần giúp đỡ?

Nếu gặp vấn đề:
1. Check logs trong Render/Vercel dashboard
2. Xem phần Troubleshooting ở trên
3. Google error message
4. Hỏi trên Discord/Stack Overflow
