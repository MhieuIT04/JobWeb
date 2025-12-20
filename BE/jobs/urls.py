from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    JobViewSet, ApplicationListCreateView, ApplicationViewSet, FavoriteViewSet,
    CategoryListAPIView, EmployerJobViewSet, JobApplicationListView,
    ApplicationUpdateView, WorkTypeListAPIView, TopCategoryAPIView,
    TopCompanyAPIView, HotJobsListView, JobRecommendationView,PredictCategoryView, TrendingJobs24hView,
    health_check
)
from .dashboard_views import employer_dashboard_stats, candidate_dashboard_stats
from .ai_views import (
    ai_processing_status, retry_ai_processing, batch_ai_processing,
    manual_ai_processing, ai_statistics, analyze_cv_and_recommend_jobs
)

# Router chỉ dùng cho các ViewSet phức tạp
router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorites')
router.register(r'employer/jobs', EmployerJobViewSet, basename='employer-job')
router.register(r'applications', ApplicationViewSet, basename='applications')

urlpatterns = [
    # Health check endpoint
    path('health/', health_check, name='health-check'),
    
    # --- CÁC URL CÔNG KHAI (PUBLIC) ---
    # Đặt các URL cụ thể hơn lên trên

    # GET /api/jobs/hot/
    path('hot/', HotJobsListView.as_view(), name='hot-job-list'),
    
    # GET /api/jobs/top-categories/
    path('top-categories/', TopCategoryAPIView.as_view(), name='top-categories'),
    path('trending-24h/', TrendingJobs24hView.as_view(), name='trending-24h'),
    
    # GET /api/jobs/categories/
    path('categories/', CategoryListAPIView.as_view(), name='category-list-public'),
    
    # GET /api/jobs/work-types/
    path('work-types/', WorkTypeListAPIView.as_view(), name='worktype-list'),

    # GET /api/jobs/{job_id}/recommendations/
    # Bỏ 'jobs/' ở đầu để không bị lặp
    path('<int:job_id>/recommendations/', JobRecommendationView.as_view(), name='job-recommendations'),
    
    path('predict-category/', PredictCategoryView.as_view(), name='predict-category'),
    
    # GET /api/jobs/{pk}/ (Chi tiết một job)
    path('<int:pk>/', JobViewSet.as_view({'get': 'retrieve'}), name='job-detail'),
    
    # GET /api/jobs/ (Danh sách jobs) - ĐẶT Ở CUỐI CÙNG trong nhóm này
    path('', JobViewSet.as_view({'get': 'list'}), name='job-list'),


    # --- CÁC URL CẦN XÁC THỰC (PRIVATE) ---
    # URL này sẽ được include từ file urls.py gốc, không cần tiền tố 'api/jobs' ở đây
    
    # GET /api/jobs/employer/jobs/{job_id}/applications/
    path('employer/jobs/<int:job_id>/applications/', JobApplicationListView.as_view(), name='job-application-list'),
    
    # PATCH /api/jobs/applications/{pk}/update/
    path('applications/<int:pk>/update/', ApplicationUpdateView.as_view(), name='application-update'),
    
    # GET, POST /api/jobs/applications/
    path('applications/', ApplicationListCreateView.as_view(), name='application-list-create'),
    
    # Dashboard Statistics APIs
    path('dashboard/employer/stats/', employer_dashboard_stats, name='employer-dashboard-stats'),
    path('dashboard/candidate/stats/', candidate_dashboard_stats, name='candidate-dashboard-stats'),
    
    # AI Processing APIs
    path('ai/status/<int:application_id>/', ai_processing_status, name='ai-processing-status'),
    path('ai/retry/<int:application_id>/', retry_ai_processing, name='retry-ai-processing'),
    path('ai/batch/<int:job_id>/', batch_ai_processing, name='batch-ai-processing'),
    path('ai/manual/<int:application_id>/', manual_ai_processing, name='manual-ai-processing'),
    path('ai/stats/', ai_statistics, name='ai-statistics'),
    path('ai/stats/<int:job_id>/', ai_statistics, name='ai-statistics-job'),
    path('ai/analyze-cv/', analyze_cv_and_recommend_jobs, name='analyze-cv-recommend-jobs'),
    
    # Include các URL của router (favorites, employer/jobs)
    path('', include(router.urls)),
]