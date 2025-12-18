from django.db.models import Count, Q
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchHeadline
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Job, Application, Favorite,Category, WorkType
from .serializers import JobSerializer, ApplicationSerializer, FavoriteSerializer,CategorySerializer, JobWriteSerializer, WorkTypeSerializer, ApplicationCreateSerializer, ApplicationStatusUpdateSerializer
from notifications.models import Notification
from .pagination import CustomJobPagination
from .filters import JobFilter
from rest_framework.parsers import MultiPartParser, FormParser
from notifications.utils import create_and_send_notification
from users.models import User
from users.serializers import EmployerSerializer
from rest_framework.views import APIView
from django.utils import timezone

import pickle
import joblib
import logging
import os

logger = logging.getLogger(__name__)

# Recommendation artifacts cached in memory to avoid reloading on each request
COSINE_SIM = None
INDICES = None
JOB_DF = None

def load_recommendation_artifacts():
    """Load recommendation pickle artifacts into module-level variables once.
    If files are missing, set variables to None and log a clear message.
    """
    global COSINE_SIM, INDICES, JOB_DF
    # Already loaded
    if COSINE_SIM is not None and INDICES is not None and JOB_DF is not None:
        return
    
    # Get base directory (BE folder)
    from django.conf import settings
    base_dir = settings.BASE_DIR
    
    # Prefer ANN artifacts (hnswlib + vectors) if present
    try:
        # ANN artifacts: try to import lightweight libs, but do not hard-fail if they're absent
        import numpy as _np
        try:
            import hnswlib as _hnsw  # type: ignore
        except Exception:
            _hnsw = None

        hnsw_path = os.path.join(base_dir, 'recommendations', 'hnsw_index.bin')
        vecs_path = os.path.join(base_dir, 'recommendations', 'job_vectors.npy')
        indices_path = os.path.join(base_dir, 'recommendations', 'indices.pkl')
        jobdf_path = os.path.join(base_dir, 'recommendations', 'job_df.pkl')
        if _hnsw is not None and os.path.exists(hnsw_path) and os.path.exists(vecs_path) and os.path.exists(indices_path) and os.path.exists(jobdf_path):
            JOB_VEC = _np.load(vecs_path)
            p = _hnsw.Index(space='cosine', dim=JOB_VEC.shape[1])
            p.load_index(hnsw_path)
            # Store ANN objects under different names in module globals
            globals()['HNSW_INDEX'] = p
            globals()['JOB_VECTORS'] = JOB_VEC
            with open(indices_path, 'rb') as f:
                globals()['INDICES'] = pickle.load(f)
            with open(jobdf_path, 'rb') as f:
                globals()['JOB_DF'] = pickle.load(f)
            logger.info('Loaded ANN recommendation artifacts (hnsw index + vectors).')
            return
        # else: ANN not available or files missing -> fallthrough
    except Exception as e:
        # if ANN libs missing or artifacts not present, fallthrough to TF-IDF loading
        logger.debug(f'ANN artifacts not loaded: {e}')

    # TF-IDF / cosine fallback
    try:
        # Prefer nearest-neighbors arrays if available (avoids dense matrix)
        nn_idx_path = os.path.join(base_dir, 'recommendations', 'nn_indices.npy')
        nn_dist_path = os.path.join(base_dir, 'recommendations', 'nn_distances.npy')
        indices_path = os.path.join(base_dir, 'recommendations', 'indices.pkl')
        jobdf_path = os.path.join(base_dir, 'recommendations', 'job_df.pkl')
        
        logger.info(f'Checking NN artifacts: nn_idx={os.path.exists(nn_idx_path)}, indices={os.path.exists(indices_path)}, jobdf={os.path.exists(jobdf_path)}')
        
        if os.path.exists(nn_idx_path) and os.path.exists(indices_path) and os.path.exists(jobdf_path):
            try:
                import numpy as _np
                globals()['NN_INDICES'] = _np.load(nn_idx_path)
                globals()['NN_DISTANCES'] = _np.load(nn_dist_path) if os.path.exists(nn_dist_path) else None
                with open(indices_path, 'rb') as f:
                    globals()['INDICES'] = pickle.load(f)
                with open(jobdf_path, 'rb') as f:
                    globals()['JOB_DF'] = pickle.load(f)
                logger.info('✅ Loaded TF-IDF nearest-neighbors artifacts (nn_indices).')
                return
            except Exception as e:
                logger.error(f'❌ Error loading NN artifacts: {e}')

        # legacy dense cosine matrix (should not be used for large corpora)
        cosine_path = os.path.join(base_dir, 'recommendations', 'cosine_sim.pkl')
        logger.info(f'Trying to load cosine matrix from: {cosine_path}')
        
        with open(cosine_path, 'rb') as f:
            COSINE_SIM = pickle.load(f)
        with open(os.path.join(base_dir, 'recommendations', 'indices.pkl'), 'rb') as f:
            INDICES = pickle.load(f)
        with open(os.path.join(base_dir, 'recommendations', 'job_df.pkl'), 'rb') as f:
            JOB_DF = pickle.load(f)
        logger.info('✅ Recommendation artifacts (cosine matrix) loaded into memory.')
    except FileNotFoundError as e:
        COSINE_SIM = INDICES = JOB_DF = None
        logger.warning(f'❌ Recommendation artifacts not found: {e}. Run `python manage.py generate_recommendations` to create them.')
    except Exception as e:
        COSINE_SIM = INDICES = JOB_DF = None
        logger.error(f'❌ Error loading recommendation artifacts: {e}')

