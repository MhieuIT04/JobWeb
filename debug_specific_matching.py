#!/usr/bin/env python3
"""
Debug specific matching issue: Tech CV getting high score for design job
"""
import sys
import os
sys.path.append('BE')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recruitment.settings')

import django
django.setup()

from jobs.ai_services import CVAnalysisService

def debug_specific_case():
    """Debug tại sao CV tech lại match với công việc thiết kế"""
    print("🔍 DEBUGGING SPECIFIC MATCHING ISSUE")
    print("=" * 60)
    
    # CV skills từ hình ảnh
    cv_skills = [
        'Java', 'Django', 'PostgreSQL', 'C#', 'CSS', 'Python', 'Firebase', 
        'Chef', 'Communication', 'Javascript', 'Go', 'R', 'Android', 
        'Deep Learning', 'Git', 'React', 'Html'
    ]
    
    # Job description từ hình ảnh
    job_title = "ý tưởng thiết kế sản phẩm"
    job_description = """ý tưởng thiết kế sản phẩm nhận diện thương hiệu công ty ấn phẩm truyền thông nhận sản phẩm đăng facebook tối rời bandroll bao bì nhãn sản phẩm"""
    
    print(f"📱 CV Skills ({len(cv_skills)}): {cv_skills}")
    print(f"📋 Job Title: {job_title}")
    print(f"📝 Job Description: {job_description}")
    
    # Test với service hiện tại
    service = CVAnalysisService()
    
    print(f"\n🔍 STEP-BY-STEP ANALYSIS:")
    print("-" * 40)
    
    # 1. Extract skills from job
    full_job_text = f"{job_title} {job_description}".lower()
    job_skills = service.extract_skills_from_text(full_job_text)
    
    print(f"1. Job Skills Extracted: {job_skills}")
    print(f"   📊 Count: {len(job_skills)}")
    
    # 2. Normalize skills
    cv_skills_normalized = [skill.lower().strip() for skill in cv_skills]
    job_skills_normalized = [skill.lower().strip() for skill in job_skills]
    
    print(f"\n2. Normalized Skills:")
    print(f"   CV: {cv_skills_normalized}")
    print(f"   Job: {job_skills_normalized}")
    
    # 3. Find matches
    exact_matches = set(cv_skills_normalized) & set(job_skills_normalized)
    print(f"\n3. Exact Matches: {exact_matches}")
    print(f"   📊 Count: {len(exact_matches)}")
    
    # 4. Find partial matches
    partial_matches = set()
    for cv_skill in cv_skills_normalized:
        for job_skill in job_skills_normalized:
            if cv_skill in job_skill or job_skill in cv_skill:
                if cv_skill not in exact_matches and job_skill not in exact_matches:
                    partial_matches.add((cv_skill, job_skill))
    
    print(f"\n4. Partial Matches: {partial_matches}")
    print(f"   📊 Count: {len(partial_matches)}")
    
    # 5. Calculate score step by step
    if not job_skills:
        print(f"\n⚠️ NO JOB SKILLS FOUND - RETURNING DEFAULT SCORE 2.5")
        final_score = 2.5
    else:
        exact_weight = 1.0
        partial_weight = 0.5
        
        total_matches = len(exact_matches) * exact_weight + len(partial_matches) * partial_weight
        total_required = len(job_skills_normalized)
        
        match_ratio = min(1.0, total_matches / total_required)
        base_score = match_ratio * 5.0
        
        print(f"\n5. Score Calculation:")
        print(f"   Total Matches: {total_matches} (exact: {len(exact_matches)}, partial: {len(partial_matches)})")
        print(f"   Total Required: {total_required}")
        print(f"   Match Ratio: {match_ratio:.3f}")
        print(f"   Base Score: {base_score:.2f}")
        
        # Apply bonuses
        score = base_score
        
        # Skill diversity bonus
        if len(cv_skills) > 15:
            score += 0.3
            print(f"   + Diversity Bonus (>15 skills): +0.3")
        elif len(cv_skills) > 10:
            score += 0.2
            print(f"   + Diversity Bonus (>10 skills): +0.2")
        
        # Critical skills bonus
        critical_skills = ['python', 'javascript', 'java', 'react', 'django', 'nodejs', 'sql']
        critical_matches = sum(1 for skill in exact_matches if any(crit in skill for crit in critical_skills))
        if critical_matches > 0:
            bonus = critical_matches * 0.1
            score += bonus
            print(f"   + Critical Skills Bonus: +{bonus:.1f}")
        
        # Low skill penalty
        if len(cv_skills) < 3:
            score *= 0.8
            print(f"   × Low Skills Penalty: ×0.8")
        
        final_score = max(0.0, min(5.0, score))
        print(f"   Final Score (capped): {final_score:.2f}")
    
    # 6. Test with actual service
    actual_score = service.calculate_match_score(cv_skills, job_description, job_title)
    
    print(f"\n🎯 RESULTS:")
    print(f"   Manual Calculation: {final_score:.2f}")
    print(f"   Service Result: {actual_score:.2f}")
    print(f"   Match: {'✅' if abs(final_score - actual_score) < 0.01 else '❌'}")
    
    print(f"\n🚨 PROBLEM IDENTIFIED:")
    if not job_skills:
        print(f"   ❌ No skills found in job description")
        print(f"   ❌ System returns default score 2.5 instead of 0.0")
        print(f"   ❌ Bonuses still applied, pushing score to 5.0")
    else:
        print(f"   ⚠️ Skills found but logic may be flawed")
    
    print(f"\n💡 RECOMMENDED FIXES:")
    print(f"   1. Return 0.0 when no job skills found (not 2.5)")
    print(f"   2. Only apply bonuses when there are actual matches")
    print(f"   3. Add category-based filtering")
    print(f"   4. Require minimum skill overlap for high scores")

if __name__ == "__main__":
    debug_specific_case()