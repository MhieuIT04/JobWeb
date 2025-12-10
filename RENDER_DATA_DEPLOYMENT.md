# 🚀 Hướng dẫn Deploy Dữ liệu lên Render

## Tổng quan
Script này sẽ export tất cả dữ liệu từ local database và import lên Render production database, bao gồm:
- **24 Cities** (thành phố)
- **2,542 Categories** (danh mục công việc) 
- **7 Work Types** (loại hình làm việc)
- **15 Employers** (nhà tuyển dụng)
- **5 Candidates** (ứng viên)
- **23,979 Jobs** (công việc)
- **15 Applications** (đơn ứng tuyển với AI scores)

## Bước 1: Export dữ liệu từ Local

```bash
cd BE
python export_data.py
python deploy_data_to_render.py
```

Sẽ tạo ra các file:
- `production_data.zip` - Chứa tất cả dữ liệu
- `render_import_simple.py` - Script import đơn giản

## Bước 2: Upload lên Render

### Cách 1: Qua Git (Khuyến nghị)
```bash
# Add files to git
git add production_data.zip render_import_simple.py
git commit -m "Add production data for import"
git push origin main
```

### Cách 2: Upload thủ công
- Upload `production_data.zip` và `render_import_simple.py` vào thư mục gốc của project trên Render

## Bước 3: Chạy Import trên Render

### Kết nối Render Shell:
1. Vào Render Dashboard
2. Chọn service backend của bạn
3. Click tab "Shell" 
4. Chạy lệnh:

```bash
# Chạy script import
python render_import_simple.py
```

## Bước 4: Kiểm tra kết quả

### Kiểm tra Django Admin:
1. Truy cập: `https://your-render-url.onrender.com/admin/`
2. Đăng nhập với superuser
3. Kiểm tra các model:
   - Users: Có thêm 20 users (15 employers + 5 candidates)
   - Jobs: Có thêm 23,979 công việc
   - Applications: Có thêm 15 đơn ứng tuyển

### Kiểm tra Frontend:
1. Truy cập trang chủ
2. Xem danh sách công việc
3. Test tính năng tìm kiếm
4. Test tính năng phân tích CV

## Thông tin đăng nhập

### Tài khoản được import:
- **Email**: Các email từ local database
- **Password**: `imported123` (cho tất cả users)
- **Roles**: employer và candidate

### Ví dụ tài khoản test:
```
Email: python_dev@gmail.com
Password: imported123
Role: candidate

Email: js_dev@gmail.com  
Password: imported123
Role: candidate

Email: marketer@gmail.com
Password: imported123
Role: candidate
```

## Lưu ý quan trọng

### ✅ Dữ liệu được import:
- Thông tin cơ bản (cities, skills, categories)
- Tài khoản users với profiles
- Công việc với skills và thông tin đầy đủ
- Đơn ứng tuyển với AI scores

### ❌ Dữ liệu KHÔNG được import:
- **CV files** - Users cần upload lại CV
- **Avatar/Logo images** - Users cần upload lại ảnh
- **Passwords** - Tất cả dùng password mặc định

### 🔧 Sau khi import:
1. **Thông báo users** đổi password
2. **Test các tính năng** chính
3. **Backup database** production
4. **Monitor performance** với dữ liệu lớn

## Troubleshooting

### Lỗi thường gặp:

**1. "production_data.zip not found"**
```bash
# Chạy lại export
python export_data.py
python deploy_data_to_render.py
```

**2. "User already exists"**
- Script tự động skip users đã tồn tại
- Không có vấn đề gì

**3. "Memory error with large dataset"**
- Script import từng batch nhỏ
- Monitor Render logs

**4. "Database connection timeout"**
- Render có thể restart service
- Chạy lại script import

## Kết quả mong đợi

Sau khi import thành công:
- ✅ **23,979 công việc** có sẵn để test
- ✅ **20 tài khoản** test (employers + candidates)  
- ✅ **AI scoring** hoạt động với applications có sẵn
- ✅ **Tính năng phân tích CV** có dữ liệu để test
- ✅ **Dashboard** hiển thị thống kê thực tế

## Support

Nếu gặp vấn đề:
1. Check Render logs
2. Verify database connections
3. Test với tài khoản superuser trước
4. Contact support nếu cần thiết

---

**🎉 Chúc bạn deploy thành công!**