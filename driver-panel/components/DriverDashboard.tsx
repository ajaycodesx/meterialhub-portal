'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSpinner,
  FaCircleCheck,
  FaTriangleExclamation,
  FaXmark,
  FaKey,
  FaShieldHalved
} from 'react-icons/fa6';
import { driverApi, authApi, apiClient } from '../lib/api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DriverHeader, DriverTab } from './layout/DriverHeader';

import { DriverDispatchSection } from './sections/DriverDispatchSection';
import { DriverHistorySection } from './sections/DriverHistorySection';
import { DriverProfileSection } from './sections/DriverProfileSection';

export function DriverDashboard() {
  const [activeTab, setActiveTab] = useState<DriverTab>('dispatch');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [feedData, setFeedData] = useState<any>(null);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpModalError, setOtpModalError] = useState<string | null>(null);

  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [exceptionType, setExceptionType] = useState('Site Gate Locked / Narrow Road');
  const [exceptionDescription, setExceptionDescription] = useState('');
  const [submittingException, setSubmittingException] = useState(false);

  const [isWsConnected, setIsWsConnected] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  function requestBrowserGps() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setActionError('Browser Geolocation is not supported on this device.');
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
        setActionSuccess('GPS fixed. Live carrier telemetry active.');
      },
      (err) => {
        setGpsActive(false);
        setActionError('Location permission denied or unavailable. Using simulated depot route coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
        const auth: any = await authApi.login('driver@materialhub.in', 'driver123');
        apiClient.setToken(auth.access_token);
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
        socket.onopen = () => setIsWsConnected(true);
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
          setIsWsConnected(false);
          reconnectTimer = setTimeout(setupWs, 3000);
        };
        socket.onerror = () => setIsWsConnected(false);
      } catch (e) {
        setIsWsConnected(false);
      }
    }

    loadData();
    setupWs();
    requestBrowserGps();

    const pollTimer = setInterval(() => loadData(true), 6000);

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
      setActionSuccess('Trip accepted! Proceed to merchant depot for material loading.');
      await loadData(true);
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
      const res: any = await driverApi.requestDeliveryOtp(tripId);
      if (res?.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtpValue(res.devOtp);
      }
      setIsOtpModalOpen(true);
      setActionSuccess('Delivery verification OTP dispatched to customer mobile.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to generate delivery OTP.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVerifyOtp() {
    if (!feedData?.activeTrip?.tripId || !otpValue.trim()) {
      setOtpModalError('Please enter the 6-digit OTP provided by customer.');
      return;
    }
    setVerifyingOtp(true);
    setOtpModalError(null);
    try {
      await driverApi.verifyDeliveryOtp(feedData.activeTrip.tripId, otpValue.trim());
      setIsOtpModalOpen(false);
      setOtpValue('');
      setDevOtpHint(null);
      setActionSuccess('Delivery verified and offloading completed successfully! Payout credited.');
      await loadData(true);
    } catch (err: any) {
      setOtpModalError(err.message || 'Invalid or expired OTP. Please re-check with site supervisor.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleReportException() {
    if (!feedData?.activeTrip?.tripId || !exceptionDescription.trim()) return;
    try {
      setSubmittingException(true);
      await driverApi.reportException({
        tripId: feedData.activeTrip.tripId,
        exceptionType,
        description: exceptionDescription.trim()
      });
      setIsExceptionModalOpen(false);
      setExceptionDescription('');
      setActionSuccess('Incident recorded and escalated to MaterialHub field dispatch operations.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to report exception.');
    } finally {
      setSubmittingException(false);
    }
  }

  async function handleUpdateProfile(data: any) {
    try {
      const res = await driverApi.updateProfile(data);
      setProfile(res);
      setActionSuccess('Driver profile and commercial vehicle details updated successfully.');
      await loadData(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update profile.');
      throw err;
    }
  }

  if (loading && !feedData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <FaSpinner className="h-10 w-10 animate-spin text-[#FF6500]" />
        <p className="text-sm font-medium tracking-wide">
          Connecting to MaterialHub Commercial Dispatch Network...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DriverHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        driverName={profile?.name || feedData?.driverName || 'Manoj K'}
        vehicleType={profile?.vehicleType || feedData?.vehicleType || 'Mini Commercial Truck (3 Ton)'}
        isOnline={profile?.isOnline ?? feedData?.isOnline ?? true}
        onToggleOnline={handleToggleOnline}
        isWsConnected={isWsConnected}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        gpsActive={gpsActive}
        onRequestGps={requestBrowserGps}
        onLogout={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.reload();
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="p-1 hover:bg-black/5 rounded-lg cursor-pointer">
              <FaXmark className="h-3.5 w-3.5 text-emerald-800" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <FaTriangleExclamation className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="p-1 hover:bg-black/5 rounded-lg cursor-pointer">
              <FaXmark className="h-3.5 w-3.5 text-rose-800" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => loadData(false)} className="underline font-bold">
              Retry
            </button>
          </div>
        )}

        {activeTab === 'dispatch' && (
          <DriverDispatchSection
            activeTrip={feedData?.activeTrip}
            availableTrips={feedData?.availableTrips || []}
            todayEarnings={feedData?.todayEarnings || 0}
            todayTripsCount={feedData?.todayTripsCount || 0}
            vehicleType={profile?.vehicleType || feedData?.vehicleType || 'Mini Commercial Truck (3 Ton)'}
            actionLoading={actionLoading}
            onAcceptTrip={handleAcceptTrip}
            onUpdateStatus={handleUpdateStatus}
            onRequestOtp={handleRequestOtp}
            onOpenOtpModal={() => {
              setOtpModalError(null);
              setIsOtpModalOpen(true);
            }}
            onOpenExceptionModal={() => setIsExceptionModalOpen(true)}
            gpsCoords={gpsCoords}
          />
        )}

        {activeTab === 'history' && (
          <DriverHistorySection
            history={tripHistory}
            weeklyPayout={
              feedData?.weeklyPayoutSummary || {
                weekTotal: feedData?.todayEarnings || 0,
                completedTrips: feedData?.todayTripsCount || 0,
                payoutDay: 'Every Tuesday Direct Bank Deposit'
              }
            }
            onRefresh={() => loadData(false)}
          />
        )}

        {activeTab === 'profile' && (
          <DriverProfileSection
            profile={profile || feedData}
            onUpdateProfile={handleUpdateProfile}
            onRefresh={() => loadData(false)}
          />
        )}
      </main>

      {isOtpModalOpen && (
        <Modal
          isOpen={isOtpModalOpen}
          onClose={() => {
            setIsOtpModalOpen(false);
            setOtpModalError(null);
          }}
          title="Delivery OTP Verification"
          subtitle={`Order #${feedData?.activeTrip?.orderId || ''} · Site Offloading Confirmation`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtpModalError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={verifyingOtp}
                disabled={otpValue.length < 4}
                onClick={handleVerifyOtp}
              >
                <FaShieldHalved className="mr-1.5 h-3.5 w-3.5" />
                Confirm Offloading
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed font-medium">
              Obtain the 6-digit verification code sent to the site supervisor or buyer to confirm cargo offloading.
            </p>

            {devOtpHint && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between font-medium">
                <span>Dev Simulation Code:</span>
                <span className="font-mono text-sm font-bold tracking-widest">{devOtpHint}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="------"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#FF6500] text-slate-900 bg-white"
              />
              {otpModalError && (
                <p className="text-xs text-rose-600 mt-1 font-semibold">{otpModalError}</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {isExceptionModalOpen && (
        <Modal
          isOpen={isExceptionModalOpen}
          onClose={() => setIsExceptionModalOpen(false)}
          title="Report Site or Transport Exception"
          subtitle={`Trip #${feedData?.activeTrip?.tripId?.slice(0, 8).toUpperCase() || ''} Escalation`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setIsExceptionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={submittingException}
                disabled={!exceptionDescription.trim()}
                onClick={handleReportException}
              >
                Escalate Incident
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exception Classification
              </label>
              <select
                value={exceptionType}
                onChange={(e) => setExceptionType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#FF6500]"
              >
                <option value="Site Gate Locked / Narrow Road">Site Gate Locked / Narrow Road Access</option>
                <option value="Customer / Site Supervisor Unreachable">Customer / Site Supervisor Unreachable</option>
                <option value="Damaged Material at Depot Loading">Damaged Material at Depot Loading</option>
                <option value="Carrier Vehicle Breakdown / Flat Tyre">Carrier Vehicle Breakdown / Flat Tyre</option>
                <option value="Site Offloading Refusal / Dispute">Site Offloading Refusal / Dispute</option>
              </select>
            </div>

            <Input
              label="Detailed Incident Description"
              placeholder="Explain physical roadblock, waiting duration, or reason..."
              value={exceptionDescription}
              onChange={(e) => setExceptionDescription(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
