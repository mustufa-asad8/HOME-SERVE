# Deployment

## Docker Compose

The local stack contains:

1. PostgreSQL 17
2. Django data service on the internal Docker network
3. Node gateway on port 4000, serving the built React application

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
docker compose logs -f gateway data-service
```

## Production configuration

Set strong, independent values for:

- `POSTGRES_PASSWORD`
- `INTERNAL_SERVICE_KEY`
- `JWT_SECRET`
- `DJANGO_SECRET_KEY`

Keep Django inaccessible from the public internet. Only the gateway should call `/internal/*`, using `X-Internal-Key` over a private network.

## PaaS topology

Deploy as three managed services:

- Managed PostgreSQL database.
- Private Django web service using Gunicorn.
- Public Node web service that builds the React app and serves the static output.

Configure health checks at `/health/` for Django and `/api/health` for Node. Add a persistent job queue before introducing retries, scheduled reminders or transactional email workflows.

## Security checklist

- Terminate TLS at the platform or load balancer.
- Rotate seeded credentials before any non-demo use.
- Restrict CORS to known origins when the frontend is hosted separately.
- Store secrets in the platform secret manager.
- Enable database backups and point-in-time recovery.
- Add centralized logs, error monitoring and audit events.
- Use a transactional email provider and verified sending domain.
- Add malware scanning before supporting user uploads.

## Docker build troubleshooting

### Debian mirror returns 503 while installing `libpq5`

The data-service uses `psycopg[binary]`, which already bundles the PostgreSQL
client libraries. Its Dockerfile intentionally does not run `apt-get` or install
`libpq5`. If an older checkout still contains that step, remove this line:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*
```

Then rebuild without the stale data-service layer:

```bash
docker compose build --no-cache data-service
docker compose up --build
```

## TypeScript/Vite environment declarations

The frontend includes `apps/web/src/vite-env.d.ts` so TypeScript recognizes
Vite's `import.meta.env` API and the optional `VITE_API_URL` variable. If this
file is removed, `npm run build:web` can fail with `TS2339: Property 'env' does
not exist on type 'ImportMeta'`.

### Django starts, but Compose reports `data-service is unhealthy`

A healthy Gunicorn startup followed by `dependency data-service failed to start`
means the process is running but Docker's probe did not receive a successful
response. The Compose health check intentionally uses Python's `http.client`
against `127.0.0.1`, which bypasses HTTP proxy environment variables and avoids
`localhost` IPv4/IPv6 ambiguity. It also has a 45-second `start_period` so
migrations, demo seeding and static collection can finish before failed probes
count toward container health.

Inspect the latest probe result with:

```bash
docker inspect --format '{{json .State.Health}}' homeserve-data-service-1
```

After changing `docker-compose.yml`, recreate the containers:

```bash
docker compose down
docker compose up --build -d
docker compose ps
docker compose logs --tail=100 data-service gateway
```
