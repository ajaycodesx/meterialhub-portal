'use client';

import React from 'react';
import {
  FaTruckFast,
  FaMapLocationDot,
  FaClock,
  FaIndianRupeeSign,
  FaRoute,
  FaCheck,
  FaKey,
  FaShieldHalved,
  FaTriangleExclamation,
  FaLocationCrosshairs,
  FaBuilding
} from 'react-icons/fa6';
import { Button } from '../ui/Button';

interface DriverDispatchSectionProps {
  activeTrip: any;
  availableTrips: any[];
  todayEarnings: number;
  todayTripsCount: number;
  vehicleType: string;
  actionLoading: string | null;
  onAcceptTrip: (tripId: string) => Promise<void>;
  onUpdateStatus: (tripId: string, nextStatus: string, msg: string) => Promise<void>;
  onRequestOtp: (tripId: string) => Promise<void>;
  onOpenOtpModal: () => void;
  onOpenExceptionModal: () => void;
  gpsCoords: { lat: number; lng: number } | null;
}

export const DriverDispatchSection: React.FC<DriverDispatchSectionProps> = ({
  activeTrip,
  availableTrips,
  todayEarnings,
  todayTripsCount,
  vehicleType,
  actionLoading,
  onAcceptTrip,
  onUpdateStatus,
  onRequestOtp,
  onOpenOtpModal,
  onOpenExceptionModal,
  gpsCoords
}) => {
  const activeStatus = activeTrip?.status || '';

  const steps = [
    { id: 'accepted', label: 'Accepted' },
    { id: 'arrived_at_store', label: 'Depot Arrival' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'arrived_at_site', label: 'Site Gate' },
    { id: 'unloaded_completed', label: 'Delivered' }
  ];

  function getStepIndex(status: string) {
    switch (status) {
      case 'assigned':
      case 'accepted':
        return 0;
      case 'arrived_at_store':
      case 'loaded':
        return 1;
      case 'in_transit':
        return 2;
      case 'arrived_at_site':
        return 3;
      case 'unloaded_completed':
        return 4;
      default:
        return 0;
    }
  }

  const currentStepIdx = getStepIndex(activeStatus);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Today&apos;s Net Earnings
            </span>
            <div className="text-2xl font-medium text-slate-900 mt-1">
              ₹{todayEarnings.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-500">Credited to wallet</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <FaIndianRupeeSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed Jobs
            </span>
            <div className="text-2xl font-medium text-slate-900 mt-1">
              {todayTripsCount} Trips
            </div>
            <span className="text-xs text-slate-500">Offloaded &amp; verified</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FFF7F2] text-[#FF6500]">
            <FaRoute className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Commercial Carrier
            </span>
            <div className="text-base font-medium text-slate-900 mt-1 truncate max-w-[170px]">
              {vehicleType}
            </div>
            <span className="text-xs text-slate-500">Reg: KL-07-CD-8921</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-[#F5A623]">
            <FaTruckFast className="h-5 w-5" />
          </div>
        </div>
      </div>

      {activeTrip ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-5">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-lg bg-orange-100 text-[#FF6500]">
                  Active Field Mission
                </span>
                <span className="text-xs text-slate-400">Order #{activeTrip.orderId}</span>
              </div>
              <h2 className="text-base sm:text-lg font-medium text-slate-900 mt-1">
                Commercial Transport Transit
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-600 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100">
                Guaranteed Payout: ₹{(activeTrip.tripFare || 750).toLocaleString('en-IN')}
              </span>
              <button
                onClick={onOpenExceptionModal}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Report Site or Material Exception"
              >
                <FaTriangleExclamation className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-5">
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={st.id} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-xs transition-colors ${
                        isPassed ? 'bg-[#FF6500]' : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`text-[10px] block truncate font-medium ${
                        isCurrent
                          ? 'text-[#FF6500] font-medium'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                  <FaBuilding className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-slate-500 block uppercase">
                    Pickup Depot (Merchant Hardware Yard)
                  </span>
                  <p className="text-xs font-medium text-slate-900 leading-snug">
                    {activeTrip.pickupAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Stage bay 2 • Loading Supervisor Contact: +91 98470 12345
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 h-3 ml-4" />

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#FF6500] shrink-0">
                  <FaMapLocationDot className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-slate-500 block uppercase">
                    Destination Site (Contractor Unloading Zone)
                  </span>
                  <p className="text-xs font-medium text-slate-900 leading-snug">
                    {activeTrip.dropAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Direct access road • Requires site supervisor OTP confirmation
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <FaClock className="h-3.5 w-3.5 text-slate-400" />
                  {activeTrip.distanceKm} KM Estimated Route
                </span>
                <span className="h-2.5 w-px bg-slate-300 inline-block" />
                <span>Payload: 2.5 Tons TMT &amp; Cement</span>
              </div>

              {gpsCoords && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                  <FaLocationCrosshairs className="h-3 w-3" />
                  <span>GPS: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-medium text-slate-900 block">
                  Workflow Execution Target
                </span>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {activeStatus === 'accepted' && 'Drive to merchant store to inspect and load materials.'}
                  {activeStatus === 'arrived_at_store' && 'Verify delivery challan and load vehicle securely.'}
                  {activeStatus === 'in_transit' && 'Transiting to construction project site.'}
                  {activeStatus === 'arrived_at_site' && 'Arrived at site gate. Offload and confirm customer OTP.'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {activeStatus === 'accepted' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={actionLoading === 'arrived_at_store'}
                    onClick={() =>
                      onUpdateStatus(
                        activeTrip.tripId,
                        'arrived_at_store',
                        'Arrived at merchant hardware depot.'
                      )
                    }
                  >
                    <FaMapLocationDot className="mr-1.5 h-3.5 w-3.5" />
                    Arrived at Depot
                  </Button>
                )}

                {activeStatus === 'arrived_at_store' && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading === 'in_transit'}
                    onClick={() =>
                      onUpdateStatus(
                        activeTrip.tripId,
                        'in_transit',
                        'Cargo secured. In transit to destination.'
                      )
                    }
                  >
                    <FaTruckFast className="mr-1.5 h-3.5 w-3.5" />
                    Materials Loaded &amp; Depart
                  </Button>
                )}

                {activeStatus === 'in_transit' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={actionLoading === 'arrived_at_site'}
                    onClick={() =>
                      onUpdateStatus(
                        activeTrip.tripId,
                        'arrived_at_site',
                        'Arrived at contractor site gate.'
                      )
                    }
                  >
                    <FaMapLocationDot className="mr-1.5 h-3.5 w-3.5" />
                    Arrived at Site Gate
                  </Button>
                )}

                {activeStatus === 'arrived_at_site' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      loading={actionLoading === 'request_otp'}
                      onClick={() => onRequestOtp(activeTrip.tripId)}
                    >
                      <FaKey className="mr-1.5 h-3.5 w-3.5 text-[#FF6500]" />
                      Request OTP
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenOtpModal}
                    >
                      <FaShieldHalved className="mr-1.5 h-3.5 w-3.5" />
                      Verify OTP &amp; Complete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center space-y-2">
          <FaTruckFast className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-medium text-slate-900">No Active Mission</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            You are ready for dispatch. Review eligible delivery jobs in the pool below and accept to claim exclusive transport.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-slate-900">
              Nearby Dispatch Pool ({availableTrips.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Server-authoritative allocations matched to your 3-ton commercial vehicle
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6500]">
            Instant Claim
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {availableTrips.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium">
              No unassigned jobs currently waiting in your area.
            </div>
          ) : (
            availableTrips.map((trip) => {
              const isAccepting = actionLoading === `accept_${trip.tripId}`;
              const isBusy = Boolean(activeTrip);

              return (
                <div
                  key={trip.tripId}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        Order #{trip.orderId}
                      </span>
                      <span className="h-2 w-px bg-slate-300 inline-block" />
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {trip.vehicleType || 'Mini Truck'}
                      </span>
                    </div>

                    <p className="text-slate-600 truncate">
                      {trip.pickupAddress} &rarr; {trip.dropAddress}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{trip.distanceKm} KM Route</span>
                      <span className="h-2 w-px bg-slate-300 inline-block" />
                      <span>Estimated Transit: 25 mins</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-medium text-slate-900">
                        ₹{(trip.tripFare || 750).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium">
                        Direct Deposit
                      </span>
                    </div>

                    <Button
                      variant={isBusy ? 'outline' : 'primary'}
                      size="sm"
                      loading={isAccepting}
                      disabled={isBusy}
                      onClick={() => onAcceptTrip(trip.tripId)}
                      title={isBusy ? 'Complete active delivery before accepting another' : 'Accept job'}
                    >
                      <FaCheck className="mr-1 h-3 w-3" />
                      {isBusy ? 'Busy' : 'Accept Job'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
