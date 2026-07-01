from rest_framework import serializers
from .models import CustomUser


class StudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'student_id', 'school', 'programme', 'year_of_study',
            'password', 'confirm_password',
        ]

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        username = validated_data['email'].split('@')[0]
        user = CustomUser(role='student', username=username, is_verified=True, **validated_data)
        user.set_password(password)
        user.save()
        return user


class StaffRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'staff_id', 'department', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        username = validated_data['email'].split('@')[0]
        # Staff accounts start unverified — admin must approve before they can log in
        user = CustomUser(role='staff', username=username, is_verified=False, **validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'role', 'is_verified', 'avatar', 'student_id', 'school', 'programme',
            'year_of_study', 'staff_id', 'department', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'date_joined']


class AdminStaffSerializer(serializers.ModelSerializer):
    """Used by admin to list and verify staff accounts."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'full_name', 'first_name', 'last_name', 'email',
            'staff_id', 'department', 'is_verified', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name()


class AdminUserSerializer(serializers.ModelSerializer):
    """Used by admin to list and delete any user."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'full_name', 'email', 'role',
            'student_id', 'staff_id', 'department', 'school',
            'programme', 'is_verified', 'date_joined',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data
