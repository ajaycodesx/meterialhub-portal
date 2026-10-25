'use client';

import { useState, useEffect } from 'react';
import {
  FaTruckFast,
  FaMapLocationDot,
  FaClock,
  FaIndianRupeeSign,
  FaExclamation,
  FaSpinner,
  FaBox,
  FaRoute,
  FaCheck,
  FaKey,
  FaShieldHalved,
  FaXmark,
  FaCircleCheck
} from 'react-icons/fa6';
import { driverApi, authApi, apiClient } from '../lib/api';
import { Modal } from './ui/Modal';

interface DashboardData {
  driverId: string;
  driverName: string;
  vehicleType: string;
  isOnline: boolean;
  todayEarnings: number;
  todayTripsCount: number;
  activeTrip: any;
  availableTrips: any[];
  weeklyPayoutSummary: {
    weekTotal: number;
    completedTrips: number;
    payoutDay: string;
  };
}

export function DriverDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpModalError, setOtpModalError] = useState<string | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  async function fetchDashboard() {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
        const auth: any = await authApi.login('driver@materialhub.in', 'driver123');
        apiClient.setToken(auth.access_token);
      }
      const dashboardData: any = await driverApi.getFeed();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    function setupWs() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token') || 'u_driver_1';
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => setIsWsConnected(true);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (['trip_status_update', 'order_status_update', 'delivery_verification', 'notification'].includes(msg.event)) {
              fetchDashboard();
            }
          } catch (e) {
            console.error('Driver WS parse error:', e);
          }
        };
        socket.onclose = () => {
          setIsWsConnected(false);
          reconnectTimer = setTimeout(setupWs, 3000);
        };
        socket.onerror = () => setIsWsConnected(false);
      } catch (e) {
        setIsWsConnected(false);
      }
    }

    fetchDashboard();
    setupWs();
    const pollTimer = setInterval(fetchDashboard, 5000);

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
      clearInterval(pollTimer);
    };
  }, []);

  const handleAcceptTrip = async (tripId: string) => {
    setActionLoading(`accept_${tripId}`);
    setActionError(null);
    setActionSuccess(null);
    try {
      await driverApi.updateTripStatus({ tripId, status: 'accepted' });
      setActionSuccess('Trip accepted! Head over to the merchant store for material loading.');
      await fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept trip.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (tripId: string, nextStatus: string, successMsg: string) => {
    setActionLoading(nextStatus);
    setActionError(null);
    setActionSuccess(null);
    try {
      await driverApi.updateTripStatus({ tripId, status: nextStatus });
      setActionSuccess(successMsg);
      await fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update trip status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestOtp = async (tripId: string) => {
    setActionLoading('request_otp');
    setOtpModalError(null);
    try {
      const res: any = await driverApi.requestDeliveryOtp(tripId);
      if (res?.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtpValue(res.devOtp);
      }
      setIsOtpModalOpen(true);
      setActionSuccess('Delivery verification OTP dispatched to customer phone.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to generate delivery OTP.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (!data?.activeTrip?.tripId || !otpValue.trim()) {
      setOtpModalError('Please enter the 6-digit OTP provided by customer.');
      return;
    }
    setVerifyingOtp(true);
    setOtpModalError(null);
    try {
      await driverApi.verifyDeliveryOtp(data.activeTrip.tripId, otpValue.trim());
      setIsOtpModalOpen(false);
      setOtpValue('');
      setDevOtpHint(null);
      setActionSuccess('Delivery verified and offloading completed successfully! Payout credited.');
      await fetchDashboard();
    } catch (err: any) {
      setOtpModalError(err.message || 'Invalid or expired OTP. Please re-check.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <FaSpinner className="h-6 w-6 animate-spin" />
          <span>Loading MaterialHub Driver Portal...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FaExclamation className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Unable to Load Dashboard</h3>
          <p className="text-sm text-slate-500">{error || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  const activeStatus = data.activeTrip?.status || '';

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="bg-white shadow-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
              <img
                src="/images/logo_dark.png"
                alt="MaterialHub Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{data.driverName}</h1>
              <p className="text-xs text-slate-500">{data.vehicleType}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className={`h-2 w-2 rounded-xs ${isWsConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={isWsConnected ? 'text-emerald-600' : 'text-slate-500'}>{isWsConnected ? 'Live Dispatch' : 'Syncing'}</span>
            </span>
            <span className="h-3 w-px bg-slate-200 inline-block" />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className={`h-2 w-2 rounded-xs ${data.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={data.isOnline ? 'text-emerald-600' : 'text-slate-500'}>{data.isOnline ? 'Online' : 'Offline'}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <FaExclamation className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaIndianRupeeSign className="h-5 w-5" />
              </div>
              <span className="text-xs text-emerald-600 font-semibold">Today</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{data.todayEarnings.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Today's Earnings</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaRoute className="h-5 w-5" />
              </div>
              <span className="text-xs text-blue-600 font-semibold">Completed</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.todayTripsCount}</p>
            <p className="text-xs text-slate-500 mt-1">Trips Today</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FaTruckFast className="h-5 w-5" />
              </div>
              <span className="text-xs text-purple-600 font-semibold">Vehicle</span>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight">{data.vehicleType}</p>
            <p className="text-xs text-slate-500 mt-1">Assigned Commercial Unit</p>
          </div>
        </div>

        {data.activeTrip ? (
          <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Mission</span>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Active Delivery Trip</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6500]">
                <span className="h-2 w-2 rounded-xs bg-[#FF6500]" />
                <span className="capitalize">{activeStatus.replace(/_/g, ' ')}</span>
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FaBox className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Order Reference</p>
                    <p className="text-sm font-semibold text-slate-900">{data.activeTrip.orderId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaIndianRupeeSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Trip Guaranteed Payout</p>
                    <p className="text-sm font-semibold text-slate-900">₹{data.activeTrip.tripFare.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <FaMapLocationDot className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Pickup (Merchant Hardware Store)</p>
                    <p className="text-sm text-slate-900 font-semibold">{data.activeTrip.pickupAddress}</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-slate-300 h-4 ml-4" />
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <FaMapLocationDot className="h-4 w-4 text-[#FF6500]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Drop (Construction Unloading Site)</p>
                    <p className="text-sm text-slate-900 font-semibold">{data.activeTrip.dropAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <FaClock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 font-medium">{data.activeTrip.distanceKm} KM Estimated Route</span>
                </div>
                <div className="text-xs text-slate-500">
                  Vehicle: <strong className="text-slate-800">{data.activeTrip.vehicleRegNumber || 'KL-07-CD-8921'}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-orange-50/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Workflow Action Step</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {activeStatus === 'accepted' && 'Travel to merchant store to collect and inspect materials.'}
                      {activeStatus === 'arrived_at_store' && 'Verify bill, load materials securely onto truck, and begin transit.'}
                      {activeStatus === 'in_transit' && 'Driving to destination unloading site.'}
                      {activeStatus === 'arrived_at_site' && 'Arrived at site gate. Offload materials and verify OTP with supervisor.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {activeStatus === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(data.activeTrip.tripId, 'arrived_at_store', 'Marked arrived at merchant store.')}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all w-full sm:w-auto"
                      >
                        {actionLoading === 'arrived_at_store' ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaMapLocationDot className="h-3.5 w-3.5" />}
                        <span>Arrived at Store</span>
                      </button>
                    )}

                    {activeStatus === 'arrived_at_store' && (
                      <button
                        onClick={() => handleUpdateStatus(data.activeTrip.tripId, 'in_transit', 'Materials loaded! Trip marked in-transit.')}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6500] hover:bg-[#e05800] text-white text-xs font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all w-full sm:w-auto"
                      >
                        {actionLoading === 'in_transit' ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaTruckFast className="h-3.5 w-3.5" />}
                        <span>Materials Loaded &amp; Start Trip</span>
                      </button>
                    )}

                    {activeStatus === 'in_transit' && (
                      <button
                        onClick={() => handleUpdateStatus(data.activeTrip.tripId, 'arrived_at_site', 'Arrived at construction site. Ready for OTP verification.')}
                        disabled={actionLoading !== null}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10 hover:shadow-lg transition-all w-full sm:w-auto"
                      >
                        {actionLoading === 'arrived_at_site' ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaMapLocationDot className="h-3.5 w-3.5" />}
                        <span>Arrived at Site</span>
                      </button>
                    )}

                    {activeStatus === 'arrived_at_site' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleRequestOtp(data.activeTrip.tripId)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-all shadow-xs"
                        >
                          {actionLoading === 'request_otp' ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaKey className="h-3.5 w-3.5 text-[#FF6500]" />}
                          <span>Request OTP</span>
                        </button>

                        <button
                          onClick={() => {
                            setOtpModalError(null);
                            setIsOtpModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6500] hover:bg-[#e05800] text-white text-xs font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                        >
                          <FaShieldHalved className="h-3.5 w-3.5" />
                          <span>Verify OTP &amp; Complete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-12 text-center">
            <FaTruckFast className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">No Active Trip Assigned</h3>
            <p className="text-xs sm:text-sm text-slate-500">Pick an unassigned delivery job below to start earning.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Available Dispatches</span>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Nearby Trip Pool ({data.availableTrips.length})</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Instant Driver Allocation</span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.availableTrips.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No available unassigned trips at the moment.</div>
            ) : (
              data.availableTrips.map((trip) => {
                const isAccepting = actionLoading === `accept_${trip.tripId}`;
                return (
                  <div key={trip.tripId} className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0 shadow-xs">
                        <FaBox className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{trip.orderId}</p>
                          <span className="px-2.5 py-0.5 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {trip.vehicleType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-normal">
                          {trip.pickupAddress} &rarr; {trip.dropAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-base font-bold text-slate-900">₹{trip.tripFare.toLocaleString()}</p>
                        <p className="text-[11px] text-slate-500 font-normal">{trip.distanceKm} KM Route</p>
                      </div>

                      <button
                        onClick={() => handleAcceptTrip(trip.tripId)}
                        disabled={actionLoading !== null || Boolean(data.activeTrip)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${Boolean(data.activeTrip)
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-[#FF6500] hover:bg-[#e05800] text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30'
                          }`}
                        title={data.activeTrip ? 'Complete active trip first before accepting another' : 'Accept this delivery job'}
                      >
                        {isAccepting ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaCheck className="h-3.5 w-3.5" />}
                        <span>{data.activeTrip ? 'Busy' : 'Accept Trip'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50/80 via-white to-slate-50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Weekly Direct Deposit Guarantee</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">₹{data.weeklyPayoutSummary.weekTotal.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{data.weeklyPayoutSummary.completedTrips} site offloading trips completed this cycle</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500 font-normal">Next Payout Cycle</p>
              <p className="text-sm font-semibold text-[#FF6500] mt-0.5">{data.weeklyPayoutSummary.payoutDay}</p>
            </div>
          </div>
        </div>
      </main>

      {isOtpModalOpen && (
        <Modal
          isOpen={isOtpModalOpen}
          onClose={() => {
            setIsOtpModalOpen(false);
            setOtpModalError(null);
          }}
          icon={<FaKey className="h-5 w-5" />}
          iconBg="bg-orange-500/15 border border-orange-500/25"
          iconColor="text-[#FF6500]"
          title="Delivery OTP Verification"
          subtitle={`Order #${data?.activeTrip?.orderId || ''} · Site Offloading Confirmation`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed font-normal text-center">
              Ask the site supervisor or customer for the 6-digit verification code sent to their phone to confirm material offloading.
            </p>

            {devOtpHint && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs shadow-xs flex items-center justify-between">
                <span>Dev Simulation Code:</span>
                <strong className="font-mono text-sm tracking-widest">{devOtpHint}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center uppercase tracking-wider">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="------"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl sm:text-3xl font-bold py-3 rounded-2xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500] text-white bg-[#162137] shadow-inner"
              />
              {otpModalError && (
                <p className="text-xs text-rose-400 text-center mt-2 font-medium">{otpModalError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtpModalError(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/70 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpValue.length < 4}
                className="px-6 py-2.5 rounded-xl bg-[#FF6500] hover:bg-[#e05800] text-xs font-semibold text-white shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {verifyingOtp ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaShieldHalved className="h-3.5 w-3.5" />}
                <span>Confirm Delivery</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
