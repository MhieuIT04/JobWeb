# 🚂 Hướng dẫn Triển khai với Railway

Railway là nền tảng deployment đơn giản, hỗ trợ tốt cho cả Backend và Database với giá cả hợp lý.

---

## 📋 Tổng quan

### Ưu điểm của Railway
- ✅ Setup đơn giản, không cần config phức tạp
- ✅ Tích hợp PostgreSQL sẵn (có pgvector)
- ✅ Auto-deploy từ GitHub
- ✅ Free tier: $5 credit/tháng
- ✅ Logs và monitoring tốt
- ✅ Hỗ trợ environment variables dễ dàng
- ✅ Custom domains miễn phí

### Chi phí
- **Free Tier**: $5 credit/tháng (~500 hours)
- **Hobby Plan**: $5/month (500 hours execution)
- **Pro Plan**: $20/month (unlimited)

---

## 🗄️ Bước 1: Setup Database trên Railway

### 1.1. Tạo PostgreSQL Database

1. Truy cập https://railway.app và đăng nhập
2. Click **New Project**
3. Chọn **Provision PostgreSQL**
4. Database sẽ được tạo tự động

### 1.2. Cấu hình Database

1. Click vào PostgreSQL service
2. Vào tab **Variables** để xem connection string
3. Copy các thông tin:
   ```
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway
   PGHOST=containers-us-west-xxx.railway.app
   PGPORT=7432
   PGUSER=postgres
   PGPASSWORD=your-password
   PGDATABASE=railway
   ```

### 1.3. Enable pgvector Extension

1. Click vào PostgreSQL service
2. Vào tab **Data**
3. Click **Query** và chạy:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Verify:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

---

## 🔧 Bước 2: Deploy Backend lên Railway

### 2.1. Chuẩn bị Source Code

Đảm bảo có các file sau trong thư mục `BE/`:

**railway.json** (đã tạo sẵn)
**Procfile** (đã tạo sẵn)
**runtime.txt** (đã tạo sẵn)
**requirements.txt**

### 2.2. Tạo Backend Service

1. Trong cùng project, click **New Service**
2. Chọn **GitHub Repo**
3. Authorize và chọn repository của bạn
4. Railway sẽ tự động detect Django app

### 2.3. Cấu hình Service

1. Click vào Backend service
2. Vào **Settings**:
   - **Root Directory**: `BE`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn recruitment.wsgi:application --bind 0.0.0.0:$PORT`

### 2.4. Cấu hình Environment Variables

Vào tab **Variables** và thêm:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=.railway.app,localhost

# Database (Railway tự động inject DATABASE_URL)
# DATABASE_URL sẽ được Railway tự động thêm khi link với PostgreSQL

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# AI Services (Optional)
OPENAI_API_KEY=sk-proj-xxxxx
HUGGINGFACE_TOKEN=hf_xxxxx

# Railway specific
PORT=8000
PYTHONUNBUFFERED=1
```

### 2.5. Link Database với Backend

1. Click vào Backend service
2. Vào tab **Variables**
3. Click **+ New Variable** → **Add Reference**
4. Chọn PostgreSQL service → `DATABASE_URL`
5. Railway sẽ tự động inject connection string

### 2.6. Deploy

1. Click **Deploy** hoặc push code lên GitHub
2. Railway sẽ tự động build và deploy
3. Xem logs trong tab **Deployments**

### 2.7. Chạy Migrations

Sau khi deploy thành công:

1. Vào tab **Settings** → **Networking**
2. Click **Generate Domain** để có public URL
3. Mở terminal local và chạy:
   ```bash
   # Set DATABASE_URL từ Railway
   export DATABASE_URL="postgresql://postgres:password@..."
   
   cd BE
   python manage.py migrate
   python manage.py createsuperuser
   ```

Hoặc sử dụng Railway CLI:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

---

## 🎨 Bước 3: Deploy Frontend lên Vercel

### 3.1. Cấu hình API URL

Cập nhật `FE/.env.production`:

```env
VITE_API_URL=https://your-backend.railway.app
```

### 3.2. Deploy lên Vercel

1. Truy cập https://vercel.com
2. Import repository
3. Cấu hình:
   - **Framework**: Vite
   - **Root Directory**: `FE`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Thêm Environment Variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

5. Click **Deploy**

### 3.3. Cập nhật CORS

Sau khi có Vercel URL, cập nhật CORS trong Railway:

1. Vào Backend service → **Variables**
2. Cập nhật `CORS_ALLOWED_ORIGINS`:
   ```
   https://your-frontend.vercel.app,http://localhost:3000
   ```

---

## 🔗 Bước 4: Kết nối Services

### 4.1. Custom Domain (Optional)

