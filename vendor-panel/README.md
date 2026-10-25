# MaterialHub Vendor Panel

The merchant-facing portal for hardware stores, suppliers, and material dealers.

## Prerequisites

- Node.js >= 18.x
- MaterialHub Backend running on http://localhost:8000

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL for the MaterialHub backend API (default: http://localhost:8000/api/v1)

## Build for Production

```bash
npm run build
npm start
```

## Features

- View dashboard with order metrics
- Manage product inventory
- Update stock levels and prices
- Process and fulfill orders
- View revenue and settlements
