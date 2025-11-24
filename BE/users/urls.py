# users/urls.py (KIỂM TRA LẠI)

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    CityListAPIView,
    SkillListAPIView,
    TopCompaniesListView,
    AllCompaniesListView,
    EmployerDetailView,
    CVParseView,
    CVMatchJobsView,
    EmployerReviewListCreateView,
    EmployerReviewDetailView,
    ChatThreadListCreateView,
    ChatMessageListCreateView,
    ChatThreadMarkReadView,
    ChatUnreadCountView,
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
    path('companies/', AllCompaniesListView.as_view(), name='company-list'),
    path('employers/<int:pk>/', EmployerDetailView.as_view(), name='employer-detail'),

    # CV parsing & matching
    path('cv/parse/', CVParseView.as_view(), name='cv-parse'),
    path('cv/match-jobs/', CVMatchJobsView.as_view(), name='cv-match-jobs'),

    # Employer reviews
    path('employers/<int:employer_id>/reviews/', EmployerReviewListCreateView.as_view(), name='employer-review-list-create'),
    path('reviews/<int:pk>/', EmployerReviewDetailView.as_view(), name='employer-review-detail'),

    # Chat / Messaging
    path('chat/threads/', ChatThreadListCreateView.as_view(), name='chat-thread-list-create'),
    path('chat/threads/<int:thread_id>/messages/', ChatMessageListCreateView.as_view(), name='chat-message-list-create'),
    path('chat/threads/<int:thread_id>/read/', ChatThreadMarkReadView.as_view(), name='chat-thread-mark-read'),
    path('chat/unread-count/', ChatUnreadCountView.as_view(), name='chat-unread-count'),
]
