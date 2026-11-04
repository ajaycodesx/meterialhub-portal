'use client';

import { NoData } from '../common/NoData';

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
  const alerts: any[] = [];

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
        {alerts.length === 0 && (
          <NoData title="No alerts" description="Trip requests and operations notices will appear here." />
        )}
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
