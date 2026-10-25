'use client';

import React from 'react';
import {
  FaBars,
  FaArrowsRotate,
  FaStore,
  FaCircleCheck,
  FaBell
} from 'react-icons/fa6';
import { VendorTab } from './VendorSidebar';

interface VendorHeaderProps {
  activeTab: VendorTab;
  onOpenMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  storeName?: string;
  isOnline?: boolean;
}

const TAB_TITLES: Record<VendorTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Store Performance & Orders Pulse',
    subtitle: 'Live orders awaiting preparation, low-stock alerts, and daily sales metrics'
  },
  profile: {
    title: 'Merchant Profile & Yard Verification',
    subtitle: 'Depot address, GSTIN registration, contact credentials, and KYC status'
  },
  orders: {
    title: 'Order Packing & Pick Lists',
    subtitle: 'Incoming contractor requests, pick lists, material packing, and driver readiness'
  },
  handover: {
    title: 'Driver Handover & Delivery Challans',
    subtitle: 'Commercial truck pickups, physical cargo handovers, and generated tax invoices'
  },
  products: {
    title: 'Store Material Catalog SKUs',
    subtitle: 'Manage wholesale prices, technical specifications, MOQ, and material units'
  },
  stock: {
    title: 'Inventory Stock Receipts & Movement',
    subtitle: 'Record physical yard material arrivals, damaged bag reconciliation, and thresholds'
  },
  boq: {
    title: 'Incoming Contractor BOQ Quotes',
    subtitle: 'High-tonnage project bids submitted by builders seeking depot wholesale rates'
  },
  pricing: {
    title: 'Wholesale Spot Index & Deals',
    subtitle: 'Regional commodity market rates benchmark and merchant promotional discounts'
  },
  finance: {
    title: 'Sales Ledgers & Escrow Settlements',
    subtitle: 'Delivered order balances, 5% platform fee breakdown, and bank payout records'
  }
};

export const VendorHeader: React.FC<VendorHeaderProps> = ({
  activeTab,
  onOpenMobile,
  onRefresh,
  isRefreshing,
  storeName,
  isOnline
}) => {
  const current = TAB_TITLES[activeTab] || {
    title: 'Vendor Partner Portal',
    subtitle: 'Merchant operations'
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
          <span
            className={`h-2 w-2 rounded-xs inline-block ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <span className="text-xs font-semibold text-slate-700">
            {isOnline ? 'Store Accepting Orders' : 'Store Offline'}
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
            <FaStore className="h-3.5 w-3.5 text-orange-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
