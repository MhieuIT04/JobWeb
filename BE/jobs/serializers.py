# jobs/serializers.py

from rest_framework import serializers
from .models import Job, Category, WorkType, JobSkill, Application, Favorite
from users.models import City, Skill
from users.serializers import ProfileSerializer, EmployerSerializer

# ===================================================================
# 1. CÁC SERIALIZER CƠ BẢN (DÙNG ĐỂ LỒNG VÀO CÁC SERIALIZER KHÁC)
# ===================================================================

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class WorkTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkType
        fields = ['id', 'name']

class CategorySerializer(serializers.ModelSerializer):
    job_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'name_en', 'is_hot', 'job_count']


# ===================================================================
# 2. SERIALIZER CHO JOB
# ===================================================================

class JobSerializer(serializers.ModelSerializer):
    """Serializer để đọc (GET) thông tin chi tiết của Job."""
    category = CategorySerializer(read_only=True)
    work_type = WorkTypeSerializer(read_only=True)
    city = CitySerializer(read_only=True)
    employer = EmployerSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True, source='skill_set')
    logo = serializers.ImageField(required=False, allow_null=True)
    applicants_count = serializers.SerializerMethodField()
    headline = serializers.SerializerMethodField()
    employer_avg_rating = serializers.FloatField(read_only=True)
    
    def get_applicants_count(self, obj):
        """Trả về số lượng ứng viên đã ứng tuyển"""
        return obj.application_set.count()
    
    def get_headline(self, obj):
        return getattr(obj, 'headline', None)
    
    class Meta:
        model = Job
        fields = '__all__' # An toàn khi đã định nghĩa các field lồng nhau là read_only


class JobWriteSerializer(serializers.ModelSerializer):
    """Serializer để ghi (POST/PUT) thông tin Job."""
    logo = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = Job
        # Liệt kê các trường cho phép nhà tuyển dụng ghi
        fields = [
            'title', 'title_en', 'description', 'description_en',
            'min_salary', 'max_salary', 'currency', 'expires_at',
            'category', 'work_type', 'city', 'logo'
            # employer và status sẽ được gán tự động trong view
        ]


# ===================================================================
# 3. SERIALIZER CHO APPLICATION
# ===================================================================

class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer để đọc (GET) danh sách Application."""
    user_profile = ProfileSerializer(source='user.profile', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    employer_id = serializers.IntegerField(source='job.employer.id', read_only=True)
    employer_company = serializers.CharField(source='job.employer.profile.company_name', read_only=True)
    
    # AI fields
    match_score = serializers.FloatField(read_only=True)
    skills_extracted = serializers.JSONField(read_only=True)
    ai_processed_at = serializers.DateTimeField(read_only=True)
    match_score_display = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id', 'user_profile', 'job_title', 'job_id', 'employer_id', 'employer_company', 
                 'cover_letter', 'cv', 'status', 'applied_at', 'match_score', 'skills_extracted', 
                 'ai_processed_at', 'match_score_display']
    
    def get_match_score_display(self, obj):
        """Return formatted match score"""
        if obj.match_score is not None:
            return f"{obj.match_score}/5.0"
        return "Chưa phân tích"


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer chỉ để tạo (POST) Application."""
    class Meta:
        model = Application
        # Client chỉ cần gửi 3 trường này
        fields = ['job', 'cover_letter', 'cv']

    def validate_job(self, job):
        if job.status != 'approved':
            raise serializers.ValidationError("Công việc này không còn mở để ứng tuyển.")
        return job

    def create(self, validated_data):
        from notifications.utils import notify_employer_new_application
        from .ai_services import job_matching_service
        
        user = self.context['request'].user
        job = validated_data['job']
        
        if Application.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError({"detail": "Bạn đã ứng tuyển vào công việc này rồi."})
        
        # Tạo application
        application = Application.objects.create(user=user, **validated_data)
        
        # AI Processing - Queue background task for analysis
        try:
            from .tasks import process_application_ai_async
            
            # Queue AI processing as background task
            task = process_application_ai_async.delay(application.id)
            print(f"✓ AI processing queued for application {application.id}, task ID: {task.id}")
            
        except ImportError:
            # Fallback to synchronous processing if Celery not available
            try:
                ai_result = job_matching_service.analyze_application(application)
                if ai_result['success']:
                    print(f"✓ AI analysis completed (sync) for application {application.id}: {ai_result['message']}")
                else:
                    print(f"⚠ AI analysis failed (sync) for application {application.id}: {ai_result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"⚠ AI processing error (sync) for application {application.id}: {str(e)}")
                
        except Exception as e:
            print(f"⚠ Failed to queue AI processing for application {application.id}: {str(e)}")
            # Fallback to sync processing
            try:
                ai_result = job_matching_service.analyze_application(application)
                print(f"✓ AI fallback processing for application {application.id}")
            except Exception as sync_error:
                print(f"⚠ AI fallback also failed for application {application.id}: {str(sync_error)}")
        
        # Gửi thông báo và email cho nhà tuyển dụng
        try:
            notify_employer_new_application(application)
            print(f"✓ Notification sent to employer for application {application.id}")
        except Exception as e:
            print(f"✗ Error sending notification to employer: {e}")
            # Không raise exception để không ảnh hưởng đến việc tạo application
        
        return application


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer siêu nhỏ chỉ để cập nhật (PATCH) trường 'status'."""
    class Meta:
        model = Application
        fields = ['status'] # Chỉ cho phép trường 'status' được gửi lên


# ===================================================================
# 4. SERIALIZER CHO FAVORITE
# ===================================================================

class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer để đọc và ghi Favorite."""
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'job', 'job_id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        job_id = validated_data.pop('job_id')
        favorite, created = Favorite.objects.get_or_create(user=user, job_id=job_id)
        return favorite