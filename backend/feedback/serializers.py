from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'student', 'student_name', 'service', 'service_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']
