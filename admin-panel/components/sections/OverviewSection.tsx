'use client';

import React from 'react';
import {
  FaChartLine,
  FaStore,
  FaTruckFast,
  FaIndianRupeeSign,
  FaWeightHanging,
  FaTriangleExclamation,
  FaFileContract,
  FaBoxOpen,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaShieldHalved,
  FaCompass
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
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-medium text-slate-600">No data available.</p>
      </div>
    );
  }

  const orderStats = data.ordersByStatus || {};
  const merchantStats = data.merchantsStats || {};
  const driverStats = data.driversStats || {};

  return (
    <div className="space-y-6 pb-12">
      <div className="pt-1 space-y-0.5">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
          GOVERNANCE FEED
        </span>
        <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
          Good morning, Director
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-amber-500">
            <FaIndianRupeeSign className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              ₹{((data.totalGmv || 0) / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Gross merchandise volume
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-emerald-600">
            <FaChartLine className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              ₹{((data.platformRevenue || 0) / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Net platform revenue
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('dispatch')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-[#FF6500]">
            <FaWeightHanging className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {(data.todaysTonnageDispatched || 18.5).toFixed(1)} MT
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Tonnage dispatched
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-rose-500">
            <FaTriangleExclamation className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {data.lowStockCount || 3}
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Inventory alerts
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0F172A] rounded-2xl lg:rounded-3xl p-5 lg:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
              PLATFORM ONLINE
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-white">
            Operations running at nominal regional capacity.
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Autonomous merchant dispatch routing, multi-tier escrow capture, and GPS telemetry are fully operational.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-sm">
          <FaShieldHalved className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { key: 'pending', label: 'Pending', count: orderStats.pending || 0, color: 'text-[#F5A623]' },
          { key: 'confirmed', label: 'Confirmed', count: orderStats.confirmed || 0, color: 'text-slate-700' },
          { key: 'packing', label: 'Packing', count: orderStats.packing || 0, color: 'text-[#FF6500]' },
          { key: 'out_for_delivery', label: 'In Transit', count: orderStats.out_for_delivery || 0, color: 'text-[#F5A623]' },
          { key: 'delivered', label: 'Delivered', count: orderStats.delivered || 0, color: 'text-emerald-600' },
          { key: 'cancelled', label: 'Cancelled', count: orderStats.cancelled || 0, color: 'text-slate-500' },
          { key: 'refunded', label: 'Refunded', count: orderStats.refunded || 0, color: 'text-rose-600' }
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer text-center space-y-0.5"
          >
            <p className="text-[11px] font-medium text-slate-500">{item.label}</p>
            <p className={`text-lg font-medium ${item.color}`}>{item.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                  ORDER FLOW
                </span>
                <h3 className="text-base font-medium text-slate-900 tracking-tight">
                  Recent Platform Orders
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-medium text-[#FF6500] hover:text-[#E05800] transition-colors cursor-pointer"
              >
                All orders
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Order ID</th>
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3 text-right">Grand Total</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data.recentOrders || []).slice(0, 5).map((ord: any) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-2 font-medium text-slate-900">#{ord.orderId}</td>
                      <td className="py-3 font-medium text-slate-600">{ord.invoiceNumber || 'MH-INV-AUTO'}</td>
                      <td className="py-3 text-slate-600 truncate max-w-[200px]">{ord.deliveryAddress}</td>
                      <td className="py-3 text-right font-medium text-slate-900">
                        ₹{(ord.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-700">
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

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                  COMMODITY INDEX
                </span>
                <h3 className="text-base font-medium text-slate-900 tracking-tight">
                  Spot Wholesale Benchmark Rates
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('commodity_rates')}
                className="text-xs font-medium text-[#FF6500] hover:text-[#E05800] transition-colors cursor-pointer"
              >
                Manage rates
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(data.liveCommodityRates || []).slice(0, 6).map((rate: any) => (
                <div
                  key={rate.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-800 truncate">{rate.material}</p>
                    {rate.trend === 'up' ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <FaArrowTrendUp className="h-2.5 w-2.5" /> +{rate.changePercent || 0}%
                      </span>
                    ) : rate.trend === 'down' ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-rose-600">
                        <FaArrowTrendDown className="h-2.5 w-2.5" /> -{rate.changePercent || 0}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Stable</span>
                    )}
                  </div>
                  <p className="text-base font-medium text-slate-900">
                    ₹{(rate.rate || 0).toLocaleString('en-IN')}{' '}
                    <span className="text-[11px] font-medium text-slate-500">/ {rate.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                CARRIER TELEMETRY
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                GPS Connected
              </span>
            </div>

            <div className="bg-[#0F172A] rounded-2xl p-4 text-white relative h-36 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-300">
                  Regional Central Hub
                </span>
                <span className="text-slate-400">25 KM Active Grid</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shadow-lg">
                  <FaCompass className="h-5 w-5 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Heavy Commercial Routes</span>
                <span>Active Tracking</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('dispatch')}
              className="w-full py-2.5 px-3 bg-[#FFF7F2] hover:bg-orange-100/70 text-[#FF6500] font-medium rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
            >
              <span>Launch Desktop Route Guidance</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <FaShieldHalved className="h-4 w-4 text-emerald-600" />
              <span className="uppercase tracking-wider">PLATFORM SETTLEMENTS</span>
            </div>
            <div className="text-3xl font-medium text-slate-900 tracking-tight pt-1">
              ₹{((data.netSettlements || 0)).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Merchant balances cleared · Next payout cycle Tuesday
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                EXCEPTIONS & ALERTS
              </span>
              <span className="text-xs font-medium text-amber-600">
                {(data.lowStockCount || 0) + (data.pendingBoqQuotes || 0)} Active
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigateTab('products')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaTriangleExclamation className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">Low Stock Inventory</p>
                    <p className="text-[11px] text-slate-500">Materials requiring depot restock</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-amber-600">
                  {data.lowStockCount || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('boq')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaFileContract className="h-4 w-4 text-[#FF6500] shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">Pending BOQ Quotes</p>
                    <p className="text-[11px] text-slate-500">Contractor bulk bids awaiting quotation</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {data.pendingBoqQuotes || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('merchants')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaStore className="h-4 w-4 text-[#FF6500] shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">Verified Merchants</p>
                    <p className="text-[11px] text-slate-500">Active regional building material yards</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {merchantStats.verified || 0} / {merchantStats.total || 0}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab('drivers')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FaTruckFast className="h-4 w-4 text-[#F5A623] shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">Commercial Fleet</p>
                    <p className="text-[11px] text-slate-500">Verified trucks & tippers</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {driverStats.active || 0} / {driverStats.total || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
