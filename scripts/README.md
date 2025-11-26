# 🛠️ Deployment Scripts

Bộ scripts tự động hóa cho việc triển khai và quản lý hệ thống.

## 📋 Danh sách Scripts

### 1. `railway-setup.sh` - Setup Railway Deployment
Script tự động setup và deploy lên Railway.

**Sử dụng:**
```bash
chmod +x scripts/railway-setup.sh
./scripts/railway-setup.sh
```

**Chức năng:**
- ✅ Cài đặt Railway CLI
- ✅ Login vào Railway
- ✅ Tạo project mới hoặc link project có sẵn
- ✅ Thêm PostgreSQL database
- ✅ Enable pgvector extension
- ✅ Set environment variables
- ✅ Deploy application
- ✅ Run migrations
- ✅ Create superuser

**Lưu ý:**
- Cần có Node.js và npm
- Cần tài khoản Railway (free tier available)
- Script sẽ hướng dẫn từng bước

---

### 2. `setup-local.sh` - Cài đặt môi trường local
Tự động cài đặt và cấu hình môi trường phát triển local.

**Sử dụng:**
```bash
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

**Chức năng:**
- ✅ Kiểm tra prerequisites (Python, Node.js, npm)
- ✅ Tạo virtual environment cho Backend
- ✅ Cài đặt dependencies (Python & Node.js)
- ✅ Tạo file .env từ .env.example
- ✅ Chạy database migrations
- ✅ Tạo superuser
- ✅ Collect static files

---

### 3. `deploy.sh` - Triển khai lên Production
Script tự động hóa quy trình deploy lên Render/Railway và Vercel.

**Sử dụng:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Chức năng:**
- ✅ Pre-deployment checks (Git status, dependencies)
- ✅ Run tests (Backend & Frontend)
- ✅ Build Frontend
- ✅ Commit và push changes
- ✅ Post-deployment health checks

**Lưu ý:**
- Đảm bảo đã cấu hình Git remote
- Đảm bảo đã setup Render và Vercel auto-deploy
- Script sẽ hỏi xác nhận trước khi deploy

---

### 4. `backup-db.sh` - Backup Database
Tạo backup của PostgreSQL database.

**Sử dụng:**
```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

**Chức năng:**
- ✅ Tạo SQL dump từ PostgreSQL
- ✅ Nén backup file (gzip)
- ✅ Tự động xóa backup cũ (> 7 ngày)
- ✅ Upload lên cloud storage (optional)

**Output:**
```
backups/backup_20240101_120000.sql.gz
```

**Cấu hình:**
- Backup được lưu trong thư mục `backups/`
- Tự động xóa backup cũ hơn 7 ngày
- Có thể uncomment code để upload lên S3/GCS

---

### 5. `restore-db.sh` - Restore Database
Khôi phục database từ backup file.

**Sử dụng:**
```bash
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh backups/backup_20240101_120000.sql.gz
```

**Chức năng:**
- ✅ Giải nén backup file
- ✅ Drop database hiện tại
- ✅ Tạo database mới
- ✅ Restore từ backup
- ✅ Chạy migrations

**⚠️ CẢNH BÁO:**
- Script này sẽ XÓA toàn bộ dữ liệu hiện tại
- Yêu cầu xác nhận trước khi thực hiện
- Chỉ sử dụng khi thực sự cần thiết

---

## 🔧 Cài đặt

### Cấp quyền thực thi cho tất cả scripts:

**Linux/Mac:**
```bash
chmod +x scripts/*.sh
```

**Windows (Git Bash):**
```bash
git update-index --chmod=+x scripts/*.sh
```

---

## 📝 Quy trình Deployment Chuẩn

### 1. Development
```bash
# Setup môi trường local
./scripts/setup-local.sh

# Start development servers
cd BE && source venv/bin/activate && python manage.py runserver
cd FE && npm run dev
```

### 2. Testing
```bash
# Backend tests
cd BE && python manage.py test

# Frontend tests
cd FE && npm run test

# Linting
cd FE && npm run lint
```

### 3. Backup (trước khi deploy)
```bash
# Backup database production
./scripts/backup-db.sh
```

### 4. Deployment
```bash
# Deploy to production
./scripts/deploy.sh
```

### 5. Rollback (nếu cần)
```bash
# Restore từ backup
./scripts/restore-db.sh backups/backup_YYYYMMDD_HHMMSS.sql.gz

# Rollback code qua Render/Vercel dashboard
```

---

## 🔄 Automated Backup Schedule

### Sử dụng Cron (Linux/Mac)

Thêm vào crontab:
```bash
crontab -e
```

Backup hàng ngày lúc 2:00 AM:
```cron
0 2 * * * /path/to/scripts/backup-db.sh >> /path/to/logs/backup.log 2>&1
```

Backup mỗi 6 giờ:
```cron
0 */6 * * * /path/to/scripts/backup-db.sh >> /path/to/logs/backup.log 2>&1
```

### Sử dụng Task Scheduler (Windows)

1. Mở Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `bash.exe`
6. Arguments: `/path/to/scripts/backup-db.sh`

---

## 🐛 Troubleshooting

### Script không chạy được

**Lỗi: Permission denied**
```bash
chmod +x scripts/script-name.sh
```

**Lỗi: Command not found**
```bash
# Kiểm tra PATH
echo $PATH

# Hoặc chạy với bash
bash scripts/script-name.sh
```

### Backup/Restore lỗi

**Lỗi: pg_dump: command not found**
```bash
# Cài đặt PostgreSQL client
# Ubuntu/Debian
sudo apt-get install postgresql-client

# Mac
brew install postgresql
```

**Lỗi: Connection refused**
```bash
# Kiểm tra DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Deploy script lỗi

**Lỗi: Tests failed**
```bash
# Chạy tests riêng để xem chi tiết
cd BE && python manage.py test
cd FE && npm run test
```

**Lỗi: Build failed**
```bash
# Kiểm tra dependencies
cd FE && npm install
npm run build
```

---

## 📚 Tài liệu liên quan

- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Hướng dẫn triển khai chi tiết
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Checklist triển khai
- [BE/.env.example](../BE/.env.example) - Environment variables Backend
- [FE/.env.example](../FE/.env.example) - Environment variables Frontend

---

## 🆘 Support

Nếu gặp vấn đề với scripts, vui lòng:
1. Kiểm tra logs trong terminal
2. Xem troubleshooting section ở trên
3. Liên hệ team DevOps
4. Tạo issue trên GitHub

---

## 📝 Notes

- Tất cả scripts đều có error handling (`set -e`)
- Scripts sẽ dừng ngay khi gặp lỗi
- Logs được output với màu sắc để dễ đọc
- Backup files được tự động nén và xóa sau 7 ngày
- Deploy script có confirmation prompts để tránh deploy nhầm
