'use client';

import React, { useState } from 'react';
import {
  FaTruckFast,
  FaBoxArchive,
  FaCircleCheck,
  FaBell,
  FaLocationDot,
  FaLocationArrow,
  FaShieldHalved,
  FaArrowDown,
  FaSpinner,
  FaKey,
  FaTruckRampBox,
  FaRoad,
  FaMoneyBillWave,
  FaTriangleExclamation,
  FaClock
} from 'react-icons/fa6';

interface DriverOverviewTabProps {
  driverName: string;
  isOnline: boolean;
  onToggleOnline: () => Promise<void>;
  activeTrip: any;
  completedCount: number;
  loading?: boolean;
  onNavigateTab: (tab: 'overview' | 'jobs' | 'alerts' | 'account') => void;
  onOpenMap: (trip: any) => void;
  onRequestOtp: (tripId: string) => Promise<void>;
  onVerifyOtp: (tripId: string, otp: string) => Promise<void>;
  onUpdateStatus: (tripId: string, status: string, message: string) => Promise<void>;
}

export function DriverOverviewTab({
  driverName,
  isOnline,
  onToggleOnline,
  activeTrip,
  completedCount,
  loading = false,
  onNavigateTab,
  onOpenMap,
  onRequestOtp,
  onVerifyOtp,
  onUpdateStatus,
}: DriverOverviewTabProps) {
  if (loading && !activeTrip) {
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

  const [inlineOtp, setInlineOtp] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  async function handleToggleStatus() {
    try {
      setTogglingOnline(true);
      await onToggleOnline();
    } finally {
      setTogglingOnline(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inlineOtp.trim()) return;
    try {
      setOtpSubmitting(true);
      const tripId = activeTrip?.tripId || activeTrip?.id || 'trip_5501';
      await onVerifyOtp(tripId, inlineOtp.trim());
      setInlineOtp('');
    } finally {
      setOtpSubmitting(false);
    }
  }

  const tripIdDisplay = activeTrip?.orderId
    ? activeTrip.orderId.startsWith('ord_')
      ? `MH-${activeTrip.orderId.slice(4, 8).toUpperCase()}`
      : activeTrip.orderId
    : 'MH-2051';

  const vendorName = activeTrip?.pickupAddress?.split(',')[0] || 'BuildPro Materials';
  const vendorAddress = activeTrip?.pickupAddress || 'Industrial Estate Road, Kalamassery';
  const buyerName = activeTrip?.dropAddress?.split(',')[0] || 'Anjali Traders';
  const buyerAddress = activeTrip?.dropAddress || 'Market Road, Edappally';
  const fareDisplay = activeTrip?.tripFare
    ? `₹${Math.round(activeTrip.tripFare).toLocaleString('en-IN')}`
    : '₹12,400';
  const loadDisplay = activeTrip?.vehicleType
    ? `${activeTrip.vehicleType}`
    : '20mm Metal · 8 tons';

  const tripStatus = activeTrip?.status || 'awaiting_otp';
  const isAwaitingOtp = tripStatus === 'arrived_at_site' || tripStatus === 'awaiting_otp';

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="pt-1 space-y-0.5">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
          DISPATCH FEED
        </span>
        <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
          Good morning, {driverName.split(' ')[0]}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2">
          <div className="text-[#FF6500]">
            <FaBoxArchive className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              {activeTrip ? 1 : 0}
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              Active order
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2">
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

        <button
          onClick={() => onNavigateTab('alerts')}
          className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="text-amber-500">
            <FaBell className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <span className="text-2xl lg:text-3xl font-medium text-slate-900 block leading-tight">
              4
            </span>
            <span className="text-xs font-medium text-slate-500 block">
              New alerts
            </span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-[#0F172A] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-sm inline-block ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-medium text-white tracking-tight leading-snug">
                  {isOnline
                    ? 'You are online and ready for dispatch.'
                    : 'You are currently offline.'}
                </h2>

                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
                  Dispatch and vendors use your status before offering a new vehicle assignment.
                </p>
              </div>

              <button
                onClick={handleToggleStatus}
                disabled={togglingOnline}
                className="w-14 h-14 bg-[#F5A623] hover:bg-[#E0901A] text-slate-900 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                title={isOnline ? 'Go Offline' : 'Go Online'}
              >
                {togglingOnline ? (
                  <FaSpinner className="h-6 w-6 animate-spin text-slate-900" />
                ) : (
                  <FaTruckFast className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
                  ACTIVE ORDER
                </span>
                <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                  Your delivery flow
                </h2>
              </div>

              <button
                onClick={() => onNavigateTab('jobs')}
                className="text-xs font-medium text-[#FF6500] hover:text-[#E05800] transition-colors cursor-pointer"
              >
                All orders
              </button>
            </div>

            {activeTrip ? (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 tracking-wide">
                    {tripIdDisplay}
                  </span>
                  <span className="text-xs font-medium text-amber-600">
                    {tripStatus === 'arrived_at_site'
                      ? 'Awaiting buyer OTP'
                      : tripStatus === 'in_transit'
                      ? 'In Transit'
                      : tripStatus === 'loaded'
                      ? 'Loaded · Depart Site'
                      : tripStatus === 'arrived_at_store'
                      ? 'At Depot Loading'
                      : 'Awaiting buyer OTP'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-slate-900">
                      {vendorName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <FaLocationDot className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Pickup: {vendorAddress}</span>
                    </div>
                  </div>

                  <div className="pl-1.5 text-[#F5A623]">
                    <FaArrowDown className="h-4 w-4" />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-slate-900">
                      {buyerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <FaLocationDot className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Drop: {buyerAddress}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenMap(activeTrip)}
                  className="w-full py-3 px-4 bg-[#FFF7F2] hover:bg-orange-100/70 text-[#FF6500] font-medium rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <FaLocationArrow className="h-4 w-4 text-[#FF6500]" />
                  <span>Open driving map</span>
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
                      LOAD
                    </span>
                    <span className="font-medium text-slate-900">
                      {loadDisplay}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">
                      COLLECT
                    </span>
                    <span className="font-medium text-slate-900 text-sm">
                      {fareDisplay}
                    </span>
                  </div>
                </div>

                {tripStatus === 'accepted' && (
                  <button
                    onClick={async () => {
                      setStepLoading(true);
                      try {
                        await onUpdateStatus(activeTrip.tripId, 'arrived_at_store', 'Arrived at depot for material pickup.');
                      } finally {
                        setStepLoading(false);
                      }
                    }}
                    disabled={stepLoading}
                    className="w-full py-3 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <FaTruckRampBox className="h-4 w-4" />
                    <span>Mark Arrived at Vendor Depot</span>
                  </button>
                )}

                {tripStatus === 'arrived_at_store' && (
                  <button
                    onClick={async () => {
                      setStepLoading(true);
                      try {
                        await onUpdateStatus(activeTrip.tripId, 'loaded', 'Material verified and secured on carrier vehicle.');
                      } finally {
                        setStepLoading(false);
                      }
                    }}
                    disabled={stepLoading}
                    className="w-full py-3 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <FaCircleCheck className="h-4 w-4" />
                    <span>Confirm Material Loaded</span>
                  </button>
                )}

                {tripStatus === 'loaded' && (
                  <button
                    onClick={async () => {
                      setStepLoading(true);
                      try {
                        await onUpdateStatus(activeTrip.tripId, 'in_transit', 'Dispatched from depot. Heading to contractor delivery site.');
                      } finally {
                        setStepLoading(false);
                      }
                    }}
                    disabled={stepLoading}
                    className="w-full py-3 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <FaTruckFast className="h-4 w-4" />
                    <span>Depart Depot (In Transit)</span>
                  </button>
                )}

                {tripStatus === 'in_transit' && (
                  <button
                    onClick={async () => {
                      setStepLoading(true);
                      try {
                        await onUpdateStatus(activeTrip.tripId, 'arrived_at_site', 'Arrived at delivery site. Ready for supervisor offload.');
                      } finally {
                        setStepLoading(false);
                      }
                    }}
                    disabled={stepLoading}
                    className="w-full py-3 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <FaLocationDot className="h-4 w-4" />
                    <span>Mark Arrived at Site</span>
                  </button>
                )}

                {isAwaitingOtp && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaShieldHalved className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-medium text-slate-900">
                          Buyer Handover Verification
                        </span>
                      </div>
                      <span className="text-xs font-medium text-emerald-600">
                        POD Required
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Enter the 4-digit handover OTP from {buyerName} to confirm material offload and complete delivery.
                    </p>

                    <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <FaKey className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          value={inlineOtp}
                          onChange={(e) => setInlineOtp(e.target.value)}
                          placeholder="Enter 4-digit OTP"
                          maxLength={6}
                          className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors shadow-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={otpSubmitting || !inlineOtp.trim()}
                        className="py-2.5 px-5 bg-[#0F172A] hover:bg-slate-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {otpSubmitting ? (
                          <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FaCircleCheck className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        <span>Verify & Complete</span>
                      </button>
                    </form>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <button
                        type="button"
                        onClick={() => onRequestOtp(activeTrip?.tripId || 'trip_5501')}
                        className="font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FaKey className="h-3 w-3 text-slate-400" />
                        <span>Resend OTP SMS</span>
                      </button>

                      <span className="font-medium text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-xs bg-emerald-500 inline-block" />
                        <span>Payment & Offload Handover</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FaTruckFast className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-slate-900">
                    No active delivery assignment
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Check available dispatches on the dispatch board or toggle your status online.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('jobs')}
                  className="py-2.5 px-5 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-xl text-xs transition-colors cursor-pointer inline-block"
                >
                  Browse Available Jobs
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                CARRIER TELEMETRY
              </span>
              <span className="text-xs font-medium text-emerald-600">
                GPS Connected
              </span>
            </div>

            <div className="relative w-full h-40 bg-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between p-3.5">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="relative flex items-center justify-between text-white text-xs">
                <span className="font-medium">Kalamassery to Edappally</span>
                <span className="font-mono text-[11px] text-slate-300">32 km/h</span>
              </div>

              <div className="relative text-center">
                <div className="inline-flex p-2.5 rounded-xl bg-[#FF6500] text-white shadow-md">
                  <FaLocationArrow className="h-4 w-4" />
                </div>
              </div>

              <div className="relative flex items-center justify-between text-[11px] text-slate-300">
                <span>Heavy Commercial Route</span>
                <span>4.5m Clearance</span>
              </div>
            </div>

            {activeTrip && (
              <button
                onClick={() => onOpenMap(activeTrip)}
                className="w-full py-2.5 px-4 bg-[#FFF7F2] hover:bg-orange-100/70 text-[#FF6500] font-medium rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                <FaRoad className="h-3.5 w-3.5 text-[#FF6500]" />
                <span>Launch Desktop Route Guidance</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                Weekly Earnings Ledger
              </h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase block">
                EARNINGS THIS WEEK
              </span>
              <span className="text-2xl font-medium text-slate-900 block">
                ₹6,850.00
              </span>
              <span className="text-xs text-slate-500 font-medium">
                12 loads completed · Next payout Tuesday
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <FaTriangleExclamation className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                Site Offloading Protocols
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Wear high-visibility vest & steel toe boots on site</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify buyer OTP prior to releasing delivery voucher</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Report access road blocks immediately to dispatch</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
