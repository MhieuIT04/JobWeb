"""
API Views for AI Processing Status and Management
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models import Application, Job
from .tasks import process_application_ai_async, batch_process_applications
from .ai_services import job_matching_service
from notifications.utils import notify_ai_processing_complete, send_ai_processing_email

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_processing_status(request, application_id):
    """
    Kiểm tra trạng thái AI processing của một application
    """
    application = get_object_or_404(Application, id=application_id)
    
    # Check permissions
    if request.user != application.user and request.user != application.job.employer:
        return Response(
            {'error': 'Không có quyền truy cập'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    response_data = {
        'application_id': application.id,
        'ai_processed': application.ai_processed_at is not None,
        'ai_processed_at': application.ai_processed_at,
        'match_score': application.match_score,
        'skills_extracted': application.skills_extracted,
    }
    
    if application.ai_processed_at:
        response_data['status'] = 'completed'
        response_data['match_score_display'] = f"{application.match_score}/5.0" if application.match_score else "N/A"
    else:
        # Check if processing is in progress
        time_since_application = timezone.now() - application.applied_at
        if time_since_application < timedelta(minutes=5):
            response_data['status'] = 'processing'
            response_data['message'] = 'AI đang phân tích hồ sơ...'
        else:
            response_data['status'] = 'pending'
            response_data['message'] = 'Chờ xử lý AI'
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_ai_processing(request, application_id):
    """
    Thử lại AI processing cho một application
    """
    application = get_object_or_404(Application, id=application_id)
    
    # Check permissions (only employer or admin can retry)
    if request.user != application.job.employer and not request.user.is_staff:
        return Response(
            {'error': 'Không có quyền thực hiện'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Reset AI fields
        application.ai_processed_at = None
        application.match_score = None
        application.skills_extracted = None
        application.save()
        
        # Queue new AI processing
        task = process_application_ai_async.delay(application.id)
        
        return Response({
            'success': True,
            'message': 'Đã khởi động lại AI processing',
            'task_id': task.id,
            'application_id': application.id
        })
        
    except Exception as e:
        return Response(
            {'error': f'Lỗi khi khởi động lại AI processing: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def batch_ai_processing(request, job_id):
    """
    Xử lý AI hàng loạt cho tất cả applications của một job
    """
    job = get_object_or_404(Job, id=job_id)
    
    # Check permissions (only employer or admin)
    if request.user != job.employer and not request.user.is_staff:
        return Response(
            {'error': 'Không có quyền thực hiện'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get unprocessed applications
    unprocessed_applications = Application.objects.filter(
        job=job,
        ai_processed_at__isnull=True
    )
    
    if not unprocessed_applications.exists():
        return Response({
            'message': 'Tất cả ứng viên đã được phân tích AI',
            'processed_count': 0
        })
    
    try:
        # Queue batch processing
        task_results = []
        for application in unprocessed_applications:
            task = process_application_ai_async.delay(application.id)
            task_results.append({
                'application_id': application.id,
                'task_id': task.id
            })
        
        return Response({
            'success': True,
            'message': f'Đã khởi động AI processing cho {len(task_results)} ứng viên',
            'queued_count': len(task_results),
            'tasks': task_results
        })
        
    except Exception as e:
        return Response(
            {'error': f'Lỗi khi khởi động batch AI processing: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_statistics(request, job_id=None):
    """
    Thống kê AI processing
    """
    if job_id:
        job = get_object_or_404(Job, id=job_id)
        
        # Check permissions
        if request.user != job.employer and not request.user.is_staff:
            return Response(
                {'error': 'Không có quyền truy cập'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(job=job)
    else:
        # Admin can see all statistics
        if not request.user.is_staff:
            return Response(
                {'error': 'Không có quyền truy cập'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.all()
    
    total_applications = applications.count()
    processed_applications = applications.filter(ai_processed_at__isnull=False)
    processed_count = processed_applications.count()
    
    # Calculate statistics
    stats = {
        'total_applications': total_applications,
        'processed_count': processed_count,
        'pending_count': total_applications - processed_count,
        'processing_rate': (processed_count / total_applications * 100) if total_applications > 0 else 0,
    }
    
    if processed_count > 0:
        # Match score statistics
        scores = [app.match_score for app in processed_applications if app.match_score is not None]
        if scores:
            stats.update({
                'avg_match_score': sum(scores) / len(scores),
                'max_match_score': max(scores),
                'min_match_score': min(scores),
                'high_match_count': len([s for s in scores if s >= 4.0]),
                'medium_match_count': len([s for s in scores if 2.5 <= s < 4.0]),
                'low_match_count': len([s for s in scores if s < 2.5]),
            })
    
    return Response(stats)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_ai_processing(request, application_id):
    """
    Xử lý AI thủ công (synchronous) cho testing
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Chỉ admin mới có thể thực hiện'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    application = get_object_or_404(Application, id=application_id)
    
    try:
        # Process synchronously
        ai_result = job_matching_service.analyze_application(application)
        
        if ai_result['success']:
            # Send notifications
            notify_ai_processing_complete(application)
            send_ai_processing_email(application, application.match_score)
            
            return Response({
                'success': True,
                'message': 'AI processing hoàn tất',
                'match_score': ai_result['match_score'],
                'skills_extracted': ai_result['skills_extracted']
            })
        else:
            return Response(
                {'error': ai_result.get('error', 'AI processing failed')}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': f'Lỗi khi xử lý AI: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )