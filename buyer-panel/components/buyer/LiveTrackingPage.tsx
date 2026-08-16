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
              <span>Google Maps Live Telemetry Active</span>
            </div>
          </div>

          {/* Master-Detail Split Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT SIDE: Realistic Google Maps GPS View & Status Steps */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              
              {/* Google Maps View Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
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

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <FaCircleCheck className="h-3 w-3 text-emerald-600" /> Live Traffic: Normal
                    </span>
                    <span className="text-xs font-semibold text-[#FF6500] bg-orange-50 px-3 py-1 rounded-full border border-orange-200 flex items-center gap-1">
                      <FaClock className="h-3 w-3" /> ETA: ~12 Mins
                    </span>
                  </div>
                </div>

                {/* Google Maps Realistic Map Canvas */}
                <div className="relative h-80 sm:h-[440px] w-full rounded-2xl bg-[#E5E3DF] overflow-hidden shadow-inner border border-slate-200 flex flex-col justify-between p-4 sm:p-5">
                  
                  {/* Google Maps Vector Grid & Water Features */}
                  <div className="absolute inset-0 bg-[#F4F3F0] opacity-90">
                    {/* Simulated River / Lake */}
                    <div className="absolute top-0 right-1/4 w-32 h-full bg-[#AADAFF] transform -rotate-12 opacity-80" />
                    {/* Secondary Arterial Roads */}
                    <div className="absolute top-1/3 left-0 w-full h-4 bg-white shadow-2xs transform rotate-6" />
                    <div className="absolute top-2/3 left-0 w-full h-5 bg-white shadow-2xs transform -rotate-3" />
                    {/* Primary Highway (Seaport-Airport Rd) */}
                    <div className="absolute top-0 left-1/3 w-10 h-full bg-[#FEEA9A] border-y border-[#E6D485]" />
                  </div>

                  {/* SVG Navigation Route Line (Blue Google Maps Route) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 120 340 C 220 300, 280 220, 380 180 C 480 140, 580 100, 680 70"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 120 340 C 220 300, 280 220, 380 180 C 480 140, 580 100, 680 70"
                      fill="none"
                      stroke="#4285F4"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Google Maps Controls Overlay */}
                  <div className="relative z-20 flex justify-between items-start">
                    <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-slate-800 text-xs font-semibold shadow-md border border-slate-200 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Google Maps Telemetry</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col text-slate-700">
                        <button className="p-2 hover:bg-slate-100 text-xs font-bold border-b border-slate-100 cursor-pointer">+</button>
                        <button className="p-2 hover:bg-slate-100 text-xs font-bold cursor-pointer">-</button>
                      </div>
                      <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200 text-orange-600 flex items-center justify-center cursor-pointer">
                        <FaCompass className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Store Origin Marker */}
                  <div className="absolute top-[320px] left-[90px] z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white px-2.5 py-1 rounded-lg shadow-md border border-slate-200 text-[10px] font-semibold text-slate-900 mb-1 whitespace-nowrap">
                      {merchant.name}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md ring-4 ring-white">
                      <FaStore className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Moving Vehicle Live Driver Marker */}
                  <div className="absolute top-[175px] left-[375px] z-30 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-center space-y-0.5 mb-1.5">
                      <div className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                        <FaTruckFast className="h-3 w-3" /> Rajesh Kumar (Driver)
                      </div>
                      <div className="text-[9px] text-slate-300 font-normal">KL-07-CD-8921 &bull; 38 km/h</div>
                    </div>
                    
                    <div className="relative inline-flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#FF6500] animate-ping opacity-60" />
                      <div className="h-11 w-11 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shadow-xl ring-4 ring-white relative z-10">
                        <FaTruckFast className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Destination Unloading Site Marker */}
                  <div className="absolute top-[65px] left-[670px] z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white px-2.5 py-1 rounded-lg shadow-md border border-slate-200 text-[10px] font-semibold text-slate-900 mb-1 whitespace-nowrap">
                      {location.address || 'Unloading Site #14'}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ring-4 ring-white">
                      <FaLocationPin className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Google Maps Bottom Trip Route Card */}
                  <div className="relative z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FaCompass className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                          4.2 km &bull; 12 mins remaining
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">
                          Fastest route via Seaport - Airport Rd (Traffic normal)
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold shrink-0">
                      GPS Synced
                    </span>
                  </div>

                </div>
              </div>

              {/* Milestone Status Step Cards */}
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

                {/* Standardized Platform Secondary Pill Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaPhone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Call Driver</span>
                  </a>
                  <button
                    onClick={() => alert('Opening live chat with driver Rajesh Kumar...')}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaCommentDots className="h-3.5 w-3.5 text-slate-500" />
                    <span>Chat</span>
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
                    className="inline-flex items-center justify-center gap-2 w-full px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaTriangleExclamation className="h-3.5 w-3.5 text-amber-600" />
                    <span>Report Unloading Delay</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert('Connecting to 24x7 Site Support Helpdesk...')}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaHeadset className="h-3.5 w-3.5 text-slate-500" />
                    <span>Contact Support</span>
                  </button>

                  <button
                    onClick={() => alert('GST Tax Invoice PDF Downloaded')}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all h-10 sm:h-11 cursor-pointer shadow-2xs"
                  >
                    <FaFileInvoiceDollar className="h-3.5 w-3.5 text-[#FF6500]" />
                    <span>View Invoice</span>
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
