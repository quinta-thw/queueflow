from django.db import models


class Service(models.Model):
    ICON_CHOICES = [
        ('registrar', 'Registrar'),
        ('finance', 'Finance'),
        ('health', 'Health Clinic'),
        ('library', 'Library'),
        ('ict', 'ICT Support'),
        ('student_affairs', 'Student Affairs'),
        ('admissions', 'Admissions'),
        ('cafeteria', 'Cafeteria'),
        ('course_advisor', 'Course Advisor'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=30, choices=ICON_CHOICES, default='registrar')
    location = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    opening_time = models.TimeField(default='08:00')
    closing_time = models.TimeField(default='17:00')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
