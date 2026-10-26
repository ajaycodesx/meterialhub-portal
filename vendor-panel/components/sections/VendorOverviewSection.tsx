'use client';

import React from 'react';
import {
  FaBoxesStacked,
  FaTruckFast,
  FaTriangleExclamation,
  FaCircleCheck,
  FaStore,
  FaArrowRight,
  FaLocationDot,
  FaShieldHalved,
  FaCompass
} from 'react-icons/fa6';
import { VendorTab } from '../layout/VendorSidebar';

interface VendorOverviewSectionProps {
  data?: any;
  dashboardData?: any;
  orders?: any[];
  products?: any[];
  loading?: boolean;
  onNavigateTab: (tab: VendorTab) => void;
  onOpenPackModal: (order: any) => void;
}

export const VendorOverviewSection: React.FC<VendorOverviewSectionProps> = ({
  data,
  dashboardData,
  orders = [],
  products = [],
  loading = false,
  onNavigateTab,
  onOpenPackModal
}) => {
  if (loading && !data && !dashboardData) {
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

  const resolvedData = dashboardData || data || {};
  const stats = resolvedData?.stats || {};
  const recentOrders = orders.length > 0 ? orders : (resolvedData?.recentOrders || []);
  const storeName = resolvedData?.storeName || 'Kakkanad Building Supplies';

  const awaitingCount = stats.ordersAwaitingAction ?? recentOrders.filter((o: any) => o.status === 'confirmed' || o.status === 'packing').length ?? 0;
  const readyCount = stats.ordersReadyForPickup ?? recentOrders.filter((o: any) => o.status === 'ready_for_pickup').length ?? 0;
  const completedCount = stats.completedOrdersCount ?? recentOrders.filter((o: any) => o.status === 'delivered').length ?? 12;
  const lowStockCount = stats.lowStockCount ?? products.filter((p: any) => (p.stockQty ?? 0) < 100).length ?? 4;
  const grossSalesToday = stats.grossSales ?? 28450;

  return (
    <div className="space-y-6 pb-12">
      <div className="pt-1 space-y-0.5">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
          DEPOT FEED
        </span>
        <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
          Good morning, {storeName.split(' ')[0]}
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-amber-500">
            <FaBoxesStacked className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {awaitingCount}
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Awaiting packing
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('handover')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-[#F5A623]">
            <FaTruckFast className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {readyCount}
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Ready for pickup
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-emerald-600">
            <FaCircleCheck className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {completedCount}
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Completed
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('stock')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="text-rose-500">
            <FaTriangleExclamation className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {lowStockCount}
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Stock alerts
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0F172A] rounded-2xl lg:rounded-3xl p-5 lg:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
              ONLINE
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-white">
            Depot is online and ready for order fulfillment.
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Commercial contractors and dispatch drivers can route deliveries directly to your loading bays.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-sm">
          <FaStore className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
                  ACTIVE ORDERS
                </span>
                <h2 className="text-lg font-medium text-slate-900 tracking-tight">
                  Your packing & delivery flow
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-medium text-[#FF6500] hover:text-[#E05800] transition-colors cursor-pointer"
              >
                All orders
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center text-slate-400">
                <FaBoxesStacked className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No pending orders in packing queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 4).map((order: any, idx: number) => {
                  const orderId = order.id || order.orderId || '';
                  const displayId = order.invoiceNumber || (orderId ? `MH-${orderId.slice(0, 6).toUpperCase()}` : `MH-98${20 + idx}`);
                  const orderAmount = order.totalAmount ?? order.grandTotal ?? 0;
                  const isAwaitingPack = order.status === 'confirmed' || order.status === 'packing';

                  return (
                    <div
                      key={orderId || idx}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-900">
                          {displayId}
                        </span>
                        <span className="font-medium text-[#FF6500]">
                          {(order.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <FaLocationDot className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {order.buyerName || order.buyer?.name || 'Contractor Site Delivery'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Pickup: {storeName} Loading Bay
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 pl-0.5">
                          <div className="w-2.5 flex justify-center text-slate-300">
                            ↓
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {order.deliveryAddress || 'Site Destination'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Drop: Regional Site Delivery
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                            ORDER VALUE
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            ₹{orderAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {isAwaitingPack ? (
                          <button
                            onClick={() => onOpenPackModal(order)}
                            className="px-4 py-2 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            Pack & Ready
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigateTab('handover')}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                          >
                            View Handover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                DEPOT TELEMETRY
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                GPS Connected
              </span>
            </div>

            <div className="bg-[#0F172A] rounded-2xl p-4 text-white relative h-36 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-300 truncate max-w-[140px]">
                  {storeName}
                </span>
                <span className="text-slate-400">Loading Bay A</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shadow-lg">
                  <FaCompass className="h-5 w-5 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Heavy Commercial Route</span>
                <span>Active Bay</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('handover')}
              className="w-full py-2.5 px-3 bg-[#FFF7F2] hover:bg-orange-100/70 text-[#FF6500] font-medium rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
            >
              <span>Launch Depot Dispatch Guidance</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <FaShieldHalved className="h-4 w-4 text-emerald-600" />
              <span className="uppercase tracking-wider">EARNINGS TODAY</span>
            </div>
            <div className="text-3xl font-medium text-slate-900 tracking-tight pt-1">
              ₹{grossSalesToday.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {completedCount} orders completed · Next settlement Tuesday
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600">
              <FaTriangleExclamation className="h-4 w-4" />
              <span className="uppercase tracking-wider">DEPOT OFFLOADING PROTOCOLS</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-xs bg-slate-400 mt-1.5 shrink-0" />
                <span>Verify digital invoice before driver cargo handover</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-xs bg-slate-400 mt-1.5 shrink-0" />
                <span>Wear high-visibility vest and safety boots at loading docks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-xs bg-slate-400 mt-1.5 shrink-0" />
                <span>Confirm driver tare weight check on commercial weighbridge</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
