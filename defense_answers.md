# CÂU TRẢ LỜI BẢO VỆ ĐỒ ÁN - HỆ THỐNG TUYỂN DỤNG AI

## NHÓM 1: VỀ THUẬT TOÁN VÀ AI (QUAN TRỌNG NHẤT)

### 1.1 Về mô hình chuyển đổi văn bản thành số
**Câu hỏi**: "Em sử dụng Sentence-Transformers, cụ thể là model nào? Tại sao lại chọn model đó cho tiếng Việt thay vì các model khác như PhoBERT hay mBERT?"

**Trả lời**:
Thưa thầy cô, em thực sự chưa dùng Sentence-Transformers mà đang sử dụng một cách tiếp cận đơn giản hơn:

- **Hiện tại em đang dùng**: TF-IDF (một kỹ thuật đếm từ khóa) kết hợp với LinearSVC (một thuật toán phân loại) để phân loại công việc, và so sánh từ khóa trực tiếp để phân tích CV.

- **Tại sao em chọn cách này**:
  - Với 24,000 công việc thuộc nhiều ngành nghề khác nhau, TF-IDF hoạt động khá ổn định
  - Dữ liệu của em không cân bằng (có ngành nhiều việc, ngành ít việc), LinearSVC xử lý tốt vấn đề này
  - Thư viện Underthesea giúp tách từ tiếng Việt chính xác

- **Kế hoạch cải thiện**: Em dự định nâng cấp lên Sentence-Transformers hoặc PhoBERT trong phiên bản tiếp theo để hiểu nghĩa câu tốt hơn, không chỉ đếm từ khóa

### 1.2 Về xử lý ngôn ngữ tiếng Việt    
**Câu hỏi**: "Thư viện Underthesea đóng vai trò gì trong pipeline xử lý dữ liệu của em? Em có thực hiện Stop-words hay Lemmatization trước khi vector hóa không?"

**Trả lời**:
Dạ, em có xử lý văn bản tiếng Việt qua các bước sau:

```python
def preprocess_text(self, text):
    # 1. Chuyển về chữ thường và bỏ dấu câu
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    
    # 2. Tách từ bằng Underthesea
    tokens = word_tokenize(text, format="text")
    
    # 3. Loại bỏ từ dừng tiếng Việt
    vietnamese_stop_words = ["và", "là", "của", "có", "được", ...]
    tokens = ' '.join([t for t in tokens.split() if t not in vietnamese_stop_words])
    
    return tokens
```

- **Underthesea**: Em dùng để tách từ tiếng Việt chính xác. Ví dụ "lập trình viên" sẽ được tách thành "lập_trình_viên" thay vì "lập", "trình", "viên" riêng lẻ. Nó cũng xử lý tốt dấu thanh tiếng Việt.

- **Stop-words (từ dừng)**: Có, em loại bỏ hơn 20 từ phổ biến như "và", "là", "của"... vì chúng không mang ý nghĩa quan trọng trong việc phân tích kỹ năng.

- **Lemmatization (chuẩn hóa từ)**: Em chưa làm bước này, đây là điểm em cần cải thiện. Ví dụ "lập trình", "lập trình viên", "programmer" nên được coi là cùng một khái niệm.

### 1.3 Về cách tính điểm phù hợp
**Câu hỏi**: "Công thức tính điểm tương đồng (Match Score) của em là gì? Tại sao điểm số đó lại đại diện được cho độ phù hợp của ứng viên?"

**Trả lời**:
Dạ, em tính điểm phù hợp theo các bước sau:

```python
def calculate_match_score(self, cv_skills, job_description, job_title):
    # 1. Tìm kỹ năng trong mô tả công việc
    job_skills = self.extract_skills_from_text(f"{job_title} {job_description}")
    
    # 2. So sánh kỹ năng
    exact_matches = set(cv_skills) & set(job_skills)  # Trùng khớp hoàn toàn (1 điểm)
    partial_matches = {...}  # Trùng khớp một phần (0.5 điểm)
    
    # 3. Tính tổng điểm có trọng số
    total_matches = len(exact_matches) * 1.0 + len(partial_matches) * 0.5
    match_ratio = total_matches / len(job_skills)
    
    # 4. Chuyển sang thang điểm 0-5
    base_score = match_ratio * 5.0
    
    # Cộng thêm điểm nếu có nhiều kỹ năng hoặc kỹ năng quan trọng
    # Trừ điểm nếu CV có quá ít kỹ năng
    
    return min(5.0, max(0.0, final_score))
```

