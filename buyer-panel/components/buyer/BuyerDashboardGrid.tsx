'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaMinus,
  FaChevronRight,
  FaStar,
  FaShieldHalved,
  FaLocationDot,
  FaPhone,
  FaBagShopping,
  FaClock,
  FaCheck,
  FaCircleCheck,
  FaTruckFast,
  FaRotateRight,
  FaQuoteLeft,
  FaRoute
} from 'react-icons/fa6';
import { TbCertificate } from 'react-icons/tb';
import { HardwareMerchant, MaterialCategory, CommodityRate } from '../../types/buyer';
import { useAppContext } from '../../context/AppContext';

interface BuyerDashboardGridProps {
  categories: MaterialCategory[];
  merchants: HardwareMerchant[];
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string | null;
  onSelectMerchant: (merchant: HardwareMerchant) => void;
}

export const BuyerDashboardGrid: React.FC<BuyerDashboardGridProps> = ({
  categories,
  merchants,
  onSelectCategory,
  selectedCategory,
  onSelectMerchant
}) => {
  const router = useRouter();
  const { showToast, setIsLocationModalOpen } = useAppContext();

  const [ratesTab, setRatesTab] = useState<'cement' | 'steel' | 'coarse' | 'sand'>('cement');

  const [brandsTab, setBrandsTab] = useState<string>('all');

  const [selectedRadius, setSelectedRadius] = useState<number>(20);

  const handleQuickReorder = (itemTitle: string, tons: number) => {
    showToast(`Quick Reorder: ${itemTitle} (${tons} Tons) batch placed into cart with express vehicle!`);
    router.push('/cart');
  };

  const rateTableData = {
    cement: [
      { name: 'UltraTech 53G', tradeIndex: '200 class', rate: '71.95', trend: 'up', change: '+2.025' },
      { name: 'ACC Suraksha', tradeIndex: '180 class', rate: '68.50', trend: 'up', change: '+0.850' },
      { name: 'Dalmia DSP', tradeIndex: '190 class', rate: '70.75', trend: 'down', change: '-1.080' },
      { name: 'Ramco Super', tradeIndex: '185 class', rate: '71.15', trend: 'down', change: '-1.650' }
    ],
    steel: [
      { name: 'Tata Tiscon 12mm', tradeIndex: '5,000 tason', rate: '77.75', trend: 'up', change: '+0.850' },
      { name: 'JSW Fe550D 16mm', tradeIndex: '4,800 tason', rate: '76.20', trend: 'up', change: '+1.150' },
      { name: 'Vizag Fe500D', tradeIndex: '4,750 tason', rate: '75.40', trend: 'down', change: '-0.950' },
      { name: 'Indus Fe550D', tradeIndex: '4,600 tason', rate: '74.80', trend: 'down', change: '-1.250' }
    ],
    coarse: [
      { name: 'Crushed Granite 20mm', tradeIndex: '1.80 coarse', rate: '42.50', trend: 'up', change: '+1.200' },
      { name: 'Granite Metal 40mm', tradeIndex: '1.60 coarse', rate: '39.80', trend: 'down', change: '-0.750' },
      { name: 'Aggregate G10', tradeIndex: '1.90 coarse', rate: '44.00', trend: 'up', change: '+0.600' },
      { name: 'Gravel Pea Shingle', tradeIndex: '1.50 coarse', rate: '36.50', trend: 'down', change: '-1.100' }
    ],
    sand: [
      { name: 'Manufactured M-Sand', tradeIndex: '2.10 sand', rate: '48.00', trend: 'up', change: '+0.950' },
      { name: 'Plastering P-Sand', tradeIndex: '2.30 sand', rate: '52.50', trend: 'up', change: '+1.400' },
      { name: 'Filtered River Sand', tradeIndex: '2.80 sand', rate: '68.00', trend: 'down', change: '-0.800' },
      { name: 'Graded Silica Sand', tradeIndex: '2.50 sand', rate: '62.00', trend: 'down', change: '-1.500' }
    ]
  };

  const currentRates = rateTableData[ratesTab] || rateTableData.cement;

  const nearbyStores = merchants
    .filter((m) => m.distanceKm <= selectedRadius)
    .slice(0, 3);

  const brandsList = [
    { name: 'UltraTech Cement', tag: 'Depot Direct', tagColor: 'bg-orange-50 text-[#FF6500]', initials: 'UT', rating: 4.9, stores: 18, spec: '53G OPC & Weather Shield', cat: 'cement' },
    { name: 'Tata Tiscon', tag: 'Primary Steel', tagColor: 'bg-blue-50 text-blue-700', initials: 'TT', rating: 4.9, stores: 14, spec: 'Fe550D Super Ductile TMT', cat: 'steel' },
    { name: 'JSW Neosteel', tag: 'Direct Mill Rate', tagColor: 'bg-slate-100 text-slate-800', initials: 'JS', rating: 4.8, stores: 12, spec: 'Fe500D / Fe550D Certified', cat: 'steel' },
    { name: 'ACC Cement', tag: 'Wholesale Depot', tagColor: 'bg-orange-50 text-[#FF6500]', initials: 'AC', rating: 4.8, stores: 17, spec: 'Suraksha Power & Gold 53G', cat: 'cement' },
    { name: 'Kajaria Tiles', tag: 'OEM Certified', tagColor: 'bg-emerald-50 text-emerald-700', initials: 'KT', rating: 4.7, stores: 11, spec: 'Vitrified Heavy Duty Floor', cat: 'tiles' },
    { name: 'Asian Paints', tag: 'Authorized Supply', tagColor: 'bg-rose-50 text-rose-700', initials: 'AP', rating: 4.9, stores: 19, spec: 'Apex, Royale & Wall Putty', cat: 'paints' }
  ];

  const filteredBrands = brandsTab === 'all'
    ? brandsList
    : brandsList.filter((b) => b.cat === brandsTab);

  return (
    <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">

        <div className="lg:col-span-6 xl:col-span-6 bg-white rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-3 flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.2]">
                Direct Factory &amp; Wholesale <br className="hidden sm:inline" />
                <span className="text-[#FF6500]">Construction Materials</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-md">
                Direct wholesale stock from verified manufacturer depots &amp; local stockists. Same-day site transit within 20 KM radius with GST tax credit.
              </p>
              
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={() => router.push('/catalog')}
                  className="px-5 py-2.5 rounded-2xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Explore Materials
                </button>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Add Customized Order
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-2xs h-36 sm:h-44 w-44 sm:w-56 shrink-0">
              <img
                src="/images/hero_banner.png"
                alt="MaterialHub Wholesale Delivery Yard"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-3 bg-[#1E293B] text-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight leading-snug">
              Running low on Steel?
            </h3>
            <p className="text-xs text-slate-300 font-normal mt-0.5">
              Quick Reorder &amp; Emergency Transit
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl ring-1 ring-slate-700/60 shadow-2xs">
            <div className="h-13 w-13 rounded-xl overflow-hidden shrink-0 bg-slate-900">
              <img
                src="/images/tmt_steel_rods.png"
                alt="TMT Steel Rods"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 leading-snug">
              <h4 className="text-xs font-semibold text-white truncate">
                TMT Steel Rods
              </h4>
              <p className="text-[10px] text-slate-300 font-normal truncate mt-0.5 flex items-center gap-1.5">
                <span>Fe550D High Ductility</span>
                <span className="h-2 w-px bg-slate-500 inline-block" />
                <span>10 Tons</span>
              </p>
              <p className="text-[10px] text-slate-400 font-normal truncate">
                Pre-Allocated 16T Heavy Truck
              </p>
            </div>
          </div>

          <button
            onClick={() => handleQuickReorder('TMT Steel Rods Fe550D', 10)}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs font-semibold text-center shadow-xs transition-all cursor-pointer"
          >
            Quick Reorder (10 Tons)
          </button>
        </div>

        <div className="lg:col-span-3 xl:col-span-3 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Recent Shipments Arrival
            </h3>
            <button
              onClick={() => router.push('/tracking')}
              className="text-[11px] font-semibold text-slate-400 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>View More</span>
              <FaChevronRight className="h-2 w-2" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div 
              onClick={() => router.push('/tracking')}
              className="flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src="/images/tmt_steel_rods.png" alt="TMT Steel" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                    Torrent Fe550D Steel
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="truncate">TMT Steel Fastrods</span>
                    <span className="h-2 w-px bg-slate-300 inline-block" />
                    <span className="text-emerald-600 font-semibold">
                      In-Transit
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-right">
                <span className="text-xs font-semibold text-slate-900">₹12,880</span>
                <FaChevronRight className="h-2.5 w-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => router.push('/tracking')}
              className="flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src="/images/cement_aggregates.png" alt="Bricks" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                    Bricks &amp; Clay 7 Bags
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="truncate">Bricks Cement Direct</span>
                    <span className="h-2 w-px bg-slate-300 inline-block" />
                    <span className="text-emerald-600 font-semibold">
                      In-Transit
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-right">
                <span className="text-xs font-semibold text-slate-900">₹6,480</span>
                <FaChevronRight className="h-2.5 w-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div 
              onClick={() => router.push('/tracking')}
              className="flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src="/images/cement_aggregates.png" alt="Cement" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500] transition-colors">
                    Cement Bags Fast Transit
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="truncate">UltraTech 53G Bags</span>
                    <span className="h-2 w-px bg-slate-300 inline-block" />
                    <span className="text-emerald-600 font-semibold">
                      In-Transit
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-right">
                <span className="text-xs font-semibold text-slate-900">₹1,288</span>
                <FaChevronRight className="h-2.5 w-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">

        <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Trending Wholesale Deals
              </h3>
            </div>
            <button
              onClick={() => router.push('/catalog')}
              className="text-[11px] font-semibold text-slate-400 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>View More</span>
              <FaChevronRight className="h-2 w-2" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              onClick={() => router.push('/catalog')}
              className="rounded-2xl p-2.5 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-200 mb-2">
                <img
                  src="/images/cement_aggregates.png"
                  alt="Aggregates"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[8px] font-semibold">
                  Live Stock
                </span>
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-semibold">
                  Save 13%
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500]">
                  Aggregates
                </h4>
                <p className="text-[10px] text-slate-500 truncate">20mm Granite</p>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-900">₹83.0<span className="text-[9px] text-slate-400 font-normal">/ton</span></span>
                  <span className="text-[9px] font-semibold text-[#FF6500] bg-orange-100 px-1 py-0.2 rounded">-13%</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/catalog')}
              className="rounded-2xl p-2.5 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-200 mb-2">
                <img
                  src="/images/tmt_steel_rods.png"
                  alt="TMT Steel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[8px] font-semibold">
                  Live Stock
                </span>
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-semibold">
                  Save 15%
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500]">
                  Bricks &amp; Steel
                </h4>
                <p className="text-[10px] text-slate-500 truncate">Fe550 Fe500</p>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-900">₹48,160<span className="text-[9px] text-slate-400 font-normal">/ton</span></span>
                  <span className="text-[9px] font-semibold text-[#FF6500]">-12%</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/catalog')}
              className="rounded-2xl p-2.5 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-200 mb-2">
                <img
                  src="/images/cement_aggregates.png"
                  alt="Cement"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[8px] font-semibold">
                  Live Stock
                </span>
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-semibold">
                  Save 12%
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500]">
                  Cement Bags
                </h4>
                <p className="text-[10px] text-slate-500 truncate">UltraTech 53G</p>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-900">₹1,350<span className="text-[9px] text-slate-400 font-normal">/bag</span></span>
                  <span className="text-[9px] font-semibold text-[#FF6500] bg-orange-100 px-1 py-0.2 rounded">-12%</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/catalog')}
              className="rounded-2xl p-2.5 bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-200 mb-2">
                <img
                  src="/images/hero_banner.png"
                  alt="Solid Bricks"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[8px] font-semibold">
                  Live Stock
                </span>
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-semibold">
                  Save 10%
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#FF6500]">
                  Solid Bricks
                </h4>
                <p className="text-[10px] text-slate-500 truncate">Red Clay 1st</p>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-900">₹46.9<span className="text-[9px] text-slate-400 font-normal">/pc</span></span>
                  <span className="text-[9px] font-semibold text-[#FF6500] bg-orange-100 px-1 py-0.2 rounded">-12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Live Market Rates by Tonnage
            </h3>
            <button
              onClick={() => router.push('/catalog')}
              className="text-[11px] font-semibold text-slate-400 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>View More</span>
              <FaChevronRight className="h-2 w-2" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-3">
            {(['cement', 'steel', 'coarse', 'sand'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRatesTab(tab)}
                className={`px-3 py-1 rounded-2xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  ratesTab === tab
                    ? 'bg-[#FF6500] text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full text-xs">
            <div className="grid grid-cols-4 pb-2 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Name</span>
              <span className="text-center">Trade Index</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Trend</span>
            </div>

            <div className="divide-y divide-slate-50">
              {currentRates.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 py-2 items-center hover:bg-slate-50/50 transition-colors">
                  <span className="font-semibold text-slate-900 truncate pr-1">{item.name}</span>
                  <span className="text-[10px] text-slate-400 text-center truncate">{item.tradeIndex}</span>
                  <span className="font-semibold text-slate-800 text-right">₹{item.rate}</span>
                  <span className={`text-[10px] font-semibold text-right flex items-center justify-end gap-0.5 ${
                    item.trend === 'up' ? 'text-emerald-600' : 'text-[#FF6500]'
                  }`}>
                    {item.trend === 'up' ? <FaArrowTrendUp className="h-2 w-2" /> : <FaArrowTrendDown className="h-2 w-2" />}
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-3 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              Nearest Hardware Suppliers &amp; Categories
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
              Select Category &amp; Nearest Hardware Suppliers
            </p>
          </div>

          <div className="grid grid-cols-12 gap-2 my-auto">
            <div className="col-span-4 space-y-1">
              {['Cement', 'Steel', 'Sand', 'Pipes', 'Paints'].map((c, i) => (
                <button
                  key={i}
                  onClick={() => router.push('/catalog')}
                  className="w-full text-left px-2 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-[10px] font-semibold text-slate-700 hover:text-[#FF6500] truncate transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="col-span-8 space-y-1.5">
              {merchants.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-xl bg-slate-50/80 hover:bg-white shadow-2xs hover:shadow-xs transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-900 truncate max-w-[100px]">{m.name}</span>
                    <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-500">
                      <FaStar className="h-2 w-2" /> {m.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>{m.distanceKm} KM Away</span>
                    <span>{m.deliveryEtaMinutes} Mins</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      onClick={() => onSelectMerchant(m)}
                      className="py-1 rounded-lg bg-[#FF6500] hover:bg-[#E05800] text-white text-[9px] font-semibold text-center transition-all cursor-pointer"
                    >
                      Visit Store
                    </button>
                    <button
                      onClick={() => showToast(`Connecting you with ${m.name}...`)}
                      className="py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-semibold text-center transition-all cursor-pointer"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[9px] text-slate-400 text-center pt-2 border-t border-slate-50">
            Kakkanad verified store stock direct dispatch
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">

        <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Authorized Manufacturer Brands
              </h3>
              <button
                onClick={() => router.push('/catalog')}
                className="text-[11px] font-semibold text-slate-400 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-0.5"
              >
                <span>All Brands</span>
                <FaChevronRight className="h-2 w-2" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', label: 'Categories' },
                { id: 'cement', label: 'Contracting Aggs' },
                { id: 'steel', label: 'TMT Bars' },
                { id: 'tiles', label: 'RMC Roofing' },
                { id: 'paints', label: 'Coarse Sand' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setBrandsTab(pill.id)}
                  className={`px-2.5 py-1 rounded-2xl text-[10px] font-semibold shrink-0 transition-all cursor-pointer ${
                    brandsTab === pill.id
                      ? 'bg-[#FF6500] text-white shadow-xs'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {filteredBrands.map((brand, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push('/catalog')}
                  className="p-2.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                      {brand.initials}
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-semibold ${brand.tagColor}`}>
                      {brand.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-900 truncate group-hover:text-[#FF6500]">
                      {brand.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-normal truncate mt-0.5">
                      {brand.spec}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400">
                    <span>{brand.stores} Stores</span>
                    <span className="text-[#FF6500] font-semibold flex items-center gap-0.5">
                      Rates <FaChevronRight className="h-1.5 w-1.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500">
            <span className="flex items-center gap-1">
              <FaCheck className="h-2.5 w-2.5 text-emerald-600" /> 100% Genuine Direct Depot
            </span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>GST Tax Invoice</span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>Batch Test Certificates</span>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Nearest Hardware Suppliers &amp; Categories
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                  Select Category &amp; Nearest Hardware Suppliers
                </p>
              </div>

              <div className="flex items-center gap-1">
                {[5, 10, 20].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRadius(r)}
                    className={`px-2 py-0.5 rounded-xl text-[9px] font-semibold transition-all cursor-pointer ${
                      selectedRadius === r
                        ? 'bg-[#FF6500] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}KM
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {nearbyStores.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{m.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <FaLocationDot className="h-2.5 w-2.5 text-[#FF6500]" />
                        <span>{m.distanceKm} KM Away</span>
                        <span className="h-2 w-px bg-slate-300 inline-block" />
                        <FaClock className="h-2.5 w-2.5 text-emerald-600" />
                        <span>{m.deliveryEtaMinutes} Mins</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectMerchant(m)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white text-[10px] font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      View Store
                    </button>
                    <button
                      onClick={() => showToast(`Calling ${m.name}...`)}
                      className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] transition-all cursor-pointer"
                      title="Contact Merchant"
                    >
                      <FaPhone className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 relative h-28 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/60 shadow-2xs">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#F8FAFC" />
                <rect width="100%" height="100%" fill="url(#gridPattern)" />

                <path d="M -10 40 Q 80 90 180 50 T 400 70" fill="none" stroke="#CBD5E1" strokeWidth="5" />
                <path d="M 120 -10 Q 140 60 160 140" fill="none" stroke="#CBD5E1" strokeWidth="4" />
                <path d="M 50 130 Q 140 80 280 20" fill="none" stroke="#E2E8F0" strokeWidth="3" />

                <circle cx="160" cy="55" r="50" fill="#FF6500" fillOpacity="0.08" stroke="#FF6500" strokeWidth="1.5" strokeDasharray="3 3" />

                <path d="M 80 75 Q 120 70 160 55" fill="none" stroke="#FF6500" strokeWidth="2.5" strokeDasharray="4 2" />

                <circle cx="80" cy="75" r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />

                <circle cx="210" cy="40" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

                <circle cx="160" cy="55" r="7" fill="#FF6500" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="160" cy="55" r="2" fill="#FFFFFF" />
              </svg>

              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-xs text-[9px] font-semibold text-slate-800 shadow-2xs">
                <FaLocationDot className="h-2.5 w-2.5 text-[#FF6500]" />
                <span>Site #14 Kakkanad</span>
              </div>

              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 text-white text-[9px] font-medium shadow-2xs">
                <FaRoute className="h-2.5 w-2.5 text-[#FF6500]" />
                <span>20 KM Active Radius</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 text-[9px] text-slate-400">
            <span>Direct Merchant Dispatch</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Bolero Pickup</span>
              <span className="h-2 w-px bg-slate-300 inline-block" />
              <span>16T Trucks</span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-3 bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-slate-50/80 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <FaQuoteLeft className="h-3.5 w-3.5 text-slate-300" />
              <p className="text-[10px] text-slate-600 line-clamp-3 leading-snug">
                Ordered 200 bags UltraTech... on-site in 40 mins via Bolero pickup.
              </p>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-900 truncate">Jayesh Shah</p>
                <p className="text-[8px] text-slate-400 truncate flex items-center gap-1">
                  <span>Site Engineer</span>
                  <span className="h-1.5 w-px bg-slate-300 inline-block" />
                  <span>Ernakulam</span>
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50/80 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <FaQuoteLeft className="h-3.5 w-3.5 text-slate-300" />
              <p className="text-[10px] text-slate-600 line-clamp-3 leading-snug">
                Wholesale rate index saved ₹18,000 on single steel bulk order.
              </p>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-900 truncate">M. Suresh</p>
                <p className="text-[8px] text-slate-400 truncate flex items-center gap-1">
                  <span>Civil Contractor</span>
                  <span className="h-1.5 w-px bg-slate-300 inline-block" />
                  <span>Thrissur</span>
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50/80 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <FaQuoteLeft className="h-3.5 w-3.5 text-slate-300" />
              <p className="text-[10px] text-slate-600 line-clamp-3 leading-snug">
                On-time GPS driver tracking eliminated work crew idle time.
              </p>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-900 truncate">Aniket R.</p>
                <p className="text-[8px] text-slate-400 truncate flex items-center gap-1">
                  <span>Project Lead</span>
                  <span className="h-1.5 w-px bg-slate-300 inline-block" />
                  <span>Edapally</span>
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50/80 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <FaQuoteLeft className="h-3.5 w-3.5 text-slate-300" />
              <p className="text-[10px] text-slate-600 line-clamp-3 leading-snug">
                Accurate GST tax invoices and seamless BOQ quotation support.
              </p>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-900 truncate">Ajay Das</p>
                <p className="text-[8px] text-slate-400 truncate flex items-center gap-1">
                  <span>Builder</span>
                  <span className="h-1.5 w-px bg-slate-300 inline-block" />
                  <span>Kakkanad</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 flex items-center justify-between gap-2 border border-slate-100/80 text-[10px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-6 w-6 rounded-lg bg-[#FF6500] text-white flex items-center justify-center font-bold text-xs shrink-0">
                M
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 leading-tight truncate">MaterialHub</p>
                <p className="text-[8px] text-slate-400 truncate">Wholesale Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-medium text-slate-500 shrink-0">
              <span>GST Invoiced</span>
              <span className="h-2.5 w-px bg-slate-300 inline-block" />
              <span>Razorpay Verified</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
