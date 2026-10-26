'use client';

import React from 'react';
import {
  FaBars,
  FaArrowsRotate,
  FaShieldHalved
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
    title: 'Platform Overview & Pulse',
    subtitle: 'Platform operations'
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenMobile}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
              <img
                src="/images/logo_dark.png"
                alt="MaterialHub Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-medium tracking-tight text-slate-900 leading-tight">
                Material<span className="text-[#FF6500]">Hub</span>
              </div>
              <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest block">
                Administration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-slate-200 bg-slate-50 shadow-xs">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
          </div>
        </div>
      </header>

      <header className="hidden lg:flex bg-white px-8 py-4 border-b border-slate-200/80 items-center justify-between sticky top-0 z-30 shadow-xs">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
            GOVERNANCE CONSOLE
          </span>
          <h1 className="text-xl font-medium text-slate-900 tracking-tight">
            {current.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">
              Platform Telemetry Active
            </span>
          </div>

          <div className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl border border-slate-200 bg-white shadow-xs">
            <span className="w-2 h-2 rounded-xs bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">
              {systemHealth?.activeRadius || '25.0 KM Regional Hub'}
            </span>
            <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-lg p-0.5 bg-emerald-600">
              <span className="inline-block h-4 w-4 transform rounded-md bg-white shadow-xs translate-x-4" />
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <FaArrowsRotate
              className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-[#FF6500]' : 'text-slate-500'}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </header>
    </>
  );
};