**Giải thích tại sao cách này hợp lý**:

Ví dụ thực tế: Công việc yêu cầu 5 kỹ năng: Python, Django, PostgreSQL, Git, Teamwork

- **Ứng viên A** có: Python, Django, PostgreSQL, Git, Teamwork → 5/5 = 100% → 5.0 điểm
- **Ứng viên B** có: Python, Django, React → 2/5 = 40% → 2.0 điểm  
- **Ứng viên C** có: Python, Django, PostgreSQL, Git, Teamwork + 10 kỹ năng khác → 5.0 + bonus 0.3 = 5.3 → 5.0 điểm (max)

**Tại sao đại diện được độ phù hợp**:
- Đếm trực tiếp số kỹ năng trùng khớp giữa CV và yêu cầu công việc
- Kỹ năng trùng hoàn toàn (Python = Python) được tính điểm cao hơn trùng một phần (Python trong "Python Developer")
- Chia cho tổng số kỹ năng yêu cầu để có tỷ lệ phần trăm phù hợp
- Thưởng điểm cho ứng viên có nhiều kỹ năng đa dạng hoặc kỹ năng quan trọng (Python, Java, React...)

### 1.4 Về độ chính xác của hệ thống
**Câu hỏi**: "Slide 21 ghi độ chính xác 80-90%. Em đo lường con số này dựa trên tập dữ liệu nào? Có dùng các chỉ số như Precision, Recall hay F1-Score không?"

**Trả lời**:
Dạ, về độ chính xác em đo như sau:

**Dữ liệu em dùng để test**:
- **Tổng cộng**: 23,979 công việc thực tế đã được duyệt
- **Số ngành nghề**: 2,542 ngành (từ IT, Marketing, Kế toán... đến các ngành khác)
- **Cách chia dữ liệu**: 80% để train (dạy máy), 20% để test (kiểm tra)

**Kết quả đo được**:
- **Độ chính xác tổng thể**: Khoảng 85% (máy đoán đúng 85/100 trường hợp)
- **Kiểm tra chéo**: Em chia dữ liệu thành 5 phần, lần lượt test từng phần để đảm bảo kết quả ổn định

**Các chỉ số chi tiết em có đo**:
```python
# Em có đo các chỉ số này:
- Precision: Trong số những gì máy dự đoán là đúng, bao nhiêu % thực sự đúng
- Recall: Trong số những cái đúng, máy tìm được bao nhiêu %
- F1-Score: Điểm trung bình của Precision và Recall
- Support: Số lượng mẫu thực tế của từng ngành
```

**Khó khăn em gặp phải**:
Dữ liệu không cân bằng - ngành IT có 1,189 công việc nhưng một số ngành khác chỉ có 1-2 công việc. Em đã xử lý bằng cách cho máy chú ý nhiều hơn đến các ngành ít dữ liệu (dùng class_weight='balanced').

**Ví dụ cụ thể**: Khi em cho máy đọc mô tả "Tuyển lập trình viên Python Django", máy dự đoán đúng là ngành "IT Phần mềm" với độ tin cậy cao.

## NHÓM 2: VỀ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU

### 2.1 Về cơ sở dữ liệu vector
**Câu hỏi**: "Tại sao em chọn pgvector tích hợp trong PostgreSQL thay vì các Vector Database chuyên dụng như Pinecone, Milvus hay Weaviate?"

**Trả lời**:
Thưa thầy cô, thực ra em hiện tại chưa dùng pgvector mà đang dùng PostgreSQL thông thường kết hợp với việc so sánh từ khóa.

**Lý do em chọn PostgreSQL đơn giản**:
- **Tiết kiệm chi phí**: Render cung cấp PostgreSQL miễn phí, phù hợp với ngân sách sinh viên
- **Đơn giản**: Chỉ cần một cơ sở dữ liệu cho tất cả (thông tin công việc, CV, user...) thay vì phải quản lý nhiều hệ thống
- **Ổn định**: PostgreSQL đảm bảo dữ liệu không bị mất mát khi có nhiều người dùng cùng lúc

**So sánh với các lựa chọn khác**:
- **Pinecone**: Rất tốt nhưng tốn khoảng 70 USD/tháng, quá đắt cho đồ án sinh viên
- **Milvus**: Cài đặt phức tạp, cần server riêng, em chưa có kinh nghiệm vận hành
- **Weaviate**: Quá mạnh cho quy mô hiện tại của em (24,000 công việc)

