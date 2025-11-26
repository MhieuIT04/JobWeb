# 🔧 Sửa lỗi Deploy Render

## Vấn đề

Lỗi: `bash: line 1: ./build.sh: No such file or directory`

## Nguyên nhân

File `build.sh` không có quyền thực thi trong Git hoặc Render không tìm thấy file.

## ✅ Giải pháp (Chọn 1 trong 3)

### Giải pháp 1: Không dùng build.sh (KHUYẾN NGHỊ)

Trong Render Dashboard:

1. Vào service → **Settings**
2. Tìm **Build Command**
3. Thay đổi thành:

```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input
```

4. **Start Command**:

```bash
python manage.py migrate --no-input && gunicorn recruitment.wsgi:application
```

5. Click **Save Changes**
6. Trigger manual deploy

---

### Giải pháp 2: Cấp quyền thực thi cho build.sh

```bash
# Trong terminal local
git update-index --chmod=+x BE/build.sh
git add BE/build.sh
git commit -m "Make build.sh executable"
git push
```

Render sẽ tự động redeploy.

---

### Giải pháp 3: Dùng render.yaml

Tạo file `render.yaml` ở root project:

```yaml
services:
  - type: web
    name: recruitment-backend
    runtime: python
    region: singapore
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --no-input
    startCommand: python manage.py migrate --no-input && gunicorn recruitment.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: ALLOWED_HOSTS
        value: .onrender.com
```

Commit và push:
```bash
git add render.yaml
git commit -m "Add render.yaml"
git push
```

---

## 🔍 Kiểm tra lỗi khác

### Lỗi: Module not found

Kiểm tra `requirements.txt` có đầy đủ:

```txt
Django>=4.2.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
gunicorn>=21.2.0
dj-database-url>=2.0.0
psycopg2-binary>=2.9.0
Pillow>=10.0.0
python-decouple>=3.8
cloudinary>=1.36.0
```

### Lỗi: collectstatic failed

Trong `settings.py`, đảm bảo:

```python
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### Lỗi: Database connection

Nếu không dùng database, trong `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

---

## 📝 Cấu hình Render đầy đủ

### Build Command (chọn 1):

**Option 1 - Đơn giản:**
```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input
```

**Option 2 - Với migrations:**
```bash
pip install --upgrade pip && pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate --no-input
```

### Start Command:

```bash
gunicorn recruitment.wsgi:application
```

### Environment Variables (tối thiểu):

```env
PYTHON_VERSION=3.10.0
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.onrender.com,localhost
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

## 🚀 Deploy lại

Sau khi sửa:

1. **Manual Deploy**: Render Dashboard → **Manual Deploy** → **Deploy latest commit**
2. **Auto Deploy**: Push code mới lên GitHub

---

## ✅ Checklist

- [ ] Build Command không dùng `./build.sh`
- [ ] Start Command đúng
- [ ] Environment variables đã set
- [ ] requirements.txt đầy đủ
- [ ] settings.py cấu hình đúng
- [ ] Git push thành công
- [ ] Render deploy thành công
- [ ] Logs không có errors
- [ ] API endpoint hoạt động

---

## 🆘 Vẫn lỗi?

### Xem logs chi tiết:

1. Render Dashboard → Service → **Logs**
2. Tìm dòng đầu tiên có "ERROR" hoặc "FAILED"
3. Copy error message
4. Google hoặc hỏi ChatGPT

### Lỗi thường gặp:

**"No module named 'recruitment'"**
- Root Directory phải là `BE`

**"SECRET_KEY not set"**
- Thêm SECRET_KEY vào Environment Variables

**"ALLOWED_HOSTS"**
- Thêm `.onrender.com` vào ALLOWED_HOSTS

**"collectstatic failed"**
- Kiểm tra STATIC_ROOT trong settings.py
