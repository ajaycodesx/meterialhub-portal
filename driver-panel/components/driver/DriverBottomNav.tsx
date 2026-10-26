'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaHouse,
  FaClipboardList,
  FaBell,
  FaUser
} from 'react-icons/fa6';

export type DriverNavTab = 'overview' | 'jobs' | 'alerts' | 'account';

interface DriverBottomNavProps {
  activeTab: DriverNavTab;
  onTabChange: (tab: DriverNavTab) => void;
  unreadAlertsCount?: number;
}

export function DriverBottomNav({
  activeTab,
  onTabChange,
  unreadAlertsCount = 4,
}: DriverBottomNavProps) {
  const tabs = [
    {
      id: 'overview' as DriverNavTab,
      label: 'Overview',
      icon: FaHouse,
      href: '/overview',
    },
    {
      id: 'jobs' as DriverNavTab,
      label: 'My jobs',
      icon: FaClipboardList,
      href: '/jobs',
    },
    {
      id: 'alerts' as DriverNavTab,
      label: 'Alerts',
      icon: FaBell,
      badge: unreadAlertsCount,
      href: '/alerts',
    },
    {
      id: 'account' as DriverNavTab,
      label: 'Account',
      icon: FaUser,
      href: '/account',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-5 py-2.5 z-40 flex items-center justify-between rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 transition-all cursor-pointer ${
              isActive ? 'text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <IconComponent className="h-5 w-5" />
              {tab.badge && tab.badge > 0 && !isActive && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#F5A623] text-slate-950 font-medium text-[9px] rounded-sm flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>

            <span className={`text-[11px] pt-1 leading-tight ${isActive ? 'font-medium text-slate-900' : 'font-medium text-slate-400'}`}>
              {tab.label}
            </span>

            {isActive && (
              <span className="w-1.5 h-1.5 rounded-xs bg-[#FF6500] mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
