#!/usr/bin/env python3
"""
Phân tích kiến trúc hệ thống để trả lời câu hỏi hội đồng
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from jobs.models import Job, Category, Application
from jobs.ai_services import CVAnalysisService
import pandas as pd

def analyze_system():
    """Phân tích kiến trúc hệ thống"""
    print("🏗️ PHÂN TÍCH KIẾN TRÚC HỆ THỐNG AI RECRUITMENT")
    print("=" * 70)
    
    # 1. Thống kê dữ liệu
    print("📊 1. THỐNG KÊ DỮ LIỆU:")
    print("-" * 30)
    
    total_jobs = Job.objects.count()
    approved_jobs = Job.objects.filter(status='approved').count()
    total_categories = Category.objects.count()
    total_applications = Application.objects.count()
    
    print(f"   • Tổng số jobs: {total_jobs:,}")
    print(f"   • Jobs đã duyệt: {approved_jobs:,}")
    print(f"   • Tổng categories: {total_categories:,}")
    print(f"   • Tổng applications: {total_applications:,}")
    
    # Phân bố categories
    cat_distribution = Job.objects.filter(status='approved').values('category__name').annotate(
        count=models.Count('id')
    ).order_by('-count')[:10]
    
    print(f"\n   📂 Top 10 Categories:")
    for i, cat in enumerate(cat_distribution, 1):
        print(f"      {i}. {cat['category__name']}: {cat['count']} jobs")
    
    # 2. Phân tích thuật toán AI
    print(f"\n🤖 2. THUẬT TOÁN AI HIỆN TẠI:")
    print("-" * 30)
    
    cv_service = CVAnalysisService()
    print(f"   • Skills database: {len(cv_service.skills_keywords)} keywords")
    print(f"   • Matching method: Keyword-based + TF-IDF similarity")
    print(f"   • Score range: 0.0 - 5.0")
    print(f"   • Text preprocessing: Underthesea tokenization")
    
    # Sample skills categories
    skills_by_category = {
        'Programming Languages': ['python', 'javascript', 'java', 'c++', 'c#'],
        'Web Technologies': ['react', 'angular', 'vue', 'django', 'nodejs'],
        'Databases': ['mysql', 'postgresql', 'mongodb', 'redis'],
        'Cloud & DevOps': ['aws', 'azure', 'docker', 'kubernetes'],
        'Vietnamese Skills': ['lập trình', 'phát triển', 'thiết kế', 'quản lý']
    }
    
    print(f"\n   📝 Skills Categories:")
    for category, skills in skills_by_category.items():
        print(f"      • {category}: {', '.join(skills[:3])}...")
    
    # 3. Matching Algorithm Details
    print(f"\n🎯 3. CHI TIẾT THUẬT TOÁN MATCHING:")
    print("-" * 30)
    
    print(f"   📐 Công thức tính điểm:")
    print(f"      1. Extract skills từ CV và Job description")
    print(f"      2. Tính exact matches (trọng số 1.0)")
    print(f"      3. Tính partial matches (trọng số 0.5)")
    print(f"      4. Match ratio = total_matches / total_job_skills")
    print(f"      5. Base score = match_ratio * 5.0")
    print(f"      6. Áp dụng bonus/penalty:")
    print(f"         - Bonus: Nhiều skills (+0.2-0.3)")
    print(f"         - Bonus: Critical skills match (+0.1 mỗi skill)")
    print(f"         - Penalty: Ít skills (*0.8)")
    
    # 4. Test matching với sample
    print(f"\n🧪 4. TEST MATCHING ALGORITHM:")
    print("-" * 30)
    
    sample_cv_skills = ['python', 'django', 'react', 'postgresql', 'git', 'teamwork']
    sample_jobs = [
        ("Python Developer", "Tuyển Python Developer biết Django, PostgreSQL, có kinh nghiệm teamwork"),
        ("Frontend Developer", "Cần Frontend Developer React, JavaScript, HTML CSS"),
        ("Marketing Manager", "Tuyển Marketing Manager có kinh nghiệm digital marketing")
    ]
    
    print(f"   CV Skills: {', '.join(sample_cv_skills)}")
    print(f"\n   Matching Results:")
    
    for title, desc in sample_jobs:
        score = cv_service.calculate_match_score(sample_cv_skills, desc, title)
        print(f"      • {title}: {score}/5.0 ({score*20:.1f}%)")
    
    # 5. Kiến trúc hệ thống
    print(f"\n🏛️ 5. KIẾN TRÚC HỆ THỐNG:")
    print("-" * 30)
    
    print(f"   🎨 Frontend (Vercel):")
    print(f"      • React.js + Tailwind CSS")
    print(f"      • Responsive design")
    print(f"      • Real-time CV analysis")
    
    print(f"\n   ⚙️ Backend (Render):")
    print(f"      • Django REST Framework")
    print(f"      • PostgreSQL database")
    print(f"      • AI services: CV analysis, Job matching")
    
    print(f"\n   🤖 AI Components:")
    print(f"      • Category Classifier: LinearSVC + TF-IDF")
    print(f"      • CV Parser: PyPDF2, python-docx")
    print(f"      • Text Processing: Underthesea")
    print(f"      • Matching: Custom algorithm")
    
    # 6. Hạn chế và cải thiện
    print(f"\n⚠️ 6. HẠN CHẾ VÀ HƯỚNG CẢI THIỆN:")
    print("-" * 30)
    
    print(f"   🔴 Hạn chế hiện tại:")
    print(f"      • Keyword-based matching (chưa semantic)")
    print(f"      • CV parsing đơn giản (chưa OCR)")
    print(f"      • Cold start trên Render Free")
    print(f"      • Chưa có vector database")
    
    print(f"\n   🟢 Hướng cải thiện:")
    print(f"      • Sentence Transformers cho semantic matching")
    print(f"      • pgvector cho vector search")
    print(f"      • OCR cho CV phức tạp")
    print(f"      • Collaborative filtering")
    print(f"      • Anti-keyword stuffing")

if __name__ == "__main__":
    from django.db import models
    analyze_system()