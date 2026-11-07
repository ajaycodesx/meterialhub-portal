'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaStore,
  FaCircleCheck,
  FaLocationDot,
  FaClock,
  FaStar,
  FaBoxesStacked,
  FaArrowRight,
  FaArrowLeft,
} from 'react-icons/fa6';
import { useAppContext } from '../../context/AppContext';
import { ProductCatalog } from '../../components/buyer/ProductCatalog';
import { buyerApi } from '../../lib/api';
import { NoStoreSelected } from '../../components/buyer/NoStoreSelected';
import { CartItem, Product, HardwareMerchant, MaterialCategory } from '../../types/buyer';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const { selectedMerchant, setSelectedMerchant, setCurrentCart } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [merchants, setMerchants] = useState<HardwareMerchant[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalogData() {
      setLoading(true);
      try {
        const data: any = await buyerApi.getCatalog();
        const rawProducts = data?.products ?? [];
        const rawMerchants = data?.merchants ?? [];
        const rawCategories = data?.categories ?? [];

        const transformedProducts: Product[] = rawProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          brand: p.brand,
          price: p.price,
          unit: p.unit,
          moq: p.moq,
          weightSpec: p.weightSpec,
          grade: p.grade,
          gauge: p.gauge,
          weightKg: p.weightKg,
          image: p.image,
          stockQty: p.stockQty,
          merchantId: p.merchantId
        }));

        const transformedMerchants: HardwareMerchant[] = rawMerchants.map((m: any) => ({
          id: m.id,
          name: m.name,
          ownerName: m.ownerName,
          verified: m.verified,
          rating: m.rating,
          reviewsCount: m.reviewsCount,
          distanceKm: m.distanceKm,
          deliveryEtaMinutes: m.deliveryEtaMinutes,
          minOrderValue: m.minOrderValue,
          brands: m.brands || [],
          mainCategory: m.mainCategory,
          address: m.address,
          pincode: m.pincode,
          isOnline: m.isOnline,
          avatarUrl: m.avatarUrl
        }));

        const transformedCategories: MaterialCategory[] = rawCategories.map((c: any) => ({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          iconName: c.iconName,
          colorBg: c.colorBg,
          itemCount: c.itemCount,
          trendingBadge: c.trendingBadge,
          image: c.image,
          subcategories: c.subcategories || [],
          featuredBrands: c.featuredBrands || []
        }));

        setProducts(transformedProducts);
        setMerchants(transformedMerchants);
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Failed to fetch catalog data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogData();
  }, []);

  const matchingMerchants = useMemo(() => {
    if (!categoryParam || categoryParam === 'all') {
      return merchants;
    }
    const term = categoryParam.toLowerCase();
    const filtered = merchants.filter((m) => {
      const mainCat = (m.mainCategory || '').toLowerCase();
      const hasMatchingProduct = products.some(
        (p) => p.merchantId === m.id && (p.category || '').toLowerCase().includes(term)
      );
      return mainCat.includes(term) || hasMatchingProduct;
    });

    return filtered.length > 0 ? filtered : merchants;
  }, [categoryParam, merchants, products]);

  const handleSelectVendor = (merchant: HardwareMerchant) => {
    setSelectedMerchant(merchant);
  };

  const handleProceedToCart = (cart: CartItem[]) => {
    setCurrentCart(cart);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
        <div className="h-28 bg-white p-6 rounded-3xl shadow-xs space-y-3">
          <div className="h-5 w-40 bg-slate-200 rounded-xl" />
          <div className="h-8 w-2/3 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-xs space-y-3">
              <div className="h-6 w-3/4 bg-slate-200 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (merchants.length === 0) {
    return (
      <NoStoreSelected
        message="No verified stores are available right now."
        description="New merchant applications are currently under platform administrative inspection. Verified stores will appear here once approved."
        buttonText="Return to Home"
        onAction={() => router.push('/')}
      />
    );
  }

  if (selectedMerchant) {
    return (
      <div className="space-y-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="bg-white rounded-2xl p-3 px-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Shopping Store Yard:
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {selectedMerchant.name}
              </span>
              {categoryParam && (
                <span className="text-xs text-[#FF6500] font-medium">
                  &bull; Filter: {categoryParam}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedMerchant(null)}
              className="text-xs font-semibold text-[#FF6500] hover:text-[#e05a00] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FaArrowLeft className="h-2.5 w-2.5" />
              <span>Change Store / View All Vendors</span>
            </button>
          </div>
        </div>

        <ProductCatalog
          merchant={selectedMerchant}
          products={products}
          onBack={() => setSelectedMerchant(null)}
          onProceedToCheckout={handleProceedToCart}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FaArrowLeft className="h-3 w-3" />
              <span>Home</span>
            </button>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs font-semibold text-[#FF6500] uppercase tracking-wider">
              {categoryParam ? `Category: ${categoryParam}` : 'All Suppliers'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight leading-snug">
            {categoryParam
              ? `Verified Vendors & Suppliers for ${categoryParam}`
              : 'Verified Construction Material Merchants'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Select a verified merchant yard in your delivery radius to inspect warehouse stock, factory wholesale pricing, and instant transit scheduling.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-100 shrink-0 text-center sm:text-right">
          <span className="text-xs font-semibold text-[#FF6500] block">
            {matchingMerchants.length} Verified Depot{matchingMerchants.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Within 20 KM Delivery Radius
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {matchingMerchants.map((merchant) => {
          const storeProductCount = products.filter((p) => p.merchantId === merchant.id).length;
          return (
            <div
              key={merchant.id}
              className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 border border-slate-100"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#FF6500] flex items-center justify-center shrink-0 shadow-2xs">
                      <FaStore className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-slate-900 truncate">
                        {merchant.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                        Prop. {merchant.ownerName}
                      </p>
                    </div>
                  </div>

                  {merchant.verified && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <FaCircleCheck className="h-3 w-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-normal flex items-center gap-1">
                      <FaLocationDot className="h-3 w-3 text-slate-400" />
                      <span>Location</span>
                    </span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {merchant.address || 'Kochi Yard Hub'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-normal flex items-center gap-1">
                      <FaClock className="h-3 w-3 text-slate-400" />
                      <span>Transit ETA</span>
                    </span>
                    <span className="font-semibold text-emerald-600">
                      ~{merchant.deliveryEtaMinutes || 45} Mins ({merchant.distanceKm || 3.2} KM)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-normal flex items-center gap-1">
                      <FaBoxesStacked className="h-3 w-3 text-slate-400" />
                      <span>Stock Range</span>
                    </span>
                    <span className="font-medium text-slate-800">
                      {merchant.mainCategory || 'Building Materials'}
                    </span>
                  </div>

                  {merchant.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-normal flex items-center gap-1">
                        <FaStar className="h-3 w-3 text-amber-500" />
                        <span>Rating</span>
                      </span>
                      <span className="font-medium text-slate-800">
                        {merchant.rating.toFixed(1)} ({merchant.reviewsCount || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {merchant.brands && merchant.brands.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {merchant.brands.slice(0, 4).map((b, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSelectVendor(merchant)}
                className="w-full mt-auto py-2.5 px-4 rounded-xl bg-[#FF6500] hover:bg-[#e05a00] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Browse Store Materials</span>
                <FaArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400 text-xs font-medium">
          Loading catalog...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
