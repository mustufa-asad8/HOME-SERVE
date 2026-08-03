from datetime import date
from django.db import IntegrityError
from rest_framework import serializers
from .models import Appointment, Category, Notification, ProviderProfile, Service, User


class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = ['business_name', 'bio', 'verified', 'rating', 'review_count', 'service_radius_km']
        read_only_fields = ['verified', 'rating', 'review_count']


class UserSerializer(serializers.ModelSerializer):
    provider_profile = ProviderProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password_hash', 'role', 'city', 'is_active', 'created_at', 'provider_profile']
        extra_kwargs = {'password_hash': {'write_only': True}}
        read_only_fields = ['created_at']

    def validate_email(self, value):
        normalized = value.strip().lower()
        queryset = User.objects.filter(email__iexact=normalized)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized

    def create(self, validated_data):
        user = super().create(validated_data)
        if user.role == 'provider':
            ProviderProfile.objects.get_or_create(
                user=user,
                defaults={'business_name': user.name, 'bio': 'New HomeServe service provider.'},
            )
        return user


class InternalUserSerializer(UserSerializer):
    password_hash = serializers.CharField()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    provider_name = serializers.SerializerMethodField()
    provider_verified = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'provider_name', 'provider_verified', 'rating', 'review_count',
            'category', 'category_name', 'title', 'description', 'city', 'price', 'price_unit',
            'duration_minutes', 'image_url', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']

    def _profile(self, obj):
        try:
            return obj.provider.provider_profile
        except ProviderProfile.DoesNotExist:
            return None

    def get_provider_name(self, obj):
        profile = self._profile(obj)
        return profile.business_name if profile else obj.provider.name

    def get_provider_verified(self, obj):
        profile = self._profile(obj)
        return bool(profile and profile.verified)

    def get_rating(self, obj):
        profile = self._profile(obj)
        return str(profile.rating if profile else 0)

    def get_review_count(self, obj):
        profile = self._profile(obj)
        return profile.review_count if profile else 0

    def validate_provider(self, provider):
        if provider.role != 'provider' or not provider.is_active:
            raise serializers.ValidationError('Services must belong to an active provider account.')
        return provider


class AppointmentSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    provider_email = serializers.EmailField(source='provider.email', read_only=True)
    provider_name = serializers.SerializerMethodField()
    service_id = serializers.PrimaryKeyRelatedField(source='service', queryset=Service.objects.filter(is_active=True))
    customer_id = serializers.PrimaryKeyRelatedField(source='customer', queryset=User.objects.filter(role='customer', is_active=True))
    provider_id = serializers.PrimaryKeyRelatedField(source='provider', queryset=User.objects.filter(role='provider', is_active=True))

    class Meta:
        model = Appointment
        fields = [
            'id', 'service_id', 'service_title', 'customer_id', 'customer_name', 'customer_email',
            'provider_id', 'provider_name', 'provider_email', 'date', 'time', 'address', 'notes',
            'status', 'amount', 'created_at', 'updated_at',
        ]
        read_only_fields = ['amount', 'created_at', 'updated_at']

    def get_provider_name(self, obj):
        try:
            return obj.provider.provider_profile.business_name
        except ProviderProfile.DoesNotExist:
            return obj.provider.name

    def validate(self, attrs):
        instance = self.instance
        service = attrs.get('service') or (instance.service if instance else None)
        customer = attrs.get('customer') or (instance.customer if instance else None)
        provider = attrs.get('provider') or (instance.provider if instance else None)
        visit_date = attrs.get('date') or (instance.date if instance else None)

        if not service or not customer or not provider:
            return attrs
        if customer.role != 'customer' or not customer.is_active:
            raise serializers.ValidationError('Appointment customer must be an active customer account.')
        if provider.role != 'provider' or not provider.is_active:
            raise serializers.ValidationError('Appointment provider must be an active provider account.')
        if service.provider_id != provider.id:
            raise serializers.ValidationError('Selected provider does not own this service.')
        if not instance and not service.is_active:
            raise serializers.ValidationError('This service is not currently bookable.')
        if not instance and visit_date and visit_date <= date.today():
            raise serializers.ValidationError('Appointments must be booked for a future date.')
        return attrs

    def create(self, validated_data):
        validated_data['amount'] = validated_data['service'].price
        try:
            return super().create(validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError('That provider time slot is no longer available.') from exc

    def update(self, instance, validated_data):
        # Appointment ownership and service identity are immutable after booking.
        for field in ('service', 'customer', 'provider', 'date', 'time', 'address', 'notes', 'amount'):
            validated_data.pop(field, None)
        return super().update(instance, validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
