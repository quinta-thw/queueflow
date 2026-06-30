from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from .models import Feedback
from .serializers import FeedbackSerializer


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        if self.request.user.role == 'student':
            return Feedback.objects.filter(student=self.request.user)
        return Feedback.objects.all().select_related('student', 'service')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        if request.user.role != 'staff':
            return Response({'error': 'Staff only.'}, status=status.HTTP_403_FORBIDDEN)
        from services.models import Service
        summary = []
        for service in Service.objects.filter(is_active=True):
            feedbacks = Feedback.objects.filter(service=service)
            avg = feedbacks.aggregate(avg=Avg('rating'))['avg']
            summary.append({
                'service': service.name,
                'total_ratings': feedbacks.count(),
                'average_rating': round(avg, 1) if avg else None,
            })
        return Response(summary)
