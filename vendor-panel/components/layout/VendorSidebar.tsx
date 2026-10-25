'use client';

import React from 'react';
import Image from 'next/image';
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
  FaCircleCheck,
  FaRightFromBracket,
  FaPowerOff
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
  activeTab: VendorTab;
  onTabChange: (tab: VendorTab) => void;
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
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Operations Pulse',
    items: [
      { id: 'overview', label: 'Depot Overview', icon: <FaStore className="h-4 w-4 shrink-0" /> },
      { id: 'profile', label: 'Store Profile & KYC', icon: <FaBuilding className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Order Fulfillment',
    items: [
      { id: 'orders', label: 'Packing & Pick Lists', icon: <FaBoxesStacked className="h-4 w-4 shrink-0" /> },
      { id: 'handover', label: 'Dispatch & Challans', icon: <FaTruckFast className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Inventory & SKUs',
    items: [
      { id: 'products', label: 'Store Catalog SKUs', icon: <FaBoxOpen className="h-4 w-4 shrink-0" /> },
      { id: 'stock', label: 'Stock Receipts & Ledger', icon: <FaWarehouse className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Commercials & Finance',
    items: [
      { id: 'boq', label: 'Contractor BOQ Quotes', icon: <FaFileContract className="h-4 w-4 shrink-0" /> },
      { id: 'pricing', label: 'Spot Benchmark & Deals', icon: <FaCoins className="h-4 w-4 shrink-0" /> },
      { id: 'finance', label: 'Settlement Ledgers', icon: <FaIndianRupeeSign className="h-4 w-4 shrink-0" /> }
    ]
  }
];

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  isWsConnected,
  storeName,
  isOnline,
  onToggleOnline,
  onLogout
}) => {
  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d1527] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="MaterialHub"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
              Partner Depot
            </span>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-xs inline-block ${
                isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-300">
              {isWsConnected ? 'Order Dispatch Stream' : 'Syncing Stream...'}
            </span>
          </div>
          {onToggleOnline && (
            <button
              onClick={onToggleOnline}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <FaPowerOff className="h-2.5 w-2.5" />
              {isOnline ? 'Online' : 'Offline'}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#FF6500] text-white shadow-md shadow-orange-500/25'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60 shrink-0 space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5 truncate max-w-[190px]">
              <div className="h-8 w-8 rounded-xl bg-orange-500/20 text-[#FF6500] flex items-center justify-center font-bold text-xs border border-orange-500/30 shrink-0">
                KD
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white leading-tight truncate">
                  {storeName || 'Kakkanad Supplies'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">Ramesh Kumar</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <FaRightFromBracket className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
