# MaterialHub — Wholesale Construction Materials Platform

MaterialHub is a Next.js monorepo platform built for direct factory & wholesale construction material sourcing across South India.

## 🏗️ Platform Architecture

The repository contains four integrated ecosystem panels:

- **`buyer-panel/`**: Wholesale buyer portal for contractors & site managers featuring real-time commodity tickers, live weight/tonnage barometers, dynamic truck vehicle allocation (Tata Ace to 16-Wheeler Heavy Trucks), GST invoices, and GPS live vehicle tracking.
- **`vendor-panel/`**: Hardware store & merchant onboarding portal for inventory management, wholesale rate updates, and order fulfillment.
- **`driver-panel/`**: Logistics driver & fleet management app with interactive GPS navigation, site delivery OTP verification, and unloading support.
- **`admin-panel/`**: Central platform oversight and analytics dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm / pnpm / yarn

### Installation & Development

```bash
# Navigate to buyer panel
cd buyer-panel

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

## 🛠️ Tech Stack & Design System

- **Framework**: Next.js 16 (App Router with TypeScript)
- **Styling**: Vanilla CSS / TailwindCSS with curved aesthetic tokens (`rounded-2xl`, `rounded-3xl`, borderless cards, soft shadow elevation)
- **Iconography**: React Icons (`react-icons/fa6`)
- **Typography**: Dual Font System (`Plus Jakarta Sans` for headings, `Poppins` for body)

---
*Built with ❤️ for contractors, hardware merchants, and logistics partners.*
