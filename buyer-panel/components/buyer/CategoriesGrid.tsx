'use client';

import React,{ useState } from 'react';
import {
FaBoxesStacked,
FaChevronRight,
FaCircleCheck,
FaStore,
FaLocationDot,
FaClock,
FaStar,
FaShieldHalved,
FaPhone,
FaBagShopping,
FaFilter,
FaBuilding,
FaRoute
} from 'react-icons/fa6';
import { MaterialCategory, HardwareMerchant } from '../../types/buyer';
import { Select, SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';

interface CategoriesGridProps {
  categories: MaterialCategory[];
  merchants: HardwareMerchant[];
  onSelectCategory: (categoryId: string) => void;
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

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  merchants,
  onSelectCategory,
  selectedCategory,
  onSelectMerchant
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedCategory && selectedCategory !== 'all' ? selectedCategory : 'all'
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [filterRadius, setFilterRadius] = useState<number>(20);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'eta'>('distance');
  const [quoteSuccessId, setQuoteSuccessId] = useState<string | null>(null);

  const activeCategory = categories.find((c) => c.id === internalSelectedId);

  const handleCategoryClick = (catId: string) => {
    setInternalSelectedId(catId);
    setSelectedSubCategory(null);
    onSelectCategory(catId);
  };

  const filteredMerchants = merchants
    .filter((m) => m.distanceKm <= filterRadius)
    .filter((m) => (onlyVerified ? m.verified : true))
    .filter((m) => {
      if (!internalSelectedId || internalSelectedId === 'all') return true;
      return m.mainCategory.toLowerCase().includes(internalSelectedId.toLowerCase());
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
    <section className="w-full bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 text-center sm:text-left items-center sm:items-start">
          <div className="w-full md:w-auto">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#FF6500] mb-1 sm:mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <FaBoxesStacked className="h-3.5 w-3.5" />
              Wholesale Material Marketplace
            </p>
            <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight leading-snug">
              Select Category &amp; Nearby Hardware Suppliers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Choose a category on the left to filter verified local merchants and direct store stock within 20 KM
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
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
                onChange={(val) => setSortBy(val as 'distance' | 'rating' | 'eta')}
              />
            </div>

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs font-medium transition-all h-9 sm:h-9 cursor-pointer shadow-xs ${
                onlyVerified
                  ? 'bg-white text-emerald-600 ring-1 ring-emerald-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {onlyVerified ? (
                <FaCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <FaShieldHalved className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>Verified Only</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden space-y-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                internalSelectedId === 'all'
                  ? 'bg-[#FF6500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 shadow-xs'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isSelected = cat.id === internalSelectedId;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF6500] text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 shadow-xs'
                  }`}
                >
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {activeCategory?.subcategories && activeCategory.subcategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeCategory.subcategories.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubCategory(sub === selectedSubCategory ? null : sub)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                    selectedSubCategory === sub
                      ? 'bg-orange-100 text-[#FF6500] font-medium shadow-xs ring-1 ring-orange-200'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">

          <div className="hidden lg:block lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between px-1 h-6">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Material Categories
              </span>

              {internalSelectedId !== 'all' && (
                <button
                  onClick={() => handleCategoryClick('all')}
                  className="text-xs font-medium text-[#FF6500] hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div
                onClick={() => handleCategoryClick('all')}
                className={`group rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                  internalSelectedId === 'all'
                    ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200/70'
                    : 'bg-white hover:bg-slate-50 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center shrink-0 shadow-xs">
                    ALL
                  </div>
                  <div>
                    <h3 className={`font-medium text-sm ${internalSelectedId === 'all' ? 'text-[#FF6500]' : 'text-slate-900'}`}>
                      All Hardware Materials
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">
                      Show all nearby suppliers &amp; stock
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                    1000+
                  </span>
                  <FaChevronRight className={`h-3 w-3 transition-transform ${internalSelectedId === 'all' ? 'text-[#FF6500] translate-x-1' : 'text-slate-300'}`} />
                </div>
              </div>

              {categories.map((cat) => {
                const isSelected = cat.id === internalSelectedId;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`group rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200/70'
                        : 'bg-white hover:bg-slate-50 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                        <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`font-medium text-sm ${isSelected ? 'text-[#FF6500]' : 'text-slate-900'}`}>
                            {cat.title}
                          </h3>
                          {cat.trendingBadge && (
                            <span className="text-[#FF6500] text-xs font-medium">
                              ({cat.trendingBadge})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {cat.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        {cat.itemCount}+
                      </span>
                      <FaChevronRight className={`h-3 w-3 transition-transform ${isSelected ? 'text-[#FF6500] translate-x-1' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between px-1 h-6">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FaCircleCheck className="h-3 w-3 text-emerald-600" />
                Nearby Hardware Suppliers ({filteredMerchants.length})
              </span>
            </div>

            {filteredMerchants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl p-6 shadow-sm">
                <FaStore className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-slate-800">No Hardware Suppliers Found</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">Try clearing category selection or expanding radius to 20 KM</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Button onClick={() => handleCategoryClick('all')} variant="secondary" size="sm">
                    Show All Categories
                  </Button>
                  <Button onClick={() => setFilterRadius(20)} variant="primary" size="sm">
                    Reset Radius to 20 KM
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 gsap-stagger-group">
                {filteredMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden gsap-card"
                  >
                    <div className="bg-slate-50/80 p-3.5 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center shadow-xs">
                              {merchant.name.charAt(0)}
                            </div>
                            {merchant.verified && (
                              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-lg bg-emerald-500 flex items-center justify-center shadow-xs ring-2 ring-white">
                                <FaShieldHalved className="h-2.5 w-2.5 text-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-slate-900 leading-tight">
                              {merchant.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5 font-normal leading-snug flex items-center gap-1">
                              <FaBuilding className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                              <span className="truncate max-w-[150px] sm:max-w-[170px]">{merchant.address}</span>
                            </p>
                          </div>
                        </div>

                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-slate-800 text-xs font-medium shrink-0 shadow-xs">
                          <FaStar className="h-2.5 w-2.5 text-amber-400" />
                          {merchant.rating}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-orange-50/70 rounded-xl px-2.5 py-2 shadow-2xs">
                          <div className="h-5 w-5 rounded-lg bg-[#FF6500]/10 text-[#FF6500] flex items-center justify-center shrink-0">
                            <FaLocationDot className="h-2.5 w-2.5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Distance</div>
                            <div className="text-xs font-medium text-slate-800">{merchant.distanceKm} KM Away</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-emerald-50/70 rounded-xl px-2.5 py-2 shadow-2xs">
                          <div className="h-5 w-5 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <FaClock className="h-2.5 w-2.5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Delivery ETA</div>
                            <div className="text-xs font-medium text-slate-800">{merchant.deliveryEtaMinutes} Mins</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                          Featured Stocked Brands
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                          {merchant.brands.map((brand, idx) => (
                            <span key={idx} className="flex items-center gap-2">
                              {idx > 0 && <span className="h-2.5 w-px bg-slate-300 inline-block" />}
                              <span>{brand}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 space-y-2">
                      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
                        <span className="text-slate-500 font-normal">Min Order Value</span>
                        <span className="font-medium text-slate-900">₹{merchant.minOrderValue.toLocaleString()}</span>
                      </div>

                      {quoteSuccessId === merchant.id ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium text-center flex items-center justify-center gap-1.5">
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
                            className="w-full text-xs py-1.5 font-medium"
                          >
                            Direct Quote
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onSelectMerchant(merchant)}
                            icon={<FaBagShopping className="h-3 w-3" />}
                            iconPosition="left"
                            className="w-full text-xs py-1.5 font-medium"
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

        </div>

      </div>
    </section>
  );
};
