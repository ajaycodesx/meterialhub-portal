'use client';

import React,{ useState,useMemo } from 'react';
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
FaBoxesStacked,
FaCheck
} from 'react-icons/fa6';
import { HardwareMerchant, Product, CartItem } from '../../types/buyer';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';
import { PageBanner } from './PageBanner';
import { FaXmark } from 'react-icons/fa6';

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
  const { showToast } = useAppContext();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedGauge, setSelectedGauge] = useState<string>('all');

  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const merchantProducts = useMemo(() => {
    if (!merchant) return products;
    const storeProducts = products.filter((p) => p.merchantId === merchant.id);
    if (storeProducts.length > 0) return storeProducts;

    const merchantCats = (merchant.mainCategory || '').toLowerCase();
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return (
        merchantCats.includes(cat) ||
        (cat === 'steel' && merchantCats.includes('steel')) ||
        (cat === 'cement' && merchantCats.includes('cement')) ||
        (cat === 'pvc' && merchantCats.includes('pvc')) ||
        (cat === 'paints' && merchantCats.includes('paint')) ||
        (cat === 'electricals' && merchantCats.includes('electrical')) ||
        cat === 'tools' ||
        cat.includes('hardware')
      );
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
      showToast(`Added ${product.moq} ${product.unit}s of ${product.title} to order cart`);
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
      <PageBanner
        onBack={onBack}
        backTitle="Back to Suppliers"
        breadcrumbs={[
          { label: 'Hardware Merchants', onClick: onBack },
          { label: merchant.name }
        ]}
        badge={(
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <FaShieldHalved className="h-3 w-3 text-emerald-600" />
            <span>Verified Direct Depot Stockist</span>
          </span>
        )}
        title={`Explore ${merchant.name} Materials`}
        subtitle={(
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-normal pt-0.5">
            <span>{merchant.address}</span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span className="flex items-center gap-1">
              <FaLocationDot className="h-3 w-3 text-[#FF6500]" />
              {merchant.distanceKm} KM Away (ETA: ~{merchant.deliveryEtaMinutes} Mins)
            </span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>Managed by <strong className="font-medium text-slate-800">{merchant.ownerName}</strong></span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>Factory Brands: {merchant.brands.join(', ')}</span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span className="text-emerald-700 font-medium">★ {merchant.rating} ({merchant.reviewsCount} reviews)</span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>Min. Order: <strong className="text-slate-900 font-medium">₹{merchant.minOrderValue.toLocaleString()}</strong></span>
          </div>
        )}
        rightContent={(
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 md:w-72 h-10 sm:h-11 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products in inventory..."
                className="w-full h-full pl-9.5 pr-4 py-2 text-xs font-normal rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] text-slate-900 shadow-2xs"
              />
              <FaMagnifyingGlass className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setQuoteSent(true);
                setTimeout(() => setQuoteSent(false), 4000);
              }}
              icon={quoteSent ? <FaCheck className="h-3.5 w-3.5" /> : <FaArrowRight className="h-3.5 w-3.5" />}
              className="whitespace-nowrap px-4 py-2.5 h-10 sm:h-11 rounded-xl"
            >
              {quoteSent ? 'Quote Sent' : 'Request Quote'}
            </Button>
          </div>
        )}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 space-y-5 sm:space-y-6">

        <div className="space-y-3 sm:space-y-4">
          <div className="lg:hidden space-y-2 pt-1">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-3 lg:sticky lg:top-24 self-start">
              <div className="flex items-center justify-between px-1 h-6">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
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
                    className="text-[11px] font-medium text-[#FF6500] hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

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
                      className={`group rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                          : 'bg-white hover:bg-slate-50 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center shrink-0">
                          {tab === 'all' ? 'ALL' : tab.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`font-medium text-xs sm:text-sm ${isActive ? 'text-[#FF6500]' : 'text-slate-900'}`}>
                            {getCategoryLabel(tab)}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
                            {tab === 'all' ? 'Show all store inventory' : `Direct stock in ${merchant.name}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                          {count} Items
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs space-y-3.5 pt-4 mt-4">
                <h3 className="font-medium text-xs text-slate-900 uppercase tracking-wider text-slate-400">
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

            <div className="lg:col-span-8 xl:col-span-9 space-y-2.5">
              <div className="flex items-center justify-between px-1 h-6">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FaShieldHalved className="h-3 w-3 text-emerald-600" />
                  Available Store Products ({filteredProducts.length})
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl p-8 shadow-xs">
                  <FaCartFlatbedSuitcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-slate-800">No Products Match Your Filters</h3>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 gsap-stagger-group">
                  {filteredProducts.map((product) => {
                    const qty = cartQuantities[product.id] || 0;
                    const isAdded = qty > 0;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden p-4 gsap-card"
                      >
                        <div>
                          <div className="relative h-40 w-full rounded-2xl bg-slate-100 overflow-hidden mb-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            <span className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                              {product.weightSpec}
                            </span>
                            {typeof product.stockQty === 'number' && (
                              <span className={`absolute top-2 right-2 text-[10px] font-medium px-2.5 py-0.5 rounded-lg backdrop-blur-md shadow-xs ${
                                product.stockQty > 0 ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
                              }`}>
                                {product.stockQty > 0 ? `${product.stockQty} in stock` : 'Out of stock'}
                              </span>
                            )}
                          </div>

                          <h4 className="font-medium text-xs sm:text-sm text-slate-900 leading-snug">
                            {product.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-medium text-slate-600">
                            <span className="text-[#FF6500] font-medium">
                              {product.brand}
                            </span>
                            {product.grade && (
                              <>
                                <span className="h-2.5 w-px bg-slate-300 inline-block" />
                                <span className="text-slate-700">
                                  {product.grade}
                                </span>
                              </>
                            )}
                            {product.gauge && (
                              <>
                                <span className="h-2.5 w-px bg-slate-300 inline-block" />
                                <span className="text-slate-500">
                                  {product.gauge}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[8px] text-slate-400 font-medium uppercase tracking-wider leading-none mb-0.5">Wholesale Price</div>
                            <div className="text-xs sm:text-sm font-medium text-slate-900">
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
                                className="w-8 text-center font-medium text-xs bg-transparent focus:outline-none text-slate-900"
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
    </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-slate-900 text-white shadow-[0_-8px_24px_rgba(0,0,0,0.25)] border-t border-slate-800 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-6">

            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FaTruckFast className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="hidden xs:block">
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none mb-0.5">Unloading Weight Check</div>
                <div className="text-xs sm:text-base font-medium leading-tight text-white flex items-center gap-1">
                  {totalWeightTons.toFixed(2)} Tons
                  <span className="text-[9px] sm:text-[11px] font-normal text-slate-400">({totalWeightKg.toLocaleString()} kg)</span>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-[140px] xs:max-w-xs sm:max-w-md space-y-1">
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-medium text-slate-400">
                <span className="truncate">Recommended Vehicle</span>
                <span className="text-[#FF6500] font-medium uppercase tracking-wider truncate ml-1">{vehicleRecommendation.name}</span>
              </div>
              <div className="relative w-full h-1.5 sm:h-2 bg-slate-800 rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#FF6500] transition-all duration-500 rounded-lg"
                  style={{ width: `${Math.min(100, (totalWeightTons / vehicleRecommendation.limit) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="text-right">
                <div className="text-[8px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none mb-0.5">Est. Material Total</div>
                <div className="text-xs sm:text-lg font-medium text-[#FF6500] leading-tight">
                  ₹{totalPrice.toLocaleString()}
                  <span className="text-[8px] sm:text-[10px] text-slate-500 font-normal ml-0.5 hidden sm:inline">Excl. GST</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onProceedToCheckout(cartItems)}
                icon={<FaArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                className="px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl text-xs font-medium shrink-0"
              >
                <span className="hidden sm:inline">Checkout Supply Order</span>
                <span className="sm:hidden">Checkout</span>
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
