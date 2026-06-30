from rest_framework import serializers
from .models import Queue, Ticket
from services.serializers import ServiceSerializer
from accounts.serializers import UserProfileSerializer


class TicketSerializer(serializers.ModelSerializer):
    student = UserProfileSerializer(read_only=True)
    service_name = serializers.CharField(source='queue.service.name', read_only=True)
    people_ahead = serializers.IntegerField(read_only=True)
    estimated_wait = serializers.IntegerField(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'queue', 'student', 'ticket_number', 'ticket_code', 'status',
            'queue_type', 'position', 'joined_at', 'called_at', 'served_at', 'notes',
            'service_name', 'people_ahead', 'estimated_wait',
        ]
        read_only_fields = ['id', 'ticket_number', 'ticket_code', 'joined_at']


class QueueSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('services.models', fromlist=['Service']).Service.objects.all(),
        source='service', write_only=True
    )
    waiting_count = serializers.IntegerField(read_only=True)
    served_count = serializers.IntegerField(read_only=True)
    avg_wait_time = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(read_only=True)
    current_ticket = serializers.SerializerMethodField()

    class Meta:
        model = Queue
        fields = [
            'id', 'service', 'service_id', 'date', 'is_open', 'is_paused',
            'current_ticket_number', 'counter', 'waiting_count', 'served_count',
            'avg_wait_time', 'status_display', 'current_ticket', 'created_at',
        ]

    def get_current_ticket(self, obj):
        ticket = obj.tickets.filter(status='serving').first()
        if ticket:
            return {'ticket_code': ticket.ticket_code, 'student_name': ticket.student.get_full_name()}
        return None


class JoinQueueSerializer(serializers.Serializer):
    service_id = serializers.IntegerField()
    queue_type = serializers.ChoiceField(choices=['physical', 'virtual'], default='physical')
