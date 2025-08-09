# users/urls.py (KIỂM TRA LẠI)

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    CityListAPIView,
    SkillListAPIView,
    TopCompaniesListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # URL cho danh sách Cities
    path('cities/', CityListAPIView.as_view(), name='city-list'),
    
    path('skills/', SkillListAPIView.as_view(), name='skill-list'),
    path('companies/top/', TopCompaniesListView.as_view(), name='top-company-list'),
]
