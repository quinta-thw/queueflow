from django.db import models
from django.utils import timezone
from accounts.models import CustomUser
from services.models import Service


class Queue(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='queues')
    date = models.DateField(default=timezone.now)
    is_open = models.BooleanField(default=False)
    is_paused = models.BooleanField(default=False)
    current_ticket_number = models.IntegerField(default=0)
    counter = models.CharField(max_length=20, default='Counter 1')
    opened_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='opened_queues'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['service', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.service.name} - {self.date}"

    def get_next_ticket_number(self):
        self.current_ticket_number += 1
        self.save()
        return self.current_ticket_number

    @property
    def waiting_count(self):
        return self.tickets.filter(status='waiting').count()

    @property
    def served_count(self):
        return self.tickets.filter(status='completed').count()

    @property
    def status_display(self):
        if not self.is_open:
            return 'closed'
        if self.is_paused:
            return 'paused'
        return 'open'

    @property
    def avg_wait_time(self):
        """Expected wait in minutes for a new person joining right now."""
        import math
        from django.db.models import Avg, F, ExpressionWrapper, DurationField

        serving = self.tickets.filter(status='serving', called_at__isnull=False).first()
        waiting = self.waiting_count

        # Nobody in queue and nobody being served → instant
        if waiting == 0 and not serving:
            return 0

        # Average service time per ticket from completed history
        completed = self.tickets.filter(
            status='completed',
            called_at__isnull=False,
            served_at__isnull=False,
        ).annotate(
            duration=ExpressionWrapper(F('served_at') - F('called_at'), output_field=DurationField())
        ).aggregate(avg=Avg('duration'))['avg']
        avg_per_ticket = max(1, round(completed.total_seconds() / 60)) if completed else 5

        # Time remaining for whoever is currently being served
        remaining_for_serving = 0
        if serving:
            elapsed = (timezone.now() - serving.called_at).total_seconds() / 60
            if elapsed < avg_per_ticket:
                remaining_for_serving = avg_per_ticket - elapsed
            else:
                # Overrunning: bump in 5-min blocks
                overrun_blocks = math.ceil((elapsed - avg_per_ticket) / 5)
                remaining_for_serving = avg_per_ticket + overrun_blocks * 5 - elapsed

        return round(remaining_for_serving + waiting * avg_per_ticket)


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('serving', 'Now Serving'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    QUEUE_TYPE_CHOICES = [('physical', 'Physical'), ('virtual', 'Virtual')]

    queue = models.ForeignKey(Queue, on_delete=models.CASCADE, related_name='tickets')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tickets')
    ticket_number = models.IntegerField()
    ticket_code = models.CharField(max_length=10)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='waiting')
    queue_type = models.CharField(max_length=10, choices=QUEUE_TYPE_CHOICES, default='physical')
    position = models.IntegerField(default=0)
    joined_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    served_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['ticket_number']

    def __str__(self):
        return f"{self.ticket_code} - {self.student.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.ticket_code:
            prefix = self.queue.service.name[:1].upper()
            self.ticket_code = f"{prefix}-{str(self.ticket_number).zfill(3)}"
        super().save(*args, **kwargs)

    @property
    def people_ahead(self):
        if self.status != 'waiting':
            return 0
        return self.queue.tickets.filter(
            status='waiting', ticket_number__lt=self.ticket_number
        ).count()

    @property
    def estimated_wait(self):
        if self.status != 'waiting':
            return 0
        # Queue's avg_wait_time now returns the full wait for a new joiner.
        # For this ticket specifically: (people_ahead + 1 serving slot) already included.
        # Reuse queue calculation anchored on this ticket's position.
        import math
        from django.db.models import Avg, F, ExpressionWrapper, DurationField

        ahead = self.people_ahead
        completed = self.queue.tickets.filter(
            status='completed', called_at__isnull=False, served_at__isnull=False,
        ).annotate(
            duration=ExpressionWrapper(F('served_at') - F('called_at'), output_field=DurationField())
        ).aggregate(avg=Avg('duration'))['avg']
        avg_per_ticket = max(1, round(completed.total_seconds() / 60)) if completed else 5

        serving = self.queue.tickets.filter(status='serving', called_at__isnull=False).first()
        remaining_for_serving = 0
        if serving:
            elapsed = (timezone.now() - serving.called_at).total_seconds() / 60
            if elapsed < avg_per_ticket:
                remaining_for_serving = avg_per_ticket - elapsed
            else:
                overrun_blocks = math.ceil((elapsed - avg_per_ticket) / 5)
                remaining_for_serving = avg_per_ticket + overrun_blocks * 5 - elapsed

        return round(remaining_for_serving + ahead * avg_per_ticket)
