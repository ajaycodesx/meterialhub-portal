'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaChevronRight,
  FaRotateRight,
  FaTruckFast,
  FaShieldHalved,
  FaStore,
  FaBoxOpen
} from 'react-icons/fa6';
import { buyerApi, apiClient } from '../../lib/api';

interface OrderSummary {
  orderId: string;
  invoiceNumber?: string;
  grandTotal: number;
  itemsTotal?: number;
  status: string;
  deliveryAddress?: string;
  pincode?: string;
  totalWeightKg?: number;
  createdAt?: string;
}

export const QuickDispatchAndShipments: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBuyerOrders() {
      try {
        const token = apiClient.getToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }
        const res: any = await buyerApi.getOrders();
        const rawList = res?.orders ?? (Array.isArray(res) ? res : []);
        if (isMounted) {
          setOrders(rawList);
        }
      } catch {
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBuyerOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasOrders = orders.length > 0;
  const latestOrder = hasOrders ? orders[0] : null;
  const recentShipments = orders.slice(0, 3);

  function formatStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('TRANSIT')) return 'In-Transit';
    if (s.includes('DELIVERED')) return 'Delivered';
    if (s.includes('CANCEL')) return 'Cancelled';
    if (s.includes('CONFIRM')) return 'Confirmed';
    if (s.includes('PLACED')) return 'Processing';
    return 'In-Transit';
  }

  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch">
          <div className="bg-[#1E293B] text-white rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-orange-400">
                  Site Shortage Dispatch
                </p>
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight leading-snug mt-1">
                  {hasOrders
                    ? 'Repeat Recent Site Order & Fast-Track Transit'
                    : 'Emergency Site Shortage & Urgent Restock'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1.5 leading-relaxed">
                  {hasOrders
                    ? 'Instant re-order of your previous construction site batch with priority vehicle allocation.'
                    : 'Immediate materials dispatch to active job sites with pre-allocated heavy commercial vehicles within a 20 KM radius.'}
                </p>
              </div>

              {hasOrders && latestOrder ? (
                <div className="flex items-center gap-3.5 bg-slate-800/90 p-3.5 sm:p-4 rounded-2xl ring-1 ring-slate-700/60 shadow-2xs">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-2xs flex items-center justify-center text-orange-400">
                    <FaTruckFast className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1 leading-snug">
                    <h4 className="text-sm font-medium text-white truncate">
                      {latestOrder.invoiceNumber ? `Invoice ${latestOrder.invoiceNumber}` : `Order #${latestOrder.orderId.slice(-8).toUpperCase()}`}
                    </h4>
                    <p className="text-xs text-slate-300 font-normal truncate mt-0.5 flex items-center gap-2">
                      <span>Total: ₹{latestOrder.grandTotal.toLocaleString('en-IN')}</span>
                      {latestOrder.totalWeightKg && (
                        <>
                          <span className="h-2.5 w-px bg-slate-600 inline-block" />
                          <span>{latestOrder.totalWeightKg} kg Batch</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-emerald-400 font-medium truncate mt-0.5 flex items-center gap-2">
                      <span>Status: {formatStatus(latestOrder.status)}</span>
                      {latestOrder.pincode && (
                        <>
                          <span className="h-2.5 w-px bg-slate-600 inline-block" />
                          <span>PIN {latestOrder.pincode}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 space-y-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-semibold text-orange-400 block tracking-wider">Speed</span>
                    <p className="text-xs font-medium text-white">Same-Day Transit</p>
                    <p className="text-[11px] text-slate-400 font-normal">Within 20 KM</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 space-y-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 block tracking-wider">Fleet</span>
                    <p className="text-xs font-medium text-white">Dedicated Trucks</p>
                    <p className="text-[11px] text-slate-400 font-normal">1.5T to 16T Capacity</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 space-y-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-semibold text-sky-400 block tracking-wider">Billing</span>
                    <p className="text-xs font-medium text-white">GST Tax Invoice</p>
                    <p className="text-[11px] text-slate-400 font-normal">100% Input Credit</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(hasOrders ? '/cart' : '/catalog')}
              className="w-full mt-5 py-3 px-4 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs sm:text-sm font-medium text-center shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaRotateRight className="h-3.5 w-3.5" />
              <span>{hasOrders ? 'Reorder Latest Batch' : 'Browse Materials for Immediate Dispatch'}</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-center sm:text-left">
              <div>
                <h3 className="text-xl font-medium text-slate-900 leading-tight">
                  Recent Shipments Arrival
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
                  Active site deliveries &amp; live GPS transit
                </p>
              </div>
              <button
                onClick={() => router.push('/tracking')}
                className="self-center sm:self-auto text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>View More</span>
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>

            {hasOrders ? (
              <div className="space-y-3">
                {recentShipments.map((order) => {
                  const statusLabel = formatStatus(order.status);
                  const isDelivered = statusLabel === 'Delivered';
                  return (
                    <div
                      key={order.orderId}
                      onClick={() => router.push(`/tracking?orderId=${order.orderId}`)}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                          <FaTruckFast className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                            {order.invoiceNumber ? `Invoice ${order.invoiceNumber}` : `Order #${order.orderId.slice(-8).toUpperCase()}`}
                          </h4>
                          <p className="text-xs text-slate-500 font-normal truncate flex items-center gap-2 mt-0.5">
                            <span>{order.deliveryAddress ? order.deliveryAddress.slice(0, 24) : 'Site Destination'}</span>
                            <span className="h-2.5 w-px bg-slate-200 inline-block" />
                            <span className={isDelivered ? 'text-slate-600 font-medium' : 'text-emerald-600 font-medium'}>
                              {statusLabel}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-right">
                        <span className="text-sm font-medium text-slate-900">
                          ₹{order.grandTotal.toLocaleString('en-IN')}
                        </span>
                        <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <div className="h-11 w-11 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-400">
                  <FaBoxOpen className="h-5 w-5 text-slate-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-slate-800">
                    No Active Shipments
                  </h4>
                  <p className="text-xs text-slate-400 font-normal max-w-xs mx-auto">
                    Live GPS delivery tracking and vehicle transit updates will appear here once you place a material order.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/catalog')}
                  className="text-xs font-semibold text-[#FF6500] hover:text-[#e05a00] flex items-center gap-1 cursor-pointer transition-colors pt-1"
                >
                  <span>Browse Materials Catalog</span>
                  <FaChevronRight className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