**Kế hoạch tương lai**: Khi hệ thống lớn hơn (100,000+ công việc), em sẽ nâng cấp lên pgvector để tìm kiếm nhanh hơn dựa trên ý nghĩa câu văn thay vì chỉ từ khóa.

### 2.2 Về hiệu năng khi dữ liệu lớn
**Câu hỏi**: "Khi số lượng Job và CV lên đến hàng triệu bản ghi, việc tính toán vector search sẽ trở nên chậm. Em đã cấu hình Index như thế nào để tối ưu?"

**Trả lời**:
Dạ, hiện tại với 24,000 công việc, em đã tạo các chỉ mục cơ bản để tăng tốc:

**Những gì em đã làm hiện tại**:
```sql
-- Tạo chỉ mục để tìm kiếm nhanh
CREATE INDEX idx_job_status ON jobs_job(status);        -- Tìm công việc đã duyệt
CREATE INDEX idx_job_category ON jobs_job(category_id);  -- Tìm theo ngành nghề
CREATE INDEX idx_application_user ON jobs_application(user_id); -- Tìm đơn của user
```

**Khi dữ liệu lên hàng triệu, em sẽ làm**:
```sql
-- Chỉ mục cho tìm kiếm vector (khi nâng cấp lên pgvector)
CREATE INDEX ON jobs_job USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON jobs_job USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 1000);
```

**Giải thích đơn giản**:
- **HNSW**: Giống như tạo một "bản đồ" để tìm đường nhanh nhất đến kết quả chính xác nhất (độ chính xác >95%)
- **IVFFlat**: Chia dữ liệu thành nhiều "khu vực" để tìm kiếm nhanh hơn (đổi chút độ chính xác lấy tốc độ)

**Các chiến lược khác em dự định**:
- **Phân vùng dữ liệu**: Chia theo ngành nghề hoặc địa điểm để tìm kiếm trong phạm vi nhỏ hơn
- **Lưu cache**: Lưu kết quả tìm kiếm phổ biến để lần sau không phải tính lại
- **Tìm kiếm song song**: Chia nhỏ công việc tìm kiếm cho nhiều máy cùng làm

### 2.3 Về bảo mật thông tin cá nhân
**Câu hỏi**: "Dữ liệu CV chứa thông tin cá nhân rất nhạy cảm. Em đã thực hiện những biện pháp bảo mật nào?"

**Trả lời**:
Dạ, em rất quan tâm đến vấn đề bảo mật vì CV chứa nhiều thông tin nhạy cảm. Em đã áp dụng các biện pháp sau:

**1. Kiểm soát quyền truy cập**:
```python
# Chỉ cho phép user đã đăng nhập
class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Mỗi người chỉ xem được CV của chính mình
        return Application.objects.filter(user=self.request.user)
```

**2. Kiểm tra file upload**:
```python
def create(self, request):
    cv_file = request.FILES.get('cv')
    # Chỉ cho phép PDF, DOC, DOCX
    if cv_file.content_type not in ALLOWED_TYPES:
        return Response({'error': 'Loại file không được phép'})
    # Giới hạn kích thước file 10MB
    if cv_file.size > 10 * 1024 * 1024:
        return Response({'error': 'File quá lớn'})
```

**Các biện pháp bảo mật em đã áp dụng**:
- **Xác thực bằng token**: Mỗi user có một "chìa khóa" riêng để truy cập
- **Phân quyền theo dòng**: User A không thể xem CV của User B
- **Kiểm tra file**: Chỉ nhận file PDF/Word, không nhận file lạ
- **Mã hóa kết nối**: Tất cả dữ liệu truyền qua HTTPS (có khóa)
- **Giới hạn nguồn**: Chỉ cho phép truy cập từ website chính thức
- **Chống spam**: Giới hạn số lần gọi API để tránh tấn công

**Những gì em cần cải thiện thêm**:
- **Mã hóa file CV**: Lưu CV dưới dạng mã hóa trên server
- **Che giấu thông tin nhạy cảm**: Không ghi số điện thoại, email vào log
- **Theo dõi truy cập**: Ghi lại ai đã xem CV nào, khi nào

## NHÓM 3: VỀ TRIỂN KHAI VÀ THỰC NGHIỆM

### 3.1 Về vấn đề "ngủ đông" của server
**Câu hỏi**: "Em có nêu hạn chế là Render Free bị ngủ đông. Nếu đây là một sản phẩm thương mại thật sự, em sẽ giải quyết như thế nào?"

