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
    """
    Gửi thông báo và email cho ứng viên khi trạng thái đơn ứng tuyển thay đổi.
    """
    user_to_notify = application.user
    job_title = application.job.title
    status = application.status
    company_name = "Nhà tuyển dụng"
    
    # Lấy tên công ty
    if hasattr(application.job.employer, 'profile') and application.job.employer.profile.company_name:
        company_name = application.job.employer.profile.company_name
    
    # Lấy tên ứng viên
    candidate_name = user_to_notify.email
    if hasattr(user_to_notify, 'profile'):
        full_name = f"{user_to_notify.profile.first_name} {user_to_notify.profile.last_name}".strip()
        if full_name:
            candidate_name = full_name
    
    web_message = ""
    email_subject = ""
    status_color = ""
    status_icon = ""

    if status == 'accepted':
        email_subject = "🎉 Chúc mừng! Đơn ứng tuyển của bạn đã được chấp nhận"
        web_message = f"Chúc mừng! Đơn ứng tuyển của bạn cho vị trí '{job_title}' tại {company_name} đã được chấp nhận."
        status_color = "#10b981"  # Green
        status_icon = "✅"
        
    elif status == 'rejected':
        email_subject = "Cập nhật trạng thái ứng tuyển"
        web_message = f"Rất tiếc, đơn ứng tuyển của bạn cho vị trí '{job_title}' tại {company_name} đã bị từ chối."
        status_color = "#ef4444"  # Red
        status_icon = "❌"
    else:
        # Nếu trạng thái không phải 'accepted' hay 'rejected', không làm gì cả
        return

    # 1. Tạo thông báo trên web
    try:
        notification = Notification.objects.create(
            recipient=user_to_notify, 
            message=web_message,
            link='/my-applications'
        )
        print(f"✓ Web notification created: ID {notification.id}")
    except Exception as e:
        print(f"✗ Error creating web notification: {e}")

    # 2. Gửi email
    # Email plain text
    email_body_text = f"""
Chào {candidate_name},

{web_message}

Thông tin chi tiết:
- Vị trí: {job_title}
- Công ty: {company_name}
- Trạng thái: {'Đã chấp nhận' if status == 'accepted' else 'Đã từ chối'}

Bạn có thể xem lại lịch sử ứng tuyển của mình tại website.

Trân trọng,
Đội ngũ JobBoard
    """

    # Email HTML
    email_body_html = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: {status_color};">{status_icon} Cập nhật trạng thái ứng tuyển</h2>
    
    <p>Chào <strong>{candidate_name}</strong>,</p>
    
    <p style="font-size: 16px; color: {status_color}; font-weight: bold;">
        {web_message}
    </p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>💼 Vị trí:</strong> {job_title}</p>
        <p style="margin: 5px 0;"><strong>🏢 Công ty:</strong> {company_name}</p>
        <p style="margin: 5px 0;"><strong>📊 Trạng thái:</strong> 
            <span style="color: {status_color}; font-weight: bold;">
                {'Đã chấp nhận' if status == 'accepted' else 'Đã từ chối'}
            </span>
        </p>
    </div>
    
    {'<p>Nhà tuyển dụng sẽ liên hệ với bạn sớm để thảo luận về các bước tiếp theo. Chúc mừng bạn!</p>' if status == 'accepted' else '<p>Đừng nản lòng! Hãy tiếp tục tìm kiếm và ứng tuyển vào các vị trí phù hợp khác.</p>'}
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{settings.FRONTEND_URL}/my-applications" 
           style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Xem lịch sử ứng tuyển
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
            recipient_list=[user_to_notify.email],
            fail_silently=False,
            html_message=email_body_html,
        )
        print(f"✓ Email sent to candidate {user_to_notify.email}")
    except Exception as e:
        print(f"✗ Error sending email: {e}")