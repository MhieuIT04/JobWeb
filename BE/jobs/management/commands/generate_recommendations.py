import pandas as pd
import pickle
from django.core.management.base import BaseCommand
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from jobs.models import Job

class Command(BaseCommand):
        help = 'Generates job recommendations based on content similarity.'

        def handle(self, *args, **kwargs):
            self.stdout.write(self.style.SUCCESS('Starting recommendation generation process...'))

            # 1. Lấy tất cả các công việc đã được duyệt
            jobs = Job.objects.filter(status='approved')
            if not jobs.exists():
                self.stdout.write(self.style.WARNING('No approved jobs found. Aborting.'))
                return

            # Chuyển QuerySet thành DataFrame của Pandas
            df = pd.DataFrame(list(jobs.values('id', 'title', 'description')))

            # 2. Xử lý dữ liệu văn bản
            # Kết hợp tiêu đề và mô tả để có nội dung đầy đủ hơn
            df['content'] = df['title'] + ' ' + df['description']
            
            # Khởi tạo TF-IDF Vectorizer
            # stop_words='english' sẽ loại bỏ các từ thông dụng trong tiếng Anh.
            # Bạn có thể tìm và thêm một danh sách stop words tiếng Việt để kết quả tốt hơn.
            tfidf = TfidfVectorizer(stop_words='english', max_features=5000)

            # 3. Vector hóa nội dung
            # Chuyển đổi cột 'content' thành một ma trận các vector TF-IDF
            tfidf_matrix = tfidf.fit_transform(df['content'])
            self.stdout.write(f'Generated TF-IDF matrix with shape: {tfidf_matrix.shape}')

            # 4. Tính toán độ tương đồng Cosine
            # Kết quả là một ma trận vuông, trong đó cosine_sim[i][j] là độ tương đồng giữa job i và job j
            cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
            self.stdout.write(f'Generated Cosine Similarity matrix with shape: {cosine_sim.shape}')

            # 5. Lưu kết quả để API có thể sử dụng nhanh chóng
            # Tạo một series ánh xạ từ job_id sang chỉ số của nó trong DataFrame
            indices = pd.Series(df.index, index=df['id']).drop_duplicates()

            # Sử dụng pickle để lưu các đối tượng Python
            try:
                with open('recommendations/cosine_sim.pkl', 'wb') as f:
                    pickle.dump(cosine_sim, f)
                with open('recommendations/indices.pkl', 'wb') as f:
                    pickle.dump(indices, f)
                with open('recommendations/job_df.pkl', 'wb') as f:
                    pickle.dump(df[['id', 'title']], f) # Chỉ lưu id và title cho nhẹ
                self.stdout.write(self.style.SUCCESS('Successfully saved recommendation matrices to file.'))
            except Exception as e:
                 self.stdout.write(self.style.ERROR(f'Error saving files: {e}'))