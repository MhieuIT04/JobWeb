# notifications/utils.py
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

def create_and_send_notification(application):
    user_to_notify = application.user
    job_title = application.job.title
    status = application.status
    
    if status == 'accepted':
        message = f"Chúc mừng! Đơn ứng tuyển của bạn cho vị trí '{job_title}' đã được chấp nhận."
        email_subject = f"Cập nhật trạng thái ứng tuyển: Chúc mừng!"
    elif status == 'rejected':
        message = f"Rất tiếc, đơn ứng tuyển của bạn cho vị trí '{job_title}' đã bị từ chối."
        email_subject = f"Cập nhật trạng thái ứng tuyển"
    else:
        return

    # Tạo thông báo trên web
    try:
        notification = Notification.objects.create(recipient=user_to_notify, message=message)
        print(f"--- Web notification created successfully: ID {notification.id} ---") # DEBUG 8
    except Exception as e:
        print(f"!!! ERROR creating web notification: {e}")

    # Tạo nội dung email
    Notification.objects.create(
        recipient=user_to_notify,
        message=message
    )
    
    email_body = f"""
    Chào {user_to_notify.profile.first_name or user_to_notify.email},

    {message}

    Bạn có thể xem lại lịch sử ứng tuyển của mình tại website.

    Trân trọng,
    Đội ngũ JobBoard
    """
    # Gửi email
    try:
       send_mail(
            subject=email_subject,
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_to_notify.email],
            fail_silently=False,
        )
       print(f"--- Email sent successfully to {user_to_notify.email} ---")
    except Exception as e:
        print(f"!!! ERROR sending email: {e}")