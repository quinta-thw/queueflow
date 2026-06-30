from django.contrib import admin
from .models import Queue, Ticket


@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    list_display = ['service', 'date', 'is_open', 'is_paused', 'waiting_count', 'served_count']
    list_filter = ['date', 'is_open', 'is_paused']
    date_hierarchy = 'date'


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_code', 'student', 'queue', 'status', 'joined_at']
    list_filter = ['status', 'queue__date']
    search_fields = ['ticket_code', 'student__first_name', 'student__last_name']
