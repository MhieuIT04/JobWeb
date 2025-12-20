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
    
    def calculate_match_score(self, cv_skills: List[str], job_description: str, job_title: str = "") -> float:
        """Calculate match score between CV skills and job requirements"""
        if not cv_skills or not job_description:
            return 0.0
        
        # Combine job title and description for better matching
        full_job_text = f"{job_title} {job_description}".lower()
        job_skills = self.extract_skills_from_text(full_job_text)
        
        # FIX 1: Return 0.0 if no meaningful skills found in job
        if not job_skills:
            return 0.0
        
        # Normalize skills for better matching
        cv_skills_normalized = [skill.lower().strip() for skill in cv_skills]
        job_skills_normalized = [skill.lower().strip() for skill in job_skills]
        
        # FIX 2: Filter out single-letter skills that cause false positives
        # Remove single letters like 'r', 'c', 'go' unless they're clearly technical
        meaningful_job_skills = []
        for skill in job_skills_normalized:
            if len(skill) == 1:
                # Only keep single letters if they're clearly programming languages
                if skill in ['r', 'c']:
                    # Check if it appears in a technical context
                    if any(tech_word in full_job_text for tech_word in 
                          ['programming', 'developer', 'software', 'code', 'lập trình', 'phát triển']):
                        meaningful_job_skills.append(skill)
                # Skip other single letters
            elif len(skill) == 2 and skill == 'go':
                # 'Go' language - only keep if in technical context
                if any(tech_word in full_job_text for tech_word in 
                      ['programming', 'developer', 'software', 'golang', 'lập trình']):
                    meaningful_job_skills.append(skill)
            else:
                # Keep all multi-character skills
                meaningful_job_skills.append(skill)
        
        # If no meaningful skills after filtering, return low score
        if not meaningful_job_skills:
            return 0.5  # Very low score for jobs with no clear technical requirements
        
        job_skills_normalized = meaningful_job_skills
        
        # Calculate exact matches
        exact_matches = set(cv_skills_normalized) & set(job_skills_normalized)
        
        # Calculate partial matches (for compound skills)
        partial_matches = set()
        for cv_skill in cv_skills_normalized:
            for job_skill in job_skills_normalized:
                if len(cv_skill) > 2 and len(job_skill) > 2:  # Only partial match longer skills
                    if cv_skill in job_skill or job_skill in cv_skill:
                        if cv_skill not in exact_matches and job_skill not in exact_matches:
                            partial_matches.add((cv_skill, job_skill))
        
        # FIX 3: Require minimum matches for high scores
        total_matches = len(exact_matches) + len(partial_matches) * 0.5
        
        # If very few matches, cap the score
        if total_matches < 2:
            max_possible_score = 3.0  # Cap at 3.0 for jobs with <2 skill matches
        else:
            max_possible_score = 5.0
        
        # Calculate weighted score
        exact_weight = 1.0
        partial_weight = 0.5
        
        weighted_matches = len(exact_matches) * exact_weight + len(partial_matches) * partial_weight
        total_required = len(job_skills_normalized)
        
        # Base match ratio
        match_ratio = min(1.0, weighted_matches / total_required)
        
        # Convert to 0-5 scale
        base_score = match_ratio * max_possible_score
        
        # FIX 4: Only apply bonuses if there are meaningful matches
        score = base_score
        
        if total_matches >= 2:  # Only give bonuses for jobs with real skill overlap
            # Bonus for high skill diversity
            if len(cv_skills) > 15:
                score += 0.2  # Reduced bonus
            elif len(cv_skills) > 10:
                score += 0.1  # Reduced bonus
            
            # Bonus for exact matches on critical skills
            critical_skills = ['python', 'javascript', 'java', 'react', 'django', 'nodejs', 'sql', 'mysql', 'postgresql']
            critical_matches = sum(1 for skill in exact_matches if any(crit in skill for crit in critical_skills))
            if critical_matches > 0:
                score += critical_matches * 0.1
        
        # Penalty for very low skill count
        if len(cv_skills) < 3:
            score *= 0.8
        
        # Ensure score is within bounds
        score = max(0.0, min(5.0, score))
        
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
            match_score = self.cv_analyzer.calculate_match_score(
                cv_analysis['skills_extracted'],
                application.job.description,
                application.job.title
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