#!/usr/bin/env python3
"""
Test đơn giản logic CV matching
"""

# Simulate CVAnalysisService logic
class SimpleCVAnalyzer:
    def __init__(self):
        self.skills_keywords = [
            # Programming Languages
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
            'kotlin', 'typescript', 'scala', 'r', 'matlab', 'perl', 'dart', 'objective-c',
            
            # Web Technologies
            'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'laravel',
            'spring', 'asp.net', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
            'jquery', 'webpack', 'babel', 'npm', 'yarn',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
            'sql server', 'cassandra', 'dynamodb', 'firebase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions',
            'terraform', 'ansible', 'chef', 'puppet', 'vagrant', 'nginx', 'apache',
            
            # Mobile Development
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
            
            # Data Science & AI
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
            'scikit-learn', 'jupyter', 'tableau', 'power bi', 'spark', 'hadoop',
            
            # Tools & Frameworks
            'git', 'svn', 'jira', 'confluence', 'slack', 'trello', 'asana', 'figma', 'sketch',
            'photoshop', 'illustrator', 'indesign', 'after effects', 'premiere',
            
            # Soft Skills (English)
            'teamwork', 'leadership', 'communication', 'problem solving', 'critical thinking',
            'project management', 'analytical', 'creative', 'adaptable', 'time management',
            'customer service', 'presentation', 'negotiation', 'mentoring', 'coaching',
            
            # Vietnamese Technical Skills
            'lập trình', 'phát triển web', 'phát triển ứng dụng', 'thiết kế web', 'thiết kế ui/ux',
            'cơ sở dữ liệu', 'hệ thống', 'mạng máy tính', 'bảo mật', 'kiểm thử phần mềm',
            'phân tích dữ liệu', 'trí tuệ nhân tạo', 'học máy', 'blockchain', 'iot',
            
            # Vietnamese Soft Skills
            'giao tiếp', 'làm việc nhóm', 'lãnh đạo', 'sáng tạo', 'quản lý dự án',
            'phân tích', 'giải quyết vấn đề', 'tư duy logic', 'thuyết trình', 'đàm phán',
            'chăm sóc khách hàng', 'quản lý thời gian', 'làm việc độc lập', 'học hỏi nhanh',
            
            # Business Skills
            'marketing', 'sales', 'business analysis', 'financial analysis', 'accounting',
            'hr management', 'recruitment', 'training', 'consulting', 'strategy',
            
            # Vietnamese Business Skills
            'marketing', 'bán hàng', 'phân tích kinh doanh', 'kế toán', 'tài chính',
            'nhân sự', 'tuyển dụng', 'đào tạo', 'tư vấn', 'chiến lược kinh doanh'
        ]
    
    def extract_skills_from_text(self, text):
        if not text:
            return []
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skills_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return list(set(found_skills))
    
    def calculate_match_score(self, cv_skills, job_description, job_title=""):
        if not cv_skills or not job_description:
            return 0.0
        
        # Combine job title and description
        full_job_text = f"{job_title} {job_description}".lower()
        job_skills = self.extract_skills_from_text(full_job_text)
        
        if not job_skills:
            return 2.5
        
        # Normalize skills
        cv_skills_normalized = [skill.lower().strip() for skill in cv_skills]
        job_skills_normalized = [skill.lower().strip() for skill in job_skills]
        
        # Calculate exact matches
        exact_matches = set(cv_skills_normalized) & set(job_skills_normalized)
        
        # Calculate partial matches
        partial_matches = set()
        for cv_skill in cv_skills_normalized:
            for job_skill in job_skills_normalized:
                if cv_skill in job_skill or job_skill in cv_skill:
                    if cv_skill not in exact_matches and job_skill not in exact_matches:
                        partial_matches.add((cv_skill, job_skill))
        
        # Calculate weighted score
        exact_weight = 1.0
        partial_weight = 0.5
        
        total_matches = len(exact_matches) * exact_weight + len(partial_matches) * partial_weight
        total_required = len(job_skills_normalized)
        
        # Base match ratio
        match_ratio = min(1.0, total_matches / total_required)
        
        # Convert to 0-5 scale
        base_score = match_ratio * 5.0
        
        # Apply bonuses and penalties
        score = base_score
        
        # Bonus for high skill diversity
        if len(cv_skills) > 15:
            score += 0.3
        elif len(cv_skills) > 10:
            score += 0.2
        
        # Bonus for exact matches on critical skills
        critical_skills = ['python', 'javascript', 'java', 'react', 'django', 'nodejs', 'sql']
        critical_matches = sum(1 for skill in exact_matches if any(crit in skill for crit in critical_skills))
        if critical_matches > 0:
            score += critical_matches * 0.1
        
        # Penalty for very low skill count
        if len(cv_skills) < 3:
            score *= 0.8
        
        # Ensure score is within bounds
        score = max(0.0, min(5.0, score))
        
        return round(score, 2)

