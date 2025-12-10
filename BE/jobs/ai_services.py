"""
AI Services for CV Analysis and Job Matching
"""
import logging
from typing import Dict, List, Optional
from django.utils import timezone
import requests
import json

logger = logging.getLogger(__name__)

class AIProcessingError(Exception):
    """Custom exception for AI processing errors"""
    pass

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
        self.max_retries = 3
        self.timeout = 30  # seconds
    
    def extract_text_from_file(self, file) -> str:
        """Extract text from uploaded CV file"""
        try:
            import io
            
            # Read file content
            file_content = file.read()
            file.seek(0)  # Reset file pointer
            
            if file.content_type == 'application/pdf':
                try:
                    import PyPDF2
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    return text
                except ImportError:
                    # Fallback: return basic text representation
                    return f"PDF file uploaded: {file.name}"
                except Exception as e:
                    logger.error(f"Error extracting PDF text: {e}")
                    return f"PDF content from {file.name}"
            
            elif file.content_type in ['application/msword', 
                                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
                try:
                    import docx
                    doc = docx.Document(io.BytesIO(file_content))
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    return text
                except ImportError:
                    # Fallback: return basic text representation
                    return f"Word document uploaded: {file.name}"
                except Exception as e:
                    logger.error(f"Error extracting Word text: {e}")
                    return f"Word document content from {file.name}"
            
            else:
                # Try to decode as text
                try:
                    return file_content.decode('utf-8')
                except UnicodeDecodeError:
                    return f"File uploaded: {file.name}"
                    
        except Exception as e:
            logger.error(f"Error processing file {file.name}: {e}")
            # Return filename as fallback to allow skill extraction to continue
            return f"CV file: {file.name}"
    
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
    
    def process_cv_text(self, cv_text: str, retry_count: int = 0) -> Dict:
        """Process CV text and extract information with error handling"""
        try:
            if not cv_text or len(cv_text.strip()) < 10:
                raise AIProcessingError("CV text is too short or empty")
            
            skills = self.extract_skills_from_text(cv_text)
            
            if len(skills) == 0:
                logger.warning("No skills extracted from CV text")
            
            return {
                'skills_extracted': skills,
                'skills_count': len(skills),
                'processed_at': timezone.now().isoformat(),
                'success': True,
                'retry_count': retry_count
            }
            
        except AIProcessingError as e:
            logger.error(f"AI Processing Error: {str(e)}")
            return {
                'skills_extracted': [],
                'skills_count': 0,
                'error': f"AI Processing Error: {str(e)}",
                'error_type': 'ai_processing_error',
                'success': False,
                'retry_count': retry_count
            }
            
        except Exception as e:
            logger.error(f"Unexpected error processing CV text: {str(e)}")
            
            # Retry logic
            if retry_count < self.max_retries:
                logger.info(f"Retrying CV processing (attempt {retry_count + 1}/{self.max_retries})")
                return self.process_cv_text(cv_text, retry_count + 1)
            
            return {
                'skills_extracted': [],
                'skills_count': 0,
                'error': f"Processing failed after {self.max_retries} retries: {str(e)}",
                'error_type': 'system_error',
                'success': False,
                'retry_count': retry_count
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
        """Simulate CV text extraction based on user profile"""
        # In real implementation, use libraries like PyPDF2, python-docx
        # to extract text from uploaded CV files
        
        user = application.user
        profile = getattr(user, 'profile', None)
        
        # Create realistic CV text based on user profile and job
        if profile:
            name = f"{profile.first_name} {profile.last_name}".strip() or user.email
            bio = profile.bio or ""
        else:
            name = user.email
            bio = ""
        
        # Generate CV text based on user email/profile
        if 'python' in user.email.lower():
            cv_text = f"""
            {name}
            Senior Python Developer
            
            SKILLS:
            • Programming: Python, Django, Flask, FastAPI
            • Frontend: React, JavaScript, HTML, CSS
            • Database: PostgreSQL, MySQL, MongoDB
            • Tools: Git, Docker, Kubernetes, AWS
            • Soft Skills: Problem solving, teamwork, leadership, communication
            • Languages: Lập trình Python, phát triển web
            
            EXPERIENCE:
            • 4+ years in Python web development
            • Built scalable web applications using Django
            • Experience with React frontend development
            • Database design and optimization
            • Team collaboration and project management
            
            EDUCATION:
            • Computer Science degree
            • Continuous learning in software engineering
            
            {bio}
            """
        elif 'js' in user.email.lower() or 'javascript' in user.email.lower():
            cv_text = f"""
            {name}
            Full Stack JavaScript Developer
            
            SKILLS:
            • Programming: JavaScript, TypeScript, Node.js
            • Frontend: React, Vue.js, Angular, HTML, CSS
            • Backend: Express.js, NestJS
            • Database: MongoDB, PostgreSQL
            • Tools: Git, Docker, npm, webpack
            • Soft Skills: Creative, analytical, teamwork, communication
            
            EXPERIENCE:
            • 3+ years in JavaScript development
            • Full stack web application development
            • RESTful API design and implementation
            • Modern frontend frameworks
            • Agile development methodology
            
            EDUCATION:
            • Web Development certification
            • Self-taught programmer
            
            {bio}
            """
        elif 'market' in user.email.lower():
            cv_text = f"""
            {name}
            Digital Marketing Specialist
            
            SKILLS:
            • Digital Marketing: SEO, SEM, Social Media Marketing
            • Analytics: Google Analytics, Facebook Analytics
            • Tools: Google Ads, Facebook Ads Manager
            • Content: Content creation, copywriting
            • Soft Skills: Creative, analytical, communication, giao tiếp
            • Languages: Marketing strategy, phân tích dữ liệu
            
            EXPERIENCE:
            • 3+ years in digital marketing
            • Campaign management and optimization
            • Social media strategy and execution
            • Data analysis and reporting
            • Brand management
            
            EDUCATION:
            • Marketing degree
            • Google Ads certification
            • Facebook Blueprint certification
            
            {bio}
            """
        else:
            # Generic CV
            cv_text = f"""
            {name}
            Professional
            
            SKILLS:
            • Communication, teamwork, leadership
            • Problem solving, analytical thinking
            • Project management, time management
            • Computer literacy, Microsoft Office
            • Adaptable, creative, hardworking
            
            EXPERIENCE:
            • Professional work experience
            • Team collaboration
            • Customer service
            
            EDUCATION:
            • University degree
            
            {bio}
            """
        
        return cv_text

# Service instances
cv_analysis_service = CVAnalysisService()
job_matching_service = JobMatchingService()