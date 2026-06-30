from django.contrib import admin
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'location', 'is_active', 'opening_time', 'closing_time']
    list_filter = ['is_active', 'icon']
    search_fields = ['name', 'location']
    list_editable = ['is_active']
