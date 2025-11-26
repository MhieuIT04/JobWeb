# 📋 Deployment Checklist

## Pre-Deployment

### 🔍 Code Review
- [ ] Code đã được review và approved
- [ ] Tất cả tests đều pass
- [ ] Không có console.log() hoặc debug code
- [ ] Không có TODO/FIXME quan trọng
- [ ] Code đã được format (Prettier/Black)
- [ ] Không có secrets/credentials trong code

### 📦 Dependencies
- [ ] `requirements.txt` (Backend) đã được update
- [ ] `package.json` (Frontend) đã được update
- [ ] Không có unused dependencies
- [ ] Tất cả dependencies đều có version cụ thể

### 🔐 Security
- [ ] `.env` files không được commit vào Git
- [ ] `.gitignore` đã được cấu hình đúng
- [ ] SECRET_KEY được generate ngẫu nhiên
- [ ] DEBUG=False trong production
- [ ] ALLOWED_HOSTS được cấu hình đúng
- [ ] CORS_ALLOWED_ORIGINS chỉ chứa domains cần thiết
- [ ] Passwords đã được hash
- [ ] API keys được lưu trong environment variables

---

## Database Setup

### 🗄️ PostgreSQL
- [ ] Database đã được tạo trên cloud service
- [ ] Extension `vector` đã được enable
- [ ] Connection string đã được test
- [ ] Backup strategy đã được setup
- [ ] Database user có đủ permissions

### 🔄 Migrations
- [ ] Tất cả migrations đã được tạo
- [ ] Migrations đã được test trên local
- [ ] Không có conflicts trong migrations
- [ ] Data migrations (nếu có) đã được test
- [ ] Rollback plan đã được chuẩn bị

### 📊 Initial Data
- [ ] Superuser account đã được tạo
- [ ] Initial data (cities, skills, categories) đã được load
- [ ] Test data đã được xóa (nếu có)

---

## Backend Deployment (Render)

### ⚙️ Configuration
- [ ] `build.sh` có execute permission (`chmod +x build.sh`)
- [ ] `runtime.txt` chỉ định Python version đúng
- [ ] `gunicorn_config.py` đã được cấu hình
- [ ] `render.yaml` đã được review

### 🌍 Environment Variables
- [ ] SECRET_KEY
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS
- [ ] DATABASE_URL
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] CORS_ALLOWED_ORIGINS
- [ ] JWT_SECRET_KEY
- [ ] EMAIL_HOST_USER (nếu dùng email)
- [ ] EMAIL_HOST_PASSWORD (nếu dùng email)
- [ ] OPENAI_API_KEY (nếu dùng AI)

### 🚀 Deployment
- [ ] Repository đã được connect với Render
- [ ] Build command: `./build.sh`
- [ ] Start command: `gunicorn recruitment.wsgi:application`
- [ ] Region: Singapore (gần Việt Nam nhất)
- [ ] Health check endpoint: `/api/health/`
- [ ] Auto-deploy đã được enable

### ✅ Verification
- [ ] Build thành công không có errors
- [ ] Logs không có warnings nghiêm trọng
- [ ] API endpoints hoạt động: `/api/jobs/`
- [ ] Admin panel truy cập được: `/admin/`
- [ ] Static files load đúng
- [ ] Media upload hoạt động (Cloudinary)
- [ ] Database queries hoạt động
- [ ] Authentication hoạt động

---

## Frontend Deployment (Vercel)

### ⚙️ Configuration
- [ ] `vercel.json` đã được cấu hình
- [ ] `.env.production` đã được tạo
- [ ] API URL đã được update
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### 🌍 Environment Variables
- [ ] VITE_API_URL (Backend URL)
- [ ] VITE_GA_TRACKING_ID (nếu dùng Google Analytics)
- [ ] VITE_GOOGLE_MAPS_API_KEY (nếu dùng Maps)
- [ ] VITE_SENTRY_DSN (nếu dùng Sentry)

### 🚀 Deployment
- [ ] Repository đã được connect với Vercel
- [ ] Framework preset: Vite
- [ ] Root directory: `FE`
- [ ] Build settings đã được verify
- [ ] Auto-deploy đã được enable

### ✅ Verification
- [ ] Build thành công không có errors
- [ ] Trang chủ load đúng
- [ ] Routing hoạt động (React Router)
- [ ] API calls thành công
- [ ] Images load đúng
- [ ] Responsive trên mobile
- [ ] Performance score > 90 (Lighthouse)
- [ ] SEO meta tags đầy đủ

---

## Integration Testing

### 🔗 API Integration
- [ ] Frontend gọi được Backend API
- [ ] CORS không bị block
- [ ] Authentication flow hoạt động
- [ ] File upload hoạt động
- [ ] Error handling đúng

