# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

# ===== CÁC MODEL CHUNG =====

class City(models.Model):
    """Lưu trữ thông tin các thành phố."""
    name = models.CharField(max_length=100, unique=True)
    # Có thể thêm các trường khác như 'country', 'slug', v.v.

    class Meta:
        db_table = 'cities'
        verbose_name_plural = "Cities" # Sửa lỗi chính tả "Citys" trong admin

    def __str__(self):
        return self.name

class Skill(models.Model):
    """Lưu trữ thông tin các kỹ năng."""
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'skills'

    def __str__(self):
        return self.name

# ===== CUSTOM USER MODEL =====

class User(AbstractUser):
    """
    Model người dùng tùy chỉnh.
    Kế thừa từ AbstractUser để có sẵn các trường và quyền của Django.
    """
    # Ghi đè trường email để nó là duy nhất và bắt buộc khi tạo user
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    
    # Thêm các vai trò cho người dùng
    ROLE_CHOICES = (
        ('candidate', 'Candidate'),
        ('employer', 'Employer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='candidate')

    # Dùng email làm trường định danh chính để đăng nhập
    USERNAME_FIELD = 'email'
    
    # Các trường bắt buộc khi tạo user bằng lệnh createsuperuser
    # 'username' vẫn cần vì AbstractUser yêu cầu, nhưng nó không cần là duy nhất
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

# ===== PROFILE MODEL =====

class Profile(models.Model):
    """
    Model Profile để lưu trữ thông tin mở rộng của User.
    Được tạo tự động mỗi khi một User mới được tạo.
    """
    # Liên kết một-một tới User. Nếu User bị xóa, Profile cũng bị xóa.
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    
    # Các thông tin hồ sơ
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    skills = models.ManyToManyField(Skill, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    # ... thêm các trường khác bạn muốn như 'date_of_birth', 'linkedin_url', v.v.

    class Meta:
        db_table = 'profiles'

    def __str__(self):
        return f"{self.user.email}'s Profile"

# ===== TỰ ĐỘNG TẠO PROFILE CHO USER MỚI =====

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal này sẽ tự động tạo một Profile mỗi khi một User mới được tạo.
    """
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal này sẽ tự động lưu Profile mỗi khi User được lưu.
    """
    instance.profile.save()

# ===== EMPLOYER REVIEWS =====

class EmployerReview(models.Model):
    """Review/Ratings for employers (companies)."""
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employer_reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    # Structured ratings (1-5)
    culture_rating = models.PositiveSmallIntegerField(default=0)
    salary_rating = models.PositiveSmallIntegerField(default=0)
    process_rating = models.PositiveSmallIntegerField(default=0)
    overall_rating = models.FloatField(default=0)
    comment = models.TextField(blank=True)
    verified = models.BooleanField(default=False)  # true if reviewer applied to employer's jobs
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employer_reviews'
        unique_together = ('employer', 'reviewer')
        indexes = [
            models.Index(fields=['employer']),
            models.Index(fields=['reviewer']),
            models.Index(fields=['overall_rating']),
            models.Index(fields=['verified']),
        ]

    def __str__(self):
        return f"{self.reviewer.email} -> {self.employer.email} ({self.overall_rating})"

# ===== CHAT / MESSAGING =====

class ChatThread(models.Model):
    participant_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_threads_a')
    participant_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_threads_b')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_threads'
        unique_together = ('participant_a', 'participant_b')
        indexes = [
            models.Index(fields=['participant_a']),
            models.Index(fields=['participant_b'])
        ]

    def __str__(self):
        return f"Thread {self.id}"

    def has_user(self, user):
        return user_id(user) in [self.participant_a_id, self.participant_b_id]


def user_id(u):
    return getattr(u, 'id', u)


def normalized_pair(u1, u2):
    a, b = sorted([user_id(u1), user_id(u2)])
    return a, b


class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    file = models.FileField(upload_to='chat/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'chat_messages'
        indexes = [
            models.Index(fields=['thread']),
            models.Index(fields=['created_at'])
        ]
