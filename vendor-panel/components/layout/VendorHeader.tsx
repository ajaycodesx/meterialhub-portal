'use client';

import React from 'react';
import {
  FaBars,
  FaArrowsRotate,
  FaStore
} from 'react-icons/fa6';
import { VendorTab } from './VendorSidebar';

interface VendorHeaderProps {
  activeTab: VendorTab;
  onOpenMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  storeName?: string;
  isOnline?: boolean;
  onToggleOnline?: () => void;
}

const TAB_TITLES: Record<VendorTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Depot Operations Overview',
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
  isOnline = true,
  onToggleOnline
}) => {
  const current = TAB_TITLES[activeTab] || {
    title: 'Depot Operations Overview',
    subtitle: 'Merchant operations'
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
                Vendor Depot
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleOnline && (
              <button
                type="button"
                onClick={onToggleOnline}
                aria-label={isOnline ? 'Switch to Inactive' : 'Switch to Active'}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                <span
                  className={`w-2 h-2 rounded-xs inline-block ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isOnline ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {isOnline ? 'Active' : 'Inactive'}
                </span>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-lg p-0.5 transition-colors duration-200 ${
                    isOnline ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-md bg-white shadow-xs transition duration-200 ${
                      isOnline ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <header className="hidden lg:flex bg-white px-8 py-4 border-b border-slate-200/80 items-center justify-between sticky top-0 z-30 shadow-xs">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
            DEPOT CONSOLE
          </span>
          <h1 className="text-xl font-medium text-slate-900 tracking-tight">
            {current.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="text-xs font-medium text-slate-700">
              Live Orders Stream Active
            </span>
          </div>

          {onToggleOnline && (
            <button
              type="button"
              onClick={onToggleOnline}
              className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-xs ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={`text-xs font-medium ${isOnline ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isOnline ? 'Active (Accepting)' : 'Inactive (Off Duty)'}
              </span>
              <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-lg p-0.5 transition-colors duration-200 ${isOnline ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-md bg-white shadow-xs transition duration-200 ${isOnline ? 'translate-x-4' : 'translate-x-0'}`} />
              </span>
            </button>
          )}

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