# Load category classifier model (joblib) into memory at import time
CATEGORY_CLASSIFIER = None
print("=" * 80)
print("🤖 ATTEMPTING TO LOAD CATEGORY CLASSIFIER...")
print("=" * 80)
try:
    from django.conf import settings
    model_path = os.path.join(settings.BASE_DIR, 'models', 'category_classifier.joblib')
    print(f"Loading from: {model_path}")
    CATEGORY_CLASSIFIER = joblib.load(model_path)
    print(f'✅ Category classifier model loaded successfully!')
    logger.info(f'Category classifier model loaded successfully from {model_path}')
except FileNotFoundError as e:
    CATEGORY_CLASSIFIER = None
    print(f'❌ Category classifier not found: {e}')
    logger.warning('Category classifier not found: models/category_classifier.joblib. Run `python manage.py train_category_classifier` to create it.')
except Exception as e:
    CATEGORY_CLASSIFIER = None
    print(f'❌ Error loading category classifier: {e}')
    import traceback
    traceback.print_exc()
    logger.error(f'Error loading category classifier: {e}')
print("=" * 80)

# Eager-load recommendation artifacts at import time
print("=" * 80)
print("🚀 ATTEMPTING TO LOAD RECOMMENDATION ARTIFACTS...")
print("=" * 80)
try:
    load_recommendation_artifacts()
    print("✅ Recommendation artifacts loaded successfully!")
except Exception as _e:
    print(f"❌ Unable to eager-load recommendation artifacts at import time: {_e}")
    import traceback
    traceback.print_exc()
print("=" * 80)


class IsEmployerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'employer'

class JobViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'], url_path='hot')
    def hot_jobs(self, request):
        # Lấy 6 job có lượt ứng tuyển nhiều nhất hoặc mới nhất
        hot_jobs = Job.objects.filter(status='approved').annotate(num_applications=Count('application')).order_by('-num_applications', '-created_at')[:6]
        serializer = self.get_serializer(hot_jobs, many=True)
        return Response(serializer.data)
    queryset = Job.objects.filter(status='approved').order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    
    filterset_class = JobFilter 
    search_fields = ['title', 'description', 'employer__profile__company_name']
    
    def get_queryset(self):
        try:
            queryset = super().get_queryset()
            search_query = self.request.query_params.get('search', None)
            if search_query:
                queryset = queryset.annotate(
                    search=SearchVector('title', 'title_en', 'description', 'description_en'),
                    headline=SearchHeadline('description', SearchQuery(search_query))
                ).filter(search=SearchQuery(search_query))

            # Salary filter via predefined ranges e.g., "min-max" in millions
            salary = self.request.query_params.get('salary')
            if salary:
                try:
                    smin, smax = salary.split('-')
                    smin_v = float(smin) * 1_000_000
                    smax_v = float(smax) * 1_000_000
                    queryset = queryset.filter(min_salary__gte=smin_v, max_salary__lte=smax_v)
                except Exception:
                    pass

            # Rating filter (from verified employer reviews)
            rating_gte = self.request.query_params.get('rating_gte')
            if rating_gte:
                try:
                    from django.db.models import Avg, Q
                    queryset = queryset.annotate(
                        employer_avg_rating=Avg('employer__employer_reviews__overall_rating', filter=Q(employer__employer_reviews__verified=True))
                    ).filter(employer_avg_rating__gte=float(rating_gte))
                except Exception:
                    pass
            
            # Optimize queries with select_related and prefetch_related
            queryset = queryset.select_related(
                'employer', 'category', 'work_type', 'city'
            ).prefetch_related(
                'jobskill_set__skill'
            )
            return queryset
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            return Job.objects.none()
    
    def perform_create(self, serializer):
        # Nếu muốn gán employer là user hiện tại:
        serializer.save(employer=self.request.user)

    def list(self, request, *args, **kwargs):
        try:
            print(f"JobViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            print(f"API Response: {response.data}")
            return response
        except Exception as e:
            print(f"Error in JobViewSet.list: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Có lỗi xảy ra khi tải danh sách công việc'},
                status=500
            )

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho Application - hỗ trợ đầy đủ CRUD operations
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Cho phép upload file CV
    
    def get_queryset(self):
        # Chỉ trả về các đơn ứng tuyển của người dùng đang đăng nhập
        return Application.objects.filter(user=self.request.user).order_by('-applied_at')

    def get_serializer_context(self):
        return {'request': self.request}

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        # Kiểm tra file size trước khi xử lý
        cv_file = request.FILES.get('cv')
        if cv_file and cv_file.size > 10 * 1024 * 1024:  # 10MB
            return Response(
                {'cv': ['File CV quá lớn. Vui lòng chọn file nhỏ hơn 10MB.']},
                status=400
            )
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Lỗi khi tạo application: {str(e)}")
            return Response(
                {'detail': 'Đã có lỗi xảy ra khi tạo đơn ứng tuyển. Vui lòng thử lại.'},
                status=500
            )
    
    def destroy(self, request, *args, **kwargs):
        """Cho phép ứng viên rút đơn ứng tuyển"""
        try:
            instance = self.get_object()
            # Chỉ cho phép rút đơn nếu trạng thái là 'pending'
            if instance.status != 'pending':
                return Response(
                    {'detail': 'Chỉ có thể rút đơn ở trạng thái chờ duyệt.'},
                    status=400
                )
            
            self.perform_destroy(instance)
            return Response(
                {'detail': 'Đã rút đơn ứng tuyển thành công.'},
                status=204
            )
        except Exception as e:
            print(f"Lỗi khi rút đơn: {str(e)}")
            return Response(
                {'detail': 'Có lỗi xảy ra khi rút đơn. Vui lòng thử lại.'},
                status=500
            )

# Giữ lại class cũ để backward compatibility
@method_decorator(csrf_exempt, name='dispatch')
class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Application.objects.filter(user=self.request.user).order_by('-applied_at')

    def get_serializer_context(self):
        return {'request': self.request}

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationCreateSerializer
        return ApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        cv_file = request.FILES.get('cv')
        if cv_file and cv_file.size > 10 * 1024 * 1024:
            return Response(
                {'cv': ['File CV quá lớn. Vui lòng chọn file nhỏ hơn 10MB.']},
                status=400
            )
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Lỗi khi tạo application: {str(e)}")
            return Response(
                {'detail': 'Đã có lỗi xảy ra khi tạo đơn ứng tuyển. Vui lòng thử lại.'},
                status=500
            )

class FavoriteViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho Công việc yêu thích.
    - GET /api/jobs/favorites/: Lấy danh sách các công việc đã yêu thích.
    - POST /api/jobs/favorites/: Thêm một công việc vào yêu thích (body: {"job_id": 123}).
    - DELETE /api/jobs/favorites/{id}/: Xóa một công việc khỏi yêu thích.
    """
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # Chỉ trả về các favorite của người dùng đang đăng nhập
        return Favorite.objects.filter(user=self.request.user).select_related('job').order_by('-created_at')

    def get_serializer_context(self):
        # Truyền request vào context để serializer có thể lấy user
        return {'request': self.request}

    def create(self, request, *args, **kwargs):
        try:
            print(f"FavoriteViewSet.create called with data: {request.data}")
            response = super().create(request, *args, **kwargs)
            print(f"Favorite created successfully: {response.data}")
            return response
        except Exception as e:
            print(f"Error in FavoriteViewSet.create: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Có lỗi xảy ra khi thêm vào yêu thích'},
                status=500
            )

    def list(self, request, *args, **kwargs):
        try:
            print(f"FavoriteViewSet.list called for user: {request.user}")
            response = super().list(request, *args, **kwargs)
            print(f"Favorites list response: {response.data}")
            return response
        except Exception as e:
            print(f"Error in FavoriteViewSet.list: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': 'Có lỗi xảy ra khi tải danh sách yêu thích'},
                status=500
            )
    
    # def destroy(self, request, *args, **kwargs):
    #     # Lấy favorite object dựa trên pk (ID của Favorite)
    #     instance = self.get_object() 
    #     self.perform_destroy(instance)
    #     # Trả về ID của Job đã bị unfavorite, rất tiện cho frontend
    #     return Response({'job_id': instance.job.id}, status=status.HTTP_200_OK)

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None

class HotJobsListView(generics.ListAPIView):
    """
    API để lấy danh sách các công việc "hot" (premium).
    """
    # Lấy các job đã duyệt, là premium, sắp xếp ngẫu nhiên hoặc theo ngày mới nhất
    queryset = Job.objects.filter(status='approved', is_premium=True).order_by('-created_at')[:6]
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None # Không cần phân trang
    
class TopCompanyAPIView(APIView):
    def get(self, request):
        top_companies = User.objects.filter(role='employer').annotate(job_count=Count('job')).order_by('-job_count')[:6]
        if not top_companies:
            # Dữ liệu mẫu nếu chưa có employer thực
            sample = [
                {'id': 1, 'company_name': 'Công ty A', 'logo': '', 'email': 'a@company.com', 'job_count': 5},
                {'id': 2, 'company_name': 'Công ty B', 'logo': '', 'email': 'b@company.com', 'job_count': 3},
            ]
            return Response(sample)
        serializer = EmployerSerializer(top_companies, many=True)
        return Response(serializer.data)
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Không phân trang danh sách Categories
    
    def get_queryset(self):
        # Optimize categories query
        return Category.objects.all()

class TopCategoryAPIView(generics.ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None
    def get_queryset(self):
        qs = Category.objects.annotate(job_count=Count('job')).order_by('-job_count')[:6]
        if not qs:
            # Dữ liệu mẫu nếu chưa có category thực
            from collections import namedtuple
            Cat = namedtuple('Cat', ['id', 'name', 'name_en', 'is_hot', 'job_count'])
            return [Cat(1, 'Công nghệ', 'IT', True, 10), Cat(2, 'Kinh tế', 'Economics', False, 7)]
        return qs

class TrendingJobs24hView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        since = timezone.now() - timezone.timedelta(hours=24)
        return Job.objects.filter(status='approved', application__applied_at__gte=since).annotate(
            applications_24h=Count('application', filter=Q(application__applied_at__gte=since))
        ).order_by('-applications_24h', '-created_at')[:12]

class EmployerJobViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho phép nhà tuyển dụng (employer) quản lý các công việc của họ.
    """
    serializer_class = JobSerializer # Có thể tạo JobCreateSerializer riêng nếu cần
    permission_classes = [permissions.IsAuthenticated] # Yêu cầu đăng nhập

    def get_queryset(self):
        # Chỉ trả về các công việc do chính nhà tuyển dụng này tạo ra
        return Job.objects.filter(employer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Tự động gán 'employer' là người dùng đang thực hiện request
        serializer.save(employer=self.request.user)
    

class JobApplicationListView(generics.ListAPIView):
    """
    API để nhà tuyển dụng xem danh sách ứng viên cho một công việc cụ thể.
    """
    serializer_class = ApplicationSerializer # Cần ApplicationSerializer hiển thị thông tin user
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs['job_id']
        # Chỉ trả về applications của job này NẾU người request là chủ của job
        return Application.objects.filter(
            job_id=job_id, 
            job__employer=self.request.user
        ).select_related('user__profile')
        # Tối ưu hóa truy vấn
        
class ApplicationUpdateView(generics.UpdateAPIView):
    """
    API để nhà tuyển dụng thay đổi trạng thái của một đơn ứng tuyển.
    Chỉ cho phép cập nhật (PATCH).
    """
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Chỉ cho phép phương thức PATCH, không cho phép PUT
    http_method_names = ['patch', 'options']

    def get_queryset(self):
        """
        Đảm bảo nhà tuyển dụng chỉ có thể cập nhật các đơn ứng tuyển
        cho các công việc mà họ sở hữu.
        """
        return Application.objects.filter(job__employer=self.request.user)

    def update(self, request, *args, **kwargs):
        # partial=True là cần thiết cho phương thức PATCH
        partial = kwargs.pop('partial', True) 
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # (Nâng cao) Thêm logic gửi thông báo cho ứng viên ở đây

        return Response(serializer.data)
    
class EmployerJobViewSet(viewsets.ModelViewSet):
    # queryset và perform_create giữ nguyên
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(employer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Trạng thái mặc định khi nhà tuyển dụng đăng tin là 'pending'
        serializer.save(employer=self.request.user, status='pending')

    # GHI ĐÈ PHƯƠNG THỨC NÀY
    def get_serializer_class(self):
        # Nếu hành động là 'create' hoặc 'update'/'partial_update'
        if self.action in ['create', 'update', 'partial_update']:
            return JobWriteSerializer # Dùng serializer để ghi
        # Nếu không, dùng serializer mặc định để đọc (cho 'list' và 'retrieve')
        return JobSerializer

class WorkTypeListAPIView(generics.ListAPIView):
    queryset = WorkType.objects.all().order_by('name')
    serializer_class = WorkTypeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ApplicationUpdateView(generics.UpdateAPIView):
    """
    API để nhà tuyển dụng thay đổi trạng thái của một đơn ứng tuyển.
    """
    # Sử dụng serializer nhỏ, chuyên dụng
    serializer_class = ApplicationStatusUpdateSerializer
    
    # Yêu cầu người dùng phải đăng nhập
    permission_classes = [permissions.IsAuthenticated]
    
    # Chỉ cho phép phương thức PATCH
    http_method_names = ['patch', 'options']

    # PHƯƠNG THỨC QUAN TRỌNG GÂY LỖI NẰM Ở ĐÂY
    def get_queryset(self):
        """
        Hàm này trả về danh sách các đối tượng mà view này được phép thao tác.
        Đảm bảo nhà tuyển dụng chỉ có thể cập nhật các đơn ứng tuyển
        cho các công việc mà họ sở hữu.
        """
        # Tên hàm phải là 'get_queryset'
        return Application.objects.filter(job__employer=self.request.user)
    def update(self, request, *args, **kwargs):
        print("--- ApplicationUpdateView: update() called ---") # DEBUG 1
        
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Lấy instance đã được cập nhật
        updated_instance = serializer.instance
        
        print(f"--- Status updated to: {updated_instance.status} ---") # DEBUG 2

        # GỌI HÀM GỬI THÔNG BÁO
        try:
            print("--- Calling create_and_send_notification ---") # DEBUG 3
            create_and_send_notification(updated_instance)
            print("--- Finished calling notification function ---") # DEBUG 4
        except Exception as e:
            print(f"!!! ERROR calling notification function: {e}")

        return Response(serializer.data)


class JobRecommendationView(APIView):
        permission_classes = [permissions.AllowAny]

        def get(self, request, job_id):
            logger.info(f"API /recommendations/ called for job_id: {job_id}")
            
            try:
                # Try to get the current job first
                current_job = Job.objects.get(id=job_id, status='approved')
            except Job.DoesNotExist:
                return Response({"error": "Job not found"}, status=404)
            
            # Try to load recommendation artifacts
            load_recommendation_artifacts()
            
            # Check if any recommendation artifacts are available
            has_nn = 'NN_INDICES' in globals() and globals().get('NN_INDICES') is not None
            has_cosine = COSINE_SIM is not None and INDICES is not None and JOB_DF is not None
            
            recommended_jobs = None
            
            if has_nn or has_cosine:
                # Try AI recommendations if available
                try:
                    recommended_jobs = get_recommendations(job_id, COSINE_SIM, INDICES, JOB_DF)
                    logger.info(f"Found {recommended_jobs.count()} AI recommendations")
                except Exception as e:
                    logger.error(f"AI recommendations failed: {e}")
                    recommended_jobs = None
            
            # Fallback logic
            if not recommended_jobs or not recommended_jobs.exists():
                logger.info('Using fallback recommendations (same category)')
                if current_job.category:
                    recommended_jobs = Job.objects.filter(
                        category=current_job.category,
                        status='approved'
                    ).exclude(id=job_id)[:6]
                else:
                    recommended_jobs = Job.objects.none()
                
                # If still no jobs, get recent jobs
                if not recommended_jobs.exists():
                    logger.info('Using fallback recommendations (recent jobs)')
                    recommended_jobs = Job.objects.filter(
                        status='approved'
                    ).exclude(id=job_id).order_by('-created_at')[:6]

            serializer = JobSerializer(recommended_jobs, many=True, context={'request': request})
            return Response(serializer.data)

def get_recommendations(job_id, cosine_sim, indices, df):
        try:
            # If ANN index is available, use it
            if 'HNSW_INDEX' in globals() and globals().get('HNSW_INDEX') is not None:
                try:
                    import numpy as _np
                    idx_map = globals().get('INDICES')
                    hnsw = globals().get('HNSW_INDEX')
                    job_df = globals().get('JOB_DF')
                    # map job_id -> internal index
                    internal_idx = idx_map[job_id]
                    # query hnsw for neighbors (include the query itself)
                    labels, distances = hnsw.knn_query(globals().get('JOB_VECTORS')[internal_idx].reshape(1, -1), k=6)
                    # labels is array shape (1,k)
                    neighbor_idxs = labels[0].tolist()
                    # remove the first if it's the same job
                    neighbor_idxs = [i for i in neighbor_idxs if i != internal_idx][:5]
                    recommended_job_ids = job_df['id'].iloc[neighbor_idxs].tolist()
                    return Job.objects.filter(id__in=recommended_job_ids, status='approved')
                except Exception as e:
                    logger.error(f'ANN recommendation error: {e}')
                    return Job.objects.none()

            # Fallback to NearestNeighbors arrays if available (TF-IDF fallback saved nn_indices)
            if 'NN_INDICES' in globals() and globals().get('NN_INDICES') is not None:
                try:
                    idx_map = globals().get('INDICES')
                    nn_arr = globals().get('NN_INDICES')
                    job_df = globals().get('JOB_DF')
                    internal_idx = idx_map[job_id]
                    neighbor_idxs = nn_arr[internal_idx].tolist()
                    # remove the query itself if present and take top 5
                    neighbor_idxs = [i for i in neighbor_idxs if i != internal_idx][:5]
                    recommended_job_ids = job_df['id'].iloc[neighbor_idxs].tolist()
                    return Job.objects.filter(id__in=recommended_job_ids, status='approved')
                except Exception as e:
                    logger.error(f'NN-based recommendation error: {e}')
                    return Job.objects.none()

            # Fallback to dense cosine matrix (legacy - not recommended for large corpora)
            idx = indices[job_id]
            sim_scores = list(enumerate(cosine_sim[idx]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

            logger.info('Top 10 Similarity Scores:')
            for i, score in sim_scores[0:10]:
                logger.info(f"Job Index: {i}, Score: {score}")

            sim_scores = sim_scores[1:6]
            job_indices = [i[0] for i in sim_scores]
            recommended_job_ids = df['id'].iloc[job_indices].tolist()
            return Job.objects.filter(id__in=recommended_job_ids, status='approved')
        except (IOError, KeyError, IndexError) as e:
            logger.error(f"Recommendation error: {e}")
            return Job.objects.none() # Trả về queryset rỗng nếu có lỗi

class PredictCategoryView(APIView):
        permission_classes = [permissions.IsAuthenticated] # Chỉ nhà tuyển dụng được dùng
        # Use module-level CATEGORY_CLASSIFIER loaded at import time
        model = CATEGORY_CLASSIFIER

        def post(self, request, *args, **kwargs):
            if not self.model:
                return Response(
                    {"error": "Mô hình dự đoán hiện không sẵn sàng. Vui lòng liên hệ quản trị viên."}, 
                    status=503 # Service Unavailable
                )

            # Lấy title và description từ request
            title = request.data.get('title', '')
            description = request.data.get('description', '')
            
            # Kết hợp lại giống như lúc huấn luyện
            content = f"{title} {description}"

            if len(content.strip()) < 50:
                return Response({"error": "Tiêu đề và mô tả công việc quá ngắn để phân tích."}, status=400)

            try:
                # Mô hình (Pipeline) cần nhận một danh sách, dù chỉ có một phần tử
                text_to_predict = [content]
                
                # Thực hiện dự đoán
                predicted_category_id = self.model.predict(text_to_predict)[0]
                
                # Lấy thông tin ngành nghề từ CSDL
                category = Category.objects.get(pk=predicted_category_id)
                response_data = {
                    'predicted_category_id': category.id,
                    'predicted_category_name': category.name
                }
                return Response(response_data)

            except Category.DoesNotExist:
                return Response({"error": "Không tìm thấy ngành nghề tương ứng với kết quả dự đoán."}, status=404)
            except Exception as e:
                print(f"!!! ❌ ERROR during prediction: {e}")
                return Response({"error": "Đã có lỗi xảy ra trong quá trình dự đoán."}, status=500)
            

       