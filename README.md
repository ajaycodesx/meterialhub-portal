# MaterialHub — Wholesale Construction Materials Platform

MaterialHub is a production-ready B2B construction materials aggregator platform built for direct factory & wholesale material sourcing across South India. It features a complete backend API with FastAPI, four Next.js frontend panels, and comprehensive production-grade integrations.

## 🏗️ Platform Architecture

The repository contains four integrated ecosystem panels:

- **`buyer-panel/`**: Wholesale buyer portal for contractors & site managers featuring real-time commodity tickers, live weight/tonnage barometers, dynamic truck vehicle allocation (Tata Ace to 16-Wheeler Heavy Trucks), GST invoices, and GPS live vehicle tracking.
- **`vendor-panel/`**: Hardware store & merchant onboarding portal for inventory management, wholesale rate updates, and order fulfillment.
- **`driver-panel/`**: Logistics driver & fleet management app with interactive GPS navigation, site delivery OTP verification, and unloading support.
- **`admin-panel/`**: Central platform oversight and analytics dashboard.
- **`backend/`**: FastAPI backend with PostgreSQL, Redis, and comprehensive production integrations.

## ✨ Production Features

### Core Integrations
- **Payment Processing**: Razorpay integration for secure online payments with order creation, verification, and refunds
- **Notifications**: SendGrid email and Twilio SMS for order updates, delivery alerts, and OTP delivery
- **Delivery Verification**: OTP-based delivery confirmation system for secure order completion
- **GPS Tracking**: Google Maps integration for real-time driver location tracking and route optimization
- **File Storage**: AWS S3 (or S3-compatible) for invoices, receipts, BOQ files, and delivery photos
- **Real-time Updates**: WebSocket support for live order status, driver location, and notifications
- **Audit Logging**: Comprehensive audit trail for all sensitive operations (login, orders, payments, deliveries)

### Security & Infrastructure
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Authorization**: Role-based access control (BUYER, VENDOR, DRIVER, ADMIN)
- **Rate Limiting**: Distributed rate limiting with Redis support
- **Security Headers**: Strict security headers (HSTS, X-Frame-Options, CSP)
- **SSL/TLS**: HTTPS enforcement with SSL certificate management
- **CORS**: Configurable CORS policies for secure cross-origin requests
- **Trusted Proxies**: Support for reverse proxy configurations
- **Monitoring**: Sentry integration for error tracking and performance monitoring
- **Logging**: Structured JSON logging with sensitive data redaction

### Database & Storage
- **PostgreSQL**: Production-grade database with async SQLAlchemy
- **Redis**: Distributed cache and rate limiting backend
- **Migrations**: Alembic database migration system
- **Backup/Restore**: Automated database backup and restore scripts
- **Data Seeding**: Configurable development data seeding

### Deployment
- **Docker**: Multi-stage Docker builds for all services
- **Docker Compose**: Staging and production deployment configurations
- **Nginx**: Reverse proxy with SSL termination and load balancing
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Health Checks**: Health check endpoints for all services
- **Auto-restart**: Container restart policies for high availability

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- Python >= 3.12
- PostgreSQL 16+ (or Docker)
- Redis 7+ (or Docker)
- Docker & Docker Compose

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
python run.py
```

Backend API will be available at http://localhost:8000
API Documentation: http://localhost:8000/api/v1/docs

### Frontend Setup

For each panel (buyer, vendor, driver, admin):

```bash
cd <panel-name>

# Install dependencies
npm install

# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Run dev server
npm run dev
```

- Buyer Panel: http://localhost:3000
- Vendor Panel: http://localhost:3001
- Driver Panel: http://localhost:3002
- Admin Panel: http://localhost:3003

### Docker Deployment

```bash
# Staging environment
cd backend/deploy
docker-compose -f docker-compose.staging.yml up -d

# Production environment (requires .env configuration)
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL 16 with async SQLAlchemy 2.0+
- **Cache**: Redis 7+
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt 4.0+
- **Rate Limiting**: slowapi with Redis support
- **Monitoring**: Sentry SDK
- **Testing**: pytest with pytest-asyncio

### Frontend
- **Framework**: Next.js 16 (App Router with TypeScript)
- **Styling**: TailwindCSS 4
- **Iconography**: React Icons & Lucide React
- **State Management**: React hooks
- **HTTP Client**: Built-in fetch API

### Integrations
- **Payment**: Razorpay
- **Email**: SendGrid
- **SMS**: Twilio
- **Maps**: Google Maps API
- **Storage**: AWS S3 / S3-compatible
- **WebSocket**: Native WebSocket API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Logging**: Structured JSON logging

## 📚 Documentation

- [Production Deployment Guide](backend/docs/PRODUCTION_DEPLOYMENT.md)
- [API Documentation](http://localhost:8000/api/v1/docs) (when backend is running)
- [Implementation Status](AGENTS.md)

## 🔒 Security

- All sensitive data is redacted from logs
- Passwords are hashed with bcrypt
- JWT tokens have configurable expiration
- Rate limiting on all public endpoints
- CORS configured for specific origins
- Security headers enforced on all responses
- Audit logging for sensitive operations
- Role-based authorization on protected endpoints

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend linting
cd <panel-name>
npm run lint
```

## 📦 CI/CD

The project includes GitHub Actions workflows for:
- **CI**: Automated testing, linting, and security scanning on pull requests
- **CD**: Automated deployment to staging and production environments

See `.github/workflows/` for configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/materialhub/issues
- Email: support@materialhub.in

---
*Built with ❤️ for contractors, hardware merchants, and logistics partners.*
