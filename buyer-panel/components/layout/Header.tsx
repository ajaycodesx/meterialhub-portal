'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaLocationDot,
  FaMagnifyingGlass,
  FaMicrophone,
  FaChevronDown,
  FaUser,
  FaBagShopping,
  FaRightFromBracket,
  FaCreditCard,
  FaMapLocationDot
} from 'react-icons/fa6';
import { FiBell, FiShoppingCart } from 'react-icons/fi';
import { LocationState, UserProfile } from '../../types/buyer';
import { Select } from '../ui/Select';

interface HeaderProps {
  location: LocationState;
  onOpenLocationModal: () => void;
  onOpenAuthModal: () => void;
  onOpenLanguageModal?: () => void;
  user: UserProfile;
  onLogout: () => void;
  currentLanguage?: string;
  onOpenProfileSites?: () => void;
  onNavigate?: (view: 'home' | 'catalog' | 'cart_vehicle' | 'checkout' | 'success' | 'tracking' | 'profile_sites' | 'site_delivery_page') => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  onOpenLocationModal,
  onOpenAuthModal,
  user,
  onLogout,
  onOpenProfileSites,
  onNavigate,
  cartCount = 1
}) => {
  const router = useRouter();
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleVoiceSearch = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setSearchQuery('UltraTech Cement 53 Grade');
      setIsListeningVoice(false);
      router.push('/catalog');
    }, 1500);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push('/catalog');
  };

  return (
    <header className="relative z-30 w-full bg-[#0d1527] text-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 lg:gap-6 w-full">
          
          <Link 
            href="/"
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 cursor-pointer group"
          >
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0">
              <img
                src="/images/logo.png"
                alt="MaterialHub Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero_banner.png';
                }}
              />
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-xl font-medium tracking-tight text-white leading-none">
                Material<span className="text-[#FF6500]">Hub</span>
              </div>
              <p className="text-xs text-slate-400 font-normal leading-tight mt-1 hidden sm:block">
                Wholesale Construction Supply Platform
              </p>
            </div>
          </Link>

          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/60 transition-all text-left shrink-0 cursor-pointer h-11"
          >
            <div className="text-[#FF6500] shrink-0">
              <FaLocationDot className="h-4 w-4" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                Inline Delivery Site
              </div>
              <div className="text-xs font-medium text-white truncate max-w-[150px]">
                {location.address ? `${location.address.split(',')[0]}, 20km` : 'Site #14, Kakkanad, 20km'}
              </div>
            </div>
            <FaChevronDown className="h-2.5 w-2.5 text-slate-400 shrink-0 ml-0.5" />
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex flex-1 min-w-[280px] max-w-xl xl:max-w-2xl items-center relative h-11 bg-white rounded-xl shadow-xs px-1.5"
          >
            <FaMagnifyingGlass className="h-4 w-4 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Cement, Steel, Sand..."
              className="w-full h-full pl-3 pr-2 text-xs font-normal text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`h-8 px-3.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                isListeningVoice 
                  ? 'bg-red-500 text-white shadow-xs animate-pulse' 
                  : 'bg-[#0d1527] text-white hover:bg-[#1a253d] shadow-2xs'
              }`}
            >
              <FaMicrophone className={`h-3 w-3 ${isListeningVoice ? 'text-white' : 'text-[#FF6500]'}`} />
              <span className="font-medium text-xs">{isListeningVoice ? 'Listening...' : 'Voice Search'}</span>
            </button>
          </form>

          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-3.5 shrink-0">
            
            <button
              onClick={onOpenLocationModal}
              className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-[#1c2638] border border-slate-700/60 text-white text-[11px] font-medium max-w-[90px] shrink-0 cursor-pointer"
            >
              <FaLocationDot className="h-2.5 w-2.5 text-[#FF6500] shrink-0" />
              <span className="truncate">{location.address.split(',')[0]}</span>
              <FaChevronDown className="h-2 w-2 text-slate-400 shrink-0" />
            </button>

            <Select
              align="right"
              popoverWidth="w-60 sm:w-64"
              trigger={
                <div className="flex items-center gap-2 hover:opacity-95 transition-opacity cursor-pointer">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-700 shrink-0 ring-1 ring-slate-600/60">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt={user.isLoggedIn ? user.name : 'Ajay Kumar'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/logo.png';
                      }}
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <div className="text-left leading-tight">
                      <div className="text-sm font-medium text-white tracking-tight">
                        {user.isLoggedIn ? user.name : 'Ajay Kumar'}
                      </div>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">
                        (Contractor)
                      </div>
                    </div>
                    <FaChevronDown className="h-3 w-3 text-slate-300 ml-0.5 shrink-0" />
                  </div>
                </div>
              }
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-900">{user.isLoggedIn ? user.name : 'Ajay Kumar'}</p>
                <p className="text-xs text-slate-500 font-normal">{user.phone || '+91 98470 12345'}</p>
              </div>
              <div className="py-1">
                <Link 
                  href="/profile"
                  onClick={() => { onNavigate?.('profile_sites'); onOpenProfileSites?.(); }} 
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                >
                  <FaUser className="h-3.5 w-3.5" /> Profile Settings
                </Link>

                <Link 
                  href="/tracking"
                  onClick={() => { onNavigate?.('tracking'); }} 
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                >
                  <FaBagShopping className="h-3.5 w-3.5" /> My Orders &amp; Tracking
                </Link>

                <Link 
                  href="/profile"
                  onClick={() => { onNavigate?.('profile_sites'); onOpenProfileSites?.(); }} 
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                >
                  <FaCreditCard className="h-3.5 w-3.5" /> Connected Bank / Credit
                </Link>

                <Link 
                  href="/site-delivery"
                  onClick={() => { onNavigate?.('site_delivery_page'); }} 
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                >
                  <FaMapLocationDot className="h-3.5 w-3.5" /> Saved Site Addresses
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1">
                {user.isLoggedIn ? (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <FaRightFromBracket className="h-3.5 w-3.5" /> Logout Session
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-[#FF6500] hover:bg-orange-50 cursor-pointer"
                  >
                    <FaUser className="h-3.5 w-3.5" /> Sign In / Register
                  </button>
                )}
              </div>
            </Select>

            <div className="h-7 w-[1px] bg-slate-700/80 mx-1 sm:mx-2 hidden sm:block shrink-0" />

            <button
              onClick={() => router.push('/tracking')}
              className="relative p-1 sm:p-1.5 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Notifications"
            >
              <FiBell className="h-5 w-5 sm:h-6 sm:w-6 text-slate-200" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 rounded-xs bg-[#FF6500]" />
            </button>

            <Link 
              href="/cart"
              onClick={() => onNavigate?.('cart_vehicle')}
              className="flex items-center gap-1 sm:gap-2 text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              title="View Cart & Truck Allocation"
            >
              <FiShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white shrink-0" />
              <span className="text-base font-medium text-white hidden sm:inline tracking-tight">Cart</span>
              <span className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg sm:rounded-xl bg-[#FF6500] text-white text-[10px] sm:text-xs font-medium flex items-center justify-center shadow-xs shrink-0">
                {cartCount > 0 ? cartCount : 1}
              </span>
            </Link>

          </div>
        </div>

        <div className="lg:hidden pt-2 pb-0.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center h-9 bg-white rounded-xl shadow-xs px-2.5">
            <FaMagnifyingGlass className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Cement, Steel, Sand..."
              className="w-full h-full text-xs font-normal text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`h-7 px-2.5 rounded-lg text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                isListeningVoice ? 'bg-red-500 text-white animate-pulse' : 'bg-[#0d1527] text-white'
              }`}
            >
              <FaMicrophone className={`h-2.5 w-2.5 ${isListeningVoice ? 'text-white' : 'text-[#FF6500]'}`} />
              <span>{isListeningVoice ? 'Listening...' : 'Voice'}</span>
            </button>
          </form>
        </div>

      </div>
    </header>
  );
};
