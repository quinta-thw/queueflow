from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['student', 'service', 'rating', 'created_at']
    list_filter = ['rating', 'service']
