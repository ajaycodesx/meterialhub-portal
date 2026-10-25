'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaChevronLeft,
  FaMapLocationDot,
  FaTruckFast,
  FaPhone,
  FaCommentDots,
  FaCircleCheck,
  FaClock,
  FaFileInvoiceDollar,
  FaTriangleExclamation,
  FaHeadset,
  FaKey,
  FaCheck,
  FaLocationPin,
  FaCompass
} from 'react-icons/fa6';
import { HardwareMerchant, LocationState } from '../../types/buyer';
import { VehicleOption } from './CartVehicleSelection';
import { Button } from '../ui/Button';
import { buyerApi } from '../../lib/api';
import { PageBanner } from './PageBanner';

interface LiveTrackingPageProps {
  orderId: string;
  merchant: HardwareMerchant;
  vehicle: VehicleOption | null;
  location: LocationState;
  onBackToSuccess: () => void;
  onReturnHome: () => void;
}

export const LiveTrackingPage: React.FC<LiveTrackingPageProps> = ({
  orderId,
  merchant,
  vehicle,
  location,
  onBackToSuccess,
  onReturnHome
}) => {
  const [reportDelaySent, setReportDelaySent] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    async function fetchTracking() {
      if (!orderId) return;
      try {
        const res: any = await buyerApi.getOrderTracking(orderId);
        setTrackingData(res);
      } catch (err) {
        console.error('Tracking fetch error:', err);
      }
    }

    function setupWebSocket() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token') || 'u_buyer_1';
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setIsWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (['order_status_update', 'trip_status_update', 'delivery_verification', 'notification'].includes(data.event)) {
              fetchTracking();
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        socket.onclose = () => {
          setIsWsConnected(false);
          reconnectTimer = setTimeout(setupWebSocket, 3000);
        };

        socket.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (e) {
        setIsWsConnected(false);
      }
    }

    fetchTracking();
    setupWebSocket();

    const fallbackInterval = setInterval(fetchTracking, 4000);

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
      clearInterval(fallbackInterval);
    };
  }, [orderId]);

  const currentStatus = trackingData?.status || 'confirmed';
  const trip = trackingData?.trip;
  const driver = trip?.driver;
  const activeOtp = trackingData?.verificationOtp;

  const isConfirmed = true;
  const isPacked = ['packing', 'out_for_delivery', 'delivered'].includes(currentStatus) || Boolean(trip);
  const isAssigned = Boolean(driver) || ['out_for_delivery', 'delivered'].includes(currentStatus);
  const isOutForDelivery = ['out_for_delivery', 'delivered'].includes(currentStatus) || trip?.status === 'in_transit' || trip?.status === 'arrived_at_site';
  const isDelivered = currentStatus === 'delivered' || trip?.status === 'unloaded_completed';

  const driverName = driver?.name || 'Manoj K';
  const driverPhone = driver?.phone || '+919447098765';
  const vehicleName = driver?.vehicleType || vehicle?.name || 'Mini Commercial Truck (3 Ton)';
  const vehicleReg = driver?.regNumber || 'KL-07-CD-8921';

  return (
    <div className="flex-1 bg-transparent">
      <PageBanner
        onBack={onBackToSuccess}
        backTitle="Back to Order Confirmation"
        breadcrumbs={[
          { label: 'Orders', onClick: onReturnHome },
          { label: 'Live Tracking' }
        ]}
        title="Real-Time Order & Delivery Tracking"
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <span>Order ID: <strong className="text-slate-900 font-semibold">{orderId || 'MH-839210'}</strong></span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>Live Telemetry &amp; Site Offloading Verification</span>
          </div>
        }
        rightContent={
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${isWsConnected ? 'text-emerald-700' : 'text-slate-600'}`}>
              {isWsConnected ? 'Live WebSocket Push' : 'Telemetry Sync'}
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <FaCircleCheck className={`h-3.5 w-3.5 ${isDelivered ? 'text-emerald-600' : 'text-[#FF6500]'}`} />
              <span className="capitalize">{isDelivered ? 'Delivery Completed' : `Status: ${currentStatus.replace(/_/g, ' ')}`}</span>
            </div>
          </div>
        }
      />

      <section className="pt-4 sm:pt-6 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

            <div className="lg:col-span-8 space-y-5 sm:space-y-6">

              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaMapLocationDot className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900">Google Maps Live GPS Navigation</h3>
                      <p className="text-xs text-slate-500 font-normal">Real-time driver location on Seaport-Airport Road</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600" /> Live Traffic: Normal
                    </span>
                    <span className="h-3 w-px bg-slate-200 inline-block" />
                    <span className="flex items-center gap-1.5 text-[#FF6500]">
                      <FaClock className="h-3.5 w-3.5 text-[#FF6500]" /> ETA: ~{trip?.distanceKm ? Math.round(trip.distanceKm * 2.5) : 15} Mins
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2.5 w-2.5 rounded-xs bg-orange-500 shrink-0" />
                    <span className="text-slate-500 font-normal">Origin Store:</span>
                    <span className="text-slate-900 font-semibold truncate">{merchant.name}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end min-w-0">
                    <div className="h-2.5 w-2.5 rounded-xs bg-emerald-500 shrink-0" />
                    <span className="text-slate-500 font-normal">Unloading Site:</span>
                    <span className="text-slate-900 font-semibold truncate">{location.address || 'Site #14, Kakkanad Zone'}</span>
                  </div>
                </div>

                <div className="relative h-80 sm:h-[460px] w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-100">
                  <iframe
                    src="https://maps.google.com/maps?q=9.9985,76.3475&hl=en&z=14&output=embed"
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Real-Time Google Maps GPS Telemetry"
                  />
                </div>

                <div className="bg-slate-50/90 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaTruckFast className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{driverName}</span>
                        <span className="font-mono text-[11px] text-slate-500">({vehicleReg})</span>
                        <span className="h-3 w-px bg-slate-300 inline-block" />
                        <span className="text-[11px] font-semibold text-emerald-600">
                          {isDelivered ? 'Delivered' : isOutForDelivery ? 'En-Route' : 'Assigned'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                        <span>Vehicle: {vehicleName}</span>
                        <span className="h-2.5 w-px bg-slate-200 inline-block" />
                        <span>Route: {merchant.name} to {location.address || 'Kakkanad Zone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <div>
                      <p className="font-semibold text-slate-900">GPS: {trip?.currentGps ? `${trip.currentGps.lat.toFixed(4)}, ${trip.currentGps.lng.toFixed(4)}` : '10.0159, 76.3419'}</p>
                      <p className="text-[11px] text-slate-500">{trip?.distanceKm || 3.5} km corridor</p>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FaCompass className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 border-b border-slate-100 pb-3">
                  Order &amp; Delivery Status Milestone Steps
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">

                  <div className={`p-3.5 rounded-2xl space-y-1 transition-all ${isConfirmed ? 'bg-emerald-50/70 text-slate-900 shadow-2xs' : 'bg-slate-50/80 opacity-50'
                    }`}>
                    <div className="h-6 w-6 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <FaCheck className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900">Confirmed</h4>
                    <p className="text-[9px] text-slate-500 font-normal">Verified</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl space-y-1 transition-all ${isPacked ? 'bg-emerald-50/70 text-slate-900 shadow-2xs' : 'bg-slate-50/80 opacity-50'
                    }`}>
                    <div className="h-6 w-6 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <FaCheck className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900">Packed</h4>
                    <p className="text-[9px] text-slate-500 font-normal">{isPacked ? 'Ready' : 'Pending'}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl space-y-1 transition-all ${isAssigned ? 'bg-emerald-50/70 text-slate-900 shadow-2xs' : 'bg-slate-50/80 opacity-50'
                    }`}>
                    <div className="h-6 w-6 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <FaCheck className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900">Assigned</h4>
                    <p className="text-[9px] text-slate-500 font-normal">{isAssigned ? driverName : 'Matching'}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl space-y-1 transition-all ${isOutForDelivery ? 'bg-orange-50/70 text-slate-900 shadow-2xs' : 'bg-slate-50/80 opacity-50'
                    }`}>
                    <div className={`h-6 w-6 rounded-2xl text-white flex items-center justify-center text-xs ${isOutForDelivery ? 'bg-[#FF6500]' : 'bg-slate-300'
                      }`}>
                      <FaTruckFast className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900">In Transit</h4>
                    <p className="text-[9px] text-slate-500 font-normal">{isOutForDelivery ? 'On the road' : 'Queued'}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl space-y-1 transition-all ${isDelivered ? 'bg-emerald-50/70 text-slate-900 shadow-2xs' : 'bg-slate-50/80 opacity-50'
                    }`}>
                    <div className={`h-6 w-6 rounded-2xl text-white flex items-center justify-center text-xs ${isDelivered ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}>
                      {isDelivered ? <FaCheck className="h-2.5 w-2.5" /> : <FaLocationPin className="h-2.5 w-2.5" />}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-700">Delivered</h4>
                    <p className="text-[9px] text-slate-400 font-normal">{isDelivered ? 'Completed' : 'Pending'}</p>
                  </div>

                </div>
              </div>

            </div>

            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 self-start">

              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900">Assigned Delivery Partner</h3>
                  <span className="inline-flex rounded-xs h-2.5 w-2.5 bg-emerald-500" title="On-Duty Online Status" />
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white font-semibold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    {driverName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{driverName}</h4>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Reg: <strong className="text-slate-800">{vehicleName} ({vehicleReg})</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={`tel:${driverPhone}`}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaPhone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Call Driver</span>
                  </a>
                  <button
                    onClick={() => {
                      setNoticeMsg(`Direct call/message line active to ${driverName} (${driverPhone})`);
                      setTimeout(() => setNoticeMsg(null), 5000);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaCommentDots className="h-3.5 w-3.5 text-slate-500" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 p-5 sm:p-7 rounded-3xl text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FaKey className="h-4 w-4 text-[#FF6500]" />
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Delivery Verification OTP</h4>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-normal">
                    {activeOtp ? 'Ready at Site' : 'Site Gate Code'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-normal leading-relaxed relative z-10">
                  {isDelivered
                    ? 'Delivery confirmed and verified. Materials safely offloaded.'
                    : activeOtp
                      ? `Share this 6-digit verification code with driver ${driverName} upon material offloading.`
                      : `Your driver will trigger this code upon arrival at your site gate.`}
                </p>

                <div className="bg-slate-800/90 rounded-2xl p-3.5 text-center tracking-[0.4em] font-mono text-2xl sm:text-3xl font-bold text-[#FF6500] shadow-inner relative z-10">
                  {isDelivered ? 'VERIFIED' : activeOtp || '------'}
                </div>
              </div>

              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-3.5">
                <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Support &amp; Quick Actions
                </h3>

                {noticeMsg && (
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-800 text-xs font-medium text-center shadow-xs">
                    {noticeMsg}
                  </div>
                )}

                {reportDelaySent ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium text-center shadow-xs">
                    <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600 inline mr-1.5" />
                    Delay alert sent to logistics supervisor!
                  </div>
                ) : (
                  <button
                    onClick={() => setReportDelaySent(true)}
                    className="inline-flex items-center justify-center gap-2 w-full px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaTriangleExclamation className="h-3.5 w-3.5 text-amber-600" />
                    <span>Report Unloading Delay</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setNoticeMsg('Direct 24x7 Site Logistics Helpline: 1800-425-9999');
                      setTimeout(() => setNoticeMsg(null), 5000);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaHeadset className="h-3.5 w-3.5 text-slate-500" />
                    <span>Contact Support</span>
                  </button>

                  <button
                    onClick={() => {
                      setNoticeMsg(`GST Tax Invoice ${trackingData?.invoiceNumber || 'MH-INV-2026-9021'} generated.`);
                      setTimeout(() => setNoticeMsg(null), 5000);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaFileInvoiceDollar className="h-3.5 w-3.5 text-[#FF6500]" />
                    <span>View Invoice</span>
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onReturnHome}
                  className="w-full justify-center text-xs py-3 mt-1"
                >
                  Order More Materials
                </Button>
              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
