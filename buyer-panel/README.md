# MaterialHub Buyer Panel

The buyer-facing B2B construction materials marketplace for contractors, builders, and procurement managers.

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL for the MaterialHub backend API (default: http://localhost:8000/api/v1)

## Build for Production

```bash
npm run build
npm start
```

## Features

- Browse construction materials catalog
- Compare merchants and prices
- Add to cart and calculate freight
- Place orders with GST invoicing
- Track deliveries
- Manage construction sites
- View order history and invoices
