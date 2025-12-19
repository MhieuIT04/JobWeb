# users/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count # Import Count
from rest_framework.views import APIView
from jobs.models import Job
from .cv_utils import parse_cv, score_job_against_skills, score_job_combined, score_job_by_text_overlap


# Import các model và serializer cần thiết từ app 'users'
from .models import Profile, City, Skill, EmployerReview, ChatThread, ChatMessage, normalized_pair
from .serializers import (
    UserSerializer, 
    ProfileSerializer, 
    CitySerializer, 
    SkillSerializer, 
    MyTokenObtainPairSerializer,
    EmployerSerializer,
    EmployerReviewSerializer,
    ChatThreadSerializer,
    ChatMessageSerializer
)

# Lấy Custom User Model một cách an toàn
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.db.models.functions import Now
from jobs.models import Application
from rest_framework.exceptions import PermissionDenied
User = get_user_model()


# ===================================================================
# Views cho Authentication (Đăng ký, Đăng nhập)
# ===================================================================

class RegisterView(generics.CreateAPIView):
    """
    API để đăng ký một tài khoản người dùng mới.
    Ai cũng có thể truy cập.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """
    API để đăng nhập.
    Thay thế cho MyTokenObtainPairView cũ và LoginView tự viết.
    Khi người dùng gửi POST request với 'email' và 'password',
    nó sẽ sử dụng MyTokenObtainPairSerializer để xác thực và trả về token.
    """
    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


# ===================================================================
# View cho Profile người dùng
# ===================================================================

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    API để xem (GET) và cập nhật (PUT/PATCH) hồ sơ của người dùng đang đăng nhập.
    Yêu cầu người dùng phải được xác thực.
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        """
        Ghi đè phương thức này để trả về profile của người dùng
        đang thực hiện request, thay vì tìm kiếm bằng pk trong URL.
        """
        # self.request.user đã được xác thực bởi JWTAuthentication
        # .profile là reverse accessor từ OneToOneField
        return self.request.user.profile


# ===================================================================
# Views cho các Model chung (City, Skill)
# ===================================================================

class CityListAPIView(generics.ListAPIView):
    """
    API để lấy danh sách tất cả các thành phố.
    Ai cũng có thể truy cập.
    """
    queryset = City.objects.all().order_by('name') # Sắp xếp theo tên cho dễ nhìn
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Không phân trang danh sách Cities


class SkillListAPIView(generics.ListAPIView):
    """
    API để lấy danh sách tất cả các kỹ năng.
    Ai cũng có thể truy cập.
    """
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    
class TopCompaniesListView(generics.ListAPIView):
    """
    API để lấy danh sách các công ty/nhà tuyển dụng hàng đầu,
    sắp xếp theo số lượng công việc đã đăng.
    """
    # Lấy các user có vai trò 'employer' và đang active
    queryset = User.objects.filter(role='employer', is_active=True)\
        .annotate(
            job_count=Count('job'),
            avg_rating=Avg('employer_reviews__overall_rating', filter=Q(employer_reviews__verified=True)),
            review_count=Count('employer_reviews', filter=Q(employer_reviews__verified=True))
        )\
        .filter(job_count__gt=0)\
        .order_by('-job_count')[:6] # Sắp xếp giảm dần và lấy 6 công ty hàng đầu
    
    serializer_class = EmployerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
class AllCompaniesListView(generics.ListAPIView):
    serializer_class = EmployerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        order = self.request.query_params.get('order', 'jobs')
        qs = User.objects.filter(role='employer', is_active=True).annotate(
            job_count=Count('job'),
            avg_rating=Avg('employer_reviews__overall_rating', filter=Q(employer_reviews__verified=True)),
            review_count=Count('employer_reviews', filter=Q(employer_reviews__verified=True))
        ).filter(job_count__gt=0)
        if order == 'rating':
            qs = qs.order_by('-avg_rating', '-review_count')
        else:
            qs = qs.order_by('-job_count')
        return qs


class EmployerDetailView(generics.RetrieveAPIView):
    """API để lấy thông tin chi tiết của một employer"""
    serializer_class = EmployerSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'

    def get_queryset(self):
        return User.objects.filter(role='employer', is_active=True).annotate(
            job_count=Count('job'),
            avg_rating=Avg('employer_reviews__overall_rating', filter=Q(employer_reviews__verified=True)),
            review_count=Count('employer_reviews', filter=Q(employer_reviews__verified=True))
        )


class CVParseView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj = request.FILES.get('cv')
        if not file_obj:
            return Response({'detail': 'Vui lòng upload file CV (pdf/docx/txt).'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            parsed = parse_cv(file_obj)
            return Response(parsed)
        except Exception as e:
            return Response({'detail': f'Lỗi parse CV: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CVMatchJobsView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        # Accept either uploaded cv OR provided skills list
        skills = request.data.getlist('skills') or request.data.get('skills')
        if isinstance(skills, str):
            # comma separated
            skills = [s.strip() for s in skills.split(',') if s.strip()]
        parsed = None
        if not skills:
            file_obj = request.FILES.get('cv')
            if not file_obj:
                return Response({'detail': 'Vui lòng upload CV hoặc truyền danh sách skills.'}, status=status.HTTP_400_BAD_REQUEST)
            parsed = parse_cv(file_obj)
            skills = parsed.get('skills', [])
        raw_cv_text = None
        if parsed:
            raw_cv_text = parsed.get('raw_text')
        
        # Score all approved jobs
        jobs_qs = Job.objects.filter(status='approved').select_related('employer', 'category', 'city').prefetch_related('jobskill_set__skill')
        results = []
        for job in jobs_qs[:1000]:  # cap for performance
            score = score_job_combined(job, skills)
            # Fallback: if skills bring almost no signal, use text-overlap with raw CV text
            if score <= 0 and raw_cv_text:
                desc = (job.description or '') + '\n' + (job.title or '')
                score = score_job_by_text_overlap(raw_cv_text, desc)
            # Keep low-score results to avoid empty recommendations but filter out zeros
            if score <= 0:
                continue
            results.append({
                'id': job.id,
                'title': job.title,
                'company_name': getattr(getattr(job.employer, 'profile', None), 'company_name', job.employer.email),
                'city': getattr(job.city, 'name', None),
                'category': getattr(job.category, 'name', None),
                'score': score,
            })
        # sort by score desc
        results.sort(key=lambda x: x['score'], reverse=True)
        return Response({
            'skills_used': skills,
            'parsed': parsed,
            'results': results[:50]
        })


class EmployerReviewListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = EmployerReviewSerializer

    def get_queryset(self):
        employer_id = self.kwargs['employer_id']
        return EmployerReview.objects.filter(employer_id=employer_id).select_related('reviewer').order_by('-created_at')

    def perform_create(self, serializer):
        employer_id = self.kwargs['employer_id']
        # verify: only candidates who have applied to any job of this employer can review
        user = self.request.user
        if getattr(user, 'role', None) != 'candidate':
            raise PermissionDenied('Only candidates can submit reviews')
        applied = Application.objects.filter(user=user, job__employer_id=employer_id).exists()
        serializer.save(reviewer=user, employer_id=employer_id, verified=applied)


class EmployerReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EmployerReviewSerializer

    def get_queryset(self):
        # Only allow a reviewer to update/delete his own review
        return EmployerReview.objects.filter(reviewer=self.request.user)


class ChatThreadListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatThreadSerializer

    def get_queryset(self):
        user = self.request.user
        return ChatThread.objects.filter(Q(participant_a=user) | Q(participant_b=user)).order_by('-created_at')

    def perform_create(self, serializer):
        try:
            other_user_id = int(self.request.data.get('user_id'))
        except Exception:
            raise PermissionDenied('user_id is required')
        me = self.request.user.id
        a, b = normalized_pair(me, other_user_id)
        obj, _ = ChatThread.objects.get_or_create(participant_a_id=a, participant_b_id=b)
        # Return existing object if already exists
        serializer.instance = obj


class ChatMessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatMessageSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        thread_id = self.kwargs['thread_id']
        user = self.request.user
        # Ensure user is a participant
        ChatThread.objects.get(Q(id=thread_id) & (Q(participant_a=user) | Q(participant_b=user)))
        return ChatMessage.objects.filter(thread_id=thread_id).select_related('sender').order_by('created_at')

    def perform_create(self, serializer):
        thread_id = self.kwargs['thread_id']
        serializer.save(sender=self.request.user, thread_id=thread_id)


class ChatThreadMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, thread_id):
        # authorize participation
        ChatThread.objects.get(Q(id=thread_id) & (Q(participant_a=request.user) | Q(participant_b=request.user)))
        ChatMessage.objects.filter(thread_id=thread_id).exclude(sender=request.user).update(read_at=Now())
        return Response({'status': 'ok'})


class ChatUnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        threads = ChatThread.objects.filter(Q(participant_a=user) | Q(participant_b=user)).values_list('id', flat=True)
        count = ChatMessage.objects.filter(thread_id__in=list(threads), sender__ne=user).filter(read_at__isnull=True).exclude(sender=user).count()
        # The sender__ne is not valid in Django; use exclude instead
        count = ChatMessage.objects.filter(thread_id__in=list(threads)).exclude(sender=user).filter(read_at__isnull=True).count()
        return Response({'unread': count})

class UserSearchView(APIView):
    """
    API để search users cho messaging system
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if not query:
            return Response([])
        
        # Search users by email, first_name, last_name, company_name
        users = User.objects.filter(
            Q(email__icontains=query) |
            Q(profile__first_name__icontains=query) |
            Q(profile__last_name__icontains=query) |
            Q(profile__company_name__icontains=query)
        ).exclude(id=request.user.id).select_related('profile')[:10]
        
        results = []
        for user in users:
            profile = getattr(user, 'profile', None)
            results.append({
                'id': user.id,
                'email': user.email,
                'name': f"{profile.first_name} {profile.last_name}".strip() if profile else user.email,
                'company_name': profile.company_name if profile else None,
                'role': user.role,
                'avatar': profile.avatar.url if profile and profile.avatar else None,
            })
        
        return Response(results)

