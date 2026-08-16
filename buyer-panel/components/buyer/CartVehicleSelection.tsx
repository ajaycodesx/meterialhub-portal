'use client';

import React, { useState, useMemo } from 'react';
import { 
  FaChevronLeft, 
  FaTrashCan, 
  FaMinus, 
  FaPlus, 
  FaTruckFast, 
  FaShieldHalved, 
  FaCircleCheck, 
  FaBuilding, 
  FaStar, 
  FaLocationDot,
  FaArrowRight,
  FaWeightHanging,
  FaTriangleExclamation
} from 'react-icons/fa6';
import { HardwareMerchant, CartItem } from '../../types/buyer';
import { Button } from '../ui/Button';

export interface VehicleOption {
  id: string;
  name: string;
  subtitle: string;
  capacityTons: number;
  freightFee: number;
  etaMinutes: number;
  image: string;
  description: string;
}

const VEHICLES: VehicleOption[] = [
  {
    id: 'mini_truck',
    name: 'Tata Ace / Compact Pickup',
    subtitle: 'Light Payload Access',
    capacityTons: 1.5,
    freightFee: 750,
    etaMinutes: 45,
    image: '/images/mini_truck.jpg',
    description: 'Best for narrow streets & small loads up to 1.5 Tons (e.g. 30 Cement Bags or Plumbing Supplies).'
  },
  {
    id: 'pickup_truck',
    name: 'Mahindra Bolero Pickup',
    subtitle: 'Medium Payload Delivery',
    capacityTons: 3.5,
    freightFee: 1250,
    etaMinutes: 60,
    image: '/images/pickup_truck.jpg',
    description: 'Ideal for medium loads up to 3.5 Tons (e.g. 70 Cement Bags or mixed Steel TMT Rods).'
  },
  {
    id: 'commercial_truck',
    name: 'Standard 6-Wheeler Commercial Truck',
    subtitle: 'Bulk Supply Transport',
    capacityTons: 10.0,
    freightFee: 2800,
    etaMinutes: 90,
    image: '/images/commercial_truck.jpg',
    description: 'Heavy duty commercial dump truck for bulk loads up to 10 Tons.'
  },
  {
    id: 'heavy_truck',
    name: 'Heavy 10-Wheeler Logistics Truck',
    subtitle: 'Full Site Supply Transport',
    capacityTons: 16.0,
    freightFee: 4500,
    etaMinutes: 120,
    image: '/images/heavy_truck.jpg',
    description: 'Maximum capacity truck for heavy industrial loads up to 16 Tons.'
  }
];

interface CartVehicleSelectionProps {
  merchant: HardwareMerchant;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onBackToCatalog: () => void;
  onProceedToCheckout: (selectedVehicle: VehicleOption, finalCart: CartItem[]) => void;
}

