'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaShieldHalved, 
  FaStar, 
  FaLocationDot, 
  FaMagnifyingGlass, 
  FaChevronLeft, 
  FaMinus, 
  FaPlus, 
  FaCartFlatbedSuitcase, 
  FaTruckFast,
  FaArrowRight,
  FaBuilding,
  FaBoxesStacked
} from 'react-icons/fa6';
import { HardwareMerchant, Product, CartItem } from '../../types/buyer';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';

interface ProductCatalogProps {
  merchant: HardwareMerchant;
  products: Product[];
  onBack: () => void;
  onProceedToCheckout: (cart: CartItem[]) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  merchant,
  products,
  onBack,
  onProceedToCheckout
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGauge, setSelectedGauge] = useState<string>('all');

  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const merchantProducts = useMemo(() => {
    return products.filter((p) => {
      const merchantCats = merchant.mainCategory.split(',').map((c) => c.trim().toLowerCase());
      return merchantCats.includes(p.category.toLowerCase()) || p.category === 'tools';
    });
  }, [products, merchant]);

  const categoryTabs = useMemo(() => {
    const categories = Array.from(new Set(merchantProducts.map((p) => p.category)));
    return ['all', ...categories];
  }, [merchantProducts]);

  const brands = useMemo(() => {
    const unique = Array.from(new Set(merchantProducts.map((p) => p.brand)));
    return ['all', ...unique];
  }, [merchantProducts]);

  const grades = useMemo(() => {
    const unique = Array.from(new Set(merchantProducts.filter((p) => p.grade).map((p) => p.grade!)));
    return ['all', ...unique];
  }, [merchantProducts]);

  const gauges = useMemo(() => {
    const unique = Array.from(new Set(merchantProducts.filter((p) => p.gauge).map((p) => p.gauge!)));
    return ['all', ...unique];
  }, [merchantProducts]);

  const brandOptions: SelectOption[] = useMemo(() => {
    return brands.map((b) => ({
      label: b === 'all' ? 'All Brands' : b,
      value: b,
    }));
  }, [brands]);

  const gradeOptions: SelectOption[] = useMemo(() => {
    return grades.map((g) => ({
      label: g === 'all' ? 'All Grades' : g,
      value: g,
    }));
  }, [grades]);

  const gaugeOptions: SelectOption[] = useMemo(() => {
    return gauges.map((g) => ({
      label: g === 'all' ? 'All Gauges' : g,
      value: g,
    }));
  }, [gauges]);

  const filteredProducts = useMemo(() => {
    return merchantProducts.filter((p) => {
      const matchCategory = selectedCategoryTab === 'all' || p.category === selectedCategoryTab;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = selectedBrand === 'all' || p.brand === selectedBrand;
      const matchGrade = selectedGrade === 'all' || p.grade === selectedGrade;
      const matchGauge = selectedGauge === 'all' || p.gauge === selectedGauge;
      
      return matchCategory && matchSearch && matchBrand && matchGrade && matchGauge;
    });
  }, [merchantProducts, selectedCategoryTab, searchQuery, selectedBrand, selectedGrade, selectedGauge]);

  const handleIncrement = (product: Product) => {
    const currentQty = cartQuantities[product.id] || 0;
    if (currentQty === 0) {
      setCartQuantities((prev) => ({ ...prev, [product.id]: product.moq }));
    } else {
      setCartQuantities((prev) => ({ ...prev, [product.id]: currentQty + 1 }));
    }
  };

  const handleDecrement = (product: Product) => {
    const currentQty = cartQuantities[product.id] || 0;
    if (currentQty <= product.moq) {
      const updated = { ...cartQuantities };
      delete updated[product.id];
      setCartQuantities(updated);
    } else {
      setCartQuantities((prev) => ({ ...prev, [product.id]: currentQty - 1 }));
    }
  };

  const handleQtyChange = (product: Product, val: number) => {
    if (isNaN(val) || val <= 0) {
      const updated = { ...cartQuantities };
      delete updated[product.id];
      setCartQuantities(updated);
    } else {
      setCartQuantities((prev) => ({ ...prev, [product.id]: Math.max(product.moq, val) }));
    }
  };

  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cartQuantities).map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId)!;
      return { product, quantity: qty };
    });
  }, [cartQuantities, products]);

  const totalWeightKg = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.weightKg * item.quantity), 0);
  }, [cartItems]);

  const totalWeightTons = totalWeightKg / 1000;

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const vehicleRecommendation = useMemo(() => {
    if (totalWeightTons === 0) return { name: 'No Items Added', capacity: '0 Tons', limit: 1.5 };
    if (totalWeightTons <= 1.5) return { name: 'Tata Ace / Pickup Truck', capacity: 'Max 1.5 Tons', limit: 1.5 };
    if (totalWeightTons <= 3.5) return { name: 'Mahindra Bolero Pickup', capacity: 'Max 3.5 Tons', limit: 3.5 };
    if (totalWeightTons <= 10) return { name: 'Standard 6-Wheeler Truck', capacity: 'Max 10 Tons', limit: 10 };
    return { name: 'Heavy 10-Wheeler Truck', capacity: 'Max 16 Tons', limit: 16 };
  }, [totalWeightTons]);

  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'all': return 'All Items';
      case 'cement': return 'Cement & Bags';
      case 'steel': return 'TMT Steel';
      case 'pvc': return 'PVC & Plumbing';
      case 'paints': return 'Paints & Putty';
      case 'electricals': return 'Electricals';
      case 'tools': return 'Hardware & Tools';
      default: return cat;
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        
        {/* Mobile App Store Hero Banner (Matching Home Page Mobile Hero Card) */}
        <div className="sm:hidden relative rounded-2xl overflow-hidden shadow-md bg-slate-900 text-white p-4 flex flex-col justify-between group min-h-[300px]">
          <img
            src="/images/store_hero_banner.jpg"
            alt={`${merchant.name} Warehouse Yard`}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/30" />

          <div className="relative z-10 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <FaChevronLeft className="h-3 w-3" />
              <span>Suppliers</span>
            </button>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-semibold backdrop-blur-xs">
              <FaShieldHalved className="h-3 w-3" />
              Verified Hub
            </span>
          </div>

          <div className="relative z-10 space-y-1 my-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white font-semibold text-xl flex items-center justify-center shadow-md shrink-0 border border-white/20">
                {merchant.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight leading-tight">
                  {merchant.name}
                </h1>
                <p className="text-xs text-slate-200 font-normal flex items-center gap-1 mt-0.5">
                  <FaBuilding className="h-3 w-3 text-orange-400 shrink-0" />
                  <span className="truncate max-w-[220px]">{merchant.address}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-medium w-full">
              <span className="inline-flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg bg-white/20 text-white backdrop-blur-md border border-white/10 text-center truncate">
                <FaLocationDot className="h-3 w-3 text-orange-400 shrink-0" />
                <span className="truncate">{merchant.distanceKm} KM Away</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg bg-emerald-500/80 text-white backdrop-blur-md text-center truncate">
                <FaShieldHalved className="h-3 w-3 shrink-0" />
                <span className="truncate">Verified Stock</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg bg-white/15 text-white backdrop-blur-md border border-white/10 text-center truncate">
                <FaStar className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">{merchant.rating} ({merchant.reviewsCount})</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert(`Direct Quote Request sent to ${merchant.name}`)}
                className="w-full justify-center text-xs py-2 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Request Quote</span>
              </button>

              <div className="w-full text-center text-[10px] py-2 rounded-xl bg-white/20 text-white font-medium border border-white/20 backdrop-blur-xs flex items-center justify-center">
                Min Order: ₹{merchant.minOrderValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Store Hero Grid (Matching Home Page Hero Layout) */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-stretch bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
          
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                >
                  <FaChevronLeft className="h-3 w-3" />
                  <span>Back to Suppliers</span>
                </button>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <FaShieldHalved className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified Hardware Merchant</span>
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-slate-900 text-white font-semibold text-2xl sm:text-3xl flex items-center justify-center shadow-md relative shrink-0 border border-slate-700">
                  {merchant.name.charAt(0)}
                  {merchant.verified && (
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs ring-2 ring-white" title="Verified Merchant">
                      <FaShieldHalved className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-tight">
                    {merchant.name}
                  </h1>
                  
                  <p className="text-xs sm:text-sm text-slate-500 font-normal flex items-center gap-1.5">
                    <FaBuilding className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <span>{merchant.address}</span>
                  </p>

                  <p className="text-xs text-slate-400 font-normal">
                    Managed by <span className="font-semibold text-slate-700">{merchant.ownerName}</span> &bull; Stocking factory brands: {merchant.brands.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#FF6500]/10 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaLocationDot className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{merchant.distanceKm} KM Away</h4>
                    <p className="text-[11px] text-slate-500 font-normal">ETA: ~{merchant.deliveryEtaMinutes} Mins</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
                    <FaShieldHalved className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Verified Stock</h4>
                    <p className="text-[11px] text-slate-500 font-normal">GST Tax Invoice</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100/60 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <FaStar className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{merchant.rating} Rating</h4>
                    <p className="text-[11px] text-slate-500 font-normal">{merchant.reviewsCount} Reviews</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="text-xs font-semibold text-slate-700">
                  Minimum Order Value: <span className="text-[#FF6500] text-sm">₹{merchant.minOrderValue.toLocaleString()}</span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => alert(`Direct Quote Request sent to ${merchant.name}`)}
                  icon={<FaArrowRight className="h-3.5 w-3.5" />}
                  className="px-6 py-3"
                >
                  Request Direct Quote
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-full flex">
            <div className="relative rounded-3xl overflow-hidden shadow-md group bg-slate-900 w-full h-full min-h-[360px]">
              <img
                src="/images/store_hero_banner.jpg"
                alt={`${merchant.name} Warehouse Yard`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/10">
                  Warehouse Stock &amp; Yard
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FF6500] text-white text-xs font-semibold shadow-xs">
                  {merchant.brands.length} Brands Available
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Section 2: Store Products Inventory with Master-Detail Split Layout */}
      <section className="py-4 sm:py-8 bg-transparent">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          
          {/* Unified Top Section Header & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-3.5 sm:pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-[#FF6500] uppercase tracking-wider mb-0.5">
                <FaBoxesStacked className="h-3.5 w-3.5" />
                <span>Store Inventory &amp; Direct Stock</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Explore {merchant.name} Materials
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Select a category on the left to filter products, technical grades, and wholesale pricing in this store
              </p>
            </div>

            <div className="relative w-full md:w-80 h-10 sm:h-11 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products in store inventory..."
                className="w-full h-full pl-9 pr-4 py-2 text-xs font-normal rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] text-slate-900 shadow-sm"
              />
              <FaMagnifyingGlass className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Mobile View: Category Tabs & Sub-Category Pills Bar */}
          <div className="lg:hidden space-y-2 pt-1">
            {/* Row 1: Main Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategoryTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setSelectedCategoryTab(tab);
                      setSelectedBrand('all');
                      setSelectedGrade('all');
                      setSelectedGauge('all');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#FF6500] text-white border-[#FF6500] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {getCategoryLabel(tab)}
                  </button>
                );
              })}
            </div>

            {/* Technical Filters Dropdowns for Mobile (Matching Tab Height & Font Size) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Select
                label="Brand Filter"
                size="sm"
                options={brandOptions}
                value={selectedBrand}
                onChange={(val) => setSelectedBrand(String(val))}
              />
              {grades.length > 1 && (
                <Select
                  label="Grade Filter"
                  size="sm"
                  options={gradeOptions}
                  value={selectedGrade}
                  onChange={(val) => setSelectedGrade(String(val))}
                />
              )}
            </div>
          </div>

          {/* Main Grid: Left Side Category List & Right Side Store Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            {/* LEFT SIDE: Select Material Category (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1 h-6">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Store Material Categories
                </span>

                {(selectedCategoryTab !== 'all' || selectedBrand !== 'all' || selectedGrade !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCategoryTab('all');
                      setSelectedBrand('all');
                      setSelectedGrade('all');
                      setSelectedGauge('all');
                    }}
                    className="text-[11px] font-semibold text-[#FF6500] hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Category Selector Cards List */}
              <div className="space-y-2">
                {categoryTabs.map((tab) => {
                  const isActive = selectedCategoryTab === tab;
                  const count = tab === 'all' 
                    ? products.length 
                    : products.filter(p => p.category === tab).length;

                  return (
                    <div
                      key={tab}
                      onClick={() => {
                        setSelectedCategoryTab(tab);
                        setSelectedBrand('all');
                        setSelectedGrade('all');
                        setSelectedGauge('all');
                      }}
                      className={`group rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer border flex items-center justify-between ${
                        isActive
                          ? 'bg-white border-[#FF6500] shadow-lg ring-2 ring-[#FF6500]/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                          {tab === 'all' ? 'ALL' : tab.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-xs sm:text-sm ${isActive ? 'text-[#FF6500]' : 'text-slate-900'}`}>
                            {getCategoryLabel(tab)}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
                            {tab === 'all' ? 'Show all store inventory' : `Direct stock in ${merchant.name}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {count} Items
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Technical Specifications Filters Box */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3.5 pt-4 mt-4">
                <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider text-slate-400">
                  Technical Grade &amp; Brand Filters
                </h3>

                <Select
                  label="Filter by Brand"
                  size="sm"
                  options={brandOptions}
                  value={selectedBrand}
                  onChange={(val) => setSelectedBrand(String(val))}
                />

                {grades.length > 1 && (
                  <Select
                    label="Filter by Grade"
                    size="sm"
                    options={gradeOptions}
                    value={selectedGrade}
                    onChange={(val) => setSelectedGrade(String(val))}
                  />
                )}

                {gauges.length > 1 && (
                  <Select
                    label="Steel Gauge"
                    size="sm"
                    options={gaugeOptions}
                    value={selectedGauge}
                    onChange={(val) => setSelectedGauge(String(val))}
                  />
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Store Inventory Products Grid */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between px-1 h-6">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FaShieldHalved className="h-3 w-3 text-emerald-600" />
                  Available Store Products ({filteredProducts.length})
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl p-8 border border-slate-200/80 shadow-md">
                  <FaCartFlatbedSuitcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800">No Products Match Your Filters</h3>
                  <p className="text-xs text-slate-400 mt-1 font-normal">Try clearing category selection or technical filters</p>
                  <Button
                    onClick={() => {
                      setSelectedCategoryTab('all');
                      setSelectedBrand('all');
                      setSelectedGrade('all');
                      setSelectedGauge('all');
                    }}
                    variant="primary"
                    size="sm"
                    className="mt-3"
                  >
                    Reset All Product Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredProducts.map((product) => {
                    const qty = cartQuantities[product.id] || 0;
                    const isAdded = qty > 0;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden p-4"
                      >
                        <div>
                          <div className="relative h-40 w-full rounded-xl bg-slate-100 overflow-hidden mb-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                              {product.weightSpec}
                            </span>
                          </div>

                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                            {product.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6500] font-semibold">
                              {product.brand}
                            </span>
                            {product.grade && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                                {product.grade}
                              </span>
                            )}
                            {product.gauge && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                {product.gauge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Wholesale Price</div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-900">
                              ₹{product.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {product.unit}</span>
                            </div>
                          </div>

                          {isAdded ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 h-9">
                              <button
                                onClick={() => handleDecrement(product)}
                                className="h-7 w-7 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <FaMinus className="h-2.5 w-2.5" />
                              </button>
                              <input
                                type="number"
                                value={qty}
                                onChange={(e) => handleQtyChange(product, parseInt(e.target.value))}
                                className="w-8 text-center font-semibold text-xs bg-transparent focus:outline-none text-slate-900"
                              />
                              <button
                                onClick={() => handleIncrement(product)}
                                className="h-7 w-7 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <FaPlus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleIncrement(product)}
                              className="px-3 py-1.5 text-xs"
                            >
                              Add to Cart
                            </Button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {cartItems.length > 0 && (
        <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-slate-900 text-white shadow-[0_-8px_24px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <FaTruckFast className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Unloading Weight Check</div>
                  <div className="text-base font-semibold flex items-center gap-1.5">
                    {totalWeightTons.toFixed(2)} Tons
                    <span className="text-[11px] font-normal text-slate-400">({totalWeightKg.toLocaleString()} kg)</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-md space-y-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                  <span>Recommended Vehicle</span>
                  <span className="text-[#FF6500] font-semibold uppercase tracking-wider">{vehicleRecommendation.name}</span>
                </div>
                <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#FF6500] transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalWeightTons / vehicleRecommendation.limit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
              <div className="text-left md:text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Est. Material Total</div>
                <div className="text-lg font-semibold text-[#FF6500]">
                  ₹{totalPrice.toLocaleString()}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">Excl. GST</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => onProceedToCheckout(cartItems)}
                icon={<FaArrowRight className="h-3.5 w-3.5" />}
                className="px-6 py-3 rounded-2xl"
              >
                Checkout Supply Order
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
