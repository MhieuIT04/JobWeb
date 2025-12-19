#!/usr/bin/env python3
"""
Test để đo độ chính xác của phân tích CV
"""
import os
import sys
import django

# Setup Django
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')
django.setup()

from BE.jobs.ai_services import CVAnalysisService
from BE.jobs.models import Application, Job
import pandas as pd

def test_cv_analysis_accuracy():
    """Test độ chính xác phân tích CV"""
    print("🎯 KIỂM TRA ĐỘ CHÍNH XÁC PHÂN TÍCH CV")
    print("=" * 60)
    
    cv_service = CVAnalysisService()
    
    # 1. Test với CV mẫu có ground truth
    test_cases = [
        {
            "cv_text": """
            Nguyễn Văn A
            Senior Python Developer
            
            SKILLS:
            • Programming: Python, Django, Flask, FastAPI
            • Frontend: React, JavaScript, HTML, CSS
            • Database: PostgreSQL, MySQL, MongoDB
            • Tools: Git, Docker, Kubernetes, AWS
            • Soft Skills: Problem solving, teamwork, leadership, communication
            """,
            "expected_skills": ['python', 'django', 'flask', 'react', 'javascript', 'html', 'css', 
                              'postgresql', 'mysql', 'mongodb', 'git', 'docker', 'kubernetes', 'aws',
                              'problem solving', 'teamwork', 'leadership', 'communication'],
            "job_title": "Python Developer",
            "job_desc": "Tuyển Python Developer biết Django, PostgreSQL, có kinh nghiệm teamwork",
            "expected_score_range": (3.5, 5.0)
        },
        {
            "cv_text": """
            Trần Thị B
            Marketing Specialist
            
            SKILLS:
            • Digital Marketing: SEO, SEM, Social Media
            • Analytics: Google Analytics, Facebook Analytics
            • Tools: Google Ads, Facebook Ads Manager
            • Content: Content creation, copywriting
            • Soft Skills: Creative, analytical, communication
            """,
            "expected_skills": ['marketing', 'communication', 'creative', 'analytical'],
            "job_title": "Marketing Manager", 
            "job_desc": "Cần Marketing Manager có kinh nghiệm digital marketing, social media",
            "expected_score_range": (2.0, 4.0)
        },
        {
            "cv_text": """
            Lê Văn C
            Fresh Graduate
            
            EDUCATION:
            • Computer Science Degree
            
            SKILLS:
            • Basic programming knowledge
            • Microsoft Office
            • Communication skills
            """,
            "expected_skills": ['communication'],
            "job_title": "Senior Java Developer",
            "job_desc": "Tuyển Senior Java Developer có 5+ năm kinh nghiệm Spring Boot, Microservices",
            "expected_score_range": (0.0, 2.0)
        }
    ]
    
    print("📊 TESTING CV ANALYSIS ACCURACY:")
    print("-" * 40)
    
    total_tests = len(test_cases)
    skill_extraction_correct = 0
    score_prediction_correct = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}:")
        
        # Test skill extraction
        extracted_skills = cv_service.extract_skills_from_text(test_case["cv_text"])
        expected_skills = test_case["expected_skills"]
        
        # Calculate skill extraction accuracy
        extracted_set = set([s.lower() for s in extracted_skills])
        expected_set = set([s.lower() for s in expected_skills])
        
        intersection = extracted_set & expected_set
        union = extracted_set | expected_set
        
        if union:
            skill_accuracy = len(intersection) / len(union)
        else:
            skill_accuracy = 1.0 if not extracted_set and not expected_set else 0.0
        
        print(f"   📝 Skills extracted: {len(extracted_skills)} skills")
        print(f"   📝 Expected skills: {len(expected_skills)} skills")
        print(f"   📝 Matching skills: {len(intersection)} skills")
        print(f"   📝 Skill extraction accuracy: {skill_accuracy:.2%}")
        
        if skill_accuracy >= 0.5:  # 50% threshold
            skill_extraction_correct += 1
        
        # Test match score
        match_score = cv_service.calculate_match_score(
            extracted_skills, 
            test_case["job_desc"], 
            test_case["job_title"]
        )
        
        expected_range = test_case["expected_score_range"]
        score_in_range = expected_range[0] <= match_score <= expected_range[1]
        
        print(f"   🎯 Match score: {match_score}/5.0")
        print(f"   🎯 Expected range: {expected_range[0]}-{expected_range[1]}")
        print(f"   🎯 Score prediction: {'✅ Correct' if score_in_range else '❌ Incorrect'}")
        
        if score_in_range:
            score_prediction_correct += 1
    
    # Calculate overall accuracy
    skill_extraction_accuracy = (skill_extraction_correct / total_tests) * 100
    score_prediction_accuracy = (score_prediction_correct / total_tests) * 100
    
    print(f"\n📈 OVERALL ACCURACY RESULTS:")
    print(f"   🔍 Skill Extraction Accuracy: {skill_extraction_accuracy:.1f}% ({skill_extraction_correct}/{total_tests})")
    print(f"   🎯 Score Prediction Accuracy: {score_prediction_accuracy:.1f}% ({score_prediction_correct}/{total_tests})")
    print(f"   📊 Average Accuracy: {(skill_extraction_accuracy + score_prediction_accuracy) / 2:.1f}%")
    
    # 2. Test với dữ liệu thực từ database
    print(f"\n🗄️ TESTING WITH REAL DATABASE:")
    print("-" * 40)
    
    applications = Application.objects.filter(
        skills_extracted__isnull=False,
        match_score__isnull=False
    )[:10]  # Test với 10 applications thực
    
    if applications.exists():
        print(f"   📊 Found {applications.count()} real applications with AI data")
        
        scores = [app.match_score for app in applications if app.match_score]
        if scores:
            avg_score = sum(scores) / len(scores)
            print(f"   📊 Average match score: {avg_score:.2f}/5.0")
            print(f"   📊 Score distribution:")
            print(f"      • High (4.0-5.0): {len([s for s in scores if s >= 4.0])} applications")
            print(f"      • Medium (2.0-3.9): {len([s for s in scores if 2.0 <= s < 4.0])} applications") 
            print(f"      • Low (0.0-1.9): {len([s for s in scores if s < 2.0])} applications")
    else:
        print("   ⚠️ No real applications with AI data found")
    
    return {
        'skill_extraction_accuracy': skill_extraction_accuracy,
        'score_prediction_accuracy': score_prediction_accuracy,
        'overall_accuracy': (skill_extraction_accuracy + score_prediction_accuracy) / 2
    }

if __name__ == "__main__":
    results = test_cv_analysis_accuracy()
    print(f"\n✅ Test completed!")
    print(f"📊 Final Results: {results['overall_accuracy']:.1f}% overall accuracy")