from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [('student', 'Student'), ('staff', 'Staff'), ('admin', 'Admin')]
    YEAR_CHOICES = [('Y1', 'Year 1'), ('Y2', 'Year 2'), ('Y3', 'Year 3'), ('Y4', 'Year 4')]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone_number = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # Staff/admin require manual verification before login
    is_verified = models.BooleanField(default=True)

    # Student-specific
    student_id = models.CharField(max_length=20, blank=True, unique=True, null=True)
    school = models.CharField(max_length=100, blank=True)
    programme = models.CharField(max_length=100, blank=True)
    year_of_study = models.CharField(max_length=5, choices=YEAR_CHOICES, blank=True)

    # Staff-specific
    staff_id = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_staff_member(self):
        return self.role == 'staff'

    @property
    def is_admin_user(self):
        return self.role == 'admin'
