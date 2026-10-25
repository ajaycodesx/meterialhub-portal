'use client';

import React from 'react';
import Image from 'next/image';
import {
  FaChartPie,
  FaChartLine,
  FaBoxesStacked,
  FaStore,
  FaFileContract,
  FaIndianRupeeSign,
  FaTriangleExclamation,
  FaLayerGroup,
  FaBoxOpen,
  FaCoins,
  FaTags,
  FaTruckFast,
  FaRoute,
  FaUsers,
  FaShieldHalved,
  FaEnvelopeOpenText,
  FaSliders,
  FaXmark,
  FaCircleCheck,
  FaRightFromBracket
} from 'react-icons/fa6';

export type AdminTab =
  | 'overview'
  | 'reports'
  | 'orders'
  | 'merchants'
  | 'boq'
  | 'finance'
  | 'disputes'
  | 'categories'
  | 'products'
  | 'commodity_rates'
  | 'deals'
  | 'drivers'
  | 'dispatch'
  | 'buyers'
  | 'audit_logs'
  | 'notifications'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isWsConnected: boolean;
  onLogout?: () => void;
}

interface NavItem {
  id: AdminTab;
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
    group: 'Executive',
    items: [
      { id: 'overview', label: 'Overview Dashboard', icon: <FaChartPie className="h-4 w-4 shrink-0" /> },
      { id: 'reports', label: 'Reports & Analytics', icon: <FaChartLine className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Commerce Operations',
    items: [
      { id: 'orders', label: 'Orders & Fulfillment', icon: <FaBoxesStacked className="h-4 w-4 shrink-0" /> },
      { id: 'merchants', label: 'Merchants & KYC', icon: <FaStore className="h-4 w-4 shrink-0" /> },
      { id: 'boq', label: 'BOQ Bulk Quotes', icon: <FaFileContract className="h-4 w-4 shrink-0" /> },
      { id: 'finance', label: 'Payments & Refunds', icon: <FaIndianRupeeSign className="h-4 w-4 shrink-0" /> },
      { id: 'disputes', label: 'Disputes & Support', icon: <FaTriangleExclamation className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Catalog & Pricing',
    items: [
      { id: 'categories', label: 'Material Categories', icon: <FaLayerGroup className="h-4 w-4 shrink-0" /> },
      { id: 'products', label: 'Products & Inventory', icon: <FaBoxOpen className="h-4 w-4 shrink-0" /> },
      { id: 'commodity_rates', label: 'Spot Commodity Index', icon: <FaCoins className="h-4 w-4 shrink-0" /> },
      { id: 'deals', label: 'Promotions & Deals', icon: <FaTags className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Logistics & Fleet',
    items: [
      { id: 'drivers', label: 'Driver Fleet', icon: <FaTruckFast className="h-4 w-4 shrink-0" /> },
      { id: 'dispatch', label: 'Live Trip Dispatch', icon: <FaRoute className="h-4 w-4 shrink-0" /> }
    ]
  },
  {
    group: 'Governance & Settings',
    items: [
      { id: 'buyers', label: 'Contractor Accounts', icon: <FaUsers className="h-4 w-4 shrink-0" /> },
      { id: 'audit_logs', label: 'Audit Trail', icon: <FaShieldHalved className="h-4 w-4 shrink-0" /> },
      { id: 'notifications', label: 'Communication Templates', icon: <FaEnvelopeOpenText className="h-4 w-4 shrink-0" /> },
      { id: 'settings', label: 'Platform Settings', icon: <FaSliders className="h-4 w-4 shrink-0" /> }
    ]
  }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  isWsConnected,
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
              Admin
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
              {isWsConnected ? 'Operations Stream Active' : 'Connecting Stream...'}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            v1.0.0
          </span>
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
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-orange-500/20 text-[#FF6500] flex items-center justify-center font-bold text-xs border border-orange-500/30">
                MH
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">Operations Root</p>
                <p className="text-[11px] text-slate-400">admin@materialhub.in</p>
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
