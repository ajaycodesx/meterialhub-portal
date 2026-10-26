'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
FaHouse,
FaBoxesStacked,
FaCartShopping,
FaTruckFast,
FaUser
} from 'react-icons/fa6';

interface MobileBottomNavProps {
  onOpenAuthModal: () => void;
  isLoggedIn: boolean;
  cartCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAuthModal,
  isLoggedIn,
  cartCount = 2
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: FaHouse,
      exact: true
    },
    {
      href: '/catalog',
      label: 'Catalog',
      icon: FaBoxesStacked,
      exact: false
    },
    {
      href: '/cart',
      label: 'Cart & Truck',
      icon: FaCartShopping,
      badge: cartCount > 0 ? cartCount : undefined,
      exact: false
    },
    {
      href: '/tracking',
      label: 'Live Track',
      icon: FaTruckFast,
      exact: false
    },
    {
      href: '/profile',
      label: isLoggedIn ? 'Profile' : 'Sign In',
      icon: FaUser,
      exact: false,
      onClick: !isLoggedIn ? (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenAuthModal();
      } : undefined
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href) && item.href !== '/';

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.onClick}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#FF6500] font-medium' 
                  : 'text-slate-500 font-normal hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <IconComponent className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 rounded-md bg-[#FF6500] text-white text-[9px] font-medium flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-xs bg-[#FF6500]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
