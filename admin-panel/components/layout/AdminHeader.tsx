'use client';

import React from 'react';
import {
  FaBars,
  FaArrowsRotate,
  FaShieldHalved,
  FaSignal
} from 'react-icons/fa6';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onOpenMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  systemHealth?: {
    activeRadius?: string;
    uptime?: string;
  };
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Overview & Pulse',
    subtitle: 'Real-time telemetry, volume metrics, and high-level platform aggregates'
  },
  reports: {
    title: 'Financial & Operational Reports',
    subtitle: 'Gross volume, platform commissions, net merchant settlements, and tonnage'
  },
  orders: {
    title: 'Orders & Fulfillment Oversight',
    subtitle: 'Full order lifecycle, material line items, site delivery constraints, and driver assignment'
  },
  merchants: {
    title: 'Merchant Governance & KYC',
    subtitle: 'Store roster, GSTIN verification status, store inventory status, and compliance'
  },
  boq: {
    title: 'BOQ Quotes & Bulk Procurement',
    subtitle: 'Contractor Bill of Quantities submissions, site specs, and material estimations'
  },
  finance: {
    title: 'Payments, Refunds & Settlements',
    subtitle: 'Transaction ledgers, Razorpay payment captures, fee calculations, and refunds'
  },
  disputes: {
    title: 'Contractor Disputes & Support',
    subtitle: 'Material damage claims, delivery delays, resolution tracking, and settlement adjustments'
  },
  categories: {
    title: 'Material Categories & Hierarchy',
    subtitle: 'Catalog taxonomy, subcategories, featured brand associations, and category assets'
  },
  products: {
    title: 'Product Catalog & Inventory',
    subtitle: 'Material specifications, stock levels, wholesale pricing, MOQ, and technical standards'
  },
  commodity_rates: {
    title: 'Spot Commodity Rate Index',
    subtitle: 'Daily wholesale rates for cement, steel, sand, PVC, and live market trends'
  },
  deals: {
    title: 'Flash Deals & Promotions',
    subtitle: 'Time-limited promotional discounts, contractor volume deals, and campaign badges'
  },
  drivers: {
    title: 'Driver Fleet & Commercial Vehicles',
    subtitle: 'Driver verification, vehicle capacity categories, driver licenses, and payouts'
  },
  dispatch: {
    title: 'Live Trip Dispatch Operations',
    subtitle: 'Live delivery runs, GPS tracking status, site unloading confirmations, and trip logs'
  },
  buyers: {
    title: 'Contractor & Buyer Accounts',
    subtitle: 'Registered builders, project delivery addresses, lifetime spend, and account status'
  },
  audit_logs: {
    title: 'Security Audit & Operations Log',
    subtitle: 'Immutable record of administrative interventions, price changes, and state transitions'
  },
  notifications: {
    title: 'Communication & SMS Templates',
    subtitle: 'Standard SMS, WhatsApp, and email copy for order tracking and OTP verification'
  },
  settings: {
    title: 'Platform & Regional Settings',
    subtitle: 'Service cluster radius, platform take rate, GST defaults, and maintenance mode'
  }
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onOpenMobile,
  onRefresh,
  isRefreshing,
  systemHealth
}) => {
  const current = TAB_TITLES[activeTab] || {
    title: 'Admin Console',
    subtitle: 'Platform operations'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
        >
          <FaBars className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <FaSignal className="h-3 w-3 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">
            {systemHealth?.activeRadius || '25 KM Regional Cluster'}
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50"
        >
          <FaArrowsRotate
            className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-[#FF6500]' : 'text-slate-500'}`}
          />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-xl bg-[#0d1527] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <FaShieldHalved className="h-3.5 w-3.5 text-orange-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
