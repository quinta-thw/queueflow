from rest_framework import viewsets, permissions
from .models import Service
from .serializers import ServiceSerializer


class IsStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStaffUser()]

    def get_queryset(self):
        qs = Service.objects.all()
        if self.request.user.role == 'student':
            qs = qs.filter(is_active=True)
        return qs
