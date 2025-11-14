"""
Dashboard Views for Analytics
"""
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Job, Application, Favorite


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employer_dashboard_stats(request):
    """
    API trả về thống kê cho employer dashboard:
    - Tổng số jobs
    - Jobs theo status
    - Tổng số applications
    - Applications theo thời gian (7 ngày gần nhất)
    - Top 5 jobs có nhiều applications nhất
    """
    user = request.user
    
    # 1. Tổng số jobs
    total_jobs = Job.objects.filter(employer=user).count()
    
    # 2. Jobs theo status
    jobs_by_status = Job.objects.filter(employer=user).values('status').annotate(
        count=Count('id')
    )
    status_stats = {item['status']: item['count'] for item in jobs_by_status}
    
    # 3. Tổng số applications
    total_applications = Application.objects.filter(job__employer=user).count()
    
    # 4. Applications trong 7 ngày gần nhất (grouped by date)
    seven_days_ago = timezone.now() - timedelta(days=7)
    applications_last_7_days = Application.objects.filter(
        job__employer=user,
        applied_at__gte=seven_days_ago
    ).extra(
        select={'date': 'DATE(applied_at)'}
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Convert to list for JSON serialization
    applications_timeline = [
        {
            'date': item['date'].strftime('%Y-%m-%d') if item['date'] else None,
            'count': item['count']
        }
        for item in applications_last_7_days
    ]
    
    # 5. Top 5 jobs có nhiều applications nhất
    top_jobs = Job.objects.filter(employer=user).annotate(
        applications_count=Count('application')
    ).order_by('-applications_count')[:5]
    
    top_jobs_data = [
        {
            'id': job.id,
            'title': job.title,
            'applications_count': job.applications_count,
            'status': job.status,
            'created_at': job.created_at
        }
        for job in top_jobs
    ]
    
    # 6. Applications theo status
    applications_by_status = Application.objects.filter(
        job__employer=user
    ).values('status').annotate(count=Count('id'))
    
    app_status_stats = {item['status']: item['count'] for item in applications_by_status}
    
    # 7. Thống kê trong tháng này
    first_day_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    applications_this_month = Application.objects.filter(
        job__employer=user,
        applied_at__gte=first_day_of_month
    ).count()
    
    jobs_this_month = Job.objects.filter(
        employer=user,
        created_at__gte=first_day_of_month
    ).count()
    
    return Response({
        'total_jobs': total_jobs,
        'jobs_by_status': status_stats,
        'total_applications': total_applications,
        'applications_timeline': applications_timeline,
        'top_jobs': top_jobs_data,
        'applications_by_status': app_status_stats,
        'this_month': {
            'applications': applications_this_month,
            'jobs': jobs_this_month
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def candidate_dashboard_stats(request):
    """
    API trả về thống kê cho candidate dashboard:
    - Tổng số jobs đã apply
    - Applications theo status
    - Saved jobs
    - Applications theo thời gian
    - Recent applications
    """
    user = request.user
    
    # 1. Tổng số jobs đã apply
    total_applications = Application.objects.filter(user=user).count()
    
    # 2. Applications theo status
    applications_by_status = Application.objects.filter(
        user=user
    ).values('status').annotate(count=Count('id'))
    
    status_stats = {item['status']: item['count'] for item in applications_by_status}
    
    # 3. Saved/Favorite jobs
    total_saved_jobs = Favorite.objects.filter(user=user).count()
    
    # 4. Applications trong 30 ngày gần nhất (grouped by date)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    applications_timeline = Application.objects.filter(
        user=user,
        applied_at__gte=thirty_days_ago
    ).extra(
        select={'date': 'DATE(applied_at)'}
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    timeline_data = [
        {
            'date': item['date'].strftime('%Y-%m-%d') if item['date'] else None,
            'count': item['count']
        }
        for item in applications_timeline
    ]
    
    # 5. Recent 5 applications với thông tin job
    recent_applications = Application.objects.filter(
        user=user
    ).select_related('job__employer__profile', 'job__city', 'job__category').order_by('-applied_at')[:5]
    
    recent_apps_data = [
        {
            'id': app.id,
            'job_title': app.job.title,
            'company_name': app.job.employer.profile.company_name if hasattr(app.job.employer, 'profile') else app.job.employer.email,
            'status': app.status,
            'applied_at': app.applied_at,
            'job_id': app.job.id
        }
        for app in recent_applications
    ]
    
    # 6. Thống kê trong tháng này
    first_day_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    applications_this_month = Application.objects.filter(
        user=user,
        applied_at__gte=first_day_of_month
    ).count()
    
    # 7. Success rate (accepted / total)
    accepted_count = Application.objects.filter(user=user, status='accepted').count()
    success_rate = round((accepted_count / total_applications * 100), 1) if total_applications > 0 else 0
    
    return Response({
        'total_applications': total_applications,
        'applications_by_status': status_stats,
        'total_saved_jobs': total_saved_jobs,
        'applications_timeline': timeline_data,
        'recent_applications': recent_apps_data,
        'this_month_applications': applications_this_month,
        'success_rate': success_rate
    })


