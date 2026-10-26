'use client';

import React from 'react';
import {
  FaRoute,
  FaBuildingColumns,
  FaCircleCheck
} from 'react-icons/fa6';
import { Button } from '../ui/Button';

interface DriverHistorySectionProps {
  history: any[];
  weeklyPayout: {
    weekTotal: number;
    completedTrips: number;
    payoutDay: string;
  };
  onRefresh: () => void;
}

export const DriverHistorySection: React.FC<DriverHistorySectionProps> = ({
  history,
  weeklyPayout,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Weekly Payout Guarantee
          </span>
          <div className="text-3xl font-medium text-slate-900">
            ₹{(weeklyPayout.weekTotal || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {weeklyPayout.completedTrips} site offloading deliveries completed this cycle
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#FFF7F2] text-[#FF6500]">
            <FaBuildingColumns className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 block">Next Direct Deposit:</span>
            <span className="font-medium text-slate-900 text-sm">
              {weeklyPayout.payoutDay || 'Every Tuesday'}
            </span>
            <span className="text-emerald-600 font-medium block text-[11px]">
              Direct NEFT to SBI Account •••• 9214
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-slate-900">
              Completed Delivery Log ({history.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Authoritative trip records and OTP-verified offloading payouts
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            Sync Records
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Trip Ref &amp; Order</th>
                <th className="py-3 px-4">Route (Depot to Site)</th>
                <th className="py-3 px-4 text-right">Distance</th>
                <th className="py-3 px-4 text-right">Base Fare</th>
                <th className="py-3 px-4 text-right">Net Earned</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FaRoute className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No completed trips found yet</p>
                  </td>
                </tr>
              ) : (
                history.map((t) => (
                  <tr key={t.tripId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>#{t.tripId.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[11px] text-slate-400 font-normal">Order #{t.orderId}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="truncate text-slate-800">{t.dropAddress}</div>
                      <div className="text-[11px] text-slate-400 truncate">From: {t.pickupAddress}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {t.distanceKm} km
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      ₹{(t.tripFare || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      ₹{(t.totalEarned || t.tripFare || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-lg inline-flex items-center gap-1">
                        <FaCircleCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
