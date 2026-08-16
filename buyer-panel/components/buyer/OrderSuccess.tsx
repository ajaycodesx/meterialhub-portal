'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaCircleCheck,
  FaTruckFast,
  FaFileInvoiceDollar,
  FaHouse,
  FaPhone,
  FaShieldHalved,
  FaBuilding,
  FaClock,
  FaMapLocationDot,
  FaXmark,
  FaBoxesStacked,
  FaUserCheck,
  FaCheck
} from 'react-icons/fa6';
import { Button } from '../ui/Button';

interface OrderSuccessProps {
  orderId: string;
  onTrackOrderLive: () => void;
  onReturnHome: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderId, onTrackOrderLive, onReturnHome }) => {
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState(false);

  return (
    <div className="flex-1 bg-transparent">
      <section className="py-5 sm:py-10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">

          <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">

            {/* Animated Success Check Circle */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
              <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs relative z-10 border border-emerald-200">
                <FaCircleCheck className="h-10 w-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Supply Order Placed Successfully!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Unique Order Reference ID: <span className="font-semibold text-slate-900 bg-white border border-slate-200/80 px-3.5 py-1 rounded-full text-xs ml-1 shadow-2xs">{orderId || 'MH-839210'}</span>
              </p>
            </div>

            {/* Modern Order Status Progress Section */}
            <div className="bg-white border border-slate-200/80 p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-md space-y-5 text-left">
              
              {/* Segmented Top Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Order Fulfillment Status</span>
                  <span className="text-[#FF6500] font-semibold flex items-center gap-1.5">
                    <FaClock className="h-3.5 w-3.5" /> Est. Arrival: ~45 Mins
                  </span>
                </div>

                {/* 3-Segment Progress Bar */}
                <div className="grid grid-cols-3 gap-1.5 h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div className="bg-emerald-500 h-full rounded-l-full" />
                  <div className="bg-emerald-500 h-full" />
                  <div className="bg-[#FF6500] h-full rounded-r-full animate-pulse" />
                </div>
              </div>

              {/* 3 Modern Status Step Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                
                {/* Step 1: Order Placed */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FaCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Order Placed</h4>
                    <p className="text-[10px] text-slate-500 font-normal">11:52 AM &bull; Confirmed</p>
                  </div>
                </div>

                {/* Step 2: Vendor Accepted */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FaCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Vendor Accepted</h4>
                    <p className="text-[10px] text-slate-500 font-normal">11:53 AM &bull; Stock Ready</p>
                  </div>
                </div>

                {/* Step 3: Vehicle Dispatched */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FaTruckFast className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Vehicle Dispatched</h4>
                    <p className="text-[10px] text-slate-500 font-normal">En-Route &bull; ~45 Mins</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Merchant Details & Vehicle Allocation Summary */}
            <div className="bg-white border border-slate-200/80 p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-md text-left space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center text-xl shrink-0 shadow-xs border border-slate-700">
                    K
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900">Kakkanad Building Supplies Co.</h3>
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <FaShieldHalved className="h-3 w-3 text-emerald-600" />
                        <span>Verified Merchant</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5 mt-0.5">
                      <FaBuilding className="h-3.5 w-3.5 text-orange-500" /> Kakkanad Industrial Zone, Metro Pillar #412
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Allocated Vehicle</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FaTruckFast className="h-3.5 w-3.5 text-[#FF6500]" /> Bolero Pickup
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Payload Weight</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FaBoxesStacked className="h-3.5 w-3.5 text-slate-600" /> 2.50 Tons
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Est. Site Unloading</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FaClock className="h-3.5 w-3.5 text-emerald-600" /> Today in 45 Mins
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/tracking" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onTrackOrderLive}
                  icon={<FaMapLocationDot className="h-4 w-4" />}
                  className="w-full sm:w-auto px-6 py-3"
                >
                  Track Order (Live Page)
                </Button>
              </Link>

              <Link href="/" className="w-full sm:w-auto">
                <button
                  onClick={onReturnHome}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs h-11"
                >
                  <FaHouse className="h-3.5 w-3.5 text-slate-600" />
                  <span>Continue Shopping</span>
                </button>
              </Link>

              <button
                onClick={() => alert('GST Tax Invoice PDF downloaded to device')}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs h-11"
              >
                <FaFileInvoiceDollar className="h-3.5 w-3.5 text-[#FF6500]" />
                <span>GST Invoice</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {showLiveTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 relative flex flex-col space-y-5 border border-slate-100">
            <button
              onClick={() => setShowLiveTrackingModal(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FaXmark className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                <FaMapLocationDot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-slate-900 tracking-tight">Live Vehicle Tracking</h4>
                <p className="text-xs text-slate-500 font-normal">Real-time GPS tracker &amp; driver contact</p>
              </div>
            </div>

            <div className="relative h-48 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-white">
              <img
                src="/images/pickup_truck.jpg"
                alt="En-route delivery vehicle"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 rounded-2xl backdrop-blur-xs text-center space-y-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6500] text-white text-[10px] font-semibold inline-flex items-center gap-1">
                  <FaTruckFast className="h-3 w-3" /> En-Route to Site #14
                </span>
                <h4 className="text-xs font-semibold text-white">Driver: Rajesh Kumar (KL-07-CD-8921)</h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                  <FaUserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Rajesh Kumar (Driver)</h4>
                  <p className="text-[10px] text-slate-500 font-normal">Contact for site gate entry</p>
                </div>
              </div>

              <a
                href="tel:+919876543210"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FaPhone className="h-3 w-3" /> Call Driver
              </a>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setShowLiveTrackingModal(false)}
              className="w-full"
            >
              Close Live Tracker
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
