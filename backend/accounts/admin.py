from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'student_id', 'is_active']
    list_filter = ['role', 'is_active', 'year_of_study']
    search_fields = ['email', 'first_name', 'last_name', 'student_id']
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'phone_number', 'avatar')}),
        ('Student Info', {'fields': ('student_id', 'school', 'programme', 'year_of_study')}),
        ('Staff Info', {'fields': ('staff_id', 'department')}),
    )
