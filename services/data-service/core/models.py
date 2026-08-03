import uuid
from django.db import models
from django.db.models import Q

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class User(TimeStampedModel):
    ROLE_CHOICES = [('customer', 'Customer'), ('provider', 'Provider'), ('admin', 'Admin')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    city = models.CharField(max_length=80)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.email

class Category(TimeStampedModel):
    id = models.SlugField(primary_key=True, max_length=60)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ProviderProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    business_name = models.CharField(max_length=140)
    bio = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    service_radius_km = models.PositiveIntegerField(default=15)

class Service(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services', limit_choices_to={'role': 'provider'})
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='services')
    title = models.CharField(max_length=160)
    description = models.TextField()
    city = models.CharField(max_length=80)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    price_unit = models.CharField(max_length=50, default='visit')
    duration_minutes = models.PositiveIntegerField(default=60)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

class Appointment(TimeStampedModel):
    STATUS_CHOICES = [('pending','Pending'),('confirmed','Confirmed'),('in_progress','In progress'),('completion_requested','Completion requested'),('completed','Completed'),('cancelled','Cancelled')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name='appointments')
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='customer_appointments')
    provider = models.ForeignKey(User, on_delete=models.PROTECT, related_name='provider_appointments')
    date = models.DateField()
    time = models.TimeField()
    address = models.TextField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ['-date', '-time']
        constraints = [
            models.UniqueConstraint(fields=['provider', 'date', 'time'], condition=~Q(status='cancelled'), name='unique_active_provider_slot')
        ]

class Notification(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=140)
    message = models.TextField()
    kind = models.CharField(max_length=60, default='general')
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
