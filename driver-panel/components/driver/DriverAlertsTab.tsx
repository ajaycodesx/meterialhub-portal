'use client';

import React from 'react';
import {
  FaBell,
  FaBoxesPacking,
  FaShieldHalved,
  FaMoneyBillWave,
  FaTriangleExclamation,
  FaCheck
} from 'react-icons/fa6';

export function DriverAlertsTab() {
  const alerts = [
    {
      id: 'alt_1',
      title: 'New Dispatch Ready: MH-2051',
      description: 'BuildPro Materials has completed staging for 8 tons 20mm Metal. Ready for vehicle loading.',
      time: '5 mins ago',
      type: 'dispatch',
      isUnread: true,
      icon: FaBoxesPacking,
      color: 'text-[#FF6500] bg-slate-50 border border-slate-100',
    },
    {
      id: 'alt_2',
      title: 'Site Offloading Gate Clearance',
      description: 'Anjali Traders site supervisor confirmed bay #2 is reserved for your vehicle arrival at Edappally.',
      time: '18 mins ago',
      type: 'site',
      isUnread: true,
      icon: FaShieldHalved,
      color: 'text-emerald-600 bg-slate-50 border border-slate-100',
    },
    {
      id: 'alt_3',
      title: 'Weekly Payout Deposited',
      description: '₹6,850.00 credited to State Bank of India account ending in 9214 for 12 completed deliveries.',
      time: 'Yesterday',
      type: 'payout',
      isUnread: false,
      icon: FaMoneyBillWave,
      color: 'text-emerald-600 bg-slate-50 border border-slate-100',
    },
    {
      id: 'alt_4',
      title: 'Commercial Traffic Advisory',
      description: 'Heavy vehicle delay reported on Container Road intersection. Follow NH-544 route guidance.',
      time: '3 hours ago',
      type: 'traffic',
      isUnread: false,
      icon: FaTriangleExclamation,
      color: 'text-amber-600 bg-slate-50 border border-slate-100',
    },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
            NOTIFICATIONS & DISPATCH
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
            Alerts
          </h1>
        </div>

        <button className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer">
          <FaCheck className="h-3 w-3" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => {
          const IconComponent = alert.icon;
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-3xl border transition-all ${
                alert.isUnread
                  ? 'bg-white border-slate-200/80 shadow-xs'
                  : 'bg-white/60 border-slate-100 shadow-none'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${alert.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-medium text-slate-900">
                      {alert.title}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">
                      {alert.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
