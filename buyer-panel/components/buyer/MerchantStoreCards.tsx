'use client';

import React, { useState } from 'react';
import { 
  FaStore, 
  FaLocationDot, 
  FaClock, 
  FaStar, 
  FaShieldHalved, 
  FaPhone, 
  FaBagShopping, 
  FaFilter, 
  FaBuilding, 
  FaCircleCheck 
} from 'react-icons/fa6';
import { HardwareMerchant } from '../../types/buyer';
import { Select, SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';

interface MerchantStoreCardsProps {
  merchants: HardwareMerchant[];
  selectedCategory: string | null;
  onSelectMerchant: (merchant: HardwareMerchant) => void;
}

const RADIUS_OPTIONS: SelectOption[] = [
  { label: '10 KM Express Delivery', value: 10 },
  { label: '20 KM Standard Radius', value: 20 },
  { label: '25 KM Full Merchant Hub', value: 25 },
];

const SORT_OPTIONS: SelectOption[] = [
  { label: 'Nearest Distance', value: 'distance' },
  { label: 'Highest Rating', value: 'rating' },
  { label: 'Fastest ETA', value: 'eta' },
];

export const MerchantStoreCards: React.FC<MerchantStoreCardsProps> = ({
  merchants,
  selectedCategory,
  onSelectMerchant
}) => {
  const [filterRadius, setFilterRadius] = useState<number>(25);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'eta'>('distance');
  const [quoteSuccessId, setQuoteSuccessId] = useState<string | null>(null);

  const filtered = merchants
    .filter((m) => m.distanceKm <= filterRadius)
    .filter((m) => (onlyVerified ? m.verified : true))
    .filter((m) => {
      if (!selectedCategory || selectedCategory === 'all') return true;
      return m.mainCategory.toLowerCase().includes(selectedCategory.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'eta') return a.deliveryEtaMinutes - b.deliveryEtaMinutes;
      return 0;
    });

  const handleRequestQuote = (merchantId: string) => {
    setQuoteSuccessId(merchantId);
    setTimeout(() => setQuoteSuccessId(null), 3000);
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <FaCircleCheck className="h-3.5 w-3.5" />
              <span>Verified Local Merchant Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Nearby Hardware Suppliers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Direct wholesale price quotes and verified store stock from local suppliers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="min-w-[190px]">
              <Select
                icon={<FaLocationDot className="h-3 w-3 text-[#FF6500]" />}
                options={RADIUS_OPTIONS}
                value={filterRadius}
                onChange={(val) => setFilterRadius(Number(val))}
              />
            </div>

            <div className="min-w-[160px]">
              <Select
                icon={<FaFilter className="h-3 w-3 text-slate-500" />}
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
              />
            </div>

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all h-10 sm:h-11 border cursor-pointer ${
                onlyVerified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
            >
              {onlyVerified
                ? <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                : <FaShieldHalved className="h-3.5 w-3.5 text-slate-400" />
              }
              <span>Verified Only</span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl p-8">
            <FaStore className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Stores Found</h3>
            <p className="text-xs text-slate-400 mt-1 font-normal">Try expanding your delivery radius to 25 KM</p>
            <Button onClick={() => setFilterRadius(25)} variant="primary" size="md" className="mt-4">
              Reset Radius to 25 KM
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="bg-slate-50 px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white font-semibold text-base flex items-center justify-center shadow-xs">
                          {merchant.name.charAt(0)}
                        </div>
                        {merchant.verified && (
                          <span className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs ring-2 ring-white">
                            <FaShieldHalved className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 leading-tight">
                          {merchant.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-normal leading-snug flex gap-1.5">
                          <FaBuilding className="h-2.5 w-2.5 shrink-0 mt-0.5" />
                          <span>{merchant.address}</span>
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold shrink-0">
                      <FaStar className="h-2.5 w-2.5 text-amber-400" />
                      {merchant.rating}
                      <span className="text-slate-400 font-normal">({merchant.reviewsCount})</span>
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 bg-orange-50/70 rounded-2xl px-3 py-2.5">
                      <div className="h-7 w-7 rounded-xl bg-[#FF6500]/10 text-[#FF6500] flex items-center justify-center shrink-0">
                        <FaLocationDot className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Distance</div>
                        <div className="text-xs font-semibold text-slate-800">{merchant.distanceKm} KM Away</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 bg-emerald-50/70 rounded-2xl px-3 py-2.5">
                      <div className="h-7 w-7 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaClock className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Delivery ETA</div>
                        <div className="text-xs font-semibold text-slate-800">{merchant.deliveryEtaMinutes} Mins</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Featured Brands Stocked
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {merchant.brands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-normal">Min Order Value</span>
                    <span className="font-semibold text-slate-900">₹{merchant.minOrderValue.toLocaleString()}</span>
                  </div>

                  {quoteSuccessId === merchant.id ? (
                    <div className="w-full py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold text-center flex items-center justify-center gap-2">
                      <FaCircleCheck className="h-4 w-4 text-emerald-500" />
                      <span>Quote Sent! Merchant will contact you.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleRequestQuote(merchant.id)}
                        icon={<FaPhone className="h-3 w-3 text-[#FF6500]" />}
                        iconPosition="left"
                        className="w-full"
                      >
                        Direct Quote
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => onSelectMerchant(merchant)}
                        icon={<FaBagShopping className="h-3.5 w-3.5" />}
                        iconPosition="left"
                        className="w-full"
                      >
                        View Store
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
