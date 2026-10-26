'use client';

import React, { useState } from 'react';
import {
  FaTruckFast,
  FaCircleCheck,
  FaLocationDot,
  FaLocationArrow,
  FaBoxArchive,
  FaClock,
  FaSpinner,
  FaArrowRight
} from 'react-icons/fa6';

interface DriverJobsTabProps {
  availableTrips: any[];
  activeTrip: any;
  tripHistory: any[];
  onAcceptTrip: (tripId: string) => Promise<void>;
  onOpenMap: (trip: any) => void;
  actionLoading: string | null;
}

export function DriverJobsTab({
  availableTrips,
  activeTrip,
  tripHistory,
  onAcceptTrip,
  onOpenMap,
  actionLoading,
}: DriverJobsTabProps) {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const acceptedOrders: any[] = [];
  if (activeTrip) {
    acceptedOrders.push({
      ...activeTrip,
      id: activeTrip.tripId || activeTrip.id,
      displayId: activeTrip.orderId
        ? activeTrip.orderId.startsWith('ord_')
          ? `MH-${activeTrip.orderId.slice(4, 8).toUpperCase()}`
          : activeTrip.orderId
        : 'MH-2051',
      status: activeTrip.status || 'awaiting_otp',
      statusLabel: 'Awaiting OTP',
      vendorName: activeTrip.pickupAddress?.split(',')[0] || 'BuildPro Materials',
      vendorAddress: activeTrip.pickupAddress || 'Industrial Estate Road, Kalamassery',
      buyerName: activeTrip.dropAddress?.split(',')[0] || 'Anjali Traders',
      buyerAddress: activeTrip.dropAddress || 'Market Road, Edappally',
      loadSpecs: activeTrip.vehicleType || '20mm Metal · 8 tons',
      fareDisplay: activeTrip.tripFare
        ? `₹${Math.round(activeTrip.tripFare).toLocaleString('en-IN')}`
        : '₹12,400',
    });
  }

  const defaultMockHistory = [
    {
      id: 'trip_demo_prev',
      displayId: 'MH-2048',
      status: 'picked_up',
      statusLabel: 'Picked up',
      vendorName: 'Kalamassery Depot Hub',
      vendorAddress: 'NH-544 Depot, Kalamassery',
      buyerName: 'Royal Builders Site',
      buyerAddress: 'Infopark Expressway, Kakkanad',
      loadSpecs: '53-Grade OPC · 120 Bags',
      fareDisplay: '₹3,200',
    },
    {
      id: 'trip_demo_completed',
      displayId: 'MH-2042',
      status: 'delivered',
      statusLabel: 'Delivered',
      vendorName: 'Supreme Steel Yards',
      vendorAddress: 'Container Road, Eloor',
      buyerName: 'Skyline Meadows',
      buyerAddress: 'Civil Station, Kakkanad',
      loadSpecs: '12mm TMT Fe550D · 4 tons',
      fareDisplay: '₹4,800',
    }
  ];

  const historyMapped = (tripHistory.length > 0 ? tripHistory : defaultMockHistory).map((t: any) => ({
    id: t.tripId || t.id,
    displayId: t.orderId
      ? t.orderId.startsWith('ord_')
        ? `MH-${t.orderId.slice(4, 8).toUpperCase()}`
        : t.orderId
      : t.displayId || 'MH-2048',
    status: t.status || 'delivered',
    statusLabel: t.status === 'delivered' ? 'Delivered' : t.statusLabel || 'Delivered',
    vendorName: t.pickupAddress?.split(',')[0] || t.vendorName || 'Kalamassery Depot Hub',
    vendorAddress: t.pickupAddress || t.vendorAddress || 'NH-544 Depot, Kalamassery',
    buyerName: t.dropAddress?.split(',')[0] || t.buyerName || 'Royal Builders Site',
    buyerAddress: t.dropAddress || t.buyerAddress || 'Infopark Expressway, Kakkanad',
    loadSpecs: t.vehicleType || t.loadSpecs || 'Building Materials',
    fareDisplay: t.tripFare ? `₹${Math.round(t.tripFare).toLocaleString('en-IN')}` : t.fareDisplay || '₹3,200',
  }));

  const activeTripId = activeTrip?.tripId || activeTrip?.id;
  const filteredHistory = historyMapped.filter((h: any) => h.id !== activeTripId);
  const allOrders = [...acceptedOrders, ...filteredHistory];

  const filteredOrders = allOrders.filter((order) => {
    if (filter === 'in_progress') {
      return order.status !== 'delivered' && order.status !== 'unloaded_completed';
    }
    if (filter === 'completed') {
      return order.status === 'delivered' || order.status === 'unloaded_completed';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="flex items-start justify-between gap-4 pt-2">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
            DISPATCH BOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
            Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Accept a buyer order, then follow the vendor-to-buyer route.
          </p>
        </div>

        <div className="w-12 h-12 bg-[#F5A623] text-slate-900 rounded-2xl flex items-center justify-center shadow-md shrink-0">
          <FaTruckFast className="h-6 w-6" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
            AVAILABLE NOW
          </span>
          <div className="w-6 h-6 bg-[#F5A623] text-slate-900 font-medium text-xs rounded-lg flex items-center justify-center">
            {availableTrips.length}
          </div>
        </div>

        <h2 className="text-lg font-medium text-slate-900 tracking-tight -mt-1">
          Buyer orders waiting
        </h2>

        {availableTrips.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-sm space-y-2">
            <div className="text-emerald-600 flex justify-center">
              <FaCircleCheck className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">
              No unassigned orders
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Stay online and refresh when dispatch adds a buyer order.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableTrips.slice(0, 3).map((trip: any, idx: number) => {
              const tripId = trip.tripId || trip.id || `avail-${idx}`;
              const displayId = trip.orderId
                ? trip.orderId.startsWith('ord_')
                  ? `MH-${trip.orderId.slice(4, 8).toUpperCase()}`
                  : trip.orderId
                : 'MH-NEW';
              const isLoadingThis = actionLoading === `accept_${tripId}`;

              return (
                <div
                  key={`${tripId}-${idx}`}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {displayId}
                    </span>
                    <span className="text-xs font-medium text-emerald-600">
                      ₹{Math.round(trip.tripFare || 850).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FaLocationDot className="h-3 w-3 text-amber-500 shrink-0" />
                      <span className="truncate">{trip.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaLocationDot className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{trip.dropAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 font-medium">
                      {trip.vehicleType || 'Commercial Load'} · {trip.distanceKm || 3.5} km
                    </span>
                    <button
                      onClick={() => onAcceptTrip(tripId)}
                      disabled={Boolean(actionLoading)}
                      className="py-2 px-4 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingThis ? (
                        <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FaArrowRight className="h-3 w-3" />
                      )}
                      <span>Accept Delivery</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
          YOUR ORDERS
        </span>
        <h2 className="text-xl font-medium text-slate-900 tracking-tight -mt-1">
          Accepted deliveries
        </h2>

        <div className="flex items-center gap-2">
          {(['all', 'in_progress', 'completed'] as const).map((tabKey) => {
            const labels = {
              all: 'All',
              in_progress: 'In progress',
              completed: 'Completed',
            };
            const active = filter === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setFilter(tabKey)}
                className={`py-2 px-4 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {labels[tabKey]}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-slate-500 block pt-1">
          {filteredOrders.length} orders
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order: any, idx: number) => {
            const isCompleted = order.status === 'delivered' || order.status === 'unloaded_completed';
            const itemKey = `${order.id || 'order'}-${idx}`;

            return (
              <div
                key={itemKey}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">
                    {order.displayId}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isCompleted
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {isCompleted ? 'Delivered' : order.statusLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-slate-900">
                      {order.vendorName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <FaLocationDot className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Pickup: {order.vendorAddress}</span>
                    </div>
                  </div>

                  <div className="border-l-2 border-[#F5A623] h-4 ml-1.5" />

                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-slate-900">
                      {order.buyerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <FaLocationDot className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Drop: {order.buyerAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <FaBoxArchive className="h-3.5 w-3.5 text-slate-400" />
                    <span>{order.loadSpecs}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <FaClock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{order.fareDisplay}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenMap(order)}
                  className="w-full py-2.5 px-4 bg-[#FFF7F2] hover:bg-orange-100/70 text-[#FF6500] font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                >
                  <FaLocationArrow className="h-3.5 w-3.5 text-[#FF6500]" />
                  <span>Open driving map</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
