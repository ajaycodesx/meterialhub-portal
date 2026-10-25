# MaterialHub Production Deployment Guide

This guide covers deploying MaterialHub to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Deployment Steps](#deployment-steps)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 16+ (or managed database service)
- Redis 7+ (or managed cache service)
- Domain names configured (api.materialhub.in, buyer.materialhub.in, etc.)
- SSL certificates (Let's Encrypt or commercial)
- AWS account (for ECR, S3, etc.) or equivalent cloud provider
- SendGrid account (for email)
- Twilio account (for SMS)
- Razorpay account (for payments)
- Google Maps API key (optional, for GPS tracking)

## Infrastructure Requirements

### Minimum Requirements

- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Network**: 100 Mbps

### Recommended Production Requirements

- **CPU**: 8 cores
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **Network**: 1 Gbps
- **Load Balancer**: Nginx or AWS ALB

## Environment Configuration

### 1. Generate Secure Secrets

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate PostgreSQL password
python -c "import secrets; print(secrets.token_urlsafe(16))"

# Generate Redis password
python -c "import secrets; print(secrets.token_urlsafe(16))"
```

### 2. Create `.env` File

Create a `.env` file in the backend directory with the following variables:

```bash
# Environment
ENVIRONMENT=production
DEBUG=false
PROJECT_NAME="MaterialHub Production API"
SECRET_KEY=<your-generated-secret-key>

# Database
DATABASE_URL=postgresql+asyncpg://materialhub_user:<password>@postgres:5432/materialhub_prod

# Rate Limiting
RATE_LIMIT_STORAGE_URL=redis://:<redis-password>@redis:6379/0

# CORS
ALLOWED_HOSTS='["api.materialhub.in","backend"]'
BACKEND_CORS_ORIGINS='["https://buyer.materialhub.in","https://vendor.materialhub.in","https://driver.materialhub.in","https://admin.materialhub.in"]'

# Payment (Razorpay)
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>

# Email (SendGrid)
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@materialhub.in
SENDGRID_FROM_NAME="MaterialHub"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=materialhub-docs
AWS_S3_ENDPOINT_URL=  # Leave empty for AWS S3, set for MinIO

# Maps (Google Maps)
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Monitoring (Sentry)
SENTRY_DSN=<your-sentry-dsn>
SENTRY_TRACES_SAMPLE_RATE=0.1

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## Database Setup

### 1. PostgreSQL Configuration

For managed databases (AWS RDS, Google Cloud SQL, etc.):
- Create PostgreSQL 16 instance
- Configure VPC/security groups
- Enable automated backups
- Set retention period (7-30 days)

For self-hosted:
```bash
# Run PostgreSQL via Docker
docker run -d \
  --name materialhub-postgres \
  -e POSTGRES_DB=materialhub_prod \
  -e POSTGRES_USER=materialhub_user \
  -e POSTGRES_PASSWORD=<password> \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

### 2. Run Database Migrations

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

### 3. Seed Initial Data (Optional)

For production, seeding is disabled by default. Seed data manually if needed:

```bash
python -m app.db.seed_data
```

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d api.materialhub.in -d buyer.materialhub.in -d vendor.materialhub.in -d driver.materialhub.in -d admin.materialhub.in

# Certificates will be saved to /etc/letsencrypt/live/
```

### Copy Certificates to Docker Volume

```bash
sudo mkdir -p backend/deploy/ssl
sudo cp /etc/letsencrypt/live/materialhub.in/fullchain.pem backend/deploy/ssl/
sudo cp /etc/letsencrypt/live/materialhub.in/privkey.pem backend/deploy/ssl/
sudo chmod 644 backend/deploy/ssl/*
```

## Deployment Steps

### 1. Clone Repository

```bash
git clone https://github.com/your-org/materialhub.git
cd materialhub
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your production values
```

### 3. Build and Start Services

```bash
cd backend/deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Run Database Migrations

```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://api.materialhub.in/api/v1/health

# Check API documentation
curl https://api.materialhub.in/api/v1/docs
```

## Post-Deployment Checklist

- [ ] All services are running (`docker-compose ps`)
- [ ] Database migrations completed successfully
- [ ] SSL certificates are valid and not expiring soon
- [ ] Health endpoint returns 200 OK
- [ ] All frontend panels are accessible
- [ ] API documentation is accessible
- [ ] Rate limiting is configured
- [ ] Monitoring (Sentry) is receiving errors
- [ ] Backup scripts are scheduled
- [ ] Log aggregation is configured
- [ ] Firewall rules are configured
- [ ] DNS records are pointing correctly

## Monitoring and Maintenance

### Health Checks

```bash
# API health
curl https://api.materialhub.in/api/v1/health

# Container health
docker-compose -f docker-compose.prod.yml ps
```

### Log Viewing

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# All logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Database Backups

```bash
# Manual backup
cd backend
python -m scripts.backup --output-dir ./backups --retention-days 7

# Schedule via cron (add to crontab)
0 2 * * * cd /opt/materialhub/backend && python -m scripts.backup --output-dir ./backups --retention-days 7
```

### Database Restoration

```bash
cd backend
python -m scripts.restore --backup-file ./backups/materialhub_pg_backup_20261020_020000.dump
```

### Updating the Application

```bash
cd backend/deploy
git pull
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Scaling Backend

Edit `docker-compose.prod.yml` to add multiple backend instances:

```yaml
backend:
  # ... existing config ...
  deploy:
    replicas: 3
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check database connection
docker-compose -f docker-compose.prod.yml exec backend python -c "from app.core.database import engine; import asyncio; asyncio.run(engine.connect())"
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check database credentials in .env
# Check network connectivity
docker-compose -f docker-compose.prod.yml exec backend ping postgres
```

### Rate Limiting Not Working

```bash
# Check Redis is running
docker-compose -f docker-compose.prod.yml ps redis

# Check Redis connection
docker-compose -f docker-compose.prod.yml exec backend redis-cli -h redis -a <password> ping
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Restart Nginx after renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate secrets regularly** (every 90 days)
3. **Use strong passwords** (minimum 32 characters)
4. **Enable firewall rules** to restrict access
5. **Keep dependencies updated** regularly
6. **Monitor security advisories** for vulnerabilities
7. **Implement IP whitelisting** for admin access
8. **Enable 2FA** for all service accounts
9. **Regular security audits** and penetration testing
10. **Backup encryption** for sensitive data

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/materialhub/issues
- Documentation: https://docs.materialhub.in
- Email: support@materialhub.in
