'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  FaRotateRight,
  FaTruckFast,
  FaLocationDot,
  FaCircleCheck,
  FaPlus
} from 'react-icons/fa6';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

export const QuickSiteDispatchCard: React.FC = () => {
  const router = useRouter();
  const { showToast, location } = useAppContext();

  const handleReorderBatch = () => {
    showToast('Previous site batch loaded into cart with Mahindra Bolero Pickup allocated!');
    router.push('/cart');
  };

  const handleQuickAdd = (packName: string, price: number) => {
    showToast(`Added ${packName} (₹${price.toLocaleString()}) to cart for immediate site dispatch!`);
    router.push('/cart');
  };

  const emergencyPacks = [
    {
      id: 'pack_cement_10',
      title: 'Cement 10-Bag Top-Up',
      spec: 'UltraTech 53G (500 kg)',
      price: 3850,
      image: '/images/cement_aggregates.png',
      eta: '30 mins'
    },
    {
      id: 'pack_plumbing_sos',
      title: 'Plumbing SOS Pipe & Solvent',
      spec: '5x 110mm Supreme + Heavy Gum',
      price: 1240,
      image: '/images/pvc_plumbing_pipes.png',
      eta: '35 mins'
    },
    {
      id: 'pack_paint_putty',
      title: 'Waterproofing & Putty Top-Up',
      spec: 'Dr. Fixit 5L + Asian Wall Putty',
      price: 2150,
      image: '/images/paints_wall_putty.png',
      eta: '40 mins'
    }
  ];

  return (
    <section className="py-3 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-5 sm:pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FF6500] mb-1 sm:mb-1.5">
                60-Minute Site Emergency Dispatch
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug mt-1 sm:mt-1.5">
                Running Low on Site? Quick Reorder &amp; Emergency Top-Up
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed max-w-2xl">
                Immediate materials dispatch to active construction sites. Direct verified store inventory, dedicated pickup vehicle, zero job downtime.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 self-start md:self-center">
              <FaLocationDot className="h-3.5 w-3.5 text-[#FF6500]" />
              <span>
                Active Site: <strong className="font-semibold text-slate-900">{location.address.split(',')[0] || 'Site #14, Kakkanad'}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mt-6 items-stretch">
            
            <div className="lg:col-span-7 bg-slate-50/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700">
                    Previous Site Delivery Batch
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <FaCircleCheck className="h-3 w-3" />
                    Delivered to Site #14
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3.5">
                  <div className="flex items-center -space-x-3 shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-2xs shrink-0">
                      <img
                        src="/images/cement_aggregates.png"
                        alt="Cement Top-up batch"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-2xs shrink-0">
                      <img
                        src="/images/tmt_steel_rods.png"
                        alt="Steel Top-up batch"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                      50 Bags UltraTech 53G + 20 Bundles Fe550D TMT Steel
                    </h4>
                    <p className="text-xs text-slate-500 font-normal flex items-center gap-2 truncate">
                      <FaTruckFast className="h-3 w-3 text-orange-500 shrink-0" />
                      <span>Dedicated Mahindra Bolero Pickup (1.5T)</span>
                      <span className="h-2.5 w-px bg-slate-300 inline-block" />
                      <span>ETA ~40 Mins</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Full Batch Total (GST Included)
                  </div>
                  <div className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight">
                    ₹48,250
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleReorderBatch}
                  icon={<FaRotateRight className="h-3.5 w-3.5" />}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Reorder Entire Batch
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-orange-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-3.5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900">
                      Instant Site Shortage Top-Ups
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Single-tap add for quick shortages during ongoing work
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {emergencyPacks.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => handleQuickAdd(pack.title, pack.price)}
                      className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xs hover:shadow-xs flex items-center justify-between gap-3 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img
                            src={pack.image}
                            alt={pack.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">
                            {pack.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="truncate">{pack.spec}</span>
                            <span className="h-2 w-px bg-slate-300 inline-block" />
                            <span className="text-emerald-700 font-semibold shrink-0">ETA {pack.eta}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-900">
                            ₹{pack.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="h-7 w-7 rounded-lg bg-orange-50 group-hover:bg-[#FF6500] text-[#FF6500] group-hover:text-white flex items-center justify-center transition-colors">
                          <FaPlus className="h-2.5 w-2.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-orange-100/60">
                Direct dispatch from Kakkanad local verified building stores
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
