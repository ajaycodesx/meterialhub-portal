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
  { label: '5 KM Local', value: 5 },
  { label: '10 KM Express', value: 10 },
  { label: '20 KM Full Hub', value: 20 },
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
  const [filterRadius, setFilterRadius] = useState<number>(20);
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
    <section className="py-2.5 sm:py-8 bg-slate-100/70">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2.5 sm:mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">
              <FaCircleCheck className="h-3 w-3" />
              <span>Verified Local Merchants</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Nearby Hardware Suppliers
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <div>
              <Select
                size="sm"
                icon={<FaLocationDot className="h-3 w-3 text-[#FF6500]" />}
                options={RADIUS_OPTIONS}
                value={filterRadius}
                onChange={(val) => setFilterRadius(Number(val))}
              />
            </div>

            <div>
              <Select
                size="sm"
                icon={<FaFilter className="h-3 w-3 text-slate-500" />}
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
              />
            </div>

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-full text-xs font-semibold transition-all h-9 sm:h-9 border cursor-pointer ${
                onlyVerified
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
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
          <div className="text-center py-12 bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <FaStore className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Stores Found</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">Try expanding your radius filter to 20 KM</p>
            <Button onClick={() => setFilterRadius(20)} variant="primary" size="sm" className="mt-3">
              Reset Radius to 20 KM
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filtered.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="bg-slate-50/80 p-3.5 sm:p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-slate-900 text-white font-semibold text-sm sm:text-base flex items-center justify-center shadow-xs">
                          {merchant.name.charAt(0)}
                        </div>
                        {merchant.verified && (
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs ring-2 ring-white">
                            <FaShieldHalved className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                          {merchant.name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 font-normal leading-snug flex items-center gap-1">
                          <FaBuilding className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                          <span className="truncate max-w-[170px] sm:max-w-[200px]">{merchant.address}</span>
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-slate-200/60 text-slate-800 text-[10px] sm:text-[11px] font-semibold shrink-0 shadow-2xs">
                      <FaStar className="h-2.5 w-2.5 text-amber-400" />
                      {merchant.rating}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-orange-50/70 rounded-xl px-2.5 py-2 border border-orange-100/60">
                      <div className="h-6 w-6 rounded-lg bg-[#FF6500]/10 text-[#FF6500] flex items-center justify-center shrink-0">
                        <FaLocationDot className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Distance</div>
                        <div className="text-[11px] sm:text-xs font-semibold text-slate-800">{merchant.distanceKm} KM Away</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-emerald-50/70 rounded-xl px-2.5 py-2 border border-emerald-100/60">
                      <div className="h-6 w-6 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaClock className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Delivery ETA</div>
                        <div className="text-[11px] sm:text-xs font-semibold text-slate-800">{merchant.deliveryEtaMinutes} Mins</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Featured Stocked Brands
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {merchant.brands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[10px] sm:text-[11px]"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-5 pt-0 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500 font-normal">Min Order Value</span>
                    <span className="font-semibold text-slate-900">₹{merchant.minOrderValue.toLocaleString()}</span>
                  </div>

                  {quoteSuccessId === merchant.id ? (
                    <div className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <FaCircleCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Quote Sent to Merchant!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRequestQuote(merchant.id)}
                        icon={<FaPhone className="h-3 w-3 text-[#FF6500]" />}
                        iconPosition="left"
                        className="w-full text-xs"
                      >
                        Direct Quote
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectMerchant(merchant)}
                        icon={<FaBagShopping className="h-3 w-3" />}
                        iconPosition="left"
                        className="w-full text-xs"
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
