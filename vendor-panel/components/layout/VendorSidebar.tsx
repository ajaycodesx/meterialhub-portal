'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaStore,
  FaBuilding,
  FaBoxesStacked,
  FaTruckFast,
  FaBoxOpen,
  FaWarehouse,
  FaFileContract,
  FaCoins,
  FaIndianRupeeSign,
  FaXmark,
  FaRightFromBracket,
  FaShieldHalved,
  FaStar
} from 'react-icons/fa6';

export type VendorTab =
  | 'overview'
  | 'profile'
  | 'orders'
  | 'handover'
  | 'products'
  | 'stock'
  | 'boq'
  | 'pricing'
  | 'finance';

interface VendorSidebarProps {
  activeTab?: VendorTab;
  onTabChange?: (tab: VendorTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isWsConnected: boolean;
  storeName?: string;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onLogout?: () => void;
}

interface NavItem {
  id: VendorTab;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'OPERATIONS PULSE',
    items: [
      { id: 'overview', href: '/overview', label: 'Depot Overview', icon: FaStore },
      { id: 'profile', href: '/profile', label: 'Store Profile & KYC', icon: FaBuilding }
    ]
  },
  {
    group: 'ORDER FULFILLMENT',
    items: [
      { id: 'orders', href: '/orders', label: 'Packing & Pick Lists', icon: FaBoxesStacked },
      { id: 'handover', href: '/handover', label: 'Dispatch & Challans', icon: FaTruckFast }
    ]
  },
  {
    group: 'INVENTORY & SKUS',
    items: [
      { id: 'products', href: '/products', label: 'Store Catalog SKUs', icon: FaBoxOpen },
      { id: 'stock', href: '/stock', label: 'Stock Receipts & Ledger', icon: FaWarehouse }
    ]
  },
  {
    group: 'COMMERCIALS & FINANCE',
    items: [
      { id: 'boq', href: '/boq', label: 'Contractor BOQ Quotes', icon: FaFileContract },
      { id: 'pricing', href: '/pricing', label: 'Spot Benchmark & Deals', icon: FaCoins },
      { id: 'finance', href: '/finance', label: 'Settlement Ledgers', icon: FaIndianRupeeSign }
    ]
  }
];

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  isWsConnected,
  storeName = 'Kakkanad Building Supplies',
  isOnline = true,
  onToggleOnline,
  onLogout
}) => {
  const pathname = usePathname();

  function isItemActive(item: NavItem): boolean {
    if (activeTab) {
      return activeTab === item.id;
    }
    if (item.href === '/overview' && (pathname === '/' || pathname === '/overview')) {
      return true;
    }
    return pathname === item.href;
  }

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-30 w-64 xl:w-72 bg-white border-r border-slate-200/80 h-screen shrink-0 overflow-hidden flex flex-col justify-between shadow-xs transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="shrink-0 p-5 xl:p-6 pb-3 space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/overview"
              onClick={onCloseMobile}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                <img
                  src="/images/logo_dark.png"
                  alt="MaterialHub Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="text-base font-medium tracking-tight text-slate-900 leading-tight">
                  Material<span className="text-[#FF6500]">Hub</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                  Vendor Depot
                </span>
              </div>
            </Link>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <FaXmark className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-[#0F172A] rounded-2xl p-4 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-xs inline-block ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {onToggleOnline && (
                <button
                  type="button"
                  onClick={onToggleOnline}
                  aria-label={isOnline ? 'Go Offline' : 'Go Online'}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-lg p-0.5 transition-colors duration-200 ${
                    isOnline ? 'bg-emerald-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-md bg-white shadow-xs transition duration-200 ${
                      isOnline ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {isOnline
                ? 'Receiving contractor wholesale orders'
                : 'Depot order intake paused'}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 xl:px-6 py-2 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
          <nav className="space-y-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-3 block mb-1">
                  {group.group}
                </span>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          if (onTabChange) onTabChange(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl font-medium text-xs transition-all cursor-pointer ${
                          active
                            ? 'bg-[#0F172A] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#FF6500]' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge ? (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${
                              active ? 'bg-white/20 text-white' : 'bg-[#F5A623] text-slate-950'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="shrink-0 p-5 xl:p-6 pt-3 border-t border-slate-100 bg-white space-y-3">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-medium text-sm shrink-0">
              {storeName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-900 truncate block">
                  {storeName}
                </span>
                <FaShieldHalved className="h-3 w-3 text-emerald-600 shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <FaStar className="h-3 w-3 text-amber-500" />
                <span>4.92</span>
                <span className="text-slate-300">·</span>
                <span className="truncate">Verified Depot</span>
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-medium rounded-xl flex items-center justify-center gap-2 text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              <FaRightFromBracket className="h-3.5 w-3.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
