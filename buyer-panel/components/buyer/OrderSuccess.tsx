'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaCheck,
  FaTruckFast,
  FaClock,
  FaLocationDot,
  FaCopy,
  FaFileInvoiceDollar,
  FaReceipt,
  FaHouse,
  FaWhatsapp,
  FaChevronRight,
  FaCircleCheck,
  FaShieldHalved,
  FaHeadset,
  FaWeightHanging,
  FaChevronLeft
} from 'react-icons/fa6';
import { PageBanner } from './PageBanner';

interface OrderSuccessProps {
  orderId?: string;
  onTrackOrderLive?: () => void;
  onReturnHome?: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  orderId = 'ord_51187259',
  onTrackOrderLive,
  onReturnHome
}) => {
  const [copied, setCopied] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  const displayOrderId = orderId || 'ord_51187259';

  const handleCopyOrderId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(displayOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadInvoice = () => {
    setInvoiceDownloaded(true);
    setTimeout(() => setInvoiceDownloaded(false), 3000);
  };

  return (
    <div className="flex-1 bg-[#F8FAFC]">
      <PageBanner
        onBack={onReturnHome}
        backTitle="Back to Dashboard"
        breadcrumbs={[
          { label: 'Checkout', onClick: onReturnHome },
          { label: 'Order Confirmed' }
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <FaShieldHalved className="h-3.5 w-3.5 text-emerald-600" />
            <span>Payment Verified &amp; Order Locked</span>
          </span>
        }
        icon={
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FaCheck className="h-5 w-5 stroke-[2]" />
          </div>
        }
        title="Supply Order Confirmed"
        subtitle={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>Reference ID:</span>
            <button
              onClick={handleCopyOrderId}
              title="Click to copy Order Reference ID"
              className="font-mono font-semibold text-slate-800 hover:text-[#FF6500] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{displayOrderId}</span>
              <FaCopy className={`h-3 w-3 ${copied ? 'text-emerald-600' : 'text-slate-400'}`} />
              {copied && <span className="text-[10px] text-emerald-600 font-sans font-semibold">Copied!</span>}
            </button>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span className="flex items-center gap-1">
              <FaClock className="h-3 w-3 text-[#FF6500]" />
              Est. Site Arrival: <strong className="text-slate-900 font-semibold">~45 Mins</strong>
            </span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>GST Tax Invoice Ready</span>
          </div>
        }
        rightContent={
          <div className="flex flex-wrap items-center gap-2.5">
            {onTrackOrderLive && (
              <button
                onClick={onTrackOrderLive}
                className="px-4 py-2.5 rounded-xl bg-[#FF6500] hover:bg-[#e05900] text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <FaTruckFast className="h-3.5 w-3.5" />
                <span>Live GPS Tracking</span>
              </button>
            )}
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Continue Shopping</span>
              </button>
            )}
          </div>
        }
      />

      <section className="pt-4 sm:pt-6 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                      Order Fulfillment Status
                    </h2>
                    <span className="h-2 w-2 rounded-xs bg-[#FF6500] inline-block" />
                    <span className="text-[11px] font-semibold text-[#FF6500] uppercase tracking-wider">Live Transit</span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Direct merchant depot dispatch en-route to site with verified vehicle allocation
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF6500] text-xs font-semibold self-start sm:self-center shrink-0">
                  <FaClock className="h-3.5 w-3.5 text-[#FF6500]" />
                  <span>Est. Site Arrival: ~45 Mins</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 flex flex-col justify-between space-y-3 transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                      <FaCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Step 1</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">Order Placed</h3>
                    <p className="text-[11px] text-slate-500 font-normal mt-1 flex items-center gap-1.5">
                      <span>11:52 AM</span>
                      <span className="h-2 w-px bg-slate-300 inline-block" />
                      <span className="text-emerald-600 font-medium">Confirmed</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 flex flex-col justify-between space-y-3 transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                      <FaCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Step 2</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">Vendor Accepted</h3>
                    <p className="text-[11px] text-slate-500 font-normal mt-1 flex items-center gap-1.5">
                      <span>11:53 AM</span>
                      <span className="h-2 w-px bg-slate-300 inline-block" />
                      <span className="text-emerald-600 font-medium">Stock Ready</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#FF6500] to-[#E55A00] text-white flex flex-col justify-between space-y-3 shadow-md shadow-orange-500/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-white text-[#FF6500] flex items-center justify-center text-xs font-semibold shadow-xs">
                      <FaTruckFast className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-orange-100 uppercase tracking-wider">Active</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white leading-tight">Vehicle Dispatched</h3>
                    <p className="text-[11px] text-orange-100 font-normal mt-1 flex items-center gap-1.5">
                      <span>En-Route</span>
                      <span className="h-2 w-px bg-orange-300/60 inline-block" />
                      <span>~45 Mins</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between space-y-3 opacity-60 transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold">
                      <FaLocationDot className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Step 4</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-600 leading-tight">Site Delivery</h3>
                    <p className="text-[11px] text-slate-400 font-normal mt-1">Unloading Pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaTruckFast className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 truncate">Manoj K (KL-07-CD-8921)</span>
                      <span className="h-2.5 w-px bg-slate-300 inline-block" />
                      <span className="text-xs text-slate-600 font-medium">Standard 6-Wheeler</span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                      Passing Kakkanad Industrial Bypass · Unloading OTP will be sent on site arrival
                    </p>
                  </div>
                </div>

                {onTrackOrderLive && (
                  <button
                    onClick={onTrackOrderLive}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Track Live GPS</span>
                    <FaChevronRight className="h-2.5 w-2.5 text-orange-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xs border border-slate-100/80 space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-[#0F172A] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    K
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 whitespace-nowrap">
                        Kakkanad Building Supplies Co.
                      </h3>
                      <span className="h-3 w-px bg-slate-300 inline-block" />
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 whitespace-nowrap">
                        <FaCircleCheck className="h-3 w-3 text-emerald-600" />
                        <span>Verified Merchant</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal flex items-center gap-1 mt-0.5 whitespace-nowrap">
                      <FaLocationDot className="h-3 w-3 text-[#FF6500]" />
                      <span>Kakkanad Industrial Zone, Metro Pillar #412</span>
                    </p>
                  </div>
                </div>

                <Link
                  href="/catalog"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap self-start sm:self-auto"
                >
                  <span>View More</span>
                  <FaChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaTruckFast className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap block">ALLOCATED VEHICLE</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 whitespace-nowrap">Bolero Pickup</p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <FaWeightHanging className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap block">PAYLOAD WEIGHT</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 whitespace-nowrap">2.50 Tons</p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaClock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap block">EST. SITE UNLOADING</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 whitespace-nowrap">Today in 45 Mins</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 w-full">
                <Link href="/tracking" className="w-full">
                  <button
                    onClick={onTrackOrderLive}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FF6500] hover:bg-[#e55b00] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <FaTruckFast className="h-3.5 w-3.5" />
                    <span>Track Order (Live Page)</span>
                    <FaChevronRight className="h-2.5 w-2.5" />
                  </button>
                </Link>

                <Link href="/" className="w-full">
                  <button
                    onClick={onReturnHome}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F1F5F9] hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <FaHouse className="h-3.5 w-3.5 text-slate-600" />
                    <span>Continue Shopping</span>
                  </button>
                </Link>

                <button
                  onClick={handleDownloadInvoice}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F1F5F9] hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                >
                  <FaFileInvoiceDollar className="h-3.5 w-3.5 text-[#FF6500]" />
                  <span>{invoiceDownloaded ? 'Invoice Saved' : 'GST Tax Invoice'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xs border border-slate-100/80 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 whitespace-nowrap">
                Order Summary
              </h2>

              <div className="space-y-3.5 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <FaFileInvoiceDollar className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-normal text-slate-600 whitespace-nowrap">Total Material Value</span>
                  </span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">₹ 12,480.00</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <FaTruckFast className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-normal text-slate-600 whitespace-nowrap">Delivery Charges</span>
                  </span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">₹ 350.00</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <FaReceipt className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-normal text-slate-600 whitespace-nowrap">GST (18%)</span>
                  </span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">₹ 2,217.00</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 whitespace-nowrap">Total Amount</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 whitespace-nowrap">₹ 15,047.00</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EDF9F3] flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0">
                  <FaCheck className="h-4 w-4 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap block">Payment Status</span>
                  <p className="font-bold text-emerald-800 text-sm leading-tight whitespace-nowrap">Paid</p>
                </div>
              </div>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`MaterialHub Site Delivery Update: Order #${displayOrderId} is confirmed for site unloading today. Track live: http://localhost:3000/tracking`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-2xl bg-[#00895A] hover:bg-[#007A50] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <FaWhatsapp className="h-4 w-4" />
                <span>Share with Site Supervisor</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);
};
