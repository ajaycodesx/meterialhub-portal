'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '../components/buyer/HeroSection';
import { QuickDispatchAndShipments } from '../components/buyer/QuickDispatchAndShipments';
import { TrendingDealsStrip } from '../components/buyer/TrendingDealsStrip';
import { WholesaleRateIndex } from '../components/buyer/WholesaleRateIndex';
import { FeaturedBrandsShowcase } from '../components/buyer/FeaturedBrandsShowcase';
import { CategoriesGrid } from '../components/buyer/CategoriesGrid';
import { ContractorTestimonials } from '../components/buyer/ContractorTestimonials';
import { useAppContext } from '../context/AppContext';
import { buyerApi } from '../lib/api';
import { HardwareMerchant, MaterialCategory, CommodityRate } from '../types/buyer';
import { MATERIAL_CATEGORIES, HARDWARE_MERCHANTS } from '../data/mockBuyerData';

interface BuyerHomePayload {
  categories?: MaterialCategory[];
  nearbyMerchants?: HardwareMerchant[];
  trendingDeals?: {
    id: string;
    title: string;
    discount: string;
    price: number;
    unit: string;
    tag: string;
    image: string;
    category: string;
  }[];
  rateTicker?: CommodityRate[];
}

export default function HomePage() {
  const router = useRouter();
  const { setSelectedMerchant } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [homeData, setHomeData] = useState<BuyerHomePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const data = await buyerApi.getHome();
        setHomeData(data as BuyerHomePayload);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  const handleOpenStore = (merchant: HardwareMerchant) => {
    setSelectedMerchant(merchant);
    router.push('/catalog');
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-xs">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded-xl" />
            <div className="h-10 sm:h-12 w-3/4 bg-slate-200 rounded-2xl" />
            <div className="h-4 w-full bg-slate-100 rounded-xl" />
            <div className="h-4 w-2/3 bg-slate-100 rounded-xl" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="h-16 bg-slate-100 rounded-2xl" />
              <div className="h-16 bg-slate-100 rounded-2xl" />
              <div className="h-16 bg-slate-100 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-5 h-64 lg:h-auto bg-slate-100 rounded-3xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-800 rounded-3xl shadow-xs" />
          <div className="h-48 bg-white rounded-3xl shadow-xs" />
        </div>

        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-white p-4 rounded-3xl shadow-xs space-y-3">
                <div className="h-24 bg-slate-100 rounded-2xl" />
                <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categories = (homeData?.categories && homeData.categories.length > 0)
    ? homeData.categories
    : MATERIAL_CATEGORIES;

  const merchants = (homeData?.nearbyMerchants && homeData.nearbyMerchants.length > 0)
    ? homeData.nearbyMerchants
    : HARDWARE_MERCHANTS;

  return (
    <div className="w-full flex flex-col pt-3 sm:pt-5 lg:pt-6 space-y-8 sm:space-y-12 lg:space-y-16 pb-0">
      <HeroSection />

      <QuickDispatchAndShipments />

      <TrendingDealsStrip />

      <div id="wholesale-rates" className="w-full">
        <WholesaleRateIndex />
      </div>

      <FeaturedBrandsShowcase />

      <CategoriesGrid
        categories={categories}
        merchants={merchants}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        selectedCategory={selectedCategory}
        onSelectMerchant={handleOpenStore}
      />

      <ContractorTestimonials />
    </div>
  );
}
