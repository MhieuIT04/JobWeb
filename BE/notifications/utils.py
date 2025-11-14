# notifications/utils.py
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


def notify_employer_new_application(application):
    """
    Gửi thông báo cho nhà tuyển dụng khi có ứng viên mới apply.
    """
    employer = application.job.employer
    candidate = application.user
    job_title = application.job.title
    
    # Lấy tên ứng viên
    if hasattr(candidate, 'profile'):
        candidate_name = f"{candidate.profile.first_name} {candidate.profile.last_name}".strip()
        if not candidate_name:
            candidate_name = candidate.email
    else:
        candidate_name = candidate.email
    
    # 1. Tạo thông báo trên web
    web_message = f'{candidate_name} đã ứng tuyển vào vị trí "{job_title}"'
    
    try:
        notification = Notification.objects.create(
            recipient=employer,
            message=web_message,
            link=f'/employer/jobs/{application.job.id}/applicants'
        )
        print(f"✓ Notification created for employer {employer.email}: ID {notification.id}")
    except Exception as e:
        print(f"✗ Error creating notification: {e}")
    
    # 2. Gửi email cho nhà tuyển dụng
    email_subject = "Có ứng viên mới ứng tuyển!"
    
    # Lấy thông tin công ty
    company_name = "Nhà tuyển dụng"
    if hasattr(employer, 'profile') and employer.profile.company_name:
        company_name = employer.profile.company_name
    
    # Email plain text
    email_body_text = f"""
Chào {company_name},

Bạn có một ứng viên mới ứng tuyển!

Thông tin:
- Ứng viên: {candidate_name}
- Email: {candidate.email}
- Vị trí: {job_title}
- Thời gian: {application.applied_at.strftime('%d/%m/%Y %H:%M')}

Vui lòng đăng nhập vào hệ thống để xem chi tiết CV và thông tin ứng viên.

Trân trọng,
Đội ngũ JobBoard
    """
    
    # Email HTML
    email_body_html = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Có ứng viên mới ứng tuyển! 🎉</h2>
    
    <p>Chào <strong>{company_name}</strong>,</p>
    
    <p>Bạn có một ứng viên mới ứng tuyển vào vị trí công việc của bạn:</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>👤 Ứng viên:</strong> {candidate_name}</p>
        <p style="margin: 5px 0;"><strong>📧 Email:</strong> {candidate.email}</p>
        <p style="margin: 5px 0;"><strong>💼 Vị trí:</strong> {job_title}</p>
        <p style="margin: 5px 0;"><strong>🕐 Thời gian:</strong> {application.applied_at.strftime('%d/%m/%Y %H:%M')}</p>
    </div>
    
    <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết CV và thông tin ứng viên.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{settings.FRONTEND_URL}/employer/jobs/{application.job.id}/applicants" 
           style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Xem chi tiết ứng viên
        </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
        Trân trọng,<br>
        Đội ngũ JobBoard
    </p>
</div>
    """
    
    # Gửi email
    try:
        send_mail(
            subject=email_subject,
            message=email_body_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer.email],
            fail_silently=False,
            html_message=email_body_html,
        )
        print(f"✓ Email sent to employer {employer.email}")
    except Exception as e:
        print(f"✗ Error sending email: {e}")


def create_and_send_notification(application):
    user_to_notify = application.user
    job_title = application.job.title
    status = application.status
    
    # --- THAY ĐỔI 1: Tách biệt nội dung cho web và email ---
    # web_message là phiên bản văn bản thuần túy cho thông báo trên website.
    # html_message là phiên bản HTML được định dạng cho email.
    
    web_message = ""
    html_message = ""
    email_subject = ""

    if status == 'accepted':
        email_subject = f"Cập nhật trạng thái ứng tuyển: Chúc mừng!"
        web_message = f"Chúc mừng! Đơn ứng tuyển của bạn cho vị trí '{job_title}' đã được chấp nhận."
        
        # Sử dụng thẻ <strong> để in đậm và inline CSS để thêm màu xanh lá cây
        html_message = f"""
            <strong style="color: #28a745;">
                Chúc mừng! Đơn ứng tuyển của bạn cho vị trí '{job_title}' đã được chấp nhận.
            </strong>
        """
    elif status == 'rejected':
        email_subject = f"Cập nhật trạng thái ứng tuyển"
        web_message = f"Rất tiếc, đơn ứng tuyển của bạn cho vị trí '{job_title}' đã bị từ chối."
        
        # Sử dụng thẻ <strong> để in đậm và inline CSS để thêm màu đỏ
        html_message = f"""
            <strong style="color: #dc3545;">
                Rất tiếc, đơn ứng tuyển của bạn cho vị trí '{job_title}' đã bị từ chối.
            </strong>
        """
    else:
        # Nếu trạng thái không phải 'accepted' hay 'rejected', không làm gì cả
        return

    # 1. Tạo thông báo trên web (sử dụng phiên bản văn bản thuần túy)
    try:
        notification = Notification.objects.create(recipient=user_to_notify, message=web_message)
        print(f"--- Web notification created successfully: ID {notification.id} ---")
    except Exception as e:
        print(f"!!! ERROR creating web notification: {e}")

    # --- THAY ĐỔI 2: Tạo nội dung email với cả hai phiên bản Plain Text và HTML ---
    
    # Nội dung email dạng văn bản thuần túy (dành cho các trình duyệt mail cũ không hỗ trợ HTML)
    email_body_text = f"""
    Chào {user_to_notify.profile.first_name or user_to_notify.email},

    {web_message}

    Bạn có thể xem lại lịch sử ứng tuyển của mình tại website.

    Trân trọng,
    Đội ngũ JobBoard
    """

    # Nội dung email dạng HTML (hiển thị đẹp hơn trên hầu hết các trình duyệt mail)
    # Sử dụng các thẻ <p> để tạo khoảng cách giữa các đoạn
    email_body_html = f"""
    <p>Chào {user_to_notify.profile.first_name or user_to_notify.email},</p>
    
    <p>{html_message}</p>
    
    <p>Bạn có thể xem lại lịch sử ứng tuyển của mình tại website.</p>
    
    <p>
        Trân trọng,<br>
        Đội ngũ JobBoard
    </p>
    """

    # 2. Gửi email
    try:
       # --- THAY ĐỔI 3: Sử dụng tham số `html_message` của hàm send_mail ---
       send_mail(
            subject=email_subject,
            message=email_body_text,  # Nội dung văn bản thuần túy làm dự phòng
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_to_notify.email],
            fail_silently=False,
            html_message=email_body_html,  # Nội dung HTML sẽ được ưu tiên hiển thị
        )
       print(f"--- Email sent successfully to {user_to_notify.email} ---")
    except Exception as e:
        print(f"!!! ERROR sending email: {e}")