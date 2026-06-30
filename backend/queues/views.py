from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Queue, Ticket
from .serializers import QueueSerializer, TicketSerializer, JoinQueueSerializer
from services.models import Service
from notifications.models import Notification


class IsStaff(IsAuthenticated.__class__):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'staff'


class QueueViewSet(viewsets.ModelViewSet):
    serializer_class = QueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Queue.objects.select_related('service')
        # Only filter to today for the list endpoint; detail/action endpoints need broader access
        if self.action == 'list':
            qs = qs.filter(date=timezone.now().date())
        if user.role == 'staff' and user.department:
            qs = qs.filter(service__name__iexact=user.department)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'join']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'])
    def join(self, request):
        serializer = JoinQueueSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        service = get_object_or_404(Service, id=serializer.validated_data['service_id'], is_active=True)

        existing = Ticket.objects.filter(
            queue__service=service,
            queue__date=timezone.now().date(),
            student=request.user,
            status__in=['waiting', 'serving']
        ).first()
        if existing:
            return Response(
                {'error': 'You already have an active ticket for this service.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queue = Queue.objects.filter(service=service, date=timezone.now().date()).first()
        if queue and not queue.is_open:
            return Response({'error': 'This queue has been closed by staff.'}, status=status.HTTP_400_BAD_REQUEST)
        if queue and queue.is_paused:
            return Response({'error': 'This queue is temporarily paused.'}, status=status.HTTP_400_BAD_REQUEST)
        if not queue:
            queue = Queue.objects.create(service=service, date=timezone.now().date(), is_open=True)

        ticket_number = queue.get_next_ticket_number()
        ticket = Ticket.objects.create(
            queue=queue,
            student=request.user,
            ticket_number=ticket_number,
            queue_type=serializer.validated_data.get('queue_type', 'physical'),
        )

        Notification.objects.create(
            user=request.user,
            title='Queue Joined',
            message=f'You have joined the {service.name} queue. Your ticket is {ticket.ticket_code}.',
            notification_type='queue_joined',
        )

        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def start(self, request):
        """Create (or reopen) today's queue for the staff member's department."""
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        if not request.user.department:
            return Response({'error': 'No department assigned to your account.'}, status=status.HTTP_400_BAD_REQUEST)
        service = Service.objects.filter(name__iexact=request.user.department, is_active=True).first()
        if not service:
            return Response({'error': 'No active service found for your department.'}, status=status.HTTP_404_NOT_FOUND)
        queue, _ = Queue.objects.get_or_create(
            service=service,
            date=timezone.now().date(),
            defaults={'is_open': True, 'opened_by': request.user},
        )
        if not queue.is_open:
            queue.is_open = True
            queue.is_paused = False
            queue.opened_by = request.user
            queue.save()
        return Response(QueueSerializer(queue).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def open(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        queue = self.get_object()
        queue.is_open = True
        queue.is_paused = False
        queue.opened_by = request.user
        queue.save()
        return Response(QueueSerializer(queue).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def close(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        queue = self.get_object()
        queue.is_open = False
        queue.save()
        return Response(QueueSerializer(queue).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pause(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        queue = self.get_object()
        queue.is_paused = True
        queue.save()
        return Response(QueueSerializer(queue).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def resume(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        queue = self.get_object()
        queue.is_paused = False
        queue.save()
        return Response(QueueSerializer(queue).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def call_next(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        queue = self.get_object()

        current_serving = queue.tickets.filter(status='serving').first()
        if current_serving:
            return Response(
                {'error': 'Mark the current ticket as Complete or No Show before calling the next student.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        next_ticket = queue.tickets.filter(status='waiting').order_by('ticket_number').first()
        if not next_ticket:
            return Response({'message': 'No more tickets in queue.'}, status=status.HTTP_200_OK)

        next_ticket.status = 'serving'
        next_ticket.called_at = timezone.now()
        next_ticket.save()

        Notification.objects.create(
            user=next_ticket.student,
            title='Your Turn!',
            message=f'Ticket {next_ticket.ticket_code} — please proceed to {queue.counter}.',
            notification_type='your_turn',
        )

        ahead_ticket = queue.tickets.filter(status='waiting').order_by('ticket_number').first()
        if ahead_ticket:
            Notification.objects.create(
                user=ahead_ticket.student,
                title='Almost Your Turn',
                message=f'You are next in line at {queue.service.name}. Get ready!',
                notification_type='almost_turn',
            )

        return Response(TicketSerializer(next_ticket).data)


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Ticket.objects.filter(student=user).select_related('queue__service', 'student')
        qs = Ticket.objects.all().select_related('queue__service', 'student')
        # Staff only ever see tickets in their own department's queues
        if user.role == 'staff' and user.department:
            qs = qs.filter(queue__service__name__iexact=user.department)
        queue_id = self.request.query_params.get('queue')
        if queue_id:
            qs = qs.filter(queue_id=queue_id)
        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        ticket = self.get_object()
        if request.user.role == 'student' and ticket.student != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        if ticket.status not in ['waiting']:
            return Response({'error': 'Cannot cancel this ticket.'}, status=status.HTTP_400_BAD_REQUEST)
        ticket.status = 'cancelled'
        ticket.save()
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        ticket = self.get_object()
        ticket.status = 'completed'
        ticket.served_at = timezone.now()
        ticket.save()
        Notification.objects.create(
            user=ticket.student,
            title='Service Completed',
            message=f'Your {ticket.queue.service.name} session is complete. Thank you for your patience!',
            notification_type='queue_joined',
        )
        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def no_show(self, request, pk=None):
        if request.user.role != 'staff':
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        ticket = self.get_object()
        ticket.status = 'no_show'
        ticket.save()
        Notification.objects.create(
            user=ticket.student,
            title='Queue Session Closed',
            message=f'Your {ticket.queue.service.name} queue session (ticket {ticket.ticket_code}) was closed because you did not show up when called. Please rejoin if you still need assistance.',
            notification_type='queue_cancelled',
        )

        return Response(TicketSerializer(ticket).data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        if request.user.role == 'student':
            tickets = Ticket.objects.filter(
                student=request.user, status__in=['waiting', 'serving']
            ).select_related('queue__service')
            return Response(TicketSerializer(tickets, many=True).data)
        return Response({'error': 'Students only.'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if request.user.role != 'staff':
            return Response({'error': 'Staff only.'}, status=status.HTTP_403_FORBIDDEN)
        from django.db.models import Count, Avg, F
        from django.utils import timezone as tz
        today = tz.now().date()
        tickets = Ticket.objects.filter(queue__date=today)
        if request.user.department:
            tickets = tickets.filter(queue__service__name__iexact=request.user.department)
        return Response({
            'total': tickets.count(),
            'waiting': tickets.filter(status='waiting').count(),
            'serving': tickets.filter(status='serving').count(),
            'completed': tickets.filter(status='completed').count(),
            'no_show': tickets.filter(status='no_show').count(),
            'cancelled': tickets.filter(status='cancelled').count(),
        })

    @action(detail=False, methods=['get'])
    def hourly(self, request):
        if request.user.role != 'staff':
            return Response({'error': 'Staff only.'}, status=status.HTTP_403_FORBIDDEN)
        from django.db.models.functions import TruncHour
        from django.db.models import Count
        today = timezone.now().date()
        rows = (
            Ticket.objects.filter(queue__date=today)
            .annotate(hour=TruncHour('joined_at'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        result = []
        for row in rows:
            if row['hour']:
                h = row['hour'].hour
                period = 'AM' if h < 12 else 'PM'
                hour_12 = h % 12 or 12
                result.append({'hour': f'{hour_12} {period}', 'count': row['count']})
        return Response(result)
