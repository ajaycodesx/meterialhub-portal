'use client';

import { useState } from 'react';
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

const RATE_DATA: Category[] = [
  {
    id: 'cement',
    label: 'Cement',
    unitName: '50kg Bag',
    rows: [
      { brand: 'UltraTech Cement', spec: '53 Grade OPC', tradeIndex: '200 class', rate: 385, unit: '50kg Bag', trend: 'up', change: 2.025 },
      { brand: 'ACC Cement', spec: 'Suraksha Power PPC', tradeIndex: '180 class', rate: 365, unit: '50kg Bag', trend: 'up', change: 0.850 },
      { brand: 'Dalmia DSP', spec: 'Super Roof Special', tradeIndex: '190 class', rate: 358, unit: '50kg Bag', trend: 'down', change: 1.080 },
      { brand: 'Ramco Cements', spec: 'Super Grade PPC', tradeIndex: '185 class', rate: 372, unit: '50kg Bag', trend: 'down', change: 1.650 },
    ],
  },
  {
    id: 'steel',
    label: 'TMT Steel',
    unitName: 'Ton',
    rows: [
      { brand: 'Tata Tiscon', spec: 'Fe550D Super Ductile 12mm', tradeIndex: '5,000 tason', rate: 58500, unit: 'Ton', trend: 'up', change: 0.850 },
      { brand: 'JSW Neosteel', spec: 'Fe550D High Strength 16mm', tradeIndex: '4,800 tason', rate: 57200, unit: 'Ton', trend: 'up', change: 1.150 },
      { brand: 'Vizag Steel', spec: 'Fe500D Primary Billet 8mm', tradeIndex: '4,750 tason', rate: 56800, unit: 'Ton', trend: 'down', change: 0.950 },
      { brand: 'Indus TMT', spec: 'Fe550D Seismic Grade 10mm', tradeIndex: '4,600 tason', rate: 55500, unit: 'Ton', trend: 'down', change: 1.250 },
    ],
  },
  {
    id: 'coarse',
    label: 'Coarse & Aggregates',
    unitName: 'Ton',
    rows: [
      { brand: 'Blue Metal Granite', spec: '20mm Machine Crushed', tradeIndex: '1.80 coarse', rate: 830, unit: 'Ton', trend: 'up', change: 1.200 },
      { brand: 'Granite Metal 40mm', spec: 'Foundation Grade', tradeIndex: '1.60 coarse', rate: 780, unit: 'Ton', trend: 'down', change: 0.750 },
      { brand: 'Aggregate G10', spec: 'Graded Road Base GSB', tradeIndex: '1.90 coarse', rate: 690, unit: 'Ton', trend: 'up', change: 0.600 },
      { brand: 'Pea Gravel Shingle', spec: '10mm Concrete Mix', tradeIndex: '1.50 coarse', rate: 890, unit: 'Ton', trend: 'down', change: 1.100 },
    ],
  },
  {
    id: 'sand',
    label: 'Sand & M-Sand',
    unitName: 'Ton',
    rows: [
      { brand: 'Manufactured M-Sand', spec: 'Concrete Grade Washed', tradeIndex: '2.10 sand', rate: 950, unit: 'Ton', trend: 'up', change: 0.950 },
      { brand: 'Plastering P-Sand', spec: 'Double Washed Graded', tradeIndex: '2.30 sand', rate: 1050, unit: 'Ton', trend: 'up', change: 1.400 },
      { brand: 'Filtered River Sand', spec: 'Govt Authorized Source', tradeIndex: '2.80 sand', rate: 1680, unit: 'Ton', trend: 'down', change: 0.800 },
      { brand: 'Graded Silica Sand', spec: 'Fine Finish Texture', tradeIndex: '2.50 sand', rate: 1420, unit: 'Ton', trend: 'down', change: 1.500 },
    ],
  },
  {
    id: 'pvc',
    label: 'PVC Pipes',
    unitName: '6m Length',
    rows: [
      { brand: 'Supreme Pipes', spec: 'SWR 110mm Class 2 Ringfit', tradeIndex: '3.10 tement', rate: 1240, unit: '6m Length', trend: 'down', change: 0.520 },
      { brand: 'Astral Pipes', spec: 'CPVC SDR11 1 Inch Hot/Cold', tradeIndex: '2.80 astral', rate: 850, unit: '3m Length', trend: 'up', change: 1.200 },
      { brand: 'Finolex Pipes', spec: 'UPVC 75mm 6kg/cm2 Pressure', tradeIndex: '2.90 finolex', rate: 680, unit: '6m Length', trend: 'down', change: 0.900 },
      { brand: 'Prince Pipes', spec: 'SWR Drainage 160mm Heavy', tradeIndex: '3.40 prince', rate: 1650, unit: '6m Length', trend: 'up', change: 0.700 },
    ],
  },
  {
    id: 'paints',
    label: 'Paints & Putty',
    unitName: 'Bucket / Bag',
    rows: [
      { brand: 'Asian Paints', spec: 'Apex Exterior Weatherproof 20L', tradeIndex: '4.20 apex', rate: 4650, unit: '20L Bucket', trend: 'down', change: 3.100 },
      { brand: 'Berger Paints', spec: 'WeatherCoat Long Life 20L', tradeIndex: '3.90 berger', rate: 4320, unit: '20L Bucket', trend: 'down', change: 1.500 },
      { brand: 'Birla White Putty', spec: 'Polymer Modified Putty 40kg', tradeIndex: '1.40 putty', rate: 980, unit: '40kg Bag', trend: 'up', change: 0.800 },
      { brand: 'Dulux Weathershield', spec: 'Max Protection Exterior 20L', tradeIndex: '4.10 dulux', rate: 4800, unit: '20L Bucket', trend: 'up', change: 0.500 },
    ],
  },
];

export function WholesaleRateIndex() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('cement');
  const category = RATE_DATA.find(c => c.id === activeTab) || RATE_DATA[0];

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
            <span>Direct depot rate verified across Kakkanad, Aluva, and Ernakulam hubs.</span>
            <span className="font-medium text-slate-700">All prices exclusive of 18% / 28% GST (Tax Invoiced at Checkout)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