### 👤 User Flows
- [ ] **Registration**: Đăng ký tài khoản mới
  - [ ] Candidate registration
  - [ ] Employer registration
  - [ ] Email verification (nếu có)

- [ ] **Login**: Đăng nhập
  - [ ] Login với email/password
  - [ ] JWT token được lưu
  - [ ] Redirect sau login

- [ ] **Profile**: Quản lý profile
  - [ ] View profile
  - [ ] Edit profile
  - [ ] Upload avatar
  - [ ] Update skills/experience

- [ ] **Jobs**: Quản lý công việc
  - [ ] Browse jobs
  - [ ] Search/filter jobs
  - [ ] View job details
  - [ ] Create job (employer)
  - [ ] Edit job (employer)
  - [ ] Delete job (employer)

- [ ] **Applications**: Ứng tuyển
  - [ ] Apply for job
  - [ ] Upload CV
  - [ ] View applications
  - [ ] Update application status

- [ ] **Messaging**: Tin nhắn
  - [ ] Create new thread
  - [ ] Send message
  - [ ] Upload file attachment
  - [ ] Mark as read
  - [ ] Real-time updates

- [ ] **Reviews**: Đánh giá
  - [ ] Submit review
  - [ ] View reviews
  - [ ] Edit own review

### 📱 Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### 📐 Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

---

## Performance Optimization

### ⚡ Backend
- [ ] Database queries optimized (select_related, prefetch_related)
- [ ] Database indexes created
- [ ] Pagination implemented
- [ ] Caching enabled (Redis)
- [ ] Compression middleware enabled
- [ ] Static files served via CDN

### ⚡ Frontend
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Images optimized (WebP)
- [ ] Bundle size < 500KB
- [ ] Unused code removed (tree shaking)
- [ ] Fonts optimized

### 📊 Metrics
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1

---

## Monitoring & Logging

### 📈 Monitoring Setup
- [ ] Render monitoring enabled
- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking (optional)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Performance monitoring

### 📝 Logging
- [ ] Application logs configured
- [ ] Error logs configured
- [ ] Access logs configured
- [ ] Log retention policy set
- [ ] Log alerts configured

### 🚨 Alerts
- [ ] Downtime alerts
- [ ] Error rate alerts
- [ ] Performance degradation alerts
- [ ] Database connection alerts
- [ ] Disk space alerts

---

## Documentation

### 📚 Technical Documentation
- [ ] API documentation (Swagger/Postman)
- [ ] Database schema documented
- [ ] Architecture diagram created
- [ ] Deployment guide updated
- [ ] Environment variables documented

### 👥 User Documentation
- [ ] User guide created
- [ ] FAQ updated
- [ ] Video tutorials (optional)
- [ ] Help center setup

---

## Post-Deployment

### ✅ Immediate Checks (First 30 minutes)
- [ ] All services are running
- [ ] No critical errors in logs
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] DNS propagated correctly

### 📊 First 24 Hours
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor server resources
- [ ] Check database performance

### 🔄 First Week
- [ ] Analyze user behavior
- [ ] Review analytics data
- [ ] Collect user feedback
- [ ] Identify bottlenecks
- [ ] Plan optimizations

---

## Rollback Plan

### 🔙 Backend Rollback
- [ ] Previous deployment saved in Render
- [ ] Database backup available
- [ ] Rollback procedure documented
- [ ] Team notified of rollback process

### 🔙 Frontend Rollback
- [ ] Previous deployment saved in Vercel
- [ ] Rollback via Vercel dashboard
- [ ] DNS changes documented

### 🆘 Emergency Contacts
- [ ] DevOps team contact
- [ ] Database admin contact
- [ ] Hosting support contact
- [ ] Escalation procedure documented

---

## Sign-off

### 👨‍💻 Development Team
- [ ] Lead Developer: _________________ Date: _______
- [ ] Backend Developer: ______________ Date: _______
- [ ] Frontend Developer: _____________ Date: _______

### 🧪 QA Team
- [ ] QA Lead: _______________________ Date: _______
- [ ] Tester: ________________________ Date: _______

### 👔 Management
- [ ] Project Manager: _______________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

## Notes

### Issues Found
```
[List any issues found during deployment]
```

### Deviations from Plan
```
[List any deviations from the original deployment plan]
```

### Lessons Learned
```
[Document lessons learned for future deployments]
```

---

**Deployment Date**: _______________
**Deployment Time**: _______________
**Deployed By**: ___________________
**Deployment Status**: ⬜ Success ⬜ Failed ⬜ Partial

---

## Quick Reference

### Backend URL
Production: `https://recruitment-api.onrender.com`

### Frontend URL
Production: `https://recruitment.vercel.app`

### Database
Host: `your-db-host.cloud.com`

### Admin Credentials
Username: `admin`
Password: `[Stored securely]`

### Support Contacts
- Technical Support: support@recruitment.com
- Emergency Hotline: +84-xxx-xxx-xxx
