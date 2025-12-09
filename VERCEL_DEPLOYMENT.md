# 🚀 Hướng dẫn Deploy Frontend lên Vercel

## 📋 Yêu cầu
- Tài khoản Vercel (đăng ký miễn phí tại https://vercel.com)
- Repository GitHub đã được push code
- Backend API đã deploy trên Render

## 🔧 Bước 1: Cấu hình Environment Variables trên Vercel

### Truy cập Vercel Dashboard
1. Đăng nhập vào https://vercel.com
2. Chọn project của bạn (hoặc import project mới)
3. Vào **Settings** → **Environment Variables**

### Thêm các biến môi trường sau:

#### ✅ Biến BẮT BUỘC:
```
REACT_APP_API_URL=https://recruitment-api-jrcr.onrender.com
```

#### ⚙️ Biến tùy chọn (để tắt warnings):
```
DISABLE_ESLINT_PLUGIN=true
CI=false
```

### Cách thêm biến môi trường:
1. Click **Add New**
2. Nhập **Key**: `REACT_APP_API_URL`
3. Nhập **Value**: `https://recruitment-api-jrcr.onrender.com`
4. Chọn **Environment**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

## 🔄 Bước 2: Redeploy

Sau khi thêm biến môi trường:

### Cách 1: Redeploy từ Vercel Dashboard
1. Vào tab **Deployments**
2. Click vào deployment mới nhất
3. Click nút **⋯** (3 chấm)
4. Chọn **Redeploy**
5. Chọn **Use existing Build Cache** (nếu muốn nhanh hơn)
6. Click **Redeploy**

### Cách 2: Push code mới
```bash
git add .
git commit -m "Update environment variables"
git push
```

Vercel sẽ tự động deploy lại.

## ✅ Bước 3: Kiểm tra

Sau khi deploy xong:

1. Truy cập URL Vercel của bạn (ví dụ: https://jobwebjobboards.vercel.app)
2. Mở **Developer Console** (F12)
3. Kiểm tra:
   - ✅ Không còn lỗi `ERR_CONNECTION_REFUSED`
   - ✅ API calls đang gọi đến `https://recruitment-api-jrcr.onrender.com`
   - ✅ Dữ liệu hiển thị bình thường

## 🐛 Troubleshooting

### Lỗi: Vẫn gọi đến 127.0.0.1:8000

**Nguyên nhân:** Biến môi trường chưa được áp dụng

**Giải pháp:**
1. Kiểm tra lại biến môi trường đã được thêm đúng chưa
2. Đảm bảo đã chọn đúng Environment (Production/Preview/Development)
3. Phải **Redeploy** sau khi thêm biến môi trường
4. Clear cache trình duyệt (Ctrl + Shift + R)

### Lỗi: CORS Error

**Nguyên nhân:** Backend chưa cho phép domain Vercel

**Giải pháp:**
Kiểm tra `BE/recruitment/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'https://jobwebjobboards.vercel.app',  # Thêm domain Vercel của bạn
    'http://localhost:3000',
]

CSRF_TRUSTED_ORIGINS = [
    'https://recruitment-api-jrcr.onrender.com',
    'https://jobwebjobboards.vercel.app',  # Thêm domain Vercel của bạn
]
```

### Lỗi: 404 Not Found trên các route

**Nguyên nhân:** Vercel cần cấu hình rewrites cho SPA

**Giải pháp:**
File `FE/vercel.json` đã có sẵn cấu hình:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 📝 Checklist Deploy

- [ ] Backend API đã deploy thành công trên Render
- [ ] Đã thêm `REACT_APP_API_URL` trên Vercel
- [ ] Đã Redeploy sau khi thêm biến môi trường
- [ ] Đã kiểm tra CORS settings trên Backend
- [ ] Đã test các chức năng chính:
  - [ ] Đăng ký / Đăng nhập
  - [ ] Xem danh sách công việc
  - [ ] Tìm kiếm và lọc
  - [ ] Ứng tuyển công việc
  - [ ] Upload CV

## 🎯 URLs quan trọng

- **Frontend (Vercel):** https://jobwebjobboards.vercel.app
- **Backend API (Render):** https://recruitment-api-jrcr.onrender.com
- **Admin Panel:** https://recruitment-api-jrcr.onrender.com/admin/

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Vercel Dashboard → Deployments → View Function Logs
2. Kiểm tra Network tab trong Developer Console
3. Kiểm tra Backend logs trên Render Dashboard
