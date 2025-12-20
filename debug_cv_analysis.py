#!/usr/bin/env python3
"""
Debug CV analysis và matching logic
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from BE.jobs.ai_services import CVAnalysisService
from BE.jobs.models import Job
import pandas as pd

def debug_cv_analysis():
    """Debug tại sao CV analysis không chính xác"""
    print("🔍 DEBUGGING CV ANALYSIS LOGIC")
    print("=" * 60)
    
    cv_service = CVAnalysisService()
    
    # 1. Test với CV có skills rõ ràng
    test_cv_text = """
    Kỹ năng trong CV:
    Firebase, CSS, Java, React, Git, Chef, Javascript, C#, Django, Python, 
    Communication, Deep Learning, Html, Postgresql, Android, R, Go
    
    Kinh nghiệm: 3 năm lập trình Python, Django web development
    """
    
    print("1. TESTING CV SKILLS EXTRACTION:")
    extracted_skills = cv_service.extract_skills_from_text(test_cv_text)
    print(f"   📝 Skills found: {len(extracted_skills)} skills")
    print(f"   📝 Skills list: {extracted_skills}")
    
    # 2. Test với các job thực tế
    print(f"\n2. TESTING JOB MATCHING:")
    
    # Lấy một số jobs mẫu
    sample_jobs = Job.objects.filter(status='approved')[:5]
    
    for job in sample_jobs:
        # Extract skills từ job
        job_skills = cv_service.extract_skills_from_text(f"{job.title} {job.description}")
        
        # Tính match score
        match_score = cv_service.calculate_match_score(
            extracted_skills, 
            job.description, 
            job.title
        )
        
        print(f"\n   🏢 Job: {job.title[:50]}...")
        print(f"      📍 Category: {job.category.name if job.category else 'N/A'}")
        print(f"      🎯 Match Score: {match_score}/5.0 ({match_score*20:.1f}%)")
        print(f"      📝 Job Skills: {job_skills[:5]}...")
        
        # Tính overlap
        cv_skills_lower = set([s.lower() for s in extracted_skills])
        job_skills_lower = set([s.lower() for s in job_skills])
        overlap = cv_skills_lower & job_skills_lower
        
        print(f"      🔗 Overlapping skills: {list(overlap)[:3]}...")
        print(f"      📊 Overlap ratio: {len(overlap)}/{len(job_skills_lower)} = {len(overlap)/len(job_skills_lower)*100:.1f}%")
    
    # 3. Kiểm tra tại sao gợi ý không đúng
    print(f"\n3. ANALYZING WHY RECOMMENDATIONS ARE WRONG:")
    
    # Test với skills cụ thể từ screenshot
    screenshot_skills = ['firebase', 'css', 'java', 'react', 'git', 'chef', 'javascript', 
                        'c#', 'django', 'python', 'communication', 'deep learning', 
                        'html', 'postgresql', 'android', 'r', 'go']
    
    print(f"   📱 Skills from screenshot: {len(screenshot_skills)} skills")
    
    # Tìm jobs phù hợp với skills này
    all_jobs = Job.objects.filter(status='approved')
    job_matches = []
    
    for job in all_jobs:
        match_score = cv_service.calculate_match_score(
            screenshot_skills, 
            job.description, 
            job.title
        )
        
        if match_score > 2.0:  # Chỉ lấy jobs có điểm > 2.0
            job_matches.append({
                'job': job,
                'score': match_score,
                'category': job.category.name if job.category else 'N/A'
            })
    
    # Sort by score
    job_matches.sort(key=lambda x: x['score'], reverse=True)
    
    print(f"\n   🎯 TOP MATCHING JOBS (should be tech-related):")
    for i, match in enumerate(job_matches[:10], 1):
        job = match['job']
        print(f"      {i}. {job.title[:40]}... | {match['category']} | {match['score']:.2f}/5.0")
    
    # 4. Kiểm tra vấn đề với algorithm
    print(f"\n4. CHECKING ALGORITHM ISSUES:")
    
    # Test với job marketing vs tech skills
    marketing_job_desc = "Tuyển nhân viên marketing, social media, content creation, quảng cáo Facebook"
    tech_job_desc = "Tuyển Python Developer, Django, PostgreSQL, React, Git, có kinh nghiệm 2+ năm"
    
    marketing_score = cv_service.calculate_match_score(screenshot_skills, marketing_job_desc, "Marketing Manager")
    tech_score = cv_service.calculate_match_score(screenshot_skills, tech_job_desc, "Python Developer")
    
    print(f"   📊 Marketing job score: {marketing_score}/5.0")
    print(f"   📊 Tech job score: {tech_score}/5.0")
    
    if marketing_score > tech_score:
        print(f"   ❌ PROBLEM: Marketing job scored higher than tech job!")
        print(f"   🔍 This suggests the algorithm has issues")
    else:
        print(f"   ✅ GOOD: Tech job scored higher as expected")
    
    # 5. Kiểm tra skills database
    print(f"\n5. CHECKING SKILLS DATABASE:")
    print(f"   📊 Total skills in database: {len(cv_service.skills_keywords)}")
    
    tech_skills = [s for s in cv_service.skills_keywords if s.lower() in 
                   ['python', 'java', 'javascript', 'react', 'django', 'html', 'css', 'git']]
    marketing_skills = [s for s in cv_service.skills_keywords if s.lower() in 
                       ['marketing', 'social media', 'content', 'seo', 'facebook']]
    
    print(f"   💻 Tech skills available: {tech_skills}")
    print(f"   📢 Marketing skills available: {marketing_skills}")
    
    return {
        'extracted_skills': extracted_skills,
        'top_matches': job_matches[:5],
        'algorithm_issue': marketing_score > tech_score
    }

if __name__ == "__main__":
    results = debug_cv_analysis()
    
    print(f"\n📋 SUMMARY:")
    print(f"   - Skills extracted: {len(results['extracted_skills'])}")
    print(f"   - Top matches found: {len(results['top_matches'])}")
    print(f"   - Algorithm issue: {results['algorithm_issue']}")
    
    if results['algorithm_issue']:
        print(f"\n⚠️ RECOMMENDATION: Fix matching algorithm to prioritize relevant skills")