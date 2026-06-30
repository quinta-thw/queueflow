from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = 'Delete all operational data (queues, tickets, notifications, feedback) but keep users and services.'

    def handle(self, *args, **options):
        from queues.models import Queue, Ticket
        from notifications.models import Notification
        from feedback.models import Feedback

        with transaction.atomic():
            t_count = Ticket.objects.count()
            q_count = Queue.objects.count()
            n_count = Notification.objects.count()
            f_count = Feedback.objects.count()

            Ticket.objects.all().delete()
            Queue.objects.all().delete()
            Notification.objects.all().delete()
            Feedback.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(
            f'Deleted: {t_count} tickets, {q_count} queues, '
            f'{n_count} notifications, {f_count} feedback records. '
            f'Users and services are untouched.'
        ))
