from datetime import date, time, timedelta
import bcrypt
from django.core.management.base import BaseCommand
from core.models import Appointment, Category, Notification, ProviderProfile, Service, User

PASSWORD = 'Password123!'


class Command(BaseCommand):
    help = 'Create deterministic demo accounts and marketplace data.'

    def handle(self, *args, **options):
        password_hash = bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt(rounds=12)).decode()

        admin, _ = User.objects.update_or_create(
            email='admin@homeserve.local',
            defaults={'name': 'Sara Malik', 'password_hash': password_hash, 'role': 'admin', 'city': 'Karachi', 'is_active': True},
        )
        provider, _ = User.objects.update_or_create(
            email='provider@homeserve.local',
            defaults={'name': 'Hamza Siddiqui', 'password_hash': password_hash, 'role': 'provider', 'city': 'Karachi', 'is_active': True},
        )
        customer, _ = User.objects.update_or_create(
            email='customer@homeserve.local',
            defaults={'name': 'Ayesha Khan', 'password_hash': password_hash, 'role': 'customer', 'city': 'Karachi', 'is_active': True},
        )
        mariam, _ = User.objects.update_or_create(
            email='mariam@homeserve.local',
            defaults={'name': 'Mariam Ahmed', 'password_hash': password_hash, 'role': 'customer', 'city': 'Karachi', 'is_active': True},
        )
        bilal, _ = User.objects.update_or_create(
            email='bilal@homeserve.local',
            defaults={'name': 'Bilal Shah', 'password_hash': password_hash, 'role': 'customer', 'city': 'Karachi', 'is_active': True},
        )
        nida, _ = User.objects.update_or_create(
            email='nida@homeserve.local',
            defaults={'name': 'Nida Rahman', 'password_hash': password_hash, 'role': 'customer', 'city': 'Karachi', 'is_active': True},
        )

        ProviderProfile.objects.update_or_create(
            user=provider,
            defaults={
                'business_name': 'CleanCraft Team',
                'bio': 'Professional residential cleaning with trained, equipped teams.',
                'verified': True,
                'rating': 4.90,
                'review_count': 428,
            },
        )

        other_providers = []
        provider_rows = [
            ('coolcare@homeserve.local', 'Danish Ali', 'CoolCare Services', 'Karachi', 'AC diagnostics and repair specialists.', 4.80, 311),
            ('voltworks@homeserve.local', 'Fahad Mir', 'VoltWorks', 'Lahore', 'Certified electricians for safe residential work.', 4.90, 207),
            ('flowfix@homeserve.local', 'Usman Tariq', 'FlowFix Pros', 'Islamabad', 'Plumbing, drainage and water-system support.', 4.70, 189),
        ]
        for email, name, business, city, bio, rating, reviews in provider_rows:
            provider_user, _ = User.objects.update_or_create(
                email=email,
                defaults={'name': name, 'password_hash': password_hash, 'role': 'provider', 'city': city, 'is_active': True},
            )
            ProviderProfile.objects.update_or_create(
                user=provider_user,
                defaults={'business_name': business, 'bio': bio, 'verified': True, 'rating': rating, 'review_count': reviews},
            )
            other_providers.append(provider_user)

        category_data = [
            ('cleaning', 'Cleaning', 'Deep cleaning, sofa, carpet and move-in care', 'Sparkles'),
            ('appliance', 'Appliance Repair', 'AC, refrigerator and washer repair', 'WashingMachine'),
            ('electrical', 'Electrical', 'Safe diagnostics, fixtures and wiring', 'Zap'),
            ('plumbing', 'Plumbing', 'Leaks, drainage and water systems', 'Droplets'),
        ]
        for slug, name, description, icon in category_data:
            Category.objects.update_or_create(id=slug, defaults={'name': name, 'description': description, 'icon': icon, 'is_active': True})

        def service(owner, title, **defaults):
            return Service.objects.update_or_create(provider=owner, title=title, defaults=defaults)[0]

        deep_clean = service(
            provider,
            'Signature Deep Home Cleaning',
            category_id='cleaning',
            description='A room-by-room reset for kitchens, bathrooms, bedrooms and living spaces with professional equipment.',
            city='Karachi', price=6499, price_unit='starting', duration_minutes=300,
            image_url='https://images.unsplash.com/photo-1581578731548-c64695cc6952', is_active=True,
        )
        sofa_clean = service(
            provider,
            'Sofa & Upholstery Cleaning',
            category_id='cleaning',
            description='Professional vacuuming, spot treatment and low-moisture extraction for fabric sofas and chairs.',
            city='Karachi', price=2999, price_unit='5-seater', duration_minutes=150,
            image_url='https://images.unsplash.com/photo-1555041469-a586c61ea9bc', is_active=True,
        )
        service(
            other_providers[0],
            'AC Inspection & Repair',
            category_id='appliance',
            description='Diagnostic visit, cooling performance check, electrical inspection and a transparent repair estimate.',
            city='Karachi', price=1499, price_unit='visit', duration_minutes=90,
            image_url='https://images.unsplash.com/photo-1621905251189-08b45d6a269e', is_active=True,
        )
        service(
            other_providers[1],
            'Certified Electrician Visit',
            category_id='electrical',
            description='Troubleshooting, switches, sockets, lights, fans and minor wiring handled by a vetted electrician.',
            city='Lahore', price=1199, price_unit='visit', duration_minutes=60,
            image_url='https://images.unsplash.com/photo-1504148455328-c376907d081c', is_active=True,
        )
        service(
            other_providers[2],
            'Leak & Drainage Plumber',
            category_id='plumbing',
            description='Fast help for leaks, clogged drains, low pressure, sanitary fittings and residential water lines.',
            city='Islamabad', price=1299, price_unit='visit', duration_minutes=90,
            image_url='https://images.unsplash.com/photo-1607472586893-edb57bdc0e39', is_active=True,
        )

        appointment_rows = [
            (deep_clean, customer, date.today() + timedelta(days=2), time(10, 30), 'confirmed', 'Clifton Block 5, Karachi'),
            (sofa_clean, customer, date.today() - timedelta(days=3), time(14, 0), 'completed', 'Clifton Block 5, Karachi'),
            (deep_clean, mariam, date.today() + timedelta(days=1), time(9, 0), 'pending', 'DHA Phase 6, Karachi'),
            (sofa_clean, bilal, date.today() + timedelta(days=1), time(13, 30), 'confirmed', 'PECHS, Karachi'),
            (deep_clean, nida, date.today(), time(16, 0), 'in_progress', 'Gulshan-e-Iqbal, Karachi'),
        ]
        for booked_service, booked_customer, visit_date, visit_time, status, address in appointment_rows:
            Appointment.objects.update_or_create(
                service=booked_service,
                customer=booked_customer,
                provider=booked_service.provider,
                defaults={
                    'date': visit_date,
                    'time': visit_time,
                    'address': address,
                    'status': status,
                    'amount': booked_service.price,
                },
            )

        Notification.objects.get_or_create(
            user=customer,
            title='Booking confirmed',
            defaults={'message': 'CleanCraft Team confirmed your upcoming service visit.', 'kind': 'booking_status'},
        )
        self.stdout.write(self.style.SUCCESS('Demo data ready.'))
