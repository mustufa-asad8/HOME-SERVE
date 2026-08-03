from datetime import date, time, timedelta
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Appointment, Category, ProviderProfile, Service, User


class AppointmentRulesTests(TestCase):
    def setUp(self):
        self.customer = User.objects.create(name='Customer', email='c@example.com', password_hash='x', role='customer', city='Karachi')
        self.provider = User.objects.create(name='Provider', email='p@example.com', password_hash='x', role='provider', city='Karachi')
        ProviderProfile.objects.create(user=self.provider, business_name='Test Provider')
        category = Category.objects.create(id='cleaning', name='Cleaning')
        self.service = Service.objects.create(provider=self.provider, category=category, title='Deep cleaning', description='Test service description', city='Karachi', price=5000)

    def test_provider_slot_collision_is_prevented(self):
        visit_date = date.today() + timedelta(days=1)
        Appointment.objects.create(service=self.service, customer=self.customer, provider=self.provider, date=visit_date, time=time(10, 0), address='Valid address', amount=5000)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Appointment.objects.create(service=self.service, customer=self.customer, provider=self.provider, date=visit_date, time=time(10, 0), address='Another address', amount=5000)

    def test_serializer_rejects_provider_service_mismatch(self):
        other_provider = User.objects.create(name='Other Provider', email='other@example.com', password_hash='x', role='provider', city='Karachi')
        ProviderProfile.objects.create(user=other_provider, business_name='Other Provider')
        client = APIClient()
        response = client.post('/internal/appointments/', {
            'service_id': str(self.service.id),
            'customer_id': str(self.customer.id),
            'provider_id': str(other_provider.id),
            'date': str(date.today() + timedelta(days=2)),
            'time': '10:00',
            'address': 'A valid customer address',
        }, format='json', HTTP_X_INTERNAL_KEY='development-internal-key-change-me')
        self.assertEqual(response.status_code, 400)


class RegistrationRulesTests(TestCase):
    def test_provider_registration_creates_profile(self):
        client = APIClient()
        response = client.post('/internal/users/', {
            'name': 'New Provider',
            'email': 'PROVIDER2@example.com',
            'password_hash': 'hashed-password',
            'role': 'provider',
            'city': 'Karachi',
            'is_active': True,
        }, format='json', HTTP_X_INTERNAL_KEY='development-internal-key-change-me')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email='provider2@example.com')
        self.assertTrue(ProviderProfile.objects.filter(user=user).exists())

    def test_email_uniqueness_is_case_insensitive(self):
        User.objects.create(name='Existing', email='existing@example.com', password_hash='x', role='customer', city='Karachi')
        client = APIClient()
        response = client.post('/internal/users/', {
            'name': 'Duplicate',
            'email': 'EXISTING@example.com',
            'password_hash': 'x',
            'role': 'customer',
            'city': 'Karachi',
        }, format='json', HTTP_X_INTERNAL_KEY='development-internal-key-change-me')
        self.assertEqual(response.status_code, 400)


class HealthEndpointTests(TestCase):
    def test_health_endpoint_is_public_and_returns_ok(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok', 'service': 'data-service'})

    def test_internal_endpoint_still_requires_service_key(self):
        response = self.client.get('/internal/services/')
        self.assertEqual(response.status_code, 401)
