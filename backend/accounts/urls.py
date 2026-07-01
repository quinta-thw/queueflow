from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, StudentRegisterView, StaffRegisterView, LogoutView,
    ProfileView, ChangePasswordView,
    AdminStaffListView, AdminVerifyStaffView, AdminDashboardStatsView,
    AdminUserListView, AdminDeleteUserView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/student/', StudentRegisterView.as_view(), name='register-student'),
    path('register/staff/', StaffRegisterView.as_view(), name='register-staff'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Admin endpoints
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('admin/staff/', AdminStaffListView.as_view(), name='admin-staff-list'),
    path('admin/staff/<int:pk>/verify/', AdminVerifyStaffView.as_view(), name='admin-verify-staff'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
]
