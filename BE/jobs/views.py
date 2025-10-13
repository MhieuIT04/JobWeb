from django.db.models import Count
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.contrib.postgres.search import SearchVector, SearchQuery
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

import pandas as pd
import pickle



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
                    search=SearchVector('title', 'title_en', 'description', 'description_en')
                ).filter(search=SearchQuery(search_query))
            
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

@method_decorator(csrf_exempt, name='dispatch')
class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser]  # Cho phép upload file CV
    
    def get_queryset(self):
        # Chỉ trả về các đơn ứng tuyển của người dùng đang đăng nhập
        # Sắp xếp theo ngày ứng tuyển mới nhất lên đầu (dấu trừ '-' là descending)
        return Application.objects.filter(user=self.request.user).order_by('-applied_at')

    def get_serializer_context(self):
        return {'request': self.request}

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationCreateSerializer
        return ApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        # Tối ưu hóa: Kiểm tra file size trước khi xử lý
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
            print(f"\n--- API /recommendations/ called for job_id: {job_id} ---")
            # Tải các ma trận đã được tính toán trước
            try:
                with open('recommendations/cosine_sim.pkl', 'rb') as f:
                    cosine_sim = pickle.load(f)
                with open('recommendations/indices.pkl', 'rb') as f:
                    indices = pickle.load(f)
                with open('recommendations/job_df.pkl', 'rb') as f:
                    df = pickle.load(f)
            except FileNotFoundError:
                return Response({"error": "Recommendation data not found. Please run the generation command."}, status=500)
            
            recommended_jobs = get_recommendations(job_id, cosine_sim, indices, df)
            # DEBUG: In ra số lượng gợi ý tìm thấy
            print(f"--- Found {recommended_jobs.count()} recommendations in DB ---")
            serializer = JobSerializer(recommended_jobs, many=True, context={'request': request})
            return Response(serializer.data)

def get_recommendations(job_id, cosine_sim, indices, df):
        try:
            # Lấy chỉ số của công việc hiện tại
            idx = indices[job_id]

            # Lấy điểm tương đồng của công việc này với tất cả các công việc khác
            sim_scores = list(enumerate(cosine_sim[idx]))

            # Sắp xếp các công việc dựa trên điểm tương đồng
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            
            # DEBUG: In ra 10 điểm tương đồng cao nhất
            print("--- Top 10 Similarity Scores ---")
            for i, score in sim_scores[0:10]:
                print(f"Job Index: {i}, Score: {score}")
            # Lấy 5 công việc có điểm cao nhất (bỏ qua công việc đầu tiên vì đó là chính nó)
            sim_scores = sim_scores[1:6]

            # Lấy chỉ số của các công việc được gợi ý
            job_indices = [i[0] for i in sim_scores]

            # Lấy ID của các công việc từ DataFrame và truy vấn CSDL
            recommended_job_ids = df['id'].iloc[job_indices].tolist()
            return Job.objects.filter(id__in=recommended_job_ids, status='approved')
        except (IOError, KeyError, IndexError) as e:
            print(f"Recommendation error: {e}")
            return Job.objects.none() # Trả về queryset rỗng nếu có lỗi

class PredictCategoryView(APIView):
        permission_classes = [permissions.IsAuthenticated] # Chỉ nhà tuyển dụng được dùng

        model = None # Khởi tạo là None
        try:
            # Tải mô hình một lần duy nhất khi server Django khởi động
            with open('models/category_classifier.pkl', 'rb') as f:
                model = pickle.load(f)
            print(">>> ✅ Category prediction model loaded successfully. <<<")
        except FileNotFoundError:
            print("!!! ⚠️ WARNING: Category prediction model (category_classifier.pkl) not found. API will not work.")
        except Exception as e:
            print(f"!!! ❌ ERROR loading category prediction model: {e}")

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
            

       