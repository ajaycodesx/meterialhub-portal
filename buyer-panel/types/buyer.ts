export interface LocationState {
  address: string;
  pinCode: string;
  isServiceable: boolean;
  distanceKm: number;
  coordinates?: { lat: number; lng: number };
  siteConstraints?: {
    roadWidth: string;
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
  category: string;
  brand: string;
  price: number;
  unit: string;
  moq: number;
  weightSpec: string;
  image: string;
  grade?: string;
  gauge?: string;
  weightKg: number;
  stockQty?: number;
  merchantId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

