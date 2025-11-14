from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    JobViewSet, ApplicationListCreateView, FavoriteViewSet,
    CategoryListAPIView, EmployerJobViewSet, JobApplicationListView,
    ApplicationUpdateView, WorkTypeListAPIView, TopCategoryAPIView,
    TopCompanyAPIView, HotJobsListView, JobRecommendationView,PredictCategoryView, TrendingJobs24hView
)
from .dashboard_views import employer_dashboard_stats, candidate_dashboard_stats

# Router chỉ dùng cho các ViewSet phức tạp
router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorites')
router.register(r'employer/jobs', EmployerJobViewSet, basename='employer-job')

urlpatterns = [
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
    
    # Include các URL của router (favorites, employer/jobs)
    path('', include(router.urls)),
]