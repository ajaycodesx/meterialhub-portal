'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
LocationState,
LanguageCode,
UserProfile,
HardwareMerchant,
CartItem,
} from '../types/buyer';
import { VehicleOption } from '../components/buyer/CartVehicleSelection';
import { CATALOG_PRODUCTS } from '../data/mockBuyerData';

interface AppContextValue {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  handleLogout: () => void;
  selectedMerchant: HardwareMerchant | null;
  setSelectedMerchant: (m: HardwareMerchant | null) => void;
  currentCart: CartItem[];
  setCurrentCart: (cart: CartItem[]) => void;
  handleUpdateCartQty: (productId: string, newQty: number) => void;
  handleRemoveCartItem: (productId: string) => void;
  selectedVehicle: VehicleOption | null;
  setSelectedVehicle: (v: VehicleOption | null) => void;
  placedOrderId: string;
  setPlacedOrderId: (id: string) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (v: boolean) => void;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (v: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (v: boolean) => void;
  toastMessage: string | null;
  toastType: 'success' | 'warning' | 'info';
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  hideToast: () => void;
  handleResetToHome: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 3500);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const [location, setLocation] = useState<LocationState>({
    address: 'Site #14, Kakkanad Zone',
    pinCode: '682030',
    isServiceable: true,
    distanceKm: 8.5,
    siteConstraints: {
      roadWidth: '12ft+ (Standard Truck)',
      heavyVehicleAccess: true,
      craneNeeded: false,
      unloadingTimeSlot: '08:00 AM - 01:00 PM',
    },
  });

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  const [user, setUser] = useState<UserProfile>({
    name: 'Ajay Kumar',
    phone: '+91 98765 43210',
    email: 'ajay.builder@materialhub.in',
    isLoggedIn: true,
    savedAddresses: [],
  });

  const [selectedMerchant, setSelectedMerchant] = useState<HardwareMerchant | null>(null);

  const [currentCart, setCurrentCart] = useState<CartItem[]>([
    { product: CATALOG_PRODUCTS[0], quantity: 50 },
    { product: CATALOG_PRODUCTS[1], quantity: 20 },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>({
    id: 'pickup_truck',
    name: 'Mahindra Bolero Pickup',
    subtitle: 'Medium Payload Delivery',
    capacityTons: 3.5,
    freightFee: 1250,
    etaMinutes: 60,
    image: '/images/pickup_truck.jpg',
    description: 'Ideal for medium loads up to 3.5 Tons (e.g. 70 Cement Bags or mixed Steel TMT Rods).',
  });

  const [placedOrderId, setPlacedOrderId] = useState<string>('MH-842910');

  const handleLogout = () => {
    setUser({ name: 'Guest Buyer', phone: '', email: '', isLoggedIn: false, savedAddresses: [] });
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    setCurrentCart((prev) =>
      prev.map((item) => item.product.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCurrentCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleResetToHome = () => {
    setSelectedMerchant(null);
    setCurrentCart([]);
    setSelectedVehicle(null);
    setPlacedOrderId('');
  };

  return (
    <AppContext.Provider value={{
      location, setLocation, currentLanguage, setCurrentLanguage,
      user, setUser, handleLogout,
      selectedMerchant, setSelectedMerchant,
      currentCart, setCurrentCart, handleUpdateCartQty, handleRemoveCartItem,
      selectedVehicle, setSelectedVehicle,
      placedOrderId, setPlacedOrderId,
      isLocationModalOpen, setIsLocationModalOpen,
      isLanguageModalOpen, setIsLanguageModalOpen,
      isAuthModalOpen, setIsAuthModalOpen,
      toastMessage, toastType, showToast, hideToast,
      handleResetToHome,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
