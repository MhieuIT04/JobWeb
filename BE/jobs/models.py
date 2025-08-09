from django.db import models

class WorkType(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'work_types'

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, null=True, blank=True)
    is_hot = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.name

class Job(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    employer = models.ForeignKey('users.User', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    work_type = models.ForeignKey(WorkType, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField()
    description_en = models.TextField(null=True, blank=True)
    city = models.ForeignKey('users.City', on_delete=models.SET_NULL, null=True)
    min_salary = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    max_salary = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    currency = models.CharField(max_length=10, default='VND')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_premium = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    logo = models.ImageField(upload_to='job_logos/', null=True, blank=True)

    class Meta:
        db_table = 'jobs'
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['status']),
            models.Index(fields=['category_id']),
        ]

    def __str__(self):
        return self.title

class JobSkill(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    skill = models.ForeignKey('users.Skill', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'job_skills'
        unique_together = ('job', 'skill')

    def __str__(self):
        return f"{self.job.title} - {self.skill.name}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    cv_url = models.CharField(max_length=255, null=True, blank=True)
    cover_letter = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    cv = models.FileField(upload_to='cvs/', null=True, blank=True)
    
    class Meta:
        db_table = 'applications'
        unique_together = ('user', 'job')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['job']),
            models.Index(fields=['status']),
            models.Index(fields=['applied_at']),
        ]

    def __str__(self):
        return f"{self.user.email} applied for {self.job.title}"

class Favorite(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ('user', 'job')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['job']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} favorited {self.job.title}"



