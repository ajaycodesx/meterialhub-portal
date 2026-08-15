'use client';

import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { CommodityTicker } from '../components/buyer/CommodityTicker';
import { CategoriesGrid } from '../components/buyer/CategoriesGrid';
import { MerchantStoreCards } from '../components/buyer/MerchantStoreCards';
import { LocationServiceModal } from '../components/buyer/LocationServiceModal';
import { LanguageModal } from '../components/buyer/LanguageModal';
import { AuthModal } from '../components/buyer/AuthModal';

import { 
  COMMODITY_RATES, 
  MATERIAL_CATEGORIES, 
  HARDWARE_MERCHANTS,
  CATALOG_PRODUCTS
} from '../data/mockBuyerData';

import { 
  LocationState, 
  LanguageCode, 
  UserProfile,
  HardwareMerchant,
  CartItem
} from '../types/buyer';

import { ProductCatalog } from '../components/buyer/ProductCatalog';
import { CartVehicleSelection, VehicleOption } from '../components/buyer/CartVehicleSelection';
import { CheckoutPage } from '../components/buyer/CheckoutPage';
import { OrderSuccess } from '../components/buyer/OrderSuccess';
import { LiveTrackingPage } from '../components/buyer/LiveTrackingPage';
import { ProfileSitesPage } from '../components/buyer/ProfileSitesPage';
import { SiteDeliveryPage } from '../components/buyer/SiteDeliveryPage';

import { 
  FaTruckFast, 
  FaShieldHalved, 
  FaArrowRight, 
  FaStore 
} from 'react-icons/fa6';

import { Button } from '../components/ui/Button';

type BuyerPanelProps = {
  initialView?: 'home' | 'catalog' | 'cart_vehicle' | 'checkout' | 'success' | 'tracking' | 'profile_sites' | 'site_delivery_page';
};

