'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { CommodityTicker } from '../buyer/CommodityTicker';
import { LocationServiceModal } from '../buyer/LocationServiceModal';
import { LanguageModal } from '../buyer/LanguageModal';
import { AuthModal } from '../buyer/AuthModal';
import { useAppContext } from '../../context/AppContext';
import { COMMODITY_RATES } from '../../data/mockBuyerData';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    location,
    setLocation,
    currentLanguage,
    setCurrentLanguage,
    user,
    setUser,
    handleLogout,
    currentCart,
    isLocationModalOpen,
    setIsLocationModalOpen,
    isLanguageModalOpen,
    setIsLanguageModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useAppContext();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <div className="fixed top-0 left-0 right-0 z-50 w-full shadow-md bg-[#0d1527]">
          <Header
            location={location}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            user={user}
            onLogout={handleLogout}
            currentLanguage={currentLanguage}
            onOpenProfileSites={() => router.push('/profile')}
            onNavigate={(v) => {
              const routeMap: Record<string, string> = {
                home: '/',
                catalog: '/catalog',
                cart_vehicle: '/cart',
                checkout: '/checkout',
                success: '/order-success',
                tracking: '/tracking',
                profile_sites: '/profile',
                site_delivery_page: '/site-delivery',
              };
              router.push(routeMap[v] || '/');
            }}
            cartCount={currentCart.length}
          />
          <CommodityTicker rates={COMMODITY_RATES} />
        </div>

        <main className="flex-1 pt-[130px] sm:pt-[152px] lg:pt-[104px]">
          {children}
        </main>
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
          router.push('/site-delivery');
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
