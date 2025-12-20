# notifications/utils.py
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


def notify_employer_new_application(application):
    """
    Gửi thông báo cho nhà tuyển dụng khi có ứng viên mới apply.
    Optimized to prevent timeout - skip email if it takes too long
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
    
    # 1. Tạo thông báo trên web (nhanh)
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
    
    # 2. Skip email to prevent timeout - can be done async later
    print(f"ℹ Email notification skipped to prevent timeout (can be sent async)")
    
    # TODO: Implement async email sending with Celery
    # try:
    #     from .tasks import send_employer_notification_email_async
    #     send_employer_notification_email_async.delay(application.id)
    # except ImportError:
    #     pass  # Celery not available


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

def notify_ai_processing_complete(application):
    """
    Thông báo khi AI processing hoàn tất
    """
    employer = application.job.employer
    candidate = application.user
    job_title = application.job.title
    match_score = application.match_score or 0
    
    # Lấy tên ứng viên
    candidate_name = get_user_display_name(candidate)
    
    # 1. Thông báo cho nhà tuyển dụng
    web_message = f'Phân tích AI hoàn tất cho ứng viên {candidate_name} - Điểm phù hợp: {match_score}/5.0'
    
    try:
        Notification.objects.create(
            recipient=employer,
            message=web_message,
            link=f'/employer/jobs/{application.job.id}/applicants'
        )
        print(f"✓ AI completion notification sent to employer {employer.email}")
    except Exception as e:
        print(f"✗ Error creating AI completion notification: {e}")
    
    # 2. Thông báo cho ứng viên (nếu điểm cao)
    if match_score >= 3.5:
        candidate_message = f'Hồ sơ của bạn có độ phù hợp cao ({match_score}/5.0) với vị trí "{job_title}"'
        try:
            Notification.objects.create(
                recipient=candidate,
                message=candidate_message,
                link=f'/jobs/{application.job.id}'
            )
            print(f"✓ High match notification sent to candidate {candidate.email}")
        except Exception as e:
            print(f"✗ Error creating candidate notification: {e}")

def notify_ai_processing_failed(application, error_message):
    """
    Thông báo khi AI processing thất bại
    """
    employer = application.job.employer
    candidate_name = get_user_display_name(application.user)
    
    # Chỉ thông báo cho admin/employer về lỗi kỹ thuật
    web_message = f'Không thể phân tích AI cho ứng viên {candidate_name}. Vui lòng kiểm tra thủ công.'
    
    try:
        Notification.objects.create(
            recipient=employer,
            message=web_message,
            link=f'/employer/jobs/{application.job.id}/applicants'
        )
        print(f"✓ AI failure notification sent to employer {employer.email}")
    except Exception as e:
        print(f"✗ Error creating AI failure notification: {e}")

def notify_match_score_updated(application, old_score, new_score):
    """
    Thông báo khi match score được cập nhật
    """
    if old_score == new_score:
        return
    
    employer = application.job.employer
    candidate_name = get_user_display_name(application.user)
    
    web_message = f'Điểm phù hợp của {candidate_name} đã được cập nhật: {old_score or "N/A"} → {new_score}/5.0'
    
    try:
        Notification.objects.create(
            recipient=employer,
            message=web_message,
            link=f'/employer/jobs/{application.job.id}/applicants'
        )
        print(f"✓ Match score update notification sent to employer {employer.email}")
    except Exception as e:
        print(f"✗ Error creating match score update notification: {e}")

def get_user_display_name(user):
    """
    Helper function to get user display name
    """
    if hasattr(user, 'profile'):
        full_name = f"{user.profile.first_name} {user.profile.last_name}".strip()
        if full_name:
            return full_name
    return user.email

def notify_bulk_ai_processing_complete(job_id, processed_count, avg_score):
    """
    Thông báo khi xử lý AI hàng loạt hoàn tất
    """
    from jobs.models import Job
    
    try:
        job = Job.objects.get(id=job_id)
        employer = job.employer
        
        web_message = f'Phân tích AI hoàn tất cho {processed_count} ứng viên của "{job.title}". Điểm trung bình: {avg_score:.1f}/5.0'
        
        Notification.objects.create(
            recipient=employer,
            message=web_message,
            link=f'/employer/jobs/{job_id}/applicants'
        )
        print(f"✓ Bulk AI processing notification sent to employer {employer.email}")
        
    except Exception as e:
        print(f"✗ Error creating bulk AI processing notification: {e}")

def send_ai_processing_email(application, match_score):
    """
    Gửi email thông báo kết quả AI processing
    """
    employer = application.job.employer
    candidate_name = get_user_display_name(application.user)
    job_title = application.job.title
    
    # Email subject
    subject = f"Kết quả phân tích AI - {candidate_name}"
    
    # Email body
    email_body = f"""
Chào bạn,

Hệ thống AI đã hoàn tất phân tích hồ sơ ứng viên:

📋 Thông tin ứng tuyển:
• Ứng viên: {candidate_name}
• Vị trí: {job_title}
• Điểm phù hợp: {match_score}/5.0

🤖 Đánh giá AI:
"""
    
    if match_score >= 4.0:
        email_body += "• Rất phù hợp - Nên ưu tiên xem xét\n"
    elif match_score >= 3.0:
        email_body += "• Phù hợp - Đáng để xem xét\n"
    elif match_score >= 2.0:
        email_body += "• Tương đối phù hợp - Cần xem xét kỹ hơn\n"
    else:
        email_body += "• Ít phù hợp - Có thể không đáp ứng yêu cầu\n"
    
    email_body += f"""
Bạn có thể xem chi tiết và quản lý ứng viên tại: {settings.FRONTEND_URL}/employer/jobs/{application.job.id}/applicants

Trân trọng,
Đội ngũ JobBoard
"""
    
    try:
        send_mail(
            subject=subject,
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employer.email],
            fail_silently=False,
        )
        print(f"✓ AI processing email sent to {employer.email}")
        return True
    except Exception as e:
        print(f"✗ Error sending AI processing email to {employer.email}: {e}")
        return False