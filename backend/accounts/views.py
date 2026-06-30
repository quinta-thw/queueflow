from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import (
    StudentRegisterSerializer, StaffRegisterSerializer,
    UserProfileSerializer, ChangePasswordSerializer, AdminStaffSerializer
)


def _is_admin(user):
    return user.is_authenticated and user.role == 'admin'


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        role     = request.data.get('role', 'student')

        try:
            user_obj = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request=request, username=user_obj.email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Role mismatch (admin can sign in via 'admin' role tab)
        if user.role != role:
            return Response(
                {'error': f'This account is not registered as {role}.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Block unverified staff from logging in
        if user.role == 'staff' and not user.is_verified:
            return Response(
                {'error': 'Your account is pending admin verification. Please check back later.'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserProfileSerializer(user).data,
        })


class StudentRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'user':    UserProfileSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StaffRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StaffRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # No JWT — staff must wait for admin verification before they can log in
            return Response({
                'user': UserProfileSerializer(user).data,
                'message': 'Account created. Awaiting admin verification.',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Admin views ────────────────────────────────────────────────────────────────

class AdminStaffListView(APIView):
    """List all staff accounts (verified and pending). Admin only."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        staff = CustomUser.objects.filter(role='staff').order_by('is_verified', '-date_joined')
        return Response(AdminStaffSerializer(staff, many=True).data)


class AdminVerifyStaffView(APIView):
    """Approve or reject a staff account. Admin only."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not _is_admin(request.user):
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = CustomUser.objects.get(pk=pk, role='staff')
        except CustomUser.DoesNotExist:
            return Response({'error': 'Staff account not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')  # 'approve' or 'reject'
        if action == 'approve':
            user.is_verified = True
            user.save()
            return Response({'message': f'{user.get_full_name()} approved.', 'user': AdminStaffSerializer(user).data})
        elif action == 'reject':
            name = user.get_full_name()
            user.delete()
            return Response({'message': f'{name} rejected and removed.'})
        return Response({'error': 'Action must be "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardStatsView(APIView):
    """Summary stats for the admin dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'total_students':      CustomUser.objects.filter(role='student').count(),
            'total_staff':         CustomUser.objects.filter(role='staff').count(),
            'pending_staff':       CustomUser.objects.filter(role='staff', is_verified=False).count(),
            'verified_staff':      CustomUser.objects.filter(role='staff', is_verified=True).count(),
        })
