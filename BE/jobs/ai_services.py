"""
AI Services for CV Analysis and Job Matching
"""
import logging
from typing import Dict, List, Optional
from django.utils import timezone
import requests
import json

logger = logging.getLogger(__name__)

class CVAnalysisService:
    """Service for analyzing CV and calculating job match scores"""
    
    def __init__(self):
        self.skills_keywords = [
            # Technical Skills
            'python', 'javascript', 'java', 'react', 'django', 'nodejs', 'sql',
            'html', 'css', 'git', 'docker', 'kubernetes', 'aws', 'azure',
            
            # Soft Skills
            'teamwork', 'leadership', 'communication', 'problem solving',
            'project management', 'analytical', 'creative', 'adaptable',
            
            # Vietnamese Skills
            'lập trình', 'phát triển', 'thiết kế', 'quản lý', 'phân tích',
            'giao tiếp', 'làm việc nhóm', 'lãnh đạo', 'sáng tạo'
        ]
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from CV text"""
        if not text:
            return []
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skills_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates
    
    def calculate_match_score(self, cv_skills: List[str], job_description: str) -> float:
        """Calculate match score between CV skills and job requirements"""
        if not cv_skills or not job_description:
            return 0.0
        
        job_desc_lower = job_description.lower()
        job_skills = self.extract_skills_from_text(job_description)
        
        if not job_skills:
            return 2.5  # Default score if no skills detected in job
        
        # Calculate overlap
        matching_skills = set(cv_skills) & set(job_skills)
        match_ratio = len(matching_skills) / len(job_skills)
        
        # Convert to 0-5 scale
        score = min(5.0, match_ratio * 5.0)
        
        # Add bonus for high skill count
        if len(cv_skills) > 10:
            score += 0.5
        
        return round(score, 2)
    
    def process_cv_text(self, cv_text: str) -> Dict:
        """Process CV text and extract information"""
        try:
            skills = self.extract_skills_from_text(cv_text)
            
            return {
                'skills_extracted': skills,
                'skills_count': len(skills),
                'processed_at': timezone.now().isoformat(),
                'success': True
            }
        except Exception as e:
            logger.error(f"Error processing CV text: {str(e)}")
            return {
                'skills_extracted': [],
                'skills_count': 0,
                'error': str(e),
                'success': False
            }

class JobMatchingService:
    """Service for matching applications with jobs"""
    
    def __init__(self):
        self.cv_analyzer = CVAnalysisService()
    
    def analyze_application(self, application) -> Dict:
        """Analyze application and calculate match score"""
        try:
            # For demo purposes, simulate CV text extraction
            # In real implementation, you would extract text from PDF/DOCX
            cv_text = self._simulate_cv_text_extraction(application)
            
            # Extract skills from CV
            cv_analysis = self.cv_analyzer.process_cv_text(cv_text)
            
            if not cv_analysis['success']:
                return cv_analysis
            
            # Calculate match score with job
            job_description = f"{application.job.title} {application.job.description}"
            match_score = self.cv_analyzer.calculate_match_score(
                cv_analysis['skills_extracted'],
                job_description
            )
            
            # Update application
            application.match_score = match_score
            application.skills_extracted = cv_analysis['skills_extracted']
            application.ai_processed_at = timezone.now()
            application.save()
            
            return {
                'match_score': match_score,
                'skills_extracted': cv_analysis['skills_extracted'],
                'success': True,
                'message': f'Match score calculated: {match_score}/5.0'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing application {application.id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _simulate_cv_text_extraction(self, application) -> str:
        """Simulate CV text extraction for demo purposes"""
        # In real implementation, use libraries like PyPDF2, python-docx
        # to extract text from uploaded CV files
        
        sample_cv_texts = [
            """
            Nguyễn Văn A
            Software Developer
            Skills: Python, Django, React, JavaScript, SQL, Git
            Experience: 3 years in web development
            Education: Computer Science
            """,
            """
            Trần Thị B  
            Marketing Specialist
            Skills: Digital Marketing, SEO, Social Media, Analytics
            Experience: 2 years in marketing
            Education: Marketing
            """,
            """
            Lê Văn C
            Data Analyst
            Skills: Python, SQL, Excel, Tableau, Machine Learning
            Experience: 1 year in data analysis
            Education: Statistics
            """
        ]
        
        # Return a random sample for demo
        import random
        return random.choice(sample_cv_texts)

# Service instances
cv_analysis_service = CVAnalysisService()
job_matching_service = JobMatchingService()