export default function BuyerPanelHome({ initialView = 'home' }: BuyerPanelProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [location, setLocation] = useState<LocationState>({
    address: 'Site #14, Kakkanad Zone',
    pinCode: '682030',
    isServiceable: true,
    distanceKm: 8.5,
    siteConstraints: {
      roadWidth: '12ft+ (Standard Truck)',
      heavyVehicleAccess: true,
      craneNeeded: false,
      unloadingTimeSlot: '08:00 AM - 01:00 PM'
    }
  });

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [user, setUser] = useState<UserProfile>({
    name: 'Ajay Kumar',
    phone: '+91 98765 43210',
    email: 'ajay.builder@materialhub.in',
    isLoggedIn: true,
    savedAddresses: []
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<HardwareMerchant | null>(HARDWARE_MERCHANTS[0]);
  const [activeView, setActiveView] = useState<'home' | 'catalog' | 'cart_vehicle' | 'checkout' | 'success' | 'tracking' | 'profile_sites' | 'site_delivery_page'>(initialView);
  const [currentCart, setCurrentCart] = useState<CartItem[]>([
    {
      product: CATALOG_PRODUCTS[0],
      quantity: 50
    },
    {
      product: CATALOG_PRODUCTS[1],
      quantity: 20
    }
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>({
    id: 'pickup_truck',
    name: 'Mahindra Bolero Pickup',
    subtitle: 'Medium Payload Delivery',
    capacityTons: 3.5,
    freightFee: 1250,
    etaMinutes: 60,
    image: '/images/pickup_truck.jpg',
    description: 'Ideal for medium loads up to 3.5 Tons (e.g. 70 Cement Bags or mixed Steel TMT Rods).'
  });
  const [placedOrderId, setPlacedOrderId] = useState<string>('MH-842910');
  const [mobileTab, setMobileTab] = useState('home');

  const handleLogout = () => {
    setUser({
      name: 'Guest Buyer',
      phone: '',
      email: '',
      isLoggedIn: false,
      savedAddresses: []
    });
    setActiveView('home');
  };

  const handleOpenStore = (merchant: HardwareMerchant) => {
    setSelectedMerchant(merchant);
    setActiveView('catalog');
  };

  const handleProceedToCartVehicle = (cart: CartItem[]) => {
    setCurrentCart(cart);
    setActiveView('cart_vehicle');
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    setCurrentCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCurrentCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = (vehicle: VehicleOption, finalCart: CartItem[]) => {
    setSelectedVehicle(vehicle);
    setCurrentCart(finalCart);
    setActiveView('checkout');
  };

  const handleOrderSuccess = (orderId: string) => {
    setPlacedOrderId(orderId);
    setActiveView('success');
  };

  const handleResetToHome = () => {
    setSelectedMerchant(null);
    setCurrentCart([]);
    setSelectedVehicle(null);
    setPlacedOrderId('');
    setActiveView('home');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
      <div>
        <Header
          location={location}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          user={user}
          onLogout={handleLogout}
          currentLanguage={currentLanguage}
          onOpenProfileSites={() => setActiveView('profile_sites')}
          onNavigate={(v) => setActiveView(v)}
        />

        <CommodityTicker rates={COMMODITY_RATES} />

        {activeView === 'site_delivery_page' && (
          <SiteDeliveryPage
            location={location}
            onBack={() => setActiveView('home')}
            onSaveInstructions={(instructions) => {
              setLocation((prev) => ({
                ...prev,
                siteConstraints: {
                  ...prev.siteConstraints,
                  roadWidth: instructions.accessOption === 'narrow' ? 'Narrow Road (< 10ft)' : '12ft+ (Standard Truck)',
                  heavyVehicleAccess: instructions.accessOption !== 'no_heavy',
                  craneNeeded: instructions.accessOption === 'crane',
                  unloadingTimeSlot: prev.siteConstraints?.unloadingTimeSlot || '08:00 AM - 01:00 PM'
                }
              }));
              setActiveView('home');
            }}
          />
        )}

        {activeView === 'profile_sites' && (
          <ProfileSitesPage
            user={user}
            location={location}
            onOpenSiteModal={() => setActiveView('site_delivery_page')}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            onLogout={handleLogout}
            onOpenStore={handleOpenStore}
          />
        )}

        {activeView === 'catalog' && selectedMerchant && (
          <ProductCatalog
            merchant={selectedMerchant}
            products={CATALOG_PRODUCTS}
            onBack={() => setActiveView('home')}
            onProceedToCheckout={handleProceedToCartVehicle}
          />
        )}

        {activeView === 'cart_vehicle' && selectedMerchant && (
          <CartVehicleSelection
            merchant={selectedMerchant}
            cartItems={currentCart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onBackToCatalog={() => setActiveView('catalog')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {activeView === 'checkout' && selectedMerchant && selectedVehicle && (
          <CheckoutPage
            merchant={selectedMerchant}
            cartItems={currentCart}
            vehicle={selectedVehicle}
            location={location}
            onBackToCart={() => setActiveView('cart_vehicle')}
            onPlaceOrderSuccess={handleOrderSuccess}
          />
        )}

        {activeView === 'success' && (
          <OrderSuccess
            orderId={placedOrderId}
            onTrackOrderLive={() => setActiveView('tracking')}
            onReturnHome={handleResetToHome}
          />
        )}

        {activeView === 'tracking' && selectedMerchant && (
          <LiveTrackingPage
            orderId={placedOrderId}
            merchant={selectedMerchant}
            vehicle={selectedVehicle}
            location={location}
            onBackToSuccess={() => setActiveView('success')}
            onReturnHome={handleResetToHome}
          />
        )}

        {activeView === 'home' && (
          <>
            <section className="relative py-2 sm:py-6 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="bg-white p-3 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-10 items-stretch">
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-3 sm:space-y-6">
                    <div>
                      <h1 className="text-xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.2] mb-2 sm:mb-4">
                        Direct Factory &amp; Wholesale <span className="text-[#FF6500]">Construction Materials</span>
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                        Order Cement, TMT Steel Rods, PVC Pipes, Paints &amp; Electricals directly from verified local hardware stores, with real-time stock availability, transparent wholesale pricing, GST tax invoice, and same-day site delivery within a 25 KM radius.
                      </p>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100/60 flex items-center gap-2.5 sm:gap-3">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#FF6500]/10 text-[#FF6500] flex items-center justify-center shrink-0">
                            <FaTruckFast className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900">25 KM Radius</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">Same-Day Delivery</p>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60 flex items-center gap-2.5 sm:gap-3">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
                            <FaShieldHalved className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900">GST Invoice</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">100% Tax Credit</p>
                          </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center gap-2.5 sm:gap-3">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-200 text-[#FF6500] flex items-center justify-center shrink-0">
                            <FaStore className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[11px] sm:text-xs font-semibold text-slate-900">Local Hardware</h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">Verified Stores</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setIsLocationModalOpen(true)}
                          icon={<FaArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                          className="w-full justify-center text-xs sm:text-sm py-2.5 sm:py-3.5"
                        >
                          Check Delivery Area
                        </Button>

                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => setIsAuthModalOpen(true)}
                          className="w-full justify-center text-xs sm:text-sm py-2.5 sm:py-3.5"
                        >
                          Wholesale Rates
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 h-full flex">
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs group bg-slate-100 w-full h-full min-h-[200px] sm:min-h-[380px]">
                      <img
                        src="/images/hero_banner.png"
                        alt="MaterialHub Wholesale Delivery Truck"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <CategoriesGrid
              categories={MATERIAL_CATEGORIES}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
              selectedCategory={selectedCategory}
            />

            <MerchantStoreCards
              merchants={HARDWARE_MERCHANTS}
              selectedCategory={selectedCategory}
              onSelectMerchant={handleOpenStore}
            />
          </>
        )}
      </div>

      <Footer
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        currentLanguage={currentLanguage}
      />

      <MobileBottomNav
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isLoggedIn={user.isLoggedIn}
        cartCount={currentCart.length}
      />

      <LocationServiceModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        locationState={location}
        onUpdateLocation={(newLoc) => setLocation(newLoc)}
        onProceedNext={() => {
          setIsLocationModalOpen(false);
          setActiveView('site_delivery_page');
        }}
      />

      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={currentLanguage}
        onSelectLanguage={(lang) => setCurrentLanguage(lang)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