**Trả lời**:
Dạ, đây là vấn đề em gặp phải khi dùng hosting miễn phí:

**Vấn đề hiện tại**:
- Render Free: Server "ngủ" sau 15 phút không có ai sử dụng
- Khi có người truy cập: Phải đợi 30-50 giây để server "thức dậy"
- Trải nghiệm người dùng: Rất tệ, họ sẽ nghĩ website bị lỗi

**Nếu làm sản phẩm thương mại, em sẽ giải quyết như sau**:

1. **Nâng cấp hosting**:
   - Render Pro: 7 USD/tháng, server không bao giờ ngủ
   - AWS hoặc Google Cloud: Tự động tăng giảm server theo lượng người dùng
   - Chi phí: Khoảng 50-100 USD/tháng cho sản phẩm thực tế

2. **Tối ưu hóa hệ thống**:
   ```python
   # Tạo một "người bạn" tự động gọi server mỗi 10 phút
   @celery.task
   def keep_alive_ping():
       requests.get('https://api.domain.com/health/')
   ```

3. **Lưu cache thông minh**:
   - Lưu kết quả tìm kiếm phổ biến vào Redis (như bộ nhớ tạm)
   - Dùng CDN để tải nhanh hình ảnh, CSS
   - Kết nối database thông minh (không đóng mở liên tục)

4. **Chia nhỏ hệ thống**:
   - Phần AI xử lý CV: Luôn sẵn sàng
   - Phần API chính: Có thể ngủ được
   - Phần xử lý nền: Chạy riêng

**Ví dụ thực tế**: Giống như cửa hàng 24/7 (trả phí) vs cửa hàng gia đình (đóng cửa khi không có khách).

### 3.2 Về việc đọc file CV phức tạp
**Câu hỏi**: "Em nói module đọc PDF chưa tốt với CV nhiều cột. Vậy em có giải pháp nào để cải thiện?"

**Trả lời**:
Dạ, đây là một hạn chế lớn em đang gặp phải:

**Vấn đề hiện tại**:
```python
# Em đang dùng PyPDF2 - chỉ đọc text theo thứ tự từ trên xuống
def extract_text_from_file(self, file):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"  # Bị mất bố cục
    return text
```

**Ví dụ vấn đề**: CV có 2 cột, cột trái ghi "Kỹ năng: Python", cột phải ghi "Kinh nghiệm: 3 năm". PyPDF2 đọc thành "Kỹ năng: Kinh nghiệm: Python 3 năm" → rối loạn thông tin.

**Giải pháp em dự định cải thiện**:

1. **Dùng OCR (nhận dạng ký tự quang học)**:
   ```python
   # Chuyển PDF thành hình ảnh rồi "nhìn" như mắt người
   import pytesseract
   from pdf2image import convert_from_bytes
   
   def ocr_extract(pdf_bytes):
       images = convert_from_bytes(pdf_bytes)  # PDF → ảnh
       text = ""
       for image in images:
           text += pytesseract.image_to_string(image, lang='vie')  # Đọc tiếng Việt
       return text
   ```

2. **Dùng AI thông minh (GPT)**:
   ```python
   # Cho AI đọc và tóm tắt có cấu trúc
   def llm_parse_cv(cv_text):
       prompt = f"""
       Hãy trích xuất thông tin từ CV này:
       - Kỹ năng: []
       - Kinh nghiệm: []
       - Học vấn: []
       
       Nội dung CV: {cv_text}
       """
       return openai.chat.completions.create(...)
   ```

3. **Phương pháp kết hợp**:
   - Thử PyPDF2 trước (nhanh, rẻ)
   - Nếu không được → dùng OCR (chậm hơn nhưng chính xác)
   - Nếu vẫn rối → dùng AI GPT (đắt nhất nhưng thông minh nhất)
   - Chi phí: Khoảng 0.01-0.05 USD mỗi CV với GPT-4o-mini

**Ví dụ thực tế**: Giống như đọc báo - đọc bình thường trước, không hiểu thì dùng kính lúp, vẫn không hiểu thì hỏi thầy cô.

### 3.3 Về việc tách riêng Frontend và Backend
**Câu hỏi**: "Tại sao em lại tách Frontend (Vercel) và Backend (Render)? Việc này mang lại lợi ích gì?"

**Trả lời**:
Dạ, em tách riêng vì những lý do thực tế sau:

**Lý do em tách riêng**:

