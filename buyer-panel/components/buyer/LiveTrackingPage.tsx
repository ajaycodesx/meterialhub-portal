'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FaChevronLeft, 
  FaMapLocationDot, 
  FaTruckFast, 
  FaPhone, 
  FaCommentDots, 
  FaShieldHalved, 
  FaCircleCheck, 
  FaClock, 
  FaBuilding, 
  FaFileInvoiceDollar, 
  FaTriangleExclamation, 
  FaHeadset, 
  FaKey, 
  FaCheck,
  FaBoxesStacked,
  FaStore,
  FaLocationPin,
  FaCompass
} from 'react-icons/fa6';
import { HardwareMerchant, LocationState } from '../../types/buyer';
import { VehicleOption } from './CartVehicleSelection';
import { Button } from '../ui/Button';

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
  const verificationOtp = '4829';

  return (
    <div className="flex-1 bg-transparent">
      <section className="py-5 sm:py-10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
          
          {/* Top Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4 sm:pb-6">
            <div>
              <div className="mb-2">
                <button
                  onClick={onBackToSuccess}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  <FaChevronLeft className="h-3 w-3" />
                  <span>Back to Order Confirmation</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Real-Time Order &amp; Delivery Tracking
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                Order ID: <strong className="text-slate-900 font-semibold">{orderId || 'MH-839210'}</strong> &bull; Live GPS Telemetry &amp; Site Offloading Verification
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shrink-0">
              <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Live Telemetry Active</span>
            </div>
          </div>

          {/* Master-Detail Split Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT SIDE: Interactive GPS Map View & Status Timeline */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              
              {/* Interactive Live Map View Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaMapLocationDot className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900">Interactive Map View (GPS Tracking)</h3>
                      <p className="text-xs text-slate-500 font-normal">Live map showing store origin, driver route, and unloading site</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#FF6500] bg-orange-50 px-3.5 py-1 rounded-full flex items-center gap-1 border border-orange-100">
                    <FaClock className="h-3 w-3" />
                    ETA: ~35 Mins
                  </span>
                </div>

                {/* Dark Map Canvas Container */}
                <div className="relative h-80 sm:h-[420px] w-full rounded-2xl bg-[#0F172A] overflow-hidden shadow-inner flex flex-col justify-between p-4 sm:p-6 border border-slate-800">
                  
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:16px_16px]" />

                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 60 280 C 180 260, 240 180, 360 160 C 480 140, 560 90, 720 70"
                      fill="none"
                      stroke="#FF6500"
                      strokeWidth="4"
                      strokeDasharray="8 6"
                      className="animate-pulse"
                    />
                  </svg>

                  <div className="relative z-10 flex flex-wrap justify-between items-start gap-3">
                    <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl text-white text-xs space-y-0.5 shadow-md border border-slate-700">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
                        <FaStore className="h-3 w-3" /> Store Origin
                      </div>
                      <div className="font-semibold text-slate-100">{merchant.name}</div>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl text-white text-xs space-y-0.5 text-right shadow-md border border-slate-700">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                        <FaLocationPin className="h-3 w-3" /> Unloading Site
                      </div>
                      <div className="font-semibold text-slate-100">{location.address || 'Site #14, Kakkanad'}</div>
                    </div>
                  </div>

                  <div className="relative z-10 my-auto flex justify-center">
                    <div className="bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl max-w-sm text-center text-white space-y-2.5 shadow-xl border border-white/10">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#FF6500] animate-ping opacity-40" />
                        <div className="h-11 w-11 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shadow-md relative z-10">
                          <FaTruckFast className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-white">Delivery Partner En-Route</h4>
                        <p className="text-[11px] text-slate-300 font-normal mt-0.5">
                          Driver is 4.2 km away from your site. Moving on Seaport-Airport Road.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-300 font-medium">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
                          GPS Active: 38 km/h
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-orange-400 font-semibold border border-slate-700">
                          Signal: Strong
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <FaCompass className="h-3.5 w-3.5 text-[#FF6500]" />
                      Live Telemetry Broadcast
                    </span>
                    <span className="font-semibold text-emerald-400">Pincode: {location.pinCode || '682030'}</span>
                  </div>

                </div>
              </div>

              {/* Order & Delivery Status Cards Grid */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 border-b border-slate-100 pb-3">
                  Order &amp; Delivery Status Milestone Steps
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <FaCheck className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-emerald-900">Confirmed</h4>
                    <p className="text-[9px] text-emerald-700 font-normal">11:50 AM</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <FaCheck className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-emerald-900">Packed</h4>
                    <p className="text-[9px] text-emerald-700 font-normal">11:52 AM</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                      <FaCheck className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-emerald-900">Assigned</h4>
                    <p className="text-[9px] text-emerald-700 font-normal">11:53 AM</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border-2 border-[#FF6500] shadow-sm ring-2 ring-[#FF6500]/10 space-y-1">
                    <div className="h-6 w-6 rounded-full bg-[#FF6500] text-white flex items-center justify-center text-xs animate-pulse">
                      <FaTruckFast className="h-2.5 w-2.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-[#FF6500]">Out for Delivery</h4>
                    <p className="text-[9px] text-slate-500 font-medium">In Transit</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">
                      <FaCircleCheck className="h-3 w-3" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-600">Delivered</h4>
                    <p className="text-[9px] text-slate-400 font-normal">Pending</p>
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Driver Contact, OTP Verification & Support */}
            <div className="lg:col-span-4 space-y-5 sm:space-y-6">
              
              {/* Assigned Delivery Partner Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900">Assigned Delivery Partner</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                    On-Duty
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white font-semibold text-lg flex items-center justify-center shrink-0 shadow-xs border border-slate-700">
                    RK
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900">Rajesh Kumar</h4>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Reg: <strong className="text-slate-800">{vehicle?.name || 'Mahindra Bolero Pickup'} (KL-07-CD-8921)</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="px-3 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FaPhone className="h-3 w-3 text-emerald-600" />
                    Call Driver
                  </a>
                  <button
                    onClick={() => alert('Opening live chat with driver Rajesh Kumar...')}
                    className="px-3 py-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaCommentDots className="h-3 w-3 text-slate-500" />
                    Chat
                  </button>
                </div>
              </div>

              {/* Delivery Verification OTP Box */}
              <div className="bg-slate-900 p-5 sm:p-7 rounded-2xl sm:rounded-3xl text-white shadow-md space-y-3 relative overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FaKey className="h-4 w-4 text-[#FF6500]" />
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Delivery Verification OTP</h4>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-normal">Site Gate Only</span>
                </div>

                <p className="text-[11px] text-slate-400 font-normal leading-relaxed relative z-10">
                  Share this secure 4-digit code with driver Rajesh Kumar upon offloading materials at your site.
                </p>

                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 text-center tracking-[0.4em] font-mono text-2xl sm:text-3xl font-bold text-[#FF6500] shadow-inner relative z-10">
                  {verificationOtp}
                </div>
              </div>

              {/* Support & Actions Footer Box */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-3.5">
                <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Support &amp; Quick Actions
                </h3>

                {reportDelaySent ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium text-center border border-emerald-200">
                    <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600 inline mr-1.5" />
                    Delay alert sent to logistics supervisor!
                  </div>
                ) : (
                  <button
                    onClick={() => setReportDelaySent(true)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FaTriangleExclamation className="h-3.5 w-3.5 text-amber-600" />
                    Report Unloading Delay
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert('Connecting to 24x7 Site Support Helpdesk...')}
                    className="px-3 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaHeadset className="h-3 w-3 text-slate-500" />
                    Contact Support
                  </button>

                  <button
                    onClick={() => alert('GST Tax Invoice PDF Downloaded')}
                    className="px-3 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaFileInvoiceDollar className="h-3 w-3 text-[#FF6500]" />
                    View Invoice
                  </button>
                </div>

                <Link href="/">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onReturnHome}
                    className="w-full mt-3 py-3"
                  >
                    Return to Home Page
                  </Button>
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
