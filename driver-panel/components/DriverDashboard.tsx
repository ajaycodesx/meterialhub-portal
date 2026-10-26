'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaXmark,
  FaKey,
  FaShieldHalved,
  FaTruckFast,
  FaBell
} from 'react-icons/fa6';
import { driverApi, authApi, apiClient } from '../lib/api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

import { DriverAuthView } from './driver/DriverAuthView';
import { DriverOverviewTab } from './driver/DriverOverviewTab';
import { DriverJobsTab } from './driver/DriverJobsTab';
import { DriverNavigationScreen } from './driver/DriverNavigationScreen';
import { DriverAlertsTab } from './driver/DriverAlertsTab';
import { DriverAccountTab } from './driver/DriverAccountTab';
import { DriverBottomNav, DriverNavTab } from './driver/DriverBottomNav';
import { DriverSidebar } from './driver/DriverSidebar';

function resolveDriverTabFromPath(path: string | null): DriverNavTab {
  if (!path) return 'overview';
  const stripped = path.startsWith('/') ? path.slice(1) : path;
  const clean = stripped.split('/')[0];
  const validTabs: DriverNavTab[] = ['overview', 'jobs', 'alerts', 'account'];
  return validTabs.includes(clean as DriverNavTab) ? (clean as DriverNavTab) : 'overview';
}

