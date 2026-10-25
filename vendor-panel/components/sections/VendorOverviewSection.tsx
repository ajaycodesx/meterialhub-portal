'use client';

import React from 'react';
import {
  FaStore,
  FaBox,
  FaTruckFast,
  FaBoxesStacked,
  FaIndianRupeeSign,
  FaTriangleExclamation,
  FaCircleCheck,
  FaClock,
  FaArrowRight,
  FaArrowUp,
  FaShieldHalved,
  FaFileLines
} from 'react-icons/fa6';
import { VendorTab } from '../layout/VendorSidebar';

interface VendorOverviewSectionProps {
  data: any;
  onNavigateTab: (tab: VendorTab) => void;
  onOpenPackModal: (order: any) => void;
}

export const VendorOverviewSection: React.FC<VendorOverviewSectionProps> = ({
  data,
  onNavigateTab,
  onOpenPackModal
}) => {
  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const stockAlerts = data?.stockAlerts || [];
  const quickStats = data?.quickStats || {
    fulfillmentRate: '99.2%',
    avgPackingMinutes: 18,
    rating: 4.9
  };

  const metricCards = [
    {
      label: 'Awaiting Packing',
      value: stats.ordersAwaitingAction ?? 0,
      sublabel: 'Requires depot packing',
      icon: <FaBoxesStacked className="h-5 w-5 text-amber-500" />,
      accentBg: 'bg-amber-50',
      action: () => onNavigateTab('orders')
    },
    {
      label: 'Ready for Pickup',
      value: stats.ordersReadyForPickup ?? 0,
      sublabel: 'Staged at loading bay',
      icon: <FaTruckFast className="h-5 w-5 text-blue-500" />,
      accentBg: 'bg-blue-50',
      action: () => onNavigateTab('handover')
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockCount ?? 0,
      sublabel: 'Below reorder threshold',
      icon: <FaTriangleExclamation className="h-5 w-5 text-rose-500" />,
      accentBg: 'bg-rose-50',
      action: () => onNavigateTab('stock')
    },
    {
      label: 'Gross Sales (Today)',
      value: `₹${(stats.grossSales ?? 0).toLocaleString('en-IN')}`,
      sublabel: 'Completed & in-flight',
      icon: <FaIndianRupeeSign className="h-5 w-5 text-emerald-500" />,
      accentBg: 'bg-emerald-50',
      action: () => onNavigateTab('finance')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((m, idx) => (
          <div
            key={idx}
            onClick={m.action}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {m.label}
              </span>
              <div className={`p-2.5 rounded-xl ${m.accentBg}`}>
                {m.icon}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {m.value}
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                <span>{m.sublabel}</span>
                <FaArrowRight className="h-3 w-3 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Packing Queue
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Active orders needing material stage verification and driver ready mark
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-[#FF6500] hover:text-orange-600 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <FaArrowRight className="h-3 w-3" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FaBoxesStacked className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No pending orders in packing queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="h-2 w-px bg-slate-300 inline-block" />
                      <span className="text-xs font-medium text-slate-600">
                        {order.buyerName || 'Contractor Site Delivery'}
                      </span>
                      <span className="h-2 w-px bg-slate-300 inline-block" />
                      <span className="text-xs font-semibold text-emerald-600">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-md">
                      {order.deliveryAddress || 'Site Delivery'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        order.status === 'confirmed'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'packing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'ready_for_pickup'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>

                    {(order.status === 'confirmed' || order.status === 'packing') && (
                      <button
                        onClick={() => onOpenPackModal(order)}
                        className="px-3 py-1.5 rounded-xl bg-[#FF6500] hover:bg-orange-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Pack & Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Commercial Yard Health
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-600 font-medium">On-Time Dispatch Rate</span>
                <span className="text-xs font-bold text-emerald-600">{quickStats.fulfillmentRate}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-600 font-medium">Avg Pick & Stage Time</span>
                <span className="text-xs font-bold text-slate-900">{quickStats.avgPackingMinutes} mins</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-600 font-medium">Contractor Yard Rating</span>
                <span className="text-xs font-bold text-amber-600">★ {quickStats.rating} / 5.0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-xs text-slate-600 font-medium">Platform Fee Take Rate</span>
                <span className="text-xs font-bold text-slate-700">5.0% flat</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Depot Stock Warnings
              </h2>
              <span className="text-xs font-semibold text-rose-600">
                {stockAlerts.length} Critical
              </span>
            </div>

            {stockAlerts.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <FaCircleCheck className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-xs font-medium">All material SKUs above reorder thresholds</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stockAlerts.slice(0, 4).map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigateTab('stock')}
                    className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between cursor-pointer hover:bg-rose-50 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-rose-700 font-medium">
                        Remaining: {p.stockQty} {p.unit}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-700">
                      Reorder
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
