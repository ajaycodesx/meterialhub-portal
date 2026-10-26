'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  FaChevronRight,
  FaRotateRight
} from 'react-icons/fa6';
import { useAppContext } from '../../context/AppContext';

export const QuickDispatchAndShipments: React.FC = () => {
  const router = useRouter();
  const { showToast } = useAppContext();

  const handleQuickReorder = (itemTitle: string, tons: number) => {
    showToast(`Quick Reorder: ${itemTitle} (${tons} Tons) batch placed into cart with express vehicle!`);
    router.push('/cart');
  };

  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch gsap-stagger-group">

          <div className="bg-[#1E293B] text-white rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gsap-card">
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-orange-400">
                  Site Shortage Dispatch
                </p>
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight leading-snug mt-1">
                  Running low on Steel? Quick Reorder &amp; Transit
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1.5 leading-relaxed">
                  Immediate materials dispatch to active job sites with pre-allocated heavy vehicle.
                </p>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-800/90 p-3.5 sm:p-4 rounded-2xl ring-1 ring-slate-700/60 shadow-2xs">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-2xs">
                  <img
                    src="/images/tmt_steel_rods.png"
                    alt="TMT Steel Rods"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 leading-snug">
                  <h4 className="text-sm font-medium text-white truncate">
                    TMT Steel Rods Fe550D
                  </h4>
                  <p className="text-xs text-slate-300 font-normal truncate mt-0.5 flex items-center gap-2">
                    <span>12mm Primary Mill Certified</span>
                    <span className="h-2.5 w-px bg-slate-600 inline-block" />
                    <span>10 Tons Batch</span>
                  </p>
                  <p className="text-xs text-emerald-400 font-medium truncate mt-0.5 flex items-center gap-2">
                    <span>Dedicated 16T Truck</span>
                    <span className="h-2.5 w-px bg-slate-600 inline-block" />
                    <span>ETA ~40 Mins</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickReorder('TMT Steel Rods Fe550D', 10)}
              className="w-full mt-5 py-3 px-4 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs sm:text-sm font-medium text-center shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaRotateRight className="h-3.5 w-3.5" />
              <span>Quick Reorder (10 Tons)</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 gsap-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-center sm:text-left">
              <div>
                <h3 className="text-xl font-medium text-slate-900 leading-tight">
                  Recent Shipments Arrival
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
                  Active site deliveries &amp; live GPS transit
                </p>
              </div>
              <button
                onClick={() => router.push('/tracking')}
                className="self-center sm:self-auto text-xs sm:text-sm font-medium text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>View More</span>
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => router.push('/tracking')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                    <img src="/images/tmt_steel_rods.png" alt="TMT Steel" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                      Torrent Fe550D TMT Steel
                    </h4>
                    <p className="text-xs text-slate-500 font-normal truncate flex items-center gap-2 mt-0.5">
                      <span>12mm Fastrods</span>
                      <span className="h-2.5 w-px bg-slate-200 inline-block" />
                      <span className="text-emerald-600 font-medium">
                        In-Transit
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <span className="text-sm font-medium text-slate-900">₹12,880</span>
                  <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div 
                onClick={() => router.push('/tracking')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                    <img src="/images/cement_aggregates.png" alt="Bricks" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                      Bricks &amp; Aggregate 7 Bags
                    </h4>
                    <p className="text-xs text-slate-500 font-normal truncate flex items-center gap-2 mt-0.5">
                      <span>Direct Yard Delivery</span>
                      <span className="h-2.5 w-px bg-slate-200 inline-block" />
                      <span className="text-emerald-600 font-medium">
                        In-Transit
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <span className="text-sm font-medium text-slate-900">₹6,480</span>
                  <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div 
                onClick={() => router.push('/tracking')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                    <img src="/images/cement_aggregates.png" alt="Cement" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                      Cement Bags Fast Transit
                    </h4>
                    <p className="text-xs text-slate-500 font-normal truncate flex items-center gap-2 mt-0.5">
                      <span>UltraTech 53G Bags</span>
                      <span className="h-2.5 w-px bg-slate-200 inline-block" />
                      <span className="text-emerald-600 font-medium">
                        In-Transit
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <span className="text-sm font-medium text-slate-900">₹1,288</span>
                  <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