export function DriverDashboard({ initialSlug }: { initialSlug?: DriverNavTab } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<DriverNavTab>(() => initialSlug || resolveDriverTabFromPath(pathname));

  useEffect(() => {
    const fromPath = resolveDriverTabFromPath(pathname);
    if (fromPath !== activeTab) {
      setActiveTab(fromPath);
    }
  }, [pathname]);

  const handleTabChange = (tab: DriverNavTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      router.push(`/${tab}`);
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [feedData, setFeedData] = useState<any>(null);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [navTrip, setNavTrip] = useState<any | null>(null);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpModalError, setOtpModalError] = useState<string | null>(null);

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  function requestBrowserGps() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGpsCoords(coords);
        setGpsActive(true);
        driverApi.updateLocation({
          latitude: coords.lat,
          longitude: coords.lng,
          speedKmh: position.coords.speed ? position.coords.speed * 3.6 : 30.0,
          heading: position.coords.heading || 0
        }).catch(() => {});
      },
      () => {
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          const auth: any = await authApi.login('driver@materialhub.in', 'driver123');
          if (auth?.access_token) {
            apiClient.setToken(auth.access_token);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
        } else {
          setIsAuthenticated(true);
        }
      }

      const [feedRes, historyRes, profileRes] = await Promise.allSettled([
        driverApi.getFeed(),
        driverApi.getTripHistory(),
        driverApi.getProfile()
      ]);

      if (feedRes.status === 'fulfilled') setFeedData(feedRes.value);
      if (historyRes.status === 'fulfilled') setTripHistory(historyRes.value || []);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to driver dispatch server');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    function setupWs() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token') || 'u_driver_1';
      const wsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (
              [
                'trip_status_update',
                'order_status_update',
                'delivery_verification',
                'notification',
                'system_alert'
              ].includes(msg.event)
            ) {
              loadData(true);
            }
          } catch (e) {
          }
        };
        socket.onclose = () => {
          reconnectTimer = setTimeout(setupWs, 4000);
        };
      } catch (e) {
      }
    }

    loadData();
    setupWs();
    requestBrowserGps();

    const pollTimer = setInterval(() => loadData(true), 7000);

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
      clearInterval(pollTimer);
    };
  }, [loadData]);

  async function handleToggleOnline() {
    try {
      const res = await driverApi.toggleOnline();
      setFeedData((prev: any) => ({ ...prev, isOnline: res.isOnline }));
      setProfile((prev: any) => ({ ...prev, isOnline: res.isOnline }));
      setActionSuccess(
        res.isOnline
          ? 'Driver status marked Online: Accepting nearby delivery dispatches'
          : 'Driver status marked Offline: Availability paused'
      );
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle availability status');
    }
  }

  async function handleAcceptTrip(tripId: string) {
    setActionLoading(`accept_${tripId}`);
    setActionError(null);
    setActionSuccess(null);
    try {
      await driverApi.updateTripStatus({ tripId, status: 'accepted' });
      setActionSuccess('Delivery accepted. Proceed to vendor depot for material pickup.');
      await loadData(true);
      setActiveTab('overview');
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept trip.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpdateStatus(tripId: string, nextStatus: string, successMsg: string) {
    setActionLoading(nextStatus);
    setActionError(null);
    setActionSuccess(null);
    try {
      await driverApi.updateTripStatus({
        tripId,
        status: nextStatus,
        currentLat: gpsCoords?.lat,
        currentLng: gpsCoords?.lng
      });
      setActionSuccess(successMsg);
      await loadData(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update trip status.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRequestOtp(tripId: string) {
    setActionLoading('request_otp');
    setOtpModalError(null);
    try {
      await driverApi.requestDeliveryOtp(tripId);
      setOtpValue('');
      setIsOtpModalOpen(true);
      setActionSuccess('Verification OTP sent to contractor mobile number.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to generate delivery OTP.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVerifyOtpDirect(tripId: string, otp: string) {
    if (!otp.trim()) {
      setActionError('Please enter the verification OTP.');
      return;
    }
    try {
      setActionLoading('verify_otp');
      await driverApi.verifyDeliveryOtp(tripId, otp.trim());
      setActionSuccess('Delivery verified and offloading completed successfully. Payout credited.');
      await loadData(true);
    } catch (err: any) {
      setActionError(err.message || 'Invalid or expired OTP. Please verify with site supervisor.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVerifyOtpModal() {
    const targetTripId = feedData?.activeTrip?.tripId || 'trip_5501';
    if (!otpValue.trim()) {
      setOtpModalError('Please enter the OTP.');
      return;
    }
    setVerifyingOtp(true);
    setOtpModalError(null);
    try {
      await driverApi.verifyDeliveryOtp(targetTripId, otpValue.trim());
      setIsOtpModalOpen(false);
      setOtpValue('');
      setActionSuccess('Delivery verified and offloading completed successfully.');
      await loadData(true);
    } catch (err: any) {
      setOtpModalError(err.message || 'Invalid OTP. Please check with customer.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      apiClient.setToken(null);
      setIsAuthenticated(false);
      setProfile(null);
      setFeedData(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <DriverAuthView
        onAuthenticated={(token) => {
          apiClient.setToken(token);
          setIsAuthenticated(true);
          loadData();
        }}
      />
    );
  }


  const driverName = profile?.name || feedData?.driverName || 'Ajay';
  const isOnline = profile?.isOnline ?? feedData?.isOnline ?? true;
  const activeTrip = feedData?.activeTrip;
  const availableTrips = feedData?.availableTrips || [];
  const completedCount = feedData?.todayTripsCount ?? profile?.completedTripsLifetime ?? 12;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row w-full">
      <DriverSidebar
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab)}
        driverName={driverName}
        vehicleType={profile?.vehicleType || feedData?.vehicleType || 'Commercial Carrier'}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        onLogout={handleLogout}
        unreadAlertsCount={4}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
          <div className="w-full max-w-md md:max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#F5A623] text-slate-900 rounded-xl flex items-center justify-center shadow-xs">
                <FaTruckFast className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-900 tracking-wider block leading-tight">
                  MATERIALHUB
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                  DRIVER LOGISTICS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleOnline}
                aria-label={isOnline ? 'Switch to Inactive' : 'Switch to Active'}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                <span
                  className={`w-2 h-2 rounded-xs inline-block ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isOnline ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {isOnline ? 'Active' : 'Inactive'}
                </span>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-lg p-0.5 transition-colors duration-200 ${
                    isOnline ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-md bg-white shadow-xs transition duration-200 ${
                      isOnline ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>

              <button
                onClick={() => handleTabChange('alerts')}
                aria-label="View alerts"
                className="relative w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <FaBell className="h-3.5 w-3.5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#F5A623] text-slate-950 font-medium text-[8px] rounded-xs flex items-center justify-center shadow-xs">
                  4
                </span>
              </button>
            </div>
          </div>
        </header>

        <header className="hidden lg:flex bg-white px-8 py-4 border-b border-slate-200/80 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
              DISPATCH CONSOLE
            </span>
            <h1 className="text-xl font-medium text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Operations Overview'}
              {activeTab === 'jobs' && 'Dispatch Board & Deliveries'}
              {activeTab === 'alerts' && 'System Notifications & Bulletins'}
              {activeTab === 'account' && 'Carrier Profile & Compliance'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className={`w-2.5 h-2.5 rounded-xs ${gpsActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-medium text-slate-700">
                {gpsActive ? 'Live Telemetry Active' : 'Depot Routing Mode'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleOnline}
              className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-xs ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={`text-xs font-medium ${isOnline ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isOnline ? 'Active (Accepting)' : 'Inactive (Off Duty)'}
              </span>
              <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-lg p-0.5 transition-colors duration-200 ${isOnline ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-md bg-white shadow-xs transition duration-200 ${isOnline ? 'translate-x-4' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-md md:max-w-3xl lg:max-w-none mx-auto lg:mx-0 pt-20 sm:pt-22 lg:pt-8 px-4 sm:px-6 lg:px-8 space-y-6 overflow-y-auto">
          {actionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button
                onClick={() => setActionSuccess(null)}
                className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
              >
                <FaXmark className="h-3.5 w-3.5 text-emerald-800" />
              </button>
            </div>
          )}

          {actionError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FaTriangleExclamation className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                onClick={() => setActionError(null)}
                className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
              >
                <FaXmark className="h-3.5 w-3.5 text-rose-800" />
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <DriverOverviewTab
              driverName={driverName}
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              activeTrip={activeTrip}
              completedCount={completedCount}
              loading={loading}
              onNavigateTab={(tab) => handleTabChange(tab)}
              onOpenMap={(trip) => setNavTrip(trip)}
              onRequestOtp={handleRequestOtp}
              onVerifyOtp={handleVerifyOtpDirect}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'jobs' && (
            <DriverJobsTab
              availableTrips={availableTrips}
              activeTrip={activeTrip}
              tripHistory={tripHistory}
              onAcceptTrip={handleAcceptTrip}
              onOpenMap={(trip) => setNavTrip(trip)}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === 'alerts' && <DriverAlertsTab />}

          {activeTab === 'account' && (
            <DriverAccountTab
              profile={profile}
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              onLogout={handleLogout}
            />
          )}
        </main>

        <div className="lg:hidden">
          <DriverBottomNav
            activeTab={activeTab}
            onTabChange={(tab) => handleTabChange(tab)}
            unreadAlertsCount={4}
          />
        </div>
      </div>

        {navTrip && (
          <DriverNavigationScreen
            trip={navTrip}
            onClose={() => setNavTrip(null)}
            gpsCoords={gpsCoords}
            gpsActive={gpsActive}
            onRequestGps={requestBrowserGps}
          />
        )}

        <Modal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          title="Verify Delivery Handover"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <FaShieldHalved className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-medium text-slate-900">Enter Delivery Handover OTP</p>
                <p className="text-slate-500 font-medium">
                  Request the 4 or 6-digit OTP from the site supervisor upon material offload.
                </p>
              </div>
            </div>

            {otpModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {otpModalError}
              </div>
            )}

            <Input
              label="CUSTOMER OTP"
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="e.g. 5821"
              maxLength={6}
              leftIcon={<FaKey className="h-3.5 w-3.5" />}
              autoFocus
            />

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOtpModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-[#059669] hover:bg-[#047857]"
                loading={verifyingOtp}
                onClick={handleVerifyOtpModal}
              >
                Verify Handover
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
}
