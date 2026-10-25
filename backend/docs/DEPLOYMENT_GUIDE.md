# MaterialHub — Production Deployment & Hardening Guide

## Architecture Overview
MaterialHub production architecture follows a secure tiered architecture:

```
[ Clients / Frontends ]
         │ (HTTPS / TLS 1.3)
         ▼
[ Nginx Reverse Proxy / Cloudflare / AWS ALB ]
    │ (SSL Termination, HSTS, Rate Limit Buffer, Forwarded Headers)
    ▼
[ FastAPI Backend (Uvicorn ASGI Workers) ]
    │ Request ID Tracing, Rate Limiting, JSON Logging, Security Headers
    ├──► [ PostgreSQL 16 DB (asyncpg) ]
    └──► [ Redis Cache / Distributed Rate Limiter (Optional) ]
```

---

## 1. Secrets & Environment Configuration

### Generation
Generate a cryptographically secure 256-bit secret key for JWT signing:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Production `.env` Requirements:
| Variable | Production Requirement | Validation Rule |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Must be set to `production` | Enforces production security checks |
| `DEBUG` | Must be `false` | Raises `ValidationError` if `true` in production |
| `SECRET_KEY` | Must be a strong unique string | Raises `ValidationError` if default key or length < 32 |
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `ALLOWED_HOSTS` | Explicit array of authorized domains | Raises `ValidationError` if wildcard `*` is present |
| `BACKEND_CORS_ORIGINS` | Explicit array of frontend origins | Localhost triggers warning in production |
| `RATE_LIMIT_STORAGE_URL` | Redis URL for distributed rate limiting | `redis://:pass@host:6379/0` |
| `SENTRY_DSN` | Sentry error monitoring DSN | Optional; enables telemetry without code changes |

---

## 2. Database Migration with Alembic

### Safe Migration Procedure for Fresh Production Database
```bash
# 1. Ensure DATABASE_URL is pointed to PostgreSQL in .env
# 2. Run initial migration to create all tables, indexes, and constraints
alembic upgrade head
```

### Safe Migration Procedure for Existing Database
If migrating an existing database that already contains tables created prior to Alembic:
```bash
# Stamp the database to register current state without attempting to recreate existing tables
alembic stamp head

# Verify current revision
alembic current
```

### Generating Future Schema Migrations
```bash
# After modifying SQLAlchemy models in app/models/:
alembic revision --autogenerate -m "describe_change"

# Review the generated file in alembic/versions/
# Apply to database:
alembic upgrade head
```

---

## 3. PostgreSQL Readiness & Compatibility Notes

### Supported Driver
MaterialHub uses **asyncpg** via `postgresql+asyncpg://`.
The connection URL format:
```
postgresql+asyncpg://[user]:[password]@[host]:[port]/[database]
```

### Schema & Data Type Compatibility
- **JSON Fields**: Mapped to native JSON/JSONB in PostgreSQL.
- **Enums**: SQLAlchemy enums (`userrole`, `orderstatus`, `tripstatus`) create native PostgreSQL ENUM types.
- **Foreign Keys**: Enforced strictly in PostgreSQL. The Alembic initial migration defines table creation in strict dependency order:
  `users`, `merchants`, `categories` ➔ `products`, `orders` ➔ `order_items`, `delivery_trips`, `boq_quotes`.
- **Timezones**: Datetime fields store UTC timestamps uniformly.

---

## 4. Reverse Proxy & HTTPS Termination

### SSL/TLS Configuration
MaterialHub requires HTTPS in production. SSL termination should be performed by an upstream reverse proxy (such as Nginx, Caddy, Traefik, or an AWS Application Load Balancer).

An Nginx configuration template is provided at: `backend/deploy/nginx.conf.example`.

Key requirements:
1. **Forwarded Headers**: Pass `X-Forwarded-For` and `X-Forwarded-Proto https` so FastAPI knows the request is secure.
2. **HSTS**: Enforce `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
3. **Host Header**: Upstream must set `proxy_set_header Host $host`.

---

## 5. Rate Limiting in Production

### In-Memory vs. Distributed
- **Single-instance deployments**: Default in-memory rate limiting operates out-of-the-box.
- **Multi-container / Autoscaled deployments**: Set `RATE_LIMIT_STORAGE_URL="redis://:password@redis:6379/0"`. This shares client counters across all API pods.

### Rate Limits:
- `POST /api/v1/auth/login`: 5 requests per minute
- `POST /api/v1/auth/register`: 3 requests per minute
- `POST /api/v1/buyer/orders`: 10 requests per minute
- `POST /api/v1/buyer/calculate-order`: 30 requests per minute
- General API endpoints: 60 requests per minute default

When limits are exceeded, the API returns:
- Status: **HTTP 429 Too Many Requests**
- Header: `Retry-After: <seconds>`
- Body: `{"success": false, "message": "Too many requests. Rate limit exceeded.", ...}`

---

## 6. Structured Logging & Monitoring

### Logging
Set `LOG_FORMAT=json` and `LOG_LEVEL=INFO`.
Logs output single-line JSON objects with:
- UTC timestamp
- Log level
- Correlation ID (`request_id` via `X-Request-ID`)
- Source file & line
- Redacted sensitive fields (passwords, JWTs, and secrets are automatically masked)

### Error Monitoring (Sentry)
Set `SENTRY_DSN` in production. Sentry captures unhandled 500 exceptions, traces API request performance, and records database query timings without sending PII.
If `SENTRY_DSN` is empty, the application functions normally without error monitoring.
