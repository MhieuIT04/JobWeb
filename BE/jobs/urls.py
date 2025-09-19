# jobs/urls.py (PHIÊN BẢN CHUẨN)

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    JobViewSet,
    ApplicationListCreateView,
    FavoriteViewSet,
    CategoryListAPIView,
    EmployerJobViewSet,
    JobApplicationListView,
    ApplicationUpdateView,
    WorkTypeListAPIView,
    TopCategoryAPIView,
    TopCompanyAPIView,
    HotJobsListView,
    JobRecommendationView
)

# Router chỉ dùng cho Favorite, nơi cần các hành động phức tạp
router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorites')
router.register(r'employer/jobs', EmployerJobViewSet, basename='employer-job')

urlpatterns = [
    # Định nghĩa tường minh cho API JOBS
    path(
        'employer/jobs/<int:job_id>/applications/', 
        JobApplicationListView.as_view(), 
        name='job-application-list'
    ),
    
    path(
        'applications/<int:pk>/update/',
        ApplicationUpdateView.as_view(),
        name='application-update'
    ),
    # Các API cần xác thực
    path('applications/', ApplicationListCreateView.as_view(), name='application-list-create'),
    
    path('', JobViewSet.as_view({'get': 'list'}), name='job-list'),
    
    path('<int:pk>/', JobViewSet.as_view({'get': 'retrieve'}), name='job-detail'),
    
    # Định nghĩa tường minh cho API CATEGORIES
    path('categories/', CategoryListAPIView.as_view(), name='category-list-public'),

    # Endpoint nổi bật (rút gọn path)
    path('jobs/hot/', HotJobsListView.as_view(), name='hot-job-list'),
    path('top-companies/', TopCompanyAPIView.as_view(), name='top-companies'),
    path('top-categories/', TopCategoryAPIView.as_view(), name='top-categories'),
    
    path('work-types/', WorkTypeListAPIView.as_view(), name='worktype-list'),
    
    
    # Bao gồm URL của router cho favorites
    path('', include(router.urls)),
    path('jobs/<int:job_id>/recommendations/', JobRecommendationView.as_view(), name='job-recommendations')
    

    
]