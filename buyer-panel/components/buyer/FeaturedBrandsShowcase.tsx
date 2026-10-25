'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaChevronRight,
  FaCheck
} from 'react-icons/fa6';
import { TbCertificate } from 'react-icons/tb';

interface BrandItem {
  name: string;
  category: string;
  categoryLabel: string;
  specialty: string;
  localStockists: number;
  tag: string;
  tagColor: string;
  initials: string;
  accentBg: string;
  accentText: string;
  logo: string;
}

const BRAND_DATA: BrandItem[] = [
  {
    name: 'UltraTech Cement',
    category: 'cement',
    categoryLabel: 'Cement & Aggregates',
    specialty: '53G OPC & Weather Shield',
    localStockists: 18,
    tag: 'Depot Direct',
    tagColor: 'bg-orange-50 text-[#FF6500]',
    initials: 'UT',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-700',
    logo: '/images/brands/ultratech.png',
  },
  {
    name: 'Tata Tiscon',
    category: 'steel',
    categoryLabel: 'TMT Steel Rods',
    specialty: 'Fe550D Super Ductile TMT',
    localStockists: 14,
    tag: 'Primary Steel',
    tagColor: 'bg-blue-50 text-blue-700',
    initials: 'TT',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-700',
    logo: '/images/brands/tata_tiscon.png',
  },
  {
    name: 'JSW Neosteel',
    category: 'steel',
    categoryLabel: 'TMT Steel Rods',
    specialty: 'Fe500D / Fe550D Certified',
    localStockists: 12,
    tag: 'Direct Mill Rate',
    tagColor: 'bg-slate-100 text-slate-800',
    initials: 'JS',
    accentBg: 'bg-slate-500/10',
    accentText: 'text-slate-800',
    logo: '/images/brands/jsw.png',
  },
  {
    name: 'Supreme Pipes',
    category: 'pvc',
    categoryLabel: 'PVC & Plumbing',
    specialty: 'CPVC & SWR Drainage Pipes',
    localStockists: 22,
    tag: 'Factory Direct',
    tagColor: 'bg-emerald-50 text-emerald-700',
    initials: 'SU',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-700',
    logo: '/images/brands/supreme.png',
  },
  {
    name: 'Astral Pipes',
    category: 'pvc',
    categoryLabel: 'PVC & Plumbing',
    specialty: 'Pipes, Fittings & Tanks',
    localStockists: 16,
    tag: 'Master Stockist',
    tagColor: 'bg-sky-50 text-sky-700',
    initials: 'AS',
    accentBg: 'bg-sky-500/10',
    accentText: 'text-sky-700',
    logo: '/images/brands/astral.png',
  },
  {
    name: 'Asian Paints',
    category: 'paints',
    categoryLabel: 'Paints & Wall Putty',
    specialty: 'Apex, Royale & Putty',
    localStockists: 19,
    tag: 'Authorized Supply',
    tagColor: 'bg-rose-50 text-rose-700',
    initials: 'AP',
    accentBg: 'bg-rose-500/10',
    accentText: 'text-rose-700',
    logo: '/images/brands/asian_paints.png',
  },
  {
    name: 'Finolex Cables',
    category: 'electricals',
    categoryLabel: 'Electricals',
    specialty: 'Flame Guard FR Wires',
    localStockists: 15,
    tag: 'Contractor Pack',
    tagColor: 'bg-amber-50 text-amber-800',
    initials: 'FI',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-800',
    logo: '/images/brands/finolex.png',
  },
  {
    name: 'Havells India',
    category: 'electricals',
    categoryLabel: 'Electricals',
    specialty: 'MCBs, Cables & Lighting',
    localStockists: 13,
    tag: 'GST Invoiced',
    tagColor: 'bg-emerald-50 text-emerald-700',
    initials: 'HA',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-700',
    logo: '/images/brands/havells.png',
  },
  {
    name: 'Berger Paints',
    category: 'paints',
    categoryLabel: 'Paints & Wall Putty',
    specialty: 'WeatherCoat & Waterproofing',
    localStockists: 11,
    tag: 'Direct Dealer',
    tagColor: 'bg-indigo-50 text-indigo-700',
    initials: 'BE',
    accentBg: 'bg-indigo-500/10',
    accentText: 'text-indigo-700',
    logo: '/images/brands/berger.png',
  },
  {
    name: 'Bosch Tools',
    category: 'tools',
    categoryLabel: 'Power Tools',
    specialty: 'Drills, Cutters & Grinders',
    localStockists: 9,
    tag: 'Warranty Assured',
    tagColor: 'bg-slate-100 text-slate-800',
    initials: 'BO',
    accentBg: 'bg-slate-500/10',
    accentText: 'text-slate-800',
    logo: '/images/brands/bosch.png',
  },
  {
    name: 'ACC Cement',
    category: 'cement',
    categoryLabel: 'Cement & Aggregates',
    specialty: 'Suraksha Power & Gold 53G',
    localStockists: 17,
    tag: 'Wholesale Depot',
    tagColor: 'bg-orange-50 text-[#FF6500]',
    initials: 'AC',
    accentBg: 'bg-orange-500/10',
    accentText: 'text-[#FF6500]',
    logo: '/images/brands/acc.png',
  },
  {
    name: 'Schneider Electric',
    category: 'electricals',
    categoryLabel: 'Electricals',
    specialty: 'Acti9 MCBs & DB Boxes',
    localStockists: 8,
    tag: 'Authorized OEM',
    tagColor: 'bg-teal-50 text-teal-700',
    initials: 'SE',
    accentBg: 'bg-teal-500/10',
    accentText: 'text-teal-700',
    logo: '/images/brands/schneider.png',
  },
];

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All Brands' },
  { id: 'cement', label: 'Cement & Aggregates' },
  { id: 'steel', label: 'TMT Steel' },
  { id: 'pvc', label: 'PVC & Plumbing' },
  { id: 'paints', label: 'Paints & Putty' },
  { id: 'electricals', label: 'Electricals' },
];

