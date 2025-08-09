# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import uuid
# Import các model từ file models.py của app này
from .models import Profile, City, Skill

# Lấy Custom User Model một cách an toàn
User = get_user_model()

# ===================================================================
# Serializers cho các Model chung
# ===================================================================

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


# ===================================================================
# Serializers cho User và Authentication
# ===================================================================

# users/serializers.py

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False, 'allow_blank': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
        email=validated_data['email'],
        password=validated_data['password'],
        # Dùng một chuỗi duy nhất cho username để tránh xung đột
        username=validated_data.get('username') or str(uuid.uuid4()),
        role=validated_data.get('role', 'candidate'),
        is_active=True
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Tùy chỉnh TokenObtainPairSerializer để thêm thông tin user vào response của token.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Thêm các thông tin tùy chỉnh vào token payload
        token['email'] = user.email
        token['role'] = user.role
        # ... bạn có thể thêm bất kỳ thông tin nào khác

        return token

    # Ghi đè phương thức validate để trả về thêm thông tin user cùng với token
    def validate(self, attrs):
        data = super().validate(attrs)

        # Thêm thông tin người dùng vào response cuối cùng
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role
        }
        return data


# ===================================================================
# Serializer cho Profile
# ===================================================================

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc xem và cập nhật Profile.
    """
    # Lấy email từ User model liên quan để hiển thị
    email = serializers.EmailField(source='user.email', read_only=True)
    
    # Hiển thị thông tin chi tiết của City và Skills (chỉ đọc)
    city = CitySerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

    # Thêm các trường chỉ dùng để ghi (write-only) để cập nhật ForeignKey và ManyToMany
    city_id = serializers.IntegerField(write_only=True, required=False, allow_null=True, source='city')
    skill_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, source='skills'
    )

    class Meta:
        model = Profile
        fields = [
            'first_name', 'last_name', 'avatar', 'phone_number',
            'bio', 'email', 'city', 'skills', 'city_id', 'skill_ids','company_name','logo'
        ]

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
    
# users/serializers.py
class EmployerSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='profile.company_name', read_only=True)
    logo = serializers.ImageField(source='profile.logo', read_only=True)
    job_count = serializers.IntegerField(read_only=True) # <-- THÊM DÒNG NÀY

    class Meta:
        model = User
        fields = ['id', 'company_name', 'logo', 'email', 'job_count']