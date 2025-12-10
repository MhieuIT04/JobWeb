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
from .ai_services import job_matching_service, CVAnalysisService
from .serializers import JobSerializer
from notifications.utils import notify_ai_processing_complete, send_ai_processing_email
import logging

logger = logging.getLogger(__name__)

# Import tasks only if available
try:
    from .tasks import process_application_ai_async, batch_process_applications
    HAS_CELERY_TASKS = True
except ImportError:
    HAS_CELERY_TASKS = False

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
        
        if HAS_CELERY_TASKS:
            # Queue new AI processing
            task = process_application_ai_async.delay(application.id)
            return Response({
                'success': True,
                'message': 'Đã khởi động lại AI processing (async)',
                'task_id': task.id,
                'application_id': application.id
            })
        else:
            # Process synchronously if no Celery
            ai_result = job_matching_service.analyze_application(application)
            return Response({
                'success': True,
                'message': 'AI processing hoàn tất (sync)',
                'match_score': ai_result.get('match_score'),
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
        if HAS_CELERY_TASKS:
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
                'message': f'Đã khởi động AI processing cho {len(task_results)} ứng viên (async)',
                'queued_count': len(task_results),
                'tasks': task_results
            })
        else:
            # Process synchronously if no Celery
            results = []
            for application in unprocessed_applications:
                try:
                    ai_result = job_matching_service.analyze_application(application)
                    results.append({
                        'application_id': application.id,
                        'success': ai_result['success'],
                        'match_score': ai_result.get('match_score')
                    })
                except Exception as e:
                    results.append({
                        'application_id': application.id,
                        'success': False,
                        'error': str(e)
                    })
            
            return Response({
                'success': True,
                'message': f'AI processing hoàn tất cho {len(results)} ứng viên (sync)',
                'processed_count': len(results),
                'results': results
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_cv_and_recommend_jobs(request):
    """
    Phân tích CV và đề xuất công việc phù hợp
    """
    if 'cv_file' not in request.FILES:
        return Response(
            {'error': 'Vui lòng tải lên file CV'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    cv_file = request.FILES['cv_file']
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if cv_file.content_type not in allowed_types:
        return Response(
            {'error': 'Chỉ chấp nhận file PDF, DOC, DOCX'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate file size (10MB max)
    if cv_file.size > 10 * 1024 * 1024:
        return Response(
            {'error': 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        cv_analyzer = CVAnalysisService()
        
        # Extract text from CV file
        cv_text = cv_analyzer.extract_text_from_file(cv_file)
        if not cv_text:
            return Response(
                {'error': 'Không thể đọc nội dung CV. Vui lòng kiểm tra file'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract skills from CV
        extracted_skills = cv_analyzer.extract_skills_from_text(cv_text)
        
        # Get all approved jobs
        active_jobs = Job.objects.filter(status='approved')
        
        # Calculate match scores for each job
        job_matches = []
        for job in active_jobs:
            match_score = cv_analyzer.calculate_match_score(extracted_skills, job.description)
            if match_score > 1.0:  # Only include jobs with reasonable match
                job_matches.append({
                    'job': job,
                    'match_score': match_score,
                    'match_percentage': min(match_score * 20, 100)  # Convert to percentage (max 100%)
                })
        
        # Sort by match score (highest first)
        job_matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Limit to top 10 matches
        top_matches = job_matches[:10]
        
        # Serialize job data
        recommended_jobs = []
        for match in top_matches:
            job_data = JobSerializer(match['job']).data
            job_data['match_score'] = round(match['match_score'], 2)
            job_data['match_percentage'] = round(match['match_percentage'], 1)
            recommended_jobs.append(job_data)
        
        return Response({
            'success': True,
            'cv_analysis': {
                'skills_extracted': extracted_skills,
                'skills_count': len(extracted_skills),
                'cv_text_length': len(cv_text),
                'analysis_summary': f"Tìm thấy {len(extracted_skills)} kỹ năng trong CV của bạn"
            },
            'recommended_jobs': recommended_jobs,
            'total_matches': len(job_matches),
            'message': f"Tìm thấy {len(top_matches)} công việc phù hợp với CV của bạn"
        })
        
    except Exception as e:
        logger.error(f"Error analyzing CV: {str(e)}")
        return Response(
            {'error': f'Lỗi khi phân tích CV: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )