# Hướng dẫn Triển khai Hệ thống Tuyển dụng

## Tổng quan
Hệ thống được triển khai theo quy trình CI/CD thủ công với 3 thành phần chính:
- **Database**: PostgreSQL trên Cloud Service
- **Backend**: Django REST API trên Render
- **Frontend**: React App trên Vercel

---

## 1. Triển khai Cơ sở dữ liệu (PostgreSQL)

### 1.1. Khởi tạo PostgreSQL trên Cloud

**Các nền tảng đề xuất:**
- Neon (https://neon.tech) - Free tier, hỗ trợ vector extension
- Supabase (https://supabase.com) - Free tier, UI quản lý tốt
- Railway (https://railway.app) - Dễ sử dụng
- AWS RDS / Google Cloud SQL - Production grade

**Bước thực hiện:**

1. Đăng ký tài khoản trên nền tảng đã chọn
2. Tạo PostgreSQL database mới
3. Lưu lại thông tin kết nối:
   ```
   Host: your-db-host.cloud.com
   Port: 5432
   Database: recruitment_db
   Username: your_username
   Password: your_password
   ```

### 1.2. Cấu hình Extension Vector

Kết nối vào database và chạy lệnh:

```sql
-- Kích hoạt extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Kiểm tra extension đã được cài đặt
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 1.3. Chạy Migration

Từ thư mục Backend local:

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình DATABASE_URL trong .env
export DATABASE_URL="postgresql://username:password@host:5432/database"

# Chạy migrations
python manage.py makemigrations
python manage.py migrate

# Tạo superuser (admin)
python manage.py createsuperuser

# (Optional) Load dữ liệu mẫu
python manage.py loaddata initial_data.json
```

---

## 2. Triển khai Backend (Django API trên Render)

### 2.1. Chuẩn bị Source Code

Đảm bảo các file sau tồn tại trong thư mục `BE/`:

- `requirements.txt` - Dependencies
- `runtime.txt` - Python version
- `build.sh` - Build script
- `gunicorn_config.py` - Gunicorn configuration

### 2.2. Tạo Project trên Render

1. Truy cập https://render.com và đăng nhập
2. Click **New** → **Web Service**
3. Kết nối với Git repository
4. Cấu hình:
   - **Name**: `recruitment-api`
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Branch**: `main`
   - **Root Directory**: `BE`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn recruitment.wsgi:application`

### 2.3. Cấu hình Environment Variables

Trong Render Dashboard, thêm các biến môi trường:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=recruitment-api.onrender.com,localhost

# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Email Settings (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# AI/ML Settings (Optional)
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_TOKEN=your-hf-token
```

### 2.4. Deploy và Kiểm tra

1. Click **Create Web Service**
2. Đợi quá trình build hoàn tất (5-10 phút)
3. Kiểm tra logs để đảm bảo không có lỗi
4. Test API endpoints:
   ```bash
   curl https://recruitment-api.onrender.com/api/jobs/
   ```

### 2.5. Cấu hình CORS

Trong `BE/recruitment/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 3. Triển khai Frontend (React trên Vercel)

### 3.1. Chuẩn bị Source Code

Cập nhật API URL trong `FE/.env.production`:

```env
VITE_API_URL=https://recruitment-api.onrender.com
```

### 3.2. Build Local để Test

```bash
cd FE
npm install
npm run build

# Test build locally
npm run preview
```

### 3.3. Deploy lên Vercel

**Cách 1: Qua Vercel CLI**

```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd FE
vercel --prod
```

**Cách 2: Qua Vercel Dashboard**

1. Truy cập https://vercel.com và đăng nhập
2. Click **Add New** → **Project**
3. Import Git repository
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `FE`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.4. Cấu hình Environment Variables trên Vercel

Trong Vercel Project Settings → Environment Variables:

```env
VITE_API_URL=https://recruitment-api.onrender.com
```

### 3.5. Cấu hình Custom Domain (Optional)

1. Trong Vercel Project Settings → Domains
2. Thêm domain của bạn (ví dụ: recruitment.yourdomain.com)
3. Cấu hình DNS records theo hướng dẫn

### 3.6. Tối ưu hóa Performance

Vercel tự động cung cấp:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image Optimization
- ✅ Edge Caching
- ✅ Gzip/Brotli Compression

---

## 4. Kiểm tra và Xác thực

### 4.1. Checklist Kiểm tra Backend

- [ ] API endpoints hoạt động: `/api/jobs/`, `/api/users/profile/`
- [ ] Database connection thành công
- [ ] Static files được serve đúng
- [ ] Media files upload lên Cloudinary
- [ ] CORS cho phép Frontend domain
- [ ] JWT authentication hoạt động
- [ ] Admin panel truy cập được: `/admin/`

### 4.2. Checklist Kiểm tra Frontend

- [ ] Trang chủ load thành công
- [ ] API calls đến Backend thành công
- [ ] Authentication (Login/Register) hoạt động
- [ ] Upload file/image hoạt động
- [ ] Responsive trên mobile
- [ ] SEO meta tags đầy đủ
- [ ] Performance score > 90 (Lighthouse)

### 4.3. Test End-to-End

1. **Đăng ký tài khoản mới**
   - Candidate account
   - Employer account

2. **Đăng công việc** (Employer)
   - Tạo job posting
   - Upload company logo
   - Publish job

3. **Ứng tuyển** (Candidate)
   - Browse jobs
   - Upload CV
   - Submit application

4. **Messaging**
   - Gửi tin nhắn giữa employer và candidate
   - Upload file đính kèm

5. **Review & Rating**
   - Candidate review employer
   - Check rating display

---

## 5. Monitoring và Maintenance

### 5.1. Monitoring Tools

**Backend (Render):**
- Render Dashboard → Logs
- Render Dashboard → Metrics (CPU, Memory)
- Setup alerts cho downtime

**Frontend (Vercel):**
- Vercel Analytics
- Vercel Speed Insights
- Real User Monitoring (RUM)

### 5.2. Backup Strategy

**Database:**
```bash
# Backup thủ công
pg_dump -h host -U username -d database > backup_$(date +%Y%m%d).sql

# Restore
psql -h host -U username -d database < backup_20240101.sql
```

**Automated Backups:**
- Neon: Automatic daily backups
- Supabase: Point-in-time recovery
- AWS RDS: Automated snapshots

### 5.3. Update và Rollback

**Backend Update:**
```bash
# Push code mới
git push origin main

# Render tự động deploy
# Nếu có lỗi, rollback trong Render Dashboard
```

**Frontend Update:**
```bash
# Push code mới
git push origin main

# Vercel tự động deploy
# Rollback: Vercel Dashboard → Deployments → Promote previous
```

---

## 6. Troubleshooting

### Lỗi thường gặp

**Backend không kết nối được Database:**
```bash
# Kiểm tra DATABASE_URL
echo $DATABASE_URL

# Test connection
python manage.py dbshell
```

**CORS Error:**
```python
# Thêm domain vào CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = [
    "https://your-new-domain.vercel.app",
]
```

**Static files không load:**
```bash
# Chạy collectstatic
python manage.py collectstatic --noinput
```

**Frontend không gọi được API:**
```javascript
// Kiểm tra VITE_API_URL
console.log(import.meta.env.VITE_API_URL)
```

---

## 7. Security Checklist

- [ ] SECRET_KEY được generate ngẫu nhiên và bảo mật
- [ ] DEBUG=False trong production
- [ ] Database credentials không commit vào Git
- [ ] HTTPS được bật cho cả Frontend và Backend
- [ ] CORS chỉ cho phép domain cụ thể
- [ ] Rate limiting được cấu hình
- [ ] SQL injection protection (Django ORM)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection enabled
- [ ] Secure cookies (HttpOnly, Secure, SameSite)

---

## 8. Performance Optimization

### Backend
- [ ] Database indexing cho các trường thường query
- [ ] Query optimization (select_related, prefetch_related)
- [ ] Redis caching cho API responses
- [ ] Pagination cho list endpoints
- [ ] Compression middleware enabled

### Frontend
- [ ] Code splitting (React.lazy)
- [ ] Image optimization (WebP format)
- [ ] Lazy loading images
- [ ] Bundle size < 500KB
- [ ] Tree shaking unused code

---

## 9. Cost Estimation

### Free Tier (Development/Testing)
- **Database**: Neon Free - 0.5GB storage
- **Backend**: Render Free - 750 hours/month
- **Frontend**: Vercel Free - Unlimited bandwidth
- **Total**: $0/month

### Production Tier
- **Database**: Neon Pro - $19/month (10GB)
- **Backend**: Render Starter - $7/month (512MB RAM)
- **Frontend**: Vercel Pro - $20/month (team features)
- **Cloudinary**: Free tier - 25GB storage
- **Total**: ~$46/month

---

## 10. Support và Tài liệu

### Documentation
- Django: https://docs.djangoproject.com/
- React: https://react.dev/
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

### Community
- Django Forum: https://forum.djangoproject.com/
- React Discord: https://discord.gg/react
- Stack Overflow: Tag với `django`, `reactjs`

---

## Kết luận

Quy trình triển khai này đảm bảo:
- ✅ Tách biệt môi trường Dev/Staging/Production
- ✅ Tự động hóa build và deploy
- ✅ Bảo mật thông tin nhạy cảm
- ✅ Khả năng mở rộng và bảo trì
- ✅ Chi phí tối ưu cho startup

**Thời gian triển khai ước tính:** 2-4 giờ cho lần đầu tiên.
