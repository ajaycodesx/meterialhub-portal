'use client';

import { useState } from 'react';
import { NoData } from '../common/NoData';
import { useRouter } from 'next/navigation';
import { FaArrowTrendUp, FaArrowTrendDown, FaMinus, FaRotateRight, FaChevronRight } from 'react-icons/fa6';

interface RateRow {
  brand: string;
  spec: string;
  tradeIndex: string;
  rate: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface Category {
  id: string;
  label: string;
  unitName: string;
  rows: RateRow[];
}

export function WholesaleRateIndex({ rates = [] }: { rates?: any[] }) {
  const router = useRouter();
  const RATE_DATA: Category[] = rates.length > 0 ? [{
    id: 'live',
    label: 'Live rates',
    unitName: 'Unit',
    rows: rates.map((r: any) => ({
      brand: r.materialName,
      spec: r.unit,
      tradeIndex: '—',
      rate: r.wholesaleRate,
      unit: r.unit,
      trend: r.trend === 'up' || r.trend === 'down' ? r.trend : 'stable',
      change: r.changePercent ?? 0,
    })),
  }] : [];
  const [activeTab, setActiveTab] = useState('live');
  const category = RATE_DATA.find(c => c.id === activeTab) || RATE_DATA[0];

  if (RATE_DATA.length === 0) {
    return <NoData title="No market rates yet" description="Rates are published by MaterialHub operations." />;
  }

  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3 text-center sm:text-left items-center sm:items-start">
          <div className="w-full sm:w-auto">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#FF6500] mb-1 sm:mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <FaRotateRight className="h-3.5 w-3.5 text-emerald-600" />
              Wholesale Rate Index
            </p>
            <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight leading-snug">
              Live Market Rates by Tonnage &amp; Brand
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Updated every 15 minutes directly from verified merchant stock and factory depots
            </p>
          </div>

          <button
            onClick={() => router.push('/catalog')}
            className="self-center sm:self-auto text-xs sm:text-sm font-medium text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>View More</span>
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {RATE_DATA.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === c.id
                  ? 'bg-[#FF6500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3.5 bg-slate-50/90 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span className="col-span-5 sm:col-span-3">Brand &amp; Material</span>
            <span className="hidden sm:block sm:col-span-4">Grade / Specification</span>
            <span className="hidden sm:block sm:col-span-2 text-center">Trade Index</span>
            <span className="col-span-4 sm:col-span-2 text-right">Wholesale Rate</span>
            <span className="col-span-3 sm:col-span-1 text-right">Trend</span>
          </div>

          <div className="divide-y divide-slate-50">
            {category.rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-50/60 transition-colors cursor-pointer group"
                onClick={() => router.push('/catalog')}
              >
                <div className="col-span-5 sm:col-span-3">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-[#FF6500] transition-colors">
                    {row.brand}
                  </p>
                  <p className="text-xs text-slate-400 font-normal sm:hidden">{row.spec}</p>
                </div>

                <div className="hidden sm:block sm:col-span-4">
                  <p className="text-xs sm:text-sm text-slate-600 font-normal">{row.spec}</p>
                </div>

                <div className="hidden sm:block sm:col-span-2 text-center">
                  <span className="text-slate-600 text-xs font-medium">
                    {row.tradeIndex}
                  </span>
                </div>

                <div className="col-span-4 sm:col-span-2 text-right">
                  <p className="text-xs sm:text-sm font-medium text-slate-900">
                    ₹{row.rate.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-400 font-normal">per {row.unit}</p>
                </div>

                <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1 text-right">
                  {row.trend === 'up' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                      <FaArrowTrendUp className="h-2.5 w-2.5" />
                      +{row.change}%
                    </span>
                  )}
                  {row.trend === 'down' && (
                    <span className="inline-flex items-center gap-1 text-[#FF6500] font-medium text-xs">
                      <FaArrowTrendDown className="h-2.5 w-2.5" />
                      -{row.change}%
                    </span>
                  )}
                  {row.trend === 'stable' && (
                    <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-normal">
                      <FaMinus className="h-2 w-2" />
                      0.0%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-normal">
            <span>Rates are published by MaterialHub operations.</span>
            <span className="font-medium text-slate-700">All prices exclusive of 18% / 28% GST (Tax Invoiced at Checkout)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
