from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import CustomUser
from services.models import Service


class Feedback(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='feedbacks')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.get_full_name()} -> {self.service.name}: {self.rating}/5"
