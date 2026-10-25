'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaClock,
  FaFire,
  FaChevronRight,
  FaBolt
} from 'react-icons/fa6';

export interface Deal {
  id: string;
  material: string;
  brand: string;
  image: string;
  originalRate: number;
  dealRate: number;
  unit: string;
  discountPct: number;
  minOrder: string;
  badge: string;
  badgeColor: string;
  expiresInSeconds: number;
}

const DEFAULT_DEALS: Deal[] = [
  {
    id: 'd1',
    material: 'Aggregates 20mm Granite',
    brand: 'Kakkanad Quarry Depo',
    image: '/images/cement_aggregates.png',
    originalRate: 95,
    dealRate: 83,
    unit: 'Ton',
    discountPct: 13,
    minOrder: '10 Tons Min.',
    badge: 'Live Stock',
    badgeColor: 'bg-slate-900',
    expiresInSeconds: 14200,
  },
  {
    id: 'd2',
    material: 'Bricks & Fe550D TMT Steel',
    brand: 'Tata Tiscon & JSW',
    image: '/images/tmt_steel_rods.png',
    originalRate: 54600,
    dealRate: 48160,
    unit: 'Ton',
    discountPct: 12,
    minOrder: '2 Tons Min.',
    badge: 'Live Stock',
    badgeColor: 'bg-[#FF6500]',
    expiresInSeconds: 29400,
  },
  {
    id: 'd3',
    material: 'UltraTech Cement 53G Bags',
    brand: 'UltraTech Cement',
    image: '/images/cement_aggregates.png',
    originalRate: 1530,
    dealRate: 1350,
    unit: 'Ton',
    discountPct: 12,
    minOrder: '50 Bags Min.',
    badge: 'Depot Direct',
    badgeColor: 'bg-emerald-600',
    expiresInSeconds: 19800,
  },
  {
    id: 'd4',
    material: 'Solid Red Clay Wirecut Bricks',
    brand: 'Kerala Clay Products',
    image: '/images/hero_banner.png',
    originalRate: 53,
    dealRate: 46.9,
    unit: 'Pc',
    discountPct: 11,
    minOrder: '1,000 Pcs Min.',
    badge: 'Live Stock',
    badgeColor: 'bg-slate-900',
    expiresInSeconds: 43200,
  },
  {
    id: 'd5',
    material: 'Supreme SWR Drainage Pipe 110mm',
    brand: 'Supreme Pipes',
    image: '/images/pvc_plumbing_pipes.png',
    originalRate: 1380,
    dealRate: 1190,
    unit: '6m Length',
    discountPct: 14,
    minOrder: '20 Lengths Min.',
    badge: 'Flash Deal',
    badgeColor: 'bg-[#FF6500]',
    expiresInSeconds: 31200,
  },
];

function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const [secs, setSecs] = useState(deal.expiresInSeconds);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl p-3.5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group gsap-card"
    >
      <div>
        <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center">
          <img
            src={deal.image}
            alt={deal.material}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-white text-xs font-semibold tracking-wider shadow-xs ${deal.badgeColor}`}>
              <FaBolt className="h-2.5 w-2.5 text-yellow-300" />
              {deal.badge}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold shadow-xs">
              -{deal.discountPct}%
            </span>
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs shadow-xs">
            <div className="flex items-center gap-1 text-slate-300 font-normal">
              <FaClock className="h-2.5 w-2.5 text-orange-400" />
              <span>Ends in</span>
            </div>
            <span className="font-semibold tabular-nums text-white">
              {h}:{m}:{s}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-normal">
            <span className="truncate font-medium text-slate-600">{deal.brand}</span>
            <span className="shrink-0 text-xs font-medium text-slate-400 group-hover:text-[#FF6500] transition-colors">
              View More
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#FF6500] transition-colors line-clamp-1 leading-snug">
            {deal.material}
          </h3>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400 font-normal line-through">
            ₹{deal.originalRate.toLocaleString('en-IN')}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-500 font-medium">Price:</span>
            <span className="text-sm sm:text-base font-semibold text-slate-900 leading-none">
              ₹{deal.dealRate.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-normal text-slate-500">
              /{deal.unit}
            </span>
          </div>
        </div>

        <span className="text-xs font-semibold text-[#FF6500]">
          -{deal.discountPct}%
        </span>
      </div>
    </div>
  );
}

export function TrendingDealsStrip({ deals = DEFAULT_DEALS }: { deals?: Deal[] }) {
  const router = useRouter();

  return (
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3.5 mb-3 sm:mb-4 text-center sm:text-left items-center sm:items-start">
          <div className="w-full sm:w-auto">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FF6500] mb-1 sm:mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <FaFire className="h-3.5 w-3.5" />
              Live Flash Pricing
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
              Trending Wholesale Deals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Limited-time negotiated wholesale batches from verified nearby stockists with direct site dispatch
            </p>
          </div>

          <button
            onClick={() => router.push('/catalog')}
            className="self-center sm:self-auto text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6500] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>View More</span>
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 gsap-stagger-group">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => router.push('/catalog')}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
