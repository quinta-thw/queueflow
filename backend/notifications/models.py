from django.db import models
from accounts.models import CustomUser


class Notification(models.Model):
    TYPE_CHOICES = [
        ('queue_joined', 'Queue Joined'),
        ('queue_progressing', 'Queue Progressing'),
        ('almost_turn', 'Almost Your Turn'),
        ('your_turn', 'Your Turn'),
        ('queue_cancelled', 'Queue Cancelled'),
        ('queue_paused', 'Queue Paused'),
        ('announcement', 'Announcement'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='announcement')
    sender_department = models.CharField(max_length=100, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} -> {self.user.email}"
