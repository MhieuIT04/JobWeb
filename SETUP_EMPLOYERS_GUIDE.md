# 📘 Hướng dẫn Setup Employers cho Jobs từ Kaggle

## 🎯 Mục tiêu
Gán employer (nhà tuyển dụng) cho các jobs từ dữ liệu Kaggle để:
- Employer có thể xem danh sách ứng viên
- Employer có thể duyệt/từ chối đơn ứng tuyển
- Ứng viên nhận được phản hồi từ nhà tuyển dụng

---

## 🚀 Cách 1: Tạo Employers Mới (Khuyến nghị)

### Bước 1: Tạo Test Employers

```bash
cd BE
python manage.py create_test_employers --count 3
```

**Kết quả:**
- ✅ Tạo 3 employer accounts:
  - `employer1@test.com` - Tech Solutions VN
  - `employer2@test.com` - Digital Marketing Pro
  - `employer3@test.com` - Finance Experts Co.
- 🔑 Mật khẩu: `testpass123`

### Bước 2: Gán Employers cho Jobs

**Option A: Gán tất cả jobs cho 1 employer**
```bash
python manage.py assign_employers_to_jobs --employer-email employer1@test.com --approve-all
```

**Option B: Phân phối đều jobs cho nhiều employers**
```bash
python manage.py assign_employers_to_jobs --distribute --approve-all
```

**Giải thích:**
- `--approve-all`: Đặt status = "approved" để jobs hiển thị trên trang chủ
- `--distribute`: Phân phối đều jobs cho tất cả employers

---

## 🔄 Cách 2: Re-import Jobs với Employer

Nếu muốn import lại từ đầu:

```bash
# Xóa jobs cũ và import mới với employer cụ thể
python manage.py import_jobs data/train.csv --employer-email employer1@test.com

# Hoặc dùng CSV khác
python manage.py import_jobs data/your_jobs.csv --employer-email employer2@test.com --append
```

**Tham số:**
- `--append`: Giữ lại jobs cũ, không xóa
- `--employer-email`: Email của employer (tự động tạo nếu chưa có)
- `--dry-run`: Xem trước mà không insert vào DB

---

## 📋 Kiểm tra Kết quả

### 1. Đăng nhập Django Admin
```
http://localhost:8000/admin/
```

Kiểm tra:
- Jobs → Xem employer đã được gán chưa
- Applications → Xem đơn ứng tuyển

### 2. Đăng nhập Frontend

**Đăng nhập bằng Employer:**
```
Email: employer1@test.com
Password: testpass123
```

**Truy cập Dashboard:**
```
http://localhost:3000/employer/dashboard
```

**Xem ứng viên:**
- Click "Xem ứng viên" tại job bất kỳ
- Hoặc truy cập: `http://localhost:3000/employer/jobs/{jobId}/applicants`

---

## 🎨 Dark Mode đã được áp dụng

Tất cả trang đã có dark mode:
- ✅ JobList (Trang chủ)
- ✅ JobDetail  
- ✅ Login & Register
- ✅ Profile
- ✅ FavoriteJobs
- ✅ **EmployerDashboard**
- ✅ **JobApplicants** (Xem ứng viên)

---

## 🧪 Test Flow Hoàn chỉnh

### A. Employer Test Flow

1. **Đăng nhập employer**
   ```
   Email: employer1@test.com
   Password: testpass123
   ```

2. **Vào Dashboard** → Xem danh sách jobs của mình

3. **Click "Xem ứng viên"** tại 1 job

4. **Quản lý ứng viên:**
   - Xem CV
   - Đổi trạng thái: Chờ duyệt / Chấp nhận / Từ chối

### B. Candidate Test Flow  

1. **Đăng ký tài khoản candidate**

2. **Ứng tuyển vào job**

3. **Employer sẽ thấy đơn ứng tuyển ngay lập tức**

4. **Candidate xem lịch sử ứng tuyển** tại `/my-applications`

---

## 📊 Thống kê Jobs theo Employer

Sau khi distribute, kiểm tra phân phối:

```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from jobs.models import Job

User = get_user_model()

for employer in User.objects.filter(role='employer'):
    count = Job.objects.filter(employer=employer).count()
    print(f"{employer.company_name}: {count} jobs")
```

---

## ⚠️ Lưu ý

1. **Employers phải có role='employer'** trong database

2. **Jobs cần status='approved'** để hiển thị trên trang chủ

3. **Nếu jobs không hiển thị:**
   ```bash
   # Check status
   python manage.py shell
   from jobs.models import Job
   print(Job.objects.values('status').annotate(count=Count('id')))
   ```

4. **Nếu employer không thấy jobs:**
   - Kiểm tra `employer_id` của job
   - Đảm bảo user đang login có role='employer'

---

## 🔧 Troubleshooting

### Problem: Jobs không có employer

**Solution:**
```bash
python manage.py assign_employers_to_jobs --employer-email employer1@test.com
```

### Problem: Employer không thấy applications

**Check:**
1. Job có thuộc employer đó không?
2. Application có link đến job đúng không?

**Fix:**
```bash
python manage.py shell
```
```python
from jobs.models import Job, Application

# Check job owner
job = Job.objects.get(id=YOUR_JOB_ID)
print(f"Owner: {job.employer.email}")

# Check applications
apps = Application.objects.filter(job_id=YOUR_JOB_ID)
print(f"Applications: {apps.count()}")
```

---

## ✅ Checklist Hoàn thành

- [ ] Tạo test employers
- [ ] Gán employers cho jobs
- [ ] Set status='approved' cho jobs
- [ ] Test đăng nhập employer
- [ ] Test xem danh sách jobs
- [ ] Test xem danh sách ứng viên
- [ ] Test đổi trạng thái application
- [ ] Test candidate ứng tuyển
- [ ] Test dark mode tất cả trang

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Django logs: `python manage.py runserver`
2. Browser console (F12)
3. Network tab để xem API calls

**Happy coding! 🎉**

