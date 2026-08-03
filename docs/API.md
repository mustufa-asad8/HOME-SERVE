# REST API

Base URL: `/api`

## Authentication

### `POST /auth/register`

Creates a customer or provider account.

```json
{
  "name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "password": "strong-password",
  "role": "customer",
  "city": "Karachi"
}
```

### `POST /auth/login`

Returns a JWT and safe user profile.

```json
{
  "email": "customer@homeserve.local",
  "password": "Password123!"
}
```

Authenticated requests use `Authorization: Bearer <token>`. After verifying the JWT signature, the gateway reloads the account from PostgreSQL for every protected request and authorizes with its current active state and role. `GET /auth/me` returns that current safe user profile.

## Services

- `GET /services` — search and filter the service catalog.
- `GET /services/categories` — active categories.
- `GET /services/:id` — service and provider details.
- `GET /services/mine` — provider-only owned services.
- `POST /services` — provider-only service publishing; the provider ID comes from the JWT.

Supported query parameters are passed to the data service, including `search`, `category`, `city`, `provider`, `is_active` and `ordering`.

## Appointments

- `GET /appointments` — role-scoped appointments.
- `GET /appointments/:id` — role-scoped appointment details.
- `POST /appointments` — customer-only booking request.
- `PATCH /appointments/:id/status` — ownership-checked, role-specific status transition.

```json
{
  "service_id": "uuid",
  "date": "2026-08-02",
  "time": "10:30",
  "address": "Clifton Block 5, Karachi",
  "notes": "Please call before arrival."
}
```

Allowed transitions:

```text
pending -> confirmed | cancelled
confirmed -> in_progress | cancelled
in_progress -> completion_requested
completion_requested -> completed
completed -> terminal
cancelled -> terminal
```

Customers may cancel only their own pending or confirmed appointment, and may mark a visit completed only from `completion_requested`. Providers may confirm, start, request completion or cancel only appointments assigned to them. Administrators can view all appointments and cancel eligible visits, but cannot confirm, start or complete technician work. The gateway derives `customer_id`, `provider_id` and amount instead of trusting browser input.

## Administration

- `GET /admin/analytics` — admin-only marketplace aggregates.

## Health

- `GET /health` — gateway health.
- Django exposes `/health/` privately for orchestration.

## Real-time events

Clients authenticate Socket.IO using `auth.token`. The gateway verifies the current database account before placing the connection in `user:<user-id>`. Appointment changes are emitted to both the customer and provider rooms so either dashboard refreshes immediately. Event types include:

- `booking_created`
- `booking_status`
- `notification`