def test_cv_matching():
    """Test CV matching logic"""
    print("🔍 TESTING CV MATCHING LOGIC")
    print("=" * 60)
    
    analyzer = SimpleCVAnalyzer()
    
    # Skills từ screenshot
    screenshot_skills = ['firebase', 'css', 'java', 'react', 'git', 'chef', 'javascript', 
                        'c#', 'django', 'python', 'communication', 'deep learning', 
                        'html', 'postgresql', 'android', 'r', 'go']
    
    print(f"📱 CV Skills: {len(screenshot_skills)} skills")
    print(f"    {screenshot_skills[:8]}...")
    
    # Test jobs
    test_jobs = [
        {
            "title": "Python Developer",
            "description": "Tuyển Python Developer có kinh nghiệm Django, PostgreSQL, React, Git. Yêu cầu 2+ năm kinh nghiệm.",
            "expected": "HIGH (tech match)"
        },
        {
            "title": "Frontend Developer", 
            "description": "Cần Frontend Developer biết React, JavaScript, HTML, CSS, responsive design.",
            "expected": "HIGH (frontend match)"
        },
        {
            "title": "Marketing Manager",
            "description": "Tuyển Marketing Manager có kinh nghiệm digital marketing, social media, content creation.",
            "expected": "LOW (no tech overlap)"
        },
        {
            "title": "Java Developer",
            "description": "Tuyển Java Developer có kinh nghiệm Spring Boot, MySQL, Git, team work.",
            "expected": "MEDIUM (some overlap)"
        },
        {
            "title": "Data Scientist",
            "description": "Cần Data Scientist biết Python, R, machine learning, deep learning, PostgreSQL.",
            "expected": "HIGH (data science match)"
        }
    ]
    
    print(f"\n🎯 TESTING JOB MATCHES:")
    print("-" * 60)
    
    results = []
    for job in test_jobs:
        # Extract job skills
        job_skills = analyzer.extract_skills_from_text(f"{job['title']} {job['description']}")
        
        # Calculate match score
        match_score = analyzer.calculate_match_score(
            screenshot_skills, 
            job['description'], 
            job['title']
        )
        
        # Calculate overlap
        cv_skills_lower = set([s.lower() for s in screenshot_skills])
        job_skills_lower = set([s.lower() for s in job_skills])
        overlap = cv_skills_lower & job_skills_lower
        
        results.append({
            'job': job,
            'score': match_score,
            'job_skills': job_skills,
            'overlap': list(overlap),
            'overlap_count': len(overlap)
        })
        
        print(f"📋 {job['title']}")
        print(f"   🎯 Score: {match_score}/5.0 ({match_score*20:.1f}%)")
        print(f"   📝 Job Skills: {job_skills[:5]}...")
        print(f"   🔗 Overlap ({len(overlap)}): {list(overlap)[:5]}...")
        print(f"   📊 Expected: {job['expected']}")
        print()
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    print(f"🏆 RANKING BY SCORE:")
    print("-" * 30)
    for i, result in enumerate(results, 1):
        job = result['job']
        print(f"{i}. {job['title']} - {result['score']}/5.0")
    
    # Analysis
    print(f"\n📊 ANALYSIS:")
    print("-" * 30)
    
    tech_jobs = [r for r in results if 'Developer' in r['job']['title'] or 'Data Scientist' in r['job']['title']]
    marketing_jobs = [r for r in results if 'Marketing' in r['job']['title']]
    
    if tech_jobs and marketing_jobs:
        avg_tech_score = sum(r['score'] for r in tech_jobs) / len(tech_jobs)
        avg_marketing_score = sum(r['score'] for r in marketing_jobs) / len(marketing_jobs)
        
        print(f"   💻 Average Tech Job Score: {avg_tech_score:.2f}/5.0")
        print(f"   📢 Average Marketing Score: {avg_marketing_score:.2f}/5.0")
        
        if avg_tech_score > avg_marketing_score:
            print(f"   ✅ GOOD: Tech jobs scored higher (algorithm works correctly)")
        else:
            print(f"   ❌ PROBLEM: Marketing jobs scored higher (algorithm issue)")
    
    # Check if top job is appropriate
    top_job = results[0]['job']['title']
    if 'Developer' in top_job or 'Data Scientist' in top_job:
        print(f"   ✅ GOOD: Top job '{top_job}' is tech-related")
    else:
        print(f"   ❌ PROBLEM: Top job '{top_job}' is not tech-related")
    
    return results

if __name__ == "__main__":
    results = test_cv_matching()
    
    print(f"\n🎯 RECOMMENDATIONS:")
    print("=" * 30)
    
    # Check if algorithm is working correctly
    tech_in_top_3 = sum(1 for r in results[:3] if 'Developer' in r['job']['title'] or 'Data Scientist' in r['job']['title'])
    
    if tech_in_top_3 >= 2:
        print("✅ Algorithm is working reasonably well")
        print("   - Tech jobs are ranking high")
        print("   - Skills matching is logical")
    else:
        print("❌ Algorithm needs improvement")
        print("   - Tech jobs should rank higher")
        print("   - Consider adjusting weights or skill categories")
        
    print(f"\n💡 SUGGESTIONS:")
    print("   1. Add more specific tech skills to database")
    print("   2. Increase weight for exact skill matches")
    print("   3. Add category-based bonus scoring")
    print("   4. Filter out irrelevant job categories")