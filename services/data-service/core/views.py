from django.db.models import Count, Sum
from django.http import Http404, JsonResponse
from rest_framework import filters, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Appointment, Category, Notification, Service, User
from .serializers import AppointmentSerializer, CategorySerializer, InternalUserSerializer, NotificationSerializer, ServiceSerializer, UserSerializer

def health_view(_request):
    # Keep container health independent from DRF authentication, renderers,
    # database access, and the private internal-key middleware.
    return JsonResponse({'status': 'ok', 'service': 'data-service'})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_fields = ['role', 'city', 'is_active']

class UserByEmailView(APIView):
    def get(self, request):
        try:
            user = User.objects.get(email__iexact=request.query_params.get('email', ''))
        except User.DoesNotExist as exc:
            raise Http404 from exc
        return Response(InternalUserSerializer(user).data)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.select_related('provider', 'provider__provider_profile', 'category')
    serializer_class = ServiceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'provider__provider_profile__business_name']
    ordering_fields = ['price', 'created_at', 'provider__provider_profile__rating']

    def get_queryset(self):
        queryset = super().get_queryset()
        for field in ['category', 'city', 'provider', 'is_active']:
            value = self.request.query_params.get(field)
            if value is None:
                continue
            if field == 'is_active':
                normalized = value.strip().lower()
                if normalized not in {'true', 'false', '1', '0'}:
                    continue
                value = normalized in {'true', '1'}
            queryset = queryset.filter(**{field: value})
        return queryset

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('service', 'customer', 'provider', 'provider__provider_profile')
    serializer_class = AppointmentSerializer
    filterset_fields = ['customer', 'provider', 'status', 'date']

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related('user')
    serializer_class = NotificationSerializer
    filterset_fields = ['user_id']

class AnalyticsView(APIView):
    def get(self, request):
        completed = Appointment.objects.filter(status='completed')
        return Response({
            'users': User.objects.values('role').annotate(count=Count('id')),
            'appointments_by_status': Appointment.objects.values('status').annotate(count=Count('id')),
            'completed_jobs': completed.count(),
            'gross_booking_value': completed.aggregate(total=Sum('amount'))['total'] or 0,
            'active_services': Service.objects.filter(is_active=True).count(),
        })
