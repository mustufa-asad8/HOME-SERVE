from django.urls import include, path
from rest_framework.routers import DefaultRouter
from core.views import AnalyticsView, AppointmentViewSet, CategoryViewSet, NotificationViewSet, ServiceViewSet, UserByEmailView, UserViewSet, health_view

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('categories', CategoryViewSet)
router.register('services', ServiceViewSet)
router.register('appointments', AppointmentViewSet)
router.register('notifications', NotificationViewSet)

urlpatterns = [
    path('health/', health_view),
    path('internal/users/by-email/', UserByEmailView.as_view()),
    path('internal/analytics/', AnalyticsView.as_view()),
    path('internal/', include(router.urls)),
]
