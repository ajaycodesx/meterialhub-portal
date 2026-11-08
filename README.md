# MaterialHub — Wholesale Construction Materials Platform

MaterialHub is a production-grade B2B construction materials aggregator and supply platform built for direct factory and wholesale material sourcing across South India. The system includes an asynchronous FastAPI backend API, four dedicated Next.js web consoles, and zero-dependency simulation fallbacks for all third-party services.

---

## Architecture Overview

The platform operates across four ecosystem portals:

- **`buyer-panel` (`http://localhost:3000`)**: Wholesale contractor portal featuring live spot rate tickers, real-time weight and tonnage telemetry, vehicle capacity allocation (from Tata Ace mini-trucks to 16-Wheeler heavy commercial trailers), GST tax invoices, and live GPS order tracking.
- **`vendor-panel` (`http://localhost:3001`)**: Hardware merchant depot console with multi-step onboarding, statutory document verification (GSTIN, PAN, Trade License, cancelled cheque), stock inventory management, and packing fulfillment queues.
- **`driver-panel` (`http://localhost:3002`)**: Logistics carrier app featuring multi-step commercial vehicle onboarding, dispatch feed, site delivery OTP verification, and transit navigation.
- **`admin-panel` (`http://localhost:3003`)**: Executive governance console with applicant verification queues (one-click approvals), spot commodity index publishing, category configuration, financial ledger audits, and platform telemetry.
- **`backend` (`http://localhost:8000`)**: Asynchronous Python backend powered by FastAPI, SQLAlchemy 2.0 with PostgreSQL, Redis-backed rate limiting, and native WebSocket feeds.

---

## Core Features & Integrations

### 1. Verification Gatekeeping & Onboarding
- **Guided Multi-Step Registration**: 4-step progressive onboarding with dashed progress indicators for both Vendors and Drivers.
- **Statutory Document Storage**: Dropzone file uploads for GST certificates, PAN cards, Trade Licenses, Commercial Vehicle RCs, and Driver Licenses.
- **Gatekeeper Authorization**: Newly onboarded merchants and carriers remain in `is_verified=False` state; sign-in attempts are blocked with HTTP 403 Forbidden until an administrator inspects and approves the dossier.
- **Automated Alerts**: Email and SMS dispatch alerts notify applicants upon approval.

### 2. Live Commerce & Logistics
- **Dynamic Category Index**: Categories published in the Admin Console instantly reflect across the Buyer homepage, footer directory, and supplier searches.
- **Commodity Spot Rates**: TMT Steel, 53G Cement, PVC, and Aggregates wholesale rates update dynamically without static or mock fallbacks.
- **OTP Delivery Verification**: Drivers request a secure 6-digit one-time password from the site receiver with attempt limits and 5-minute expiry to confirm freight handover.
- **Real-Time Telemetry**: WebSockets broadcast order transitions (`new_order`, `order_status_update`, `trip_status_update`) across all active dashboards.

### 3. Simulation Mode Fallbacks
All external service integrations gracefully fall back to zero-dependency simulation mode when API credentials are omitted in `.env`:
- **Razorpay**: Operates with simulated payment orders, mock verification signatures, and test webhooks.
- **Google Maps Platform**: Fallbacks to Haversine geospatial calculations for distance and transit ETAs.
- **SendGrid & Twilio**: Transactional emails and SMS OTPs log directly to the structured service output.
- **AWS S3**: Uploads save to the local `/uploads` directory when S3 bucket configurations are omitted.

---

## Localhost Setup Guide

### System Prerequisites
- **Node.js**: `v18.x` or `v20.x+`
- **Python**: `3.12+`
- **PostgreSQL**: `16+` running on port `5432`
- **Redis**: Port `6379` (Optional; system defaults to in-memory rate limiting if Redis is inactive)

---

### Step 1: Database Setup (PostgreSQL)

Create the database in PostgreSQL:
```sql
CREATE DATABASE materialhub;
```

To initialize or reset the database to a clean testing state holding only root administrative accounts:
```bash
cd backend
python scripts/reset_db_admin_only.py
```

---

### Step 2: Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python run.py
```

- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/api/v1/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`

---

### Step 3: Frontend Panels Setup

Open separate terminal windows for each frontend panel you wish to run:

#### Buyer Panel
```bash
cd buyer-panel
npm install
npm run dev
```
Accessible at: **`http://localhost:3000`**

#### Vendor Panel
```bash
cd vendor-panel
npm install
npm run dev
```
Accessible at: **`http://localhost:3001`**

#### Driver Panel
```bash
cd driver-panel
npm install
npm run dev
```
Accessible at: **`http://localhost:3002`**

#### Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```
Accessible at: **`http://localhost:3003`**

---

## Test Credentials

| Portal | Role | Identifier (Email / Phone) | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Console** | Primary Administrator | `admin@materialhub.in` | `Gatsbyajayrenjith@9633` | Full root governance, approvals, commodity rates |
| **Admin Console** | Secondary Administrator | `ajayrenjith.work@gmail.com` | `Gatsbyajayrenjith@9633` | Alternate root operations console |
| **Vendor Panel** | Hardware Merchant | Register on `:3001` | User-defined | Needs Admin approval in `:3003` before sign-in |
| **Driver Panel** | Logistics Carrier | Register on `:3002` | User-defined | Needs Admin approval in `:3003` before sign-in |
| **Buyer Portal** | Site Contractor | Register on `:3000` | User-defined | Direct catalog browsing, cart, and ordering |

---

## Redis Configuration

Redis is used exclusively for distributed client rate limiting (`slowapi`).

- **Windows Service**: If Redis is installed as a Windows service, it runs automatically on port `6379`.
- **PowerShell Commands**:
  - Check status: `Get-Service Redis`
  - Start service: `Start-Service Redis`
  - Stop service: `Stop-Service Redis`
- **Docker Alternative**:
  ```bash
  docker run -d -p 6379:6379 --name materialhub-redis redis:alpine
  ```
- **In-Memory Fallback**: If Redis is not running or if `RATE_LIMIT_STORAGE_URL` is omitted in `backend/.env`, the system automatically falls back to internal in-memory limiting without crashing.

---

## Production Deployment

### Docker Compose
Production container configurations reside in `backend/deploy/`:

```bash
cd backend/deploy

# Production stack with Nginx SSL termination
docker-compose -f docker-compose.prod.yml up -d --build
```

### Production Subdomain Mapping
- `api.materialhub.in` &rarr; Backend service (Port 8000)
- `buyer.materialhub.in` &rarr; Buyer Next.js standalone container (Port 3000)
- `vendor.materialhub.in` &rarr; Vendor Next.js standalone container (Port 3001)
- `driver.materialhub.in` &rarr; Driver Next.js standalone container (Port 3002)
- `admin.materialhub.in` &rarr; Admin Next.js standalone container (Port 3003)

---

## Automated Verification & Testing

To run the end-to-end integration test validating auth gatekeeping, admin approvals, order calculations, and WebSocket feeds:
```bash
cd backend
python scripts/comprehensive_system_audit.py
```

To run unit and API tests with pytest:
```bash
cd backend
pytest tests/ -v
```

---

## Tech Stack Summary

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2, Slowapi, Uvicorn
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, React Icons (`react-icons/fa6`)
- **Infrastructure**: PostgreSQL 16, Redis 7, Nginx, Docker multi-stage builds, GitHub Actions CI/CD
