from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def broadcast(self, request):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        from accounts.models import CustomUser
        title = request.data.get('title', '')
        message = request.data.get('message', '')
        department = request.user.department or ''
        students = CustomUser.objects.filter(role='student', is_active=True)
        notifications = [
            Notification(
                user=student, title=title, message=message,
                notification_type='announcement', sender_department=department,
            )
            for student in students
        ]
        Notification.objects.bulk_create(notifications)
        return Response({'message': f'Broadcast sent to {len(notifications)} students.'})
