'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTruckFast,
  FaShieldHalved,
  FaStore,
  FaArrowRight
} from 'react-icons/fa6';
import { useAppContext } from '../../context/AppContext';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { setIsLocationModalOpen } = useAppContext();

  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
          
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
            <div className="text-center sm:text-left">
              <p className="font-heading text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FF6500] mb-1.5 sm:mb-2">
                Wholesale Material Hub
              </p>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.2] mb-2.5 sm:mb-4">
                Direct Factory &amp; Wholesale <span className="text-[#FF6500]">Construction Materials</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto sm:mx-0">
                Order Cement, TMT Steel Rods, Aggregates, PVC Pipes &amp; Electricals directly from verified local merchant depots with real-time stock availability, transparent wholesale spot pricing, GST tax invoice, and same-day site transit within a 20 KM radius.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white shadow-xs flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaTruckFast className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">20 KM Radius</h4>
                    <p className="text-xs text-slate-500 font-normal truncate">Same-Day Delivery</p>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-white shadow-xs flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaShieldHalved className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">GST Invoice</h4>
                    <p className="text-xs text-slate-500 font-normal truncate">100% Tax Credit</p>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-white shadow-xs flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaStore className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">Local Stockists</h4>
                    <p className="text-xs text-slate-500 font-normal truncate">Verified Yards</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={() => router.push('/catalog')}
                  className="w-full justify-center px-4 py-3 sm:py-3.5 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Materials</span>
                  <FaArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full text-center px-4 py-3 sm:py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  <span>Add Customized Order</span>
                </button>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/10 via-amber-200/15 to-transparent rounded-3xl blur-3xl pointer-events-none scale-110" />
            
            <div className="relative w-full flex items-center justify-center py-1 sm:py-4 lg:py-0">
              <img
                src="/images/hero_truck.png"
                alt="MaterialHub Commercial Logistics Vehicle"
                className="w-full h-auto max-h-[240px] sm:max-h-[340px] lg:max-h-[440px] object-contain drop-shadow-2xl hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