1. **Chuyên môn hóa**:
   - **Vercel**: Chuyên về React/Next.js, có mạng CDN toàn cầu (website tải nhanh ở mọi nơi)
   - **Render**: Chuyên về Python/Django, tốt cho xử lý AI và database

2. **Hiệu suất**:
   - **Frontend**: Được phân phối ở nhiều server gần người dùng → tải nhanh
   - **Backend**: Có tài nguyên riêng để xử lý AI mà không ảnh hưởng giao diện

3. **Khả năng mở rộng**:
   - Có thể tăng giảm Frontend và Backend độc lập
   - Sau này có thể làm app mobile cũng dùng chung Backend

4. **Tiết kiệm chi phí**:
   - **Vercel**: Miễn phí cho website tĩnh
   - **Render**: Chỉ trả tiền cho phần tính toán

**Nhược điểm em phải chấp nhận**:
- **Phức tạp hơn**: Phải quản lý 2 nơi deploy khác nhau
- **CORS**: Phải cấu hình cho phép Frontend gọi Backend
- **Độ trễ**: Có thêm một "bước nhảy" mạng giữa Frontend và Backend

**Ví dụ so sánh**:
- **Tách riêng**: Giống như nhà hàng có bếp riêng và phòng khách riêng - chuyên nghiệp nhưng phức tạp
- **Để chung**: Giống như quán ăn vỉa hè - đơn giản nhưng hạn chế

**Lựa chọn khác**: Em có thể dùng Railway hoặc Heroku để để chung một chỗ, nhưng sẽ kém linh hoạt và đắt hơn.

## NHÓM 4: VỀ TÍNH THỰC TẾ VÀ MỞ RỘNG

### 4.1 Về vấn đề gian lận từ khóa
**Câu hỏi**: "Nếu ứng viên cố tình 'spam' từ khóa vào CV để tăng điểm AI, hệ thống có nhận diện được không?"

**Trả lời**:
Dạ, đây là vấn đề thực tế mà em đã nghĩ đến. Có những người có thể gian lận như sau:

**Ví dụ về gian lận từ khóa**:
```
CV gian lận: "Python Python Python JavaScript React Django MySQL Python React JavaScript..."
→ Điểm cao nhưng không có kinh nghiệm thực tế
```

**Cách em đang xử lý hiện tại** (còn hạn chế):
```python
def calculate_match_score(self, cv_skills, job_description, job_title):
    # Trừ điểm nếu CV có quá ít kỹ năng đa dạng
    if len(cv_skills) < 3:
        score *= 0.8
    
    # Loại bỏ từ khóa trùng lặp
    cv_skills = list(set(cv_skills))
```

**Giải pháp nâng cao em dự định làm**:

1. **Kiểm tra ngữ cảnh**:
   ```python
   # Kiểm tra từ khóa có xuất hiện trong câu hợp lý không
   def validate_skill_context(text, skill):
       contexts = [
           f"kinh nghiệm {skill}",      # "kinh nghiệm Python"
           f"sử dụng {skill}",          # "sử dụng React"
           f"dự án {skill}"             # "dự án Django"
       ]
       return any(ctx in text.lower() for ctx in contexts)
   ```

2. **Phân tích tần suất**:
   ```python
   # Phạt nếu một từ xuất hiện quá nhiều lần
   def detect_keyword_stuffing(text):
       words = text.split()
       freq = Counter(words)
       max_freq = max(freq.values())
       if max_freq > len(words) * 0.1:  # Nếu >10% là cùng một từ → spam
           return True
   ```

3. **Kiểm tra ý nghĩa**:
   - Dùng AI để kiểm tra câu có nghĩa không
   - Kỹ năng phải xuất hiện trong câu văn tự nhiên

**Ví dụ thực tế**:
- **CV thật**: "Tôi có 3 năm kinh nghiệm lập trình Python, đã làm nhiều dự án web với Django"
- **CV spam**: "Python Python Python Django Django React JavaScript Python"

**Hệ thống em sẽ nhận diện**: CV thật có ngữ cảnh rõ ràng, CV spam chỉ là danh sách từ khóa.

### 4.2 Về hướng phát triển - Kết hợp nhiều phương pháp gợi ý
**Câu hỏi**: "Em có thể giải thích cách kết hợp Content-based và Collaborative Filtering trong bài toán tuyển dụng không?"

**Trả lời**:
Dạ, hiện tại em chỉ dùng một phương pháp đơn giản, nhưng em có kế hoạch nâng cấp lên phương pháp kết hợp:

