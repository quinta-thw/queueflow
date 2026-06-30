from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    avg_wait_time = serializers.SerializerMethodField()
    queue_length = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = '__all__'

    def get_avg_wait_time(self, obj):
        today_queue = obj.queues.filter(date=__import__('datetime').date.today()).first()
        if today_queue:
            completed = today_queue.tickets.filter(status='completed')
            if completed.exists():
                times = [
                    (t.served_at - t.joined_at).seconds // 60
                    for t in completed
                    if t.served_at and t.joined_at
                ]
                return round(sum(times) / len(times)) if times else 0
        return 0

    def get_queue_length(self, obj):
        today_queue = obj.queues.filter(date=__import__('datetime').date.today()).first()
        if today_queue:
            return today_queue.tickets.filter(status='waiting').count()
        return 0