class JobSeekersListView(generics.ListAPIView):
    """
    API để lấy danh sách job seekers cho messaging
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        search = self.request.GET.get('search', '').strip()
        queryset = User.objects.filter(role='job_seeker').exclude(id=self.request.user.id).select_related('profile')
        
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(profile__first_name__icontains=search) |
                Q(profile__last_name__icontains=search)
            )
        
        return queryset[:20]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        results = []
        
        for user in queryset:
            profile = getattr(user, 'profile', None)
            results.append({
                'id': user.id,
                'email': user.email,
                'full_name': f"{profile.first_name} {profile.last_name}".strip() if profile else user.email,
                'avatar': profile.avatar.url if profile and profile.avatar else None,
                'role': 'job_seeker'
            })
        
        return Response(results)

class EmployersListView(generics.ListAPIView):
    """
    API để lấy danh sách employers cho messaging
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        search = self.request.GET.get('search', '').strip()
        queryset = User.objects.filter(role='employer').exclude(id=self.request.user.id).select_related('profile')
        
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(profile__company_name__icontains=search)
            )
        
        return queryset[:20]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        results = []
        
        for user in queryset:
            profile = getattr(user, 'profile', None)
            results.append({
                'id': user.id,
                'email': user.email,
                'company_name': profile.company_name if profile else user.email,
                'logo': profile.logo.url if profile and profile.logo else None,
                'role': 'employer'
            })
        
        return Response(results)