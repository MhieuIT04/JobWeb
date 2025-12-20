#!/usr/bin/env python3
"""
Test improved matching algorithm with various scenarios
"""
import sys
import os
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')

import django
django.setup()

from jobs.ai_services import CVAnalysisService

def test_improved_matching():
    """Test thuật toán matching đã cải thiện"""
    print("🧪 TESTING IMPROVED MATCHING ALGORITHM")
    print("=" * 60)
    
    service = CVAnalysisService()
    
    # CV skills của developer
    tech_cv_skills = [
        'Java', 'Django', 'PostgreSQL', 'C#', 'CSS', 'Python', 'Firebase', 
        'Chef', 'Communication', 'Javascript', 'Go', 'R', 'Android', 
        'Deep Learning', 'Git', 'React', 'Html'
    ]
    
    # Test cases
    test_cases = [
        {
            'name': 'Design Job (Should be LOW)',
            'title': 'ý tưởng thiết kế sản phẩm',
            'description': 'ý tưởng thiết kế sản phẩm nhận diện thương hiệu công ty ấn phẩm truyền thông nhận sản phẩm đăng facebook tối rời bandroll bao bì nhãn sản phẩm',
            'expected': 'LOW (0.5-1.5)'
        },
        {
            'name': 'Python Developer (Should be HIGH)',
            'title': 'Python Developer',
            'description': 'We are looking for a Python developer with Django experience. Must know PostgreSQL, Git, and React for frontend. Experience with machine learning is a plus.',
            'expected': 'HIGH (4.0-5.0)'
        },
        {
            'name': 'Marketing Job (Should be LOW)',
            'title': 'Marketing Manager',
            'description': 'Quản lý marketing, lập kế hoạch truyền thông, phân tích thị trường, tăng trưởng doanh số bán hàng',
            'expected': 'LOW (0.5-2.0)'
        },
        {
            'name': 'Frontend Developer (Should be HIGH)',
            'title': 'Frontend Developer',
            'description': 'Frontend developer needed. Must know React, JavaScript, HTML, CSS. Experience with Git version control required.',
            'expected': 'HIGH (4.0-5.0)'
        },
        {
            'name': 'Data Scientist (Should be MEDIUM-HIGH)',
            'title': 'Data Scientist',
            'description': 'Data scientist position. Need Python, R programming, machine learning, deep learning experience. PostgreSQL knowledge preferred.',
            'expected': 'MEDIUM-HIGH (3.5-5.0)'
        },
        {
            'name': 'Sales Job (Should be VERY LOW)',
            'title': 'Sales Representative',
            'description': 'Bán hàng, chăm sóc khách hàng, tư vấn sản phẩm, đạt chỉ tiêu doanh số',
            'expected': 'VERY LOW (0.0-1.0)'
        }
    ]
    
    print(f"📱 Tech CV Skills ({len(tech_cv_skills)}): {tech_cv_skills[:5]}... (showing first 5)")
    print()
    
    results = []
    
    for i, case in enumerate(test_cases, 1):
        print(f"{i}. {case['name']}")
        print(f"   📋 Title: {case['title']}")
        print(f"   📝 Description: {case['description'][:60]}...")
        
        score = service.calculate_match_score(
            tech_cv_skills, 
            case['description'], 
            case['title']
        )
        
        print(f"   🎯 Score: {score}/5.0 ({score/5*100:.1f}%)")
        print(f"   📊 Expected: {case['expected']}")
        
        # Determine if result is as expected
        if 'HIGH' in case['expected'] and score >= 4.0:
            result = '✅ CORRECT'
        elif 'MEDIUM-HIGH' in case['expected'] and score >= 3.5:
            result = '✅ CORRECT'
        elif 'LOW' in case['expected'] and score <= 2.0:
            result = '✅ CORRECT'
        elif 'VERY LOW' in case['expected'] and score <= 1.0:
            result = '✅ CORRECT'
        else:
            result = '❌ INCORRECT'
        
        print(f"   {result}")
        print()
        
        results.append({
            'name': case['name'],
            'score': score,
            'expected': case['expected'],
            'correct': '✅' in result
        })
    
    # Summary
    print("📊 SUMMARY:")
    print("-" * 40)
    
    correct_count = sum(1 for r in results if r['correct'])
    total_count = len(results)
    accuracy = correct_count / total_count * 100
    
    print(f"✅ Correct predictions: {correct_count}/{total_count} ({accuracy:.1f}%)")
    
    for result in results:
        status = '✅' if result['correct'] else '❌'
        print(f"   {status} {result['name']}: {result['score']}/5.0")
    
    print(f"\n🎯 ALGORITHM PERFORMANCE:")
    if accuracy >= 80:
        print(f"   🎉 EXCELLENT: Algorithm is working well!")
    elif accuracy >= 60:
        print(f"   👍 GOOD: Algorithm needs minor improvements")
    else:
        print(f"   ⚠️ NEEDS WORK: Algorithm needs major improvements")
    
    print(f"\n💡 KEY IMPROVEMENTS MADE:")
    print(f"   ✅ Fixed false positive from single-letter matches")
    print(f"   ✅ Added context checking for ambiguous skills")
    print(f"   ✅ Capped scores for jobs with few skill matches")
    print(f"   ✅ Only apply bonuses when meaningful matches exist")
    print(f"   ✅ Return 0.0 instead of 2.5 for no-skill jobs")

if __name__ == "__main__":
    test_improved_matching()