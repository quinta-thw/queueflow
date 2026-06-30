from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/services/', include('services.urls')),
    path('api/queues/', include('queues.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/feedback/', include('feedback.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
