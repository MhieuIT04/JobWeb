#!/usr/bin/env python3
"""
Test script để kiểm tra logic matching CV đã cải thiện
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from BE.jobs.ai_services import CVAnalysisService

def test_improved_matching():
    """Test logic matching đã cải thiện"""
    print("🧪 TESTING IMPROVED CV MATCHING LOGIC")
    print("=" * 60)
    
    cv_analyzer = CVAnalysisService()
    
    # Test CV với skills Python
    python_cv = """
    Nguyễn Văn A
    Senior Python Developer
    
    SKILLS:
    • Programming: Python, Django, Flask, FastAPI
    • Frontend: React, JavaScript, HTML, CSS
    • Database: PostgreSQL, MySQL, MongoDB
    • Tools: Git, Docker, Kubernetes, AWS
    • Soft Skills: Problem solving, teamwork, leadership, communication
    • Languages: Lập trình Python, phát triển web
    """
    
    # Test Job descriptions
    jobs = [
        {
            "title": "Python Developer",
            "description": "Tuyển dụng Python Developer có kinh nghiệm Django, PostgreSQL, AWS. Yêu cầu teamwork, communication skills."
        },
        {
            "title": "Frontend Developer", 
            "description": "Cần tuyển Frontend Developer biết React, JavaScript, HTML, CSS. Ưu tiên có kinh nghiệm UI/UX."
        },
        {
            "title": "Marketing Manager",
            "description": "Tuyển Marketing Manager có kinh nghiệm digital marketing, social media, content creation."
        },
        {
            "title": "Full Stack Developer",
            "description": "Tuyển Full Stack Developer biết Python, React, PostgreSQL, Docker. Yêu cầu problem solving, leadership."
        }
    ]
    
    # Extract skills từ CV
    cv_skills = cv_analyzer.extract_skills_from_text(python_cv)
    print(f"📋 CV Skills extracted: {len(cv_skills)} skills")
    print(f"   Skills: {', '.join(cv_skills[:10])}")
    print()
    
    # Test matching với từng job
    print("🎯 MATCHING RESULTS:")
    print("-" * 60)
    
    for i, job in enumerate(jobs, 1):
        match_score = cv_analyzer.calculate_match_score(
            cv_skills, 
            job["description"], 
            job["title"]
        )
        
        match_percentage = min(match_score * 20, 100)
        
        print(f"{i}. {job['title']}")
        print(f"   Match Score: {match_score}/5.0 ({match_percentage:.1f}%)")
        
        # Extract job skills để so sánh
        job_skills = cv_analyzer.extract_skills_from_text(f"{job['title']} {job['description']}")
        matching_skills = set([s.lower() for s in cv_skills]) & set([s.lower() for s in job_skills])
        
        print(f"   Job Skills: {', '.join(job_skills[:5])}")
        print(f"   Matching Skills: {', '.join(list(matching_skills)[:5])}")
        print()
    
    print("✅ Test completed!")
    print()
    print("📊 ANALYSIS:")
    print("- Python Developer job should have highest score (most relevant)")
    print("- Full Stack job should have high score (overlapping skills)")  
    print("- Frontend job should have medium score (some overlap)")
    print("- Marketing job should have lowest score (no technical overlap)")

if __name__ == "__main__":
    test_improved_matching()