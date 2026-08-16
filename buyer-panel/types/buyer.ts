export interface LocationState {
  address: string;
  pinCode: string;
  isServiceable: boolean;
  distanceKm: number;
  coordinates?: { lat: number; lng: number };
  siteConstraints?: {
    roadWidth: string; // e.g. "12ft+", "Narrow < 10ft"
    heavyVehicleAccess: boolean;
    craneNeeded: boolean;
    unloadingTimeSlot: string;
  };
}

export type LanguageCode = 'en' | 'ml' | 'ta' | 'hi' | 'kn' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface CommodityRate {
  id: string;
  materialName: string;
  unit: string;
  wholesaleRate: number;
  prevRate: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  lastUpdated: string;
}

export interface MaterialCategory {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  colorBg: string;
  itemCount: number;
  trendingBadge?: string;
  image: string;
  subcategories?: string[];
  featuredBrands?: string[];
}

export interface HardwareMerchant {
  id: string;
  name: string;
  ownerName: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  deliveryEtaMinutes: number;
  minOrderValue: number;
  brands: string[];
  mainCategory: string;
  address: string;
  isOnline: boolean;
  avatarUrl: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  isLoggedIn: boolean;
  savedAddresses: { id: string; label: string; address: string }[];
}

export interface Product {
  id: string;
  title: string;
  category: string; // cement, steel, pvc, paints, electricals, tools
  brand: string;
  price: number;
  unit: string;
  moq: number;
  weightSpec: string;
  image: string;
  grade?: string; // e.g. "53 Grade", "PPC", "Fe550D", "CPVC", "Flame Retardant"
  gauge?: string; // e.g. "8mm", "12mm", "16mm", "110mm"
  weightKg: number; // for tonnage barometer calculation
}

export interface CartItem {
  product: Product;
  quantity: number;
}