**Hiện tại em đang dùng**: Content-based (dựa trên nội dung)
```python
# Chỉ so sánh kỹ năng trong CV với yêu cầu công việc
match_score = calculate_similarity(cv_skills, job_skills)
```

**Kế hoạch nâng cấp - Kết hợp 2 phương pháp**:

```python
class HybridRecommendationEngine:
    def recommend_jobs(self, user_id, cv_skills):
        # 1. Phương pháp 1: Dựa trên nội dung (70% trọng số)
        content_scores = self.content_based.score_jobs(cv_skills)
        
        # 2. Phương pháp 2: Dựa trên hành vi người dùng (30% trọng số)
        similar_users = self.find_similar_users(user_id)
        collab_scores = self.collaborative.score_jobs(similar_users)
        
        # 3. Kết hợp cả hai
        final_scores = {}
        for job_id in all_jobs:
            final_scores[job_id] = (
                0.7 * content_scores.get(job_id, 0) +
                0.3 * collab_scores.get(job_id, 0)
            )
        
        return sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
```

**Giải thích 2 phương pháp**:

1. **Content-based (Dựa trên nội dung)** - Đang dùng:
   - So sánh trực tiếp kỹ năng của bạn với yêu cầu công việc
   - Ví dụ: Bạn biết Python → Gợi ý công việc yêu cầu Python

2. **Collaborative Filtering (Dựa trên cộng đồng)** - Sẽ làm:
   ```python
   # Tìm người dùng giống bạn
   def find_similar_users(target_user):
       # Tìm những người có kỹ năng tương tự bạn
       # Xem họ đã ứng tuyển công việc gì
       # Gợi ý những công việc đó cho bạn
   ```

**Ví dụ thực tế**:
- **Bạn A**: Biết Python, Django
- **Bạn B**: Biết Python, Django (giống A)
- **Bạn B** đã ứng tuyển: Công việc X, Y, Z
- **Hệ thống gợi ý cho A**: "Những người giống bạn cũng quan tâm đến công việc X, Y, Z"

**Lợi ích của phương pháp kết hợp**:
- **Cho người mới**: Dùng Content-based vì chưa có lịch sử
- **Khám phá mới**: Collaborative giúp tìm công việc bạn chưa nghĩ đến
- **Chính xác hơn**: Kết hợp nhiều tín hiệu
- **Đa dạng hơn**: Tránh chỉ gợi ý một loại công việc

**Lộ trình thực hiện**:
- **Giai đoạn 1**: Cải thiện Content-based (dùng AI hiểu nghĩa)
- **Giai đoạn 2**: Thêm Collaborative filtering
- **Giai đoạn 3**: Dùng Deep Learning kết hợp cả hai

**Ví dụ đời thường**: Giống như Netflix - vừa gợi ý phim theo thể loại bạn thích (Content), vừa gợi ý phim mà người giống bạn đã xem (Collaborative).

---

## TÓM TẮT ĐIỂM MẠNH VÀ HƯỚNG PHÁT TRIỂN

### Những gì em đã làm được:
✅ **Quy mô lớn**: 24,000 công việc thực tế, 2,542 ngành nghề  
✅ **Độ chính xác**: 85% độ chính xác phân loại công việc  
✅ **Kiến trúc tốt**: Tách riêng Frontend/Backend, dễ mở rộng  
✅ **Bảo mật**: Mỗi người chỉ xem được CV của mình  
✅ **Hiệu suất**: Tối ưu cho quy mô hiện tại  

### Kế hoạch phát triển tiếp:
🚀 **Nâng cấp AI**: Dùng Sentence Transformers, pgvector để hiểu nghĩa câu  
🚀 **Chống gian lận**: Phát hiện spam từ khóa trong CV  
🚀 **Đọc CV tốt hơn**: OCR + AI GPT cho CV phức tạp  
🚀 **Gợi ý thông minh**: Kết hợp nhiều phương pháp gợi ý  
🚀 **Hạ tầng chuyên nghiệp**: Server không ngủ, tốc độ nhanh  

### Lời kết:
Em hiểu rằng đồ án vẫn còn nhiều điểm cần cải thiện, nhưng em đã cố gắng xây dựng một hệ thống hoạt động thực tế với dữ liệu thật và giải quyết được vấn đề cơ bản của việc matching CV với công việc. Em mong nhận được góp ý từ thầy cô để hoàn thiện hơn trong tương lai.  