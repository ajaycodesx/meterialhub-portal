'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FaLocationDot, 
  FaMagnifyingGlass, 
  FaMicrophone, 
  FaStore, 
  FaTruck, 
  FaChevronDown, 
  FaUser, 
  FaCircleCheck, 
  FaBagShopping, 
  FaHeart, 
  FaRightFromBracket, 
  FaCreditCard,
  FaMapLocationDot,
  FaHeadset,
  FaCartShopping
} from 'react-icons/fa6';
import { LocationState, UserProfile } from '../../types/buyer';
import { Select } from '../ui/Select';

interface HeaderProps {
  location: LocationState;
  onOpenLocationModal: () => void;
  onOpenAuthModal: () => void;
  onOpenLanguageModal: () => void;
  user: UserProfile;
  onLogout: () => void;
  currentLanguage: string;
  onOpenProfileSites?: () => void;
  onNavigate?: (view: 'home' | 'catalog' | 'cart_vehicle' | 'checkout' | 'success' | 'tracking' | 'profile_sites' | 'site_delivery_page') => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  onOpenLocationModal,
  onOpenAuthModal,
  onOpenLanguageModal,
  user,
  onLogout,
  currentLanguage,
  onOpenProfileSites,
  onNavigate,
  cartCount = 2
}) => {
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleVoiceSearch = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setSearchQuery('UltraTech Cement 53 Grade');
      setIsListeningVoice(false);
    }, 1800);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        
        <div className="flex items-center justify-between gap-2 w-full">
          
          <Link 
            href="/"
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
          >
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-full overflow-hidden shadow-xs border border-orange-100 bg-slate-900 shrink-0">
              <img
                src="/images/logo.png"
                alt="MaterialHub Circular Brand Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="font-semibold text-base sm:text-xl tracking-tight text-slate-900 leading-tight">
                Material<span className="text-[#FF6500]">Hub</span>
              </span>
              <p className="text-[10px] sm:text-xs text-slate-500 font-normal hidden sm:block leading-tight">
                Wholesale Construction Supply Platform
              </p>
            </div>
          </Link>

          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 transition-all text-left group h-10 sm:h-11 shrink-0 cursor-pointer"
          >
            <div className="h-6 w-6 rounded-lg bg-[#FF6500] text-white flex items-center justify-center shrink-0">
              <FaLocationDot className="h-3 w-3" />
            </div>
            <div className="text-xs leading-tight min-w-0">
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                Delivery Site
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-800 text-xs truncate max-w-[120px]">
                  {location.address || 'Select Site'}
                </span>
                <FaChevronDown className="h-2 w-2 text-slate-400 shrink-0" />
              </div>
            </div>
            {location.isServiceable && (
              <span className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold shrink-0">
                <FaCircleCheck className="h-2.5 w-2.5" />
                25km
              </span>
            )}
          </button>

          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-md items-center relative h-10 sm:h-11">
            <div className="relative w-full h-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Cement, Steel Rods, PVC Pipes..."
                className="w-full h-full pl-9 pr-22 py-2 text-xs font-normal rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] text-slate-900 placeholder-slate-400"
              />
              <FaMagnifyingGlass className="absolute left-3 top-3.5 h-3 w-3 text-slate-400" />
              
              <button
                onClick={handleVoiceSearch}
                className={`absolute right-1.5 h-7.5 px-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  isListeningVoice 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <FaMicrophone className="h-2.5 w-2.5 text-[#FF6500]" />
                <span>{isListeningVoice ? 'Listening...' : 'Voice'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            <button
              onClick={onOpenLocationModal}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold max-w-[120px] shrink-0 cursor-pointer"
            >
              <FaLocationDot className="h-3 w-3 text-[#FF6500] shrink-0" />
              <span className="truncate text-[11px] font-semibold">{location.address.split(',')[0]}</span>
              <FaChevronDown className="h-2 w-2 text-slate-400 shrink-0" />
            </button>

            <Link
              href="/cart"
              onClick={() => onNavigate?.('cart_vehicle')}
              className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#FF6500] flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="View Cart & Truck Allocation"
            >
              <FaCartShopping className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 rounded-full bg-[#FF6500] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={onOpenLanguageModal}
              className="hidden sm:flex px-3 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 items-center gap-1.5 transition-all h-10 sm:h-11 cursor-pointer"
            >
              <span className="text-xs">🇮🇳</span>
              <span className="uppercase text-xs font-semibold">{currentLanguage}</span>
            </button>

            <Select
              align="right"
              popoverWidth="w-56 sm:w-64"
              trigger={
                <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all h-10 sm:h-11 cursor-pointer">
                  <div className="h-5 w-5 rounded-md bg-[#FF6500] text-white flex items-center justify-center shrink-0">
                    <FaStore className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Portals</span>
                  <FaChevronDown className="h-2.5 w-2.5 text-slate-400" />
                </button>
              }
            >
              <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Ecosystem Portals
              </div>
              <a
                href="../vendor-panel"
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-[#FF6500] transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-orange-100 text-[#FF6500] flex items-center justify-center shrink-0">
                  <FaStore className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Become a Vendor</div>
                  <div className="text-[10px] text-slate-500 font-normal">Merchant Store Onboarding</div>
                </div>
              </a>
              <a
                href="../driver-panel"
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-[#FF6500] transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FaTruck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Logistics Partner</div>
                  <div className="text-[10px] text-slate-500 font-normal">Driver &amp; Fleet Network</div>
                </div>
              </a>
              <div className="border-t border-slate-100 my-1"></div>
              <a
                href="#support"
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FaHeadset className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold">24x7 Site Support</div>
                  <div className="text-[10px] text-slate-500 font-normal">Live Helpdesk &amp; Orders</div>
                </div>
              </a>
            </Select>

            {user.isLoggedIn ? (
              <Select
                align="right"
                popoverWidth="w-60 sm:w-64"
                trigger={
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200 transition-all h-9 sm:h-11 cursor-pointer">
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-xl bg-[#FF6500] text-white flex items-center justify-center font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-slate-900 max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <FaChevronDown className="h-2.5 w-2.5 text-slate-500" />
                  </div>
                }
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 font-normal">{user.phone || user.email}</p>
                </div>
                <div className="py-1">
                  <Link 
                    href="/profile"
                    onClick={() => { onNavigate?.('profile_sites'); onOpenProfileSites?.(); }} 
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                  >
                    <FaUser className="h-3.5 w-3.5" /> Profile Settings
                  </Link>

                  <Link 
                    href="/tracking"
                    onClick={() => { onNavigate?.('tracking'); }} 
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                  >
                    <FaBagShopping className="h-3.5 w-3.5" /> My Orders &amp; Tracking
                  </Link>

                  <Link 
                    href="/profile"
                    onClick={() => { onNavigate?.('profile_sites'); onOpenProfileSites?.(); }} 
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                  >
                    <FaCreditCard className="h-3.5 w-3.5" /> Connected Bank / UPI
                  </Link>

                  <Link 
                    href="/site-delivery"
                    onClick={() => { onNavigate?.('site_delivery_page'); }} 
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                  >
                    <FaMapLocationDot className="h-3.5 w-3.5" /> Saved Site Addresses
                  </Link>

                  <Link 
                    href="/profile"
                    onClick={() => { onNavigate?.('profile_sites'); onOpenProfileSites?.(); }} 
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#FF6500] cursor-pointer"
                  >
                    <FaHeart className="h-3.5 w-3.5" /> Favorite Merchants
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <FaRightFromBracket className="h-3.5 w-3.5" /> Logout Session
                  </button>
                </div>
              </Select>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-2xl bg-[#FF6500] hover:bg-[#E05800] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 h-9 sm:h-11 shrink-0 cursor-pointer"
              >
                <FaUser className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

        <div className="lg:hidden pt-2 pb-0.5">
          <div className="relative flex items-center h-9">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Cement, Steel, PVC Pipes..."
              className="w-full h-full pl-8 pr-20 py-1.5 text-xs font-normal rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 text-slate-900"
            />
            <FaMagnifyingGlass className="absolute left-2.5 top-3 h-3 w-3 text-slate-400" />
            <button
              onClick={handleVoiceSearch}
              className="absolute right-1 h-7 px-2 rounded-xl text-[10px] font-medium bg-slate-900 text-white flex items-center gap-1 cursor-pointer"
            >
              <FaMicrophone className="h-2.5 w-2.5 text-[#FF6500]" />
              <span>Voice</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