**Backend (Railway):**
1. Vào Backend service → **Settings** → **Networking**
2. Click **Custom Domain**
3. Thêm domain: `api.yourdomain.com`
4. Cấu hình DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-backend.railway.app
   ```

**Frontend (Vercel):**
1. Vào Project Settings → **Domains**
2. Thêm domain: `yourdomain.com`
3. Cấu hình DNS theo hướng dẫn

### 4.2. SSL/HTTPS

Railway và Vercel tự động cung cấp SSL certificate miễn phí.

---

## 📊 Bước 5: Monitoring và Logs

### 5.1. Railway Monitoring

1. **Metrics**: Vào service → **Metrics**
   - CPU usage
   - Memory usage
   - Network traffic

2. **Logs**: Vào service → **Deployments** → Click deployment
   - Real-time logs
   - Filter by level (info, error, warning)

3. **Alerts**: Setup trong **Settings** → **Alerts**

### 5.2. Vercel Analytics

1. Vào Project → **Analytics**
2. Enable Vercel Analytics
3. Xem:
   - Page views
   - Performance metrics
   - User demographics

---

## 🔄 Bước 6: CI/CD Setup

### 6.1. Auto-deploy từ GitHub

Railway tự động deploy khi:
- Push lên branch `main`
- Merge Pull Request

Cấu hình:
1. Vào service → **Settings** → **Source**
2. Chọn branch: `main`
3. Enable **Auto Deploy**

### 6.2. Deploy Hooks (Optional)

Tạo webhook để trigger deploy:

1. Vào **Settings** → **Webhooks**
2. Copy webhook URL
3. Sử dụng trong CI/CD pipeline:
   ```bash
   curl -X POST https://railway.app/api/webhooks/...
   ```

---

## 💾 Bước 7: Backup Strategy

### 7.1. Database Backup

**Automatic Backups (Railway Pro):**
- Railway Pro có automatic daily backups
- Retention: 7 days

**Manual Backup:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login và link project
railway login
railway link

# Backup database
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Hoặc sử dụng script có sẵn
./scripts/backup-db.sh
```

### 7.2. Scheduled Backups

Sử dụng GitHub Actions:

**.github/workflows/backup.yml**
```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      
      - name: Backup Database
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway run pg_dump $DATABASE_URL > backup.sql
      
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1
      
      - name: Copy to S3
        run: aws s3 cp backup.sql s3://your-bucket/backups/backup_$(date +%Y%m%d).sql
```

---

## 🚀 Bước 8: Performance Optimization

### 8.1. Railway Optimization

1. **Vertical Scaling**:
   - Vào **Settings** → **Resources**
   - Tăng RAM/CPU nếu cần

2. **Horizontal Scaling**:
   - Railway hỗ trợ replicas (Pro plan)
   - Vào **Settings** → **Replicas**

3. **Caching**:
   - Thêm Redis service:
     ```bash
     railway add redis
     ```
   - Cấu hình trong Django settings

### 8.2. Database Optimization

1. **Connection Pooling**:
   ```python
   # settings.py
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'CONN_MAX_AGE': 600,
           'OPTIONS': {
               'connect_timeout': 10,
           }
       }
   }
   ```

2. **Indexes**:
   ```python
   # models.py
   class Job(models.Model):
       title = models.CharField(max_length=200, db_index=True)
       created_at = models.DateTimeField(auto_now_add=True, db_index=True)
   ```

---

## 🔍 Troubleshooting

### Lỗi thường gặp

**1. Build Failed**
```bash
# Kiểm tra logs
railway logs

# Thử build local
cd BE
pip install -r requirements.txt
python manage.py collectstatic
```

**2. Database Connection Error**
```bash
# Verify DATABASE_URL
railway variables

# Test connection
railway run python manage.py dbshell
```

**3. Static Files không load**
```bash
# Kiểm tra STATIC_ROOT
railway run python manage.py collectstatic --noinput

# Verify Cloudinary config
railway variables | grep CLOUDINARY
```

**4. CORS Error**
```bash
# Kiểm tra CORS_ALLOWED_ORIGINS
railway variables | grep CORS

# Update nếu cần
railway variables set CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

## 📝 Checklist Triển khai Railway

### Database
- [ ] PostgreSQL service đã được tạo
- [ ] pgvector extension đã được enable
- [ ] Connection string đã được test
- [ ] Backup strategy đã được setup

### Backend
- [ ] Service đã được tạo và link với GitHub
- [ ] Root directory = `BE`
- [ ] Environment variables đã được cấu hình
- [ ] DATABASE_URL đã được link
- [ ] Build thành công
- [ ] Migrations đã được chạy
- [ ] Superuser đã được tạo
- [ ] API endpoints hoạt động
- [ ] Static files load đúng

### Frontend
- [ ] Deploy lên Vercel thành công
- [ ] VITE_API_URL đã được cấu hình
- [ ] CORS đã được cấu hình đúng
- [ ] Trang web load thành công
- [ ] API calls hoạt động

### Monitoring
- [ ] Logs được kiểm tra
- [ ] Metrics được theo dõi
- [ ] Alerts được setup
- [ ] Backup schedule được cấu hình

---

## 💰 Cost Estimation

### Free Tier (Development)
- **Database**: $5 credit/month
- **Backend**: $5 credit/month
- **Frontend**: Vercel Free
- **Total**: ~$0/month (trong credit)

### Production (Hobby)
- **Database**: $5/month
- **Backend**: $5/month
- **Frontend**: Vercel Free
- **Cloudinary**: Free tier
- **Total**: $10/month

### Production (Pro)
- **Database**: $10/month
- **Backend**: $20/month
- **Frontend**: Vercel Pro $20/month
- **Total**: $50/month

---

## 🆚 So sánh Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| Setup | ⭐⭐⭐⭐⭐ Rất dễ | ⭐⭐⭐⭐ Dễ |
| Free Tier | $5 credit | 750 hours |
| Database | Tích hợp sẵn | Riêng biệt |
| Logs | Excellent | Good |
| CLI | Excellent | Good |
| Custom Domain | Free | Free |
| Auto-deploy | ✅ | ✅ |
| Pricing | $5-20/month | $7-25/month |

**Khuyến nghị**: Railway phù hợp hơn cho dự án nhỏ/vừa vì setup đơn giản và giá rẻ hơn.

---

## 📚 Tài liệu tham khảo

- Railway Docs: https://docs.railway.app/
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Templates: https://railway.app/templates
- Community: https://discord.gg/railway

---

## 🆘 Support

**Railway Support:**
- Discord: https://discord.gg/railway
- Email: team@railway.app
- Docs: https://docs.railway.app/

**Project Support:**
- GitHub Issues
- Email: support@recruitment.com
