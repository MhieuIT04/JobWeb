# users/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count # Import Count

# Import các model và serializer cần thiết từ app 'users'
from .models import Profile, City, Skill
from .serializers import (
    UserSerializer, 
    ProfileSerializer, 
    CitySerializer, 
    SkillSerializer, 
    MyTokenObtainPairSerializer,
    EmployerSerializer
)

# Lấy Custom User Model một cách an toàn
from django.contrib.auth import get_user_model
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
        .annotate(job_count=Count('job'))\
        .filter(job_count__gt=0)\
        .order_by('-job_count')[:6] # Sắp xếp giảm dần và lấy 6 công ty hàng đầu
    
    serializer_class = EmployerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None