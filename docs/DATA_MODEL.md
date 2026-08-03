# Data model

```mermaid
erDiagram
    USER ||--o| PROVIDER_PROFILE : has
    USER ||--o{ SERVICE : offers
    CATEGORY ||--o{ SERVICE : groups
    USER ||--o{ APPOINTMENT : customer
    USER ||--o{ APPOINTMENT : provider
    SERVICE ||--o{ APPOINTMENT : booked_as
    USER ||--o{ NOTIFICATION : receives

    USER {
      uuid id PK
      string name
      string email UK
      string password_hash
      string role
      string city
      boolean is_active
    }
    PROVIDER_PROFILE {
      bigint id PK
      uuid user_id FK
      string business_name
      boolean verified
      decimal rating
      int review_count
      int service_radius_km
    }
    CATEGORY {
      slug id PK
      string name
      text description
      string icon
    }
    SERVICE {
      uuid id PK
      uuid provider_id FK
      slug category_id FK
      string title
      decimal price
      int duration_minutes
      boolean is_active
    }
    APPOINTMENT {
      uuid id PK
      uuid service_id FK
      uuid customer_id FK
      uuid provider_id FK
      date date
      time time
      string status
      decimal amount
    }
    NOTIFICATION {
      uuid id PK
      uuid user_id FK
      string title
      text message
      datetime read_at
    }
```

## Integrity rules

- User email is unique.
- A service belongs to one provider and one category.
- The selected provider must own the booked service.
- A provider cannot hold two non-cancelled appointments at the same date and time.
- Appointment amount is copied from the service when a booking is created.
- Terminal appointment states cannot be reopened through the public gateway.