export function FeaturedBrandsShowcase() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredBrands = activeCategory === 'all'
    ? BRAND_DATA
    : BRAND_DATA.filter((b) => b.category === activeCategory);

  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 text-center sm:text-left items-center sm:items-start">
          <div className="w-full sm:w-auto">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FF6500] mb-1 sm:mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <TbCertificate className="h-3.5 w-3.5" />
              Direct Manufacturer Hub
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
              Authorized Manufacturer Brands
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Direct stock &amp; transparent wholesale price index from certified local distributors
            </p>
          </div>

          <button
            onClick={() => router.push('/catalog')}
            className="self-center sm:self-auto text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>All Brands</span>
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-2 mb-2">
          {FILTER_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6500] text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 shadow-xs'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBrands.map((brand) => (
            <div
              key={brand.name}
              onClick={() => router.push('/catalog')}
              className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className={`h-9 w-9 rounded-xl ${brand.accentBg} ${brand.accentText} flex items-center justify-center font-semibold text-xs group-hover:scale-105 transition-all shadow-xs shrink-0`}>
                    {brand.initials}
                  </div>
                  <div className="h-7 max-w-[90px] flex items-center justify-end shrink-0">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-6 sm:h-7 w-auto max-w-[85px] object-contain"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#FF6500] transition-colors leading-tight line-clamp-1">
                  {brand.name}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                  {brand.specialty}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-normal">
                  {brand.localStockists} stores
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#FF6500] group-hover:translate-x-0.5 transition-transform">
                  Rates <FaChevronRight className="h-2 w-2" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-white rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs font-normal text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FaCheck className="h-2.5 w-2.5" />
            </span>
            <span className="font-medium text-slate-700">100% Genuine Materials Direct from Certified Depot Stockists</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>GST Input Tax Credit</span>
            <span className="h-3 w-px bg-slate-300 hidden sm:inline-block" />
            <span className="hidden sm:inline">Site Unloading Support</span>
            <span className="h-3 w-px bg-slate-300 inline-block" />
            <span>Batch Test Certificates</span>
          </div>
        </div>

      </div>
    </section>
  );
}
