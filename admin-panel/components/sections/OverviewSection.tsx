'use client';

import React from 'react';
import {
  FaChartLine,
  FaBoxesStacked,
  FaStore,
  FaTruckFast,
  FaIndianRupeeSign,
  FaWeightHanging,
  FaTriangleExclamation,
  FaCircleCheck,
  FaBoxOpen,
  FaFileContract,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaClock
} from 'react-icons/fa6';
import { AdminTab } from '../layout/AdminSidebar';

interface OverviewSectionProps {
  data: any;
  loading: boolean;
  onNavigateTab: (tab: AdminTab) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  data,
  loading,
  onNavigateTab
}) => {
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-600">No data available.</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Gross Merchandise Value',
      value: `INR ${(data.totalGmv || 0).toLocaleString('en-IN')}`,
      sub: 'Cumulative platform orders',
      icon: <FaIndianRupeeSign className="h-5 w-5 text-[#FF6500]" />,
      bg: 'bg-orange-500/10'
    },
    {
      label: 'Net Platform Revenue',
      value: `INR ${(data.platformRevenue || 0).toLocaleString('en-IN')}`,
      sub: 'Wholesale commission ledger',
      icon: <FaChartLine className="h-5 w-5 text-emerald-600" />,
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Net Merchant Settlement',
      value: `INR ${(data.netSettlements || 0).toLocaleString('en-IN')}`,
      sub: 'Payable store balance',
      icon: <FaStore className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Total Tonnage Dispatched',
      value: `${(data.todaysTonnageDispatched || 0).toFixed(1)} MT`,
      sub: 'Bulk steel, cement & aggregates',
      icon: <FaWeightHanging className="h-5 w-5 text-indigo-600" />,
      bg: 'bg-indigo-500/10'
    }
  ];

  const orderStats = data.ordersByStatus || {};
  const merchantStats = data.merchantsStats || {};
  const driverStats = data.driversStats || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
              <p className="text-xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
              <p className="text-[11px] font-medium text-slate-400">{kpi.sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${kpi.bg}`}>{kpi.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { key: 'pending', label: 'Pending', count: orderStats.pending || 0, color: 'text-amber-600' },
          { key: 'confirmed', label: 'Confirmed', count: orderStats.confirmed || 0, color: 'text-blue-600' },
          { key: 'packing', label: 'Packing', count: orderStats.packing || 0, color: 'text-purple-600' },
          { key: 'out_for_delivery', label: 'In Transit', count: orderStats.out_for_delivery || 0, color: 'text-orange-600' },
          { key: 'delivered', label: 'Delivered', count: orderStats.delivered || 0, color: 'text-emerald-600' },
          { key: 'cancelled', label: 'Cancelled', count: orderStats.cancelled || 0, color: 'text-slate-500' },
          { key: 'refunded', label: 'Refunded', count: orderStats.refunded || 0, color: 'text-rose-600' }
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer text-center space-y-0.5"
          >
            <p className="text-[11px] font-semibold text-slate-500">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Platform Orders</h3>
                <p className="text-xs text-slate-500">Live order stream across regional delivery nodes</p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-semibold text-[#FF6500] hover:text-[#E05800] transition-colors"
              >
                View All Orders
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-500 font-semibold">
                    <th className="pb-3 pl-2">Order ID</th>
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Site Destination</th>
                    <th className="pb-3 text-right">Grand Total</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.recentOrders || []).slice(0, 6).map((ord: any) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-2 font-semibold text-slate-900">#{ord.orderId}</td>
                      <td className="py-3 font-medium text-slate-600">{ord.invoiceNumber || 'MH-INV-AUTO'}</td>
                      <td className="py-3 text-slate-600 truncate max-w-[200px]">{ord.deliveryAddress}</td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        INR {(ord.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data.recentOrders || data.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Spot Commodity Rates</h3>
                <p className="text-xs text-slate-500">Benchmark pricing index for high-tonnage materials</p>
              </div>
              <button
                onClick={() => onNavigateTab('commodity_rates')}
                className="text-xs font-semibold text-[#FF6500] hover:text-[#E05800] transition-colors"
              >
                Manage Rates
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(data.liveCommodityRates || []).slice(0, 6).map((rate: any) => (
                <div
                  key={rate.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 truncate">{rate.material}</p>
                    {rate.trend === 'up' ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <FaArrowTrendUp className="h-2.5 w-2.5" /> +{rate.changePercent || 0}%
                      </span>
                    ) : rate.trend === 'down' ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                        <FaArrowTrendDown className="h-2.5 w-2.5" /> -{rate.changePercent || 0}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">Stable</span>
                    )}
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    INR {(rate.rate || 0).toLocaleString('en-IN')}{' '}
                    <span className="text-[11px] font-medium text-slate-500">/ {rate.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Operational Exceptions & Alerts</h3>
            <div className="space-y-2.5">
              <div
                onClick={() => onNavigateTab('products')}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaTriangleExclamation className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Low Stock Inventory</p>
                    <p className="text-[11px] text-slate-500">Products with stock under 100 units</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-700">
                  {data.lowStockCount || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('boq')}
                className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between cursor-pointer hover:bg-blue-500/15 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaFileContract className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Pending BOQ Quotes</p>
                    <p className="text-[11px] text-slate-500">Contractor bulk project bids waiting</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-700">
                  {data.pendingBoqQuotes || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('finance')}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between cursor-pointer hover:bg-rose-500/15 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaIndianRupeeSign className="h-4 w-4 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Payment Exceptions</p>
                    <p className="text-[11px] text-slate-500">Failed / cancelled order captures</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-700">
                  {data.failedPaymentsCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Platform Ecosystem Roster</h3>
            <div className="space-y-3">
              <div
                onClick={() => onNavigateTab('merchants')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaStore className="h-4 w-4 text-[#FF6500]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Verified Merchants</p>
                    <p className="text-[11px] text-slate-500">Hardware & building material yards</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {merchantStats.verified || 0} / {merchantStats.total || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('drivers')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaTruckFast className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Active Commercial Fleet</p>
                    <p className="text-[11px] text-slate-500">Trucks, tippers & pickup vehicles</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {driverStats.active || 0} / {driverStats.total || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('products')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaBoxOpen className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Catalog SKUs</p>
                    <p className="text-[11px] text-slate-500">Active materials in buyer catalog</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {data.productsCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
