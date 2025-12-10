"""
Celery tasks for background processing
"""
import logging
from django.utils import timezone

# Import Celery only if available
try:
    from celery import shared_task
    HAS_CELERY = True
except ImportError:
    HAS_CELERY = False
    # Mock decorator for when Celery is not available
    def shared_task(bind=False, max_retries=3):
        def decorator(func):
            return func
        return decorator

from .models import Application
from .ai_services import job_matching_service
from notifications.utils import notify_ai_processing_complete, notify_ai_processing_failed

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_application_ai_async(self, application_id):
    """
    Background task to process AI analysis for application
    """
    try:
        logger.info(f"Starting AI processing for application {application_id}")
        
        # Get application
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            logger.error(f"Application {application_id} not found")
            return {
                'success': False,
                'error': 'Application not found',
                'application_id': application_id
            }
        
        # Check if already processed
        if application.ai_processed_at:
            logger.info(f"Application {application_id} already processed")
            return {
                'success': True,
                'message': 'Already processed',
                'application_id': application_id,
                'match_score': application.match_score
            }
        
        # Process AI analysis
        ai_result = job_matching_service.analyze_application(application)
        
        if ai_result['success']:
            logger.info(f"AI processing completed for application {application_id}")
            
            # Send success notification
            try:
                notify_ai_processing_complete(application)
            except Exception as e:
                logger.warning(f"Failed to send AI completion notification: {str(e)}")
            
            return {
                'success': True,
                'application_id': application_id,
                'match_score': ai_result['match_score'],
                'skills_extracted': ai_result['skills_extracted'],
                'message': ai_result['message']
            }
        else:
            # AI processing failed
            logger.error(f"AI processing failed for application {application_id}: {ai_result.get('error')}")
            
            # Send failure notification
            try:
                notify_ai_processing_failed(application, ai_result.get('error', 'Unknown error'))
            except Exception as e:
                logger.warning(f"Failed to send AI failure notification: {str(e)}")
            
            return {
                'success': False,
                'application_id': application_id,
                'error': ai_result.get('error', 'AI processing failed')
            }
            
    except Exception as exc:
        logger.error(f"Task failed for application {application_id}: {str(exc)}")
        
        # Retry logic
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying task for application {application_id} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=60 * (self.request.retries + 1))  # Exponential backoff
        
        # Max retries reached
        try:
            application = Application.objects.get(id=application_id)
            notify_ai_processing_failed(application, f"Task failed after {self.max_retries} retries: {str(exc)}")
        except:
            pass
        
        return {
            'success': False,
            'application_id': application_id,
            'error': f"Task failed after {self.max_retries} retries: {str(exc)}"
        }

@shared_task
def cleanup_failed_ai_processing():
    """
    Cleanup task to retry failed AI processing
    """
    from datetime import timedelta
    
    # Find applications without AI processing after 1 hour
    cutoff_time = timezone.now() - timedelta(hours=1)
    failed_applications = Application.objects.filter(
        ai_processed_at__isnull=True,
        applied_at__lt=cutoff_time
    )
    
    count = 0
    for application in failed_applications:
        try:
            process_application_ai_async.delay(application.id)
            count += 1
        except Exception as e:
            logger.error(f"Failed to queue retry for application {application.id}: {str(e)}")
    
    logger.info(f"Queued {count} applications for AI processing retry")
    return {'retried_count': count}

@shared_task
def batch_process_applications():
    """
    Batch process multiple applications for AI analysis
    """
    # Find unprocessed applications
    unprocessed = Application.objects.filter(
        ai_processed_at__isnull=True
    ).order_by('applied_at')[:10]  # Process 10 at a time
    
    results = []
    for application in unprocessed:
        try:
            result = process_application_ai_async.delay(application.id)
            results.append({
                'application_id': application.id,
                'task_id': result.id,
                'status': 'queued'
            })
        except Exception as e:
            logger.error(f"Failed to queue application {application.id}: {str(e)}")
            results.append({
                'application_id': application.id,
                'status': 'failed',
                'error': str(e)
            })
    
    return {
        'processed_count': len(results),
        'results': results
    }