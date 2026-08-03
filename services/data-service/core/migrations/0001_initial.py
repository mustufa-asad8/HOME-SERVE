import uuid
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.SlugField(max_length=60, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('icon', models.CharField(blank=True, max_length=80)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=120)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('password_hash', models.CharField(max_length=255)),
                ('role', models.CharField(choices=[('customer', 'Customer'), ('provider', 'Provider'), ('admin', 'Admin')], default='customer', max_length=20)),
                ('city', models.CharField(max_length=80)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='ProviderProfile',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('business_name', models.CharField(max_length=140)),
                ('bio', models.TextField(blank=True)),
                ('verified', models.BooleanField(default=False)),
                ('rating', models.DecimalField(decimal_places=2, default=0, max_digits=3)),
                ('review_count', models.PositiveIntegerField(default=0)),
                ('service_radius_km', models.PositiveIntegerField(default=15)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='provider_profile', to='core.user')),
            ],
        ),
        migrations.CreateModel(
            name='Service',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=160)),
                ('description', models.TextField()),
                ('city', models.CharField(max_length=80)),
                ('price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('price_unit', models.CharField(default='visit', max_length=50)),
                ('duration_minutes', models.PositiveIntegerField(default=60)),
                ('image_url', models.URLField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='services', to='core.category')),
                ('provider', models.ForeignKey(limit_choices_to={'role': 'provider'}, on_delete=django.db.models.deletion.CASCADE, related_name='services', to='core.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField()),
                ('time', models.TimeField()),
                ('address', models.TextField()),
                ('notes', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('in_progress', 'In progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='customer_appointments', to='core.user')),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='provider_appointments', to='core.user')),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='appointments', to='core.service')),
            ],
            options={'ordering': ['-date', '-time']},
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=140)),
                ('message', models.TextField()),
                ('kind', models.CharField(default='general', max_length=60)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='core.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='appointment',
            constraint=models.UniqueConstraint(condition=models.Q(('status', 'cancelled'), _negated=True), fields=('provider', 'date', 'time'), name='unique_active_provider_slot'),
        ),
    ]
