'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTruckFast,
  FaHouse,
  FaClipboardList,
  FaBell,
  FaUser,
  FaArrowRightFromBracket,
  FaStar,
  FaShieldHalved
} from 'react-icons/fa6';
import { DriverNavTab } from './DriverBottomNav';

interface DriverSidebarProps {
  activeTab: DriverNavTab;
  onTabChange: (tab: DriverNavTab) => void;
  driverName: string;
  vehicleType: string;
  isOnline: boolean;
  onToggleOnline: () => Promise<void>;
  onLogout: () => void;
  unreadAlertsCount?: number;
}

export function DriverSidebar({
  activeTab,
  onTabChange,
  driverName,
  vehicleType,
  isOnline,
  onToggleOnline,
  onLogout,
  unreadAlertsCount = 4,
}: DriverSidebarProps) {
  const pathname = usePathname();
  const [toggling, setToggling] = React.useState(false);

  async function handleToggle() {
    try {
      setToggling(true);
      await onToggleOnline();
    } finally {
      setToggling(false);
    }
  }

  const navItems = [
    { id: 'overview' as DriverNavTab, label: 'Overview', icon: FaHouse, href: '/overview' },
    { id: 'jobs' as DriverNavTab, label: 'My jobs', icon: FaClipboardList, href: '/jobs' },
    { id: 'alerts' as DriverNavTab, label: 'Alerts', icon: FaBell, badge: unreadAlertsCount, href: '/alerts' },
    { id: 'account' as DriverNavTab, label: 'Account', icon: FaUser, href: '/account' },
  ];

  function isItemActive(item: typeof navItems[0]): boolean {
    if (activeTab) {
      return activeTab === item.id;
    }
    if (item.href === '/overview' && (pathname === '/' || pathname === '/overview')) {
      return true;
    }
    return pathname === item.href;
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200/80 sticky top-0 h-screen shrink-0 overflow-hidden justify-between shadow-xs z-30">
      <div className="shrink-0 p-5 xl:p-6 pb-3 space-y-4">
        <Link href="/overview" className="flex items-center gap-3 cursor-pointer">
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
              Carrier Dispatch
            </span>
          </div>
        </Link>

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

            <button
              type="button"
              onClick={handleToggle}
              disabled={toggling}
              aria-label={isOnline ? 'Go Offline' : 'Go Online'}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-lg p-0.5 transition-colors duration-200 disabled:opacity-50 ${
                isOnline ? 'bg-emerald-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-md bg-white shadow-xs transition duration-200 ${
                  isOnline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
            {isOnline
              ? 'Receiving vendor material dispatch offers'
              : 'Carrier availability paused'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 xl:px-6 py-2 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
        <nav className="space-y-1.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-3 block mb-2">
            MAIN DISPATCH MENU
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between py-3 px-3.5 rounded-2xl font-medium text-xs transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? 'text-[#FF6500]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${
                      active ? 'bg-white/20 text-white' : 'bg-[#F5A623] text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-5 xl:p-6 pt-3 border-t border-slate-100 bg-white space-y-3">
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-medium text-sm shrink-0">
            {driverName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-900 truncate block">
                {driverName}
              </span>
              <FaShieldHalved className="h-3 w-3 text-emerald-600 shrink-0" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <FaStar className="h-3 w-3 text-amber-500" />
              <span>4.95</span>
              <span className="text-slate-300">·</span>
              <span className="truncate">{vehicleType.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-medium rounded-xl flex items-center justify-center gap-2 text-xs border border-slate-200 transition-colors cursor-pointer"
        >
          <FaArrowRightFromBracket className="h-3.5 w-3.5 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
