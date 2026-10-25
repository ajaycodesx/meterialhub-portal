'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { ProductCatalog } from '../../components/buyer/ProductCatalog';
import { buyerApi } from '../../lib/api';
import { CATALOG_PRODUCTS, HARDWARE_MERCHANTS } from '../../data/mockBuyerData';
import { CartItem, Product, HardwareMerchant } from '../../types/buyer';

export default function CatalogPage() {
  const router = useRouter();
  const { selectedMerchant, setSelectedMerchant, setCurrentCart } = useAppContext();
  const [products, setProducts] = useState<Product[]>(CATALOG_PRODUCTS);
  const [merchants, setMerchants] = useState<HardwareMerchant[]>(HARDWARE_MERCHANTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCatalogData() {
      setLoading(true);
      try {
        const data: any = await buyerApi.getCatalog();
        const transformedProducts: Product[] = data.products.map((p: any) => ({
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

        const transformedMerchants: HardwareMerchant[] = data.merchants.map((m: any) => ({
          id: m.id,
          name: m.name,
          ownerName: m.ownerName,
          verified: m.verified,
          rating: m.rating,
          reviewsCount: m.reviewsCount,
          distanceKm: m.distanceKm,
          deliveryEtaMinutes: m.deliveryEtaMinutes,
          minOrderValue: m.minOrderValue,
          brands: m.brands,
          mainCategory: m.mainCategory,
          address: m.address,
          isOnline: m.isOnline,
          avatarUrl: m.avatarUrl
        }));

        setProducts(transformedProducts);
        setMerchants(transformedMerchants);
      } catch (error) {
        console.error('Failed to fetch catalog data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogData();
  }, []);

  const merchant = selectedMerchant || merchants[0];

  const handleProceedToCart = (cart: CartItem[]) => {
    setCurrentCart(cart);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded-xl" />
            <div className="h-10 w-2/3 bg-slate-200 rounded-2xl" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-xl" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="h-16 bg-slate-100 rounded-2xl" />
              <div className="h-16 bg-slate-100 rounded-2xl" />
              <div className="h-16 bg-slate-100 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-5 h-56 bg-slate-200 rounded-3xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm space-y-3">
              <div className="h-40 bg-slate-100 rounded-2xl" />
              <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 bg-slate-200 rounded-md" />
                <div className="h-8 w-24 bg-orange-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProductCatalog
      merchant={merchant}
      products={products}
      onBack={() => router.push('/')}
      onProceedToCheckout={handleProceedToCart}
    />
  );
}