export const CartVehicleSelection: React.FC<CartVehicleSelectionProps> = ({
  merchant,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onBackToCatalog,
  onProceedToCheckout
}) => {
  const totalWeightKg = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.weightKg * item.quantity), 0);
  }, [cartItems]);

  const totalWeightTons = totalWeightKg / 1000;

  const subtotalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const recommendedVehicle = useMemo(() => {
    if (totalWeightTons <= 1.5) return VEHICLES[0];
    if (totalWeightTons <= 3.5) return VEHICLES[1];
    if (totalWeightTons <= 10.0) return VEHICLES[2];
    return VEHICLES[3];
  }, [totalWeightTons]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(recommendedVehicle.id);

  const activeVehicle = VEHICLES.find((v) => v.id === selectedVehicleId) || recommendedVehicle;

  const isOverload = totalWeightTons > activeVehicle.capacityTons;

  return (
    <div className="flex-1 bg-transparent">
      <section className="py-5 sm:py-10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
          
          {/* Top Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4 sm:pb-6">
            <div>
              <div className="mb-2">
                <button
                  onClick={onBackToCatalog}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  <FaChevronLeft className="h-3 w-3" />
                  <span>Back to Store Catalog</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Store Cart &amp; Vehicle Allocation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                Review your construction material items, calculated payload weight, and select delivery vehicle
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
              <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                <FaWeightHanging className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Total Cart Weight</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                  {totalWeightTons.toFixed(2)} Tons <span className="text-[10px] text-slate-400 font-normal">({totalWeightKg.toLocaleString()} kg)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Master-Detail Split Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT SIDE: Cart Items & Merchant Store Card */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              
              {/* Merchant Supplier Header Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center text-xl shrink-0 shadow-xs border border-slate-700">
                      {merchant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900">{merchant.name}</h3>
                        {merchant.verified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                            <FaShieldHalved className="h-2.5 w-2.5 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5 mt-0.5">
                        <FaBuilding className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span>{merchant.address}</span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-50 text-[#FF6500] text-xs font-semibold shrink-0 border border-orange-100">
                    <FaLocationDot className="h-3 w-3" />
                    {merchant.distanceKm} KM Away
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm font-semibold text-slate-700">Your store cart is currently empty</p>
                    <Button onClick={onBackToCatalog} variant="primary" size="md" className="mt-4">
                      Return to Product Catalog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                      <span>Order Items ({cartItems.length})</span>
                      <span>Subtotal Price</span>
                    </div>

                    {cartItems.map(({ product, quantity }) => {
                      const itemTotalKg = product.weightKg * quantity;
                      const itemTotalPrice = product.price * quantity;

                      return (
                        <div key={product.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                          <div className="flex items-center gap-3.5">
                            <div className="h-16 w-16 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60 shadow-2xs">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                                {product.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6500] font-semibold">
                                  {product.brand}
                                </span>
                                {product.grade && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                                    {product.grade}
                                  </span>
                                )}
                                {product.gauge && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                    {product.gauge}
                                  </span>
                                )}
                                <span className="text-slate-500 font-normal">
                                  &bull; {product.weightSpec} ({itemTotalKg} kg)
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-slate-900 pt-0.5">
                                ₹{product.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {product.unit}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                            <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 h-9 border border-slate-200/80 shadow-2xs">
                              <button
                                onClick={() => {
                                  if (quantity <= product.moq) onRemoveItem(product.id);
                                  else onUpdateQuantity(product.id, quantity - 1);
                                }}
                                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <FaMinus className="h-2.5 w-2.5" />
                              </button>
                              <span className="w-8 text-center font-semibold text-xs text-slate-900">
                                {quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <FaPlus className="h-2.5 w-2.5" />
                              </button>
                            </div>

                            <div className="text-right min-w-[85px]">
                              <div className="text-xs sm:text-sm font-semibold text-slate-900">₹{itemTotalPrice.toLocaleString()}</div>
                            </div>

                            <button
                              onClick={() => onRemoveItem(product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                              title="Remove item"
                            >
                              <FaTrashCan className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDE: Dynamic Vehicle Allocation Panel */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-6">
              
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900">Dynamic Vehicle Allocation</h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Select logistics vehicle based on payload weight</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaTruckFast className="h-4.5 w-4.5" />
                  </div>
                </div>

                {isOverload && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-3">
                    <FaTriangleExclamation className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Payload Exceeds Vehicle Capacity!</span>
                      <p className="text-[11px] font-normal text-amber-700 mt-0.5">
                        Your total cart weight ({totalWeightTons.toFixed(2)} Tons) exceeds {activeVehicle.name}'s limit of {activeVehicle.capacityTons} Tons. Switch to a higher capacity vehicle.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3.5">
                  {VEHICLES.map((vehicle) => {
                    const isSelected = vehicle.id === activeVehicle.id;
                    const isRecommended = vehicle.id === recommendedVehicle.id;
                    const fitsLoad = totalWeightTons <= vehicle.capacityTons;

                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={`relative rounded-2xl p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-2 border-[#FF6500] shadow-lg ring-2 ring-[#FF6500]/20'
                            : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-[#FF6500] text-white text-[10px] font-semibold shadow-xs flex items-center gap-1">
                            <FaCircleCheck className="h-2.5 w-2.5" />
                            Recommended Match
                          </span>
                        )}

                        <div className="flex items-start gap-3.5">
                          <div className="h-16 w-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                            <img
                              src={vehicle.image}
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-xs text-slate-900">{vehicle.name}</h4>
                              <span className="text-xs font-semibold text-slate-900">₹{vehicle.freightFee}</span>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 font-normal line-clamp-2">{vehicle.description}</p>

                            <div className="flex items-center justify-between pt-1.5 text-[10px]">
                              <span className={`font-semibold ${fitsLoad ? 'text-emerald-700' : 'text-amber-600'}`}>
                                Payload: Max {vehicle.capacityTons} Tons
                              </span>
                              <span className="text-slate-500 font-medium">ETA: ~{vehicle.etaMinutes} Mins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown Summary & Checkout Button */}
                <div className="pt-4 space-y-3.5 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Materials Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{subtotalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Allocated Freight Charge ({activeVehicle.name})</span>
                    <span className="font-semibold text-slate-900">₹{activeVehicle.freightFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2.5 border-t border-slate-100">
                    <span>Total Estimated Cost</span>
                    <span className="text-[#FF6500] text-base">₹{(subtotalPrice + activeVehicle.freightFee).toLocaleString()}</span>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    disabled={cartItems.length === 0 || isOverload}
                    onClick={() => onProceedToCheckout(activeVehicle, cartItems)}
                    icon={<FaArrowRight className="h-3.5 w-3.5" />}
                    className="w-full mt-4 py-3 sm:py-3.5"
                  >
                    Proceed to Checkout &amp; Address
                  </Button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
