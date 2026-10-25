'use client';

import React from 'react';
import Image from 'next/image';
import {
  FaTruckFast,
  FaArrowsRotate,
  FaLocationCrosshairs,
  FaRightFromBracket,
  FaSignal
} from 'react-icons/fa6';

export type DriverTab = 'dispatch' | 'history' | 'profile';

interface DriverHeaderProps {
  activeTab: DriverTab;
  onTabChange: (tab: DriverTab) => void;
  driverName?: string;
  vehicleType?: string;
  isOnline: boolean;
  onToggleOnline: () => void;
  isWsConnected: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  gpsActive: boolean;
  onRequestGps: () => void;
  onLogout: () => void;
}

export const DriverHeader: React.FC<DriverHeaderProps> = ({
  activeTab,
  onTabChange,
  driverName = 'Manoj K',
  vehicleType = 'Mini Commercial Truck (3 Ton)',
  isOnline,
  onToggleOnline,
  isWsConnected,
  onRefresh,
  isRefreshing,
  gpsActive,
  onRequestGps,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
            <img
              src="/images/logo_dark.png"
              alt="MaterialHub"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                {driverName}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-[#FF6500] hidden sm:inline-block">
                Licensed Carrier
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[180px] sm:max-w-none">
              {vehicleType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onRequestGps}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              gpsActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="GPS Telemetry Sensor"
          >
            <FaLocationCrosshairs className={`h-3.5 w-3.5 ${gpsActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="hidden md:inline">{gpsActive ? 'GPS Fixed' : 'GPS Offline'}</span>
          </button>

          <button
            onClick={onToggleOnline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-xs inline-block ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Feed"
          >
            <FaArrowsRotate className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#FF6500]' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <FaRightFromBracket className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-100 text-xs font-semibold">
        <button
          onClick={() => onTabChange('dispatch')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'dispatch'
              ? 'border-[#FF6500] text-[#FF6500]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Live Dispatch
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#FF6500] text-[#FF6500]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Trip History &amp; Payouts
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#FF6500] text-[#FF6500]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Vehicle &amp; Licence KYC
        </button>
      </div>
    </header>
  );
};
