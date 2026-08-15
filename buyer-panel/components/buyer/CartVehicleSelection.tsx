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
    <div className="flex-1 bg-[#F8FAFC] py-2 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-6">
        
        <div>
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <FaChevronLeft className="h-3 w-3" />
            <span>Back to Store Catalog</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Store Cart &amp; Vehicle Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Review your construction material items, calculated weight, and select delivery vehicle
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Total Cart Weight</div>
              <div className="text-sm font-semibold text-slate-900">
                {totalWeightTons.toFixed(2)} Tons <span className="text-xs text-slate-500 font-normal">({totalWeightKg.toLocaleString()} kg)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-4 relative">
              <div className="absolute -top-3.5 right-6 flex items-center gap-2 z-10">
                {merchant.verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-sm">
                    <FaShieldHalved className="h-3 w-3 text-white" />
                    Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#FF6500] text-white text-xs font-semibold shadow-sm">
                  <FaLocationDot className="h-3 w-3 text-white" />
                  {merchant.distanceKm} KM Away
                </span>
              </div>

              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center text-lg shrink-0">
                    {merchant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{merchant.name}</h3>
                    <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5 mt-0.5">
                      <FaBuilding className="h-3 w-3 text-orange-400 shrink-0" />
                      <span>{merchant.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold text-slate-700">Your store cart is currently empty</p>
                  <Button onClick={onBackToCatalog} variant="primary" size="md" className="mt-4">
                    Return to Product Catalog
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {cartItems.map(({ product, quantity }) => {
                    const itemTotalKg = product.weightKg * quantity;
                    const itemTotalPrice = product.price * quantity;

                    return (
                      <div key={product.id} className="p-3 rounded-2xl bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
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
                              <span className="text-slate-400 font-normal">
                                • {product.weightSpec} ({itemTotalKg} kg)
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-900 pt-0.5">
                              ₹{product.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {product.unit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-center gap-1.5 bg-slate-100 rounded-2xl p-1 h-9">
                            <button
                              onClick={() => {
                                if (quantity <= product.moq) onRemoveItem(product.id);
                                else onUpdateQuantity(product.id, quantity - 1);
                              }}
                              className="h-7 w-7 rounded-xl bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <FaMinus className="h-2 w-2" />
                            </button>
                            <span className="w-8 text-center font-semibold text-xs text-slate-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                              className="h-7 w-7 rounded-xl bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <FaPlus className="h-2 w-2" />
                            </button>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <div className="text-xs font-semibold text-slate-900">₹{itemTotalPrice.toLocaleString()}</div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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

          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Dynamic Vehicle Allocation</h3>
                  <p className="text-xs text-slate-500 font-normal">Select logistics vehicle based on load payload</p>
                </div>
                <div className="h-8 w-8 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                  <FaTruckFast className="h-4 w-4" />
                </div>
              </div>

              {isOverload && (
                <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-800 text-xs font-medium flex items-start gap-2.5">
                  <FaTriangleExclamation className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Payload Exceeds Selected Vehicle Limit!</span>
                    <p className="text-[11px] font-normal text-amber-700 mt-0.5">
                      Your total cart weight ({totalWeightTons.toFixed(2)} Tons) exceeds {activeVehicle.name}'s limit of {activeVehicle.capacityTons} Tons. Switch to a higher capacity vehicle.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {VEHICLES.map((vehicle) => {
                  const isSelected = vehicle.id === activeVehicle.id;
                  const isRecommended = vehicle.id === recommendedVehicle.id;
                  const fitsLoad = totalWeightTons <= vehicle.capacityTons;

                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`relative rounded-2xl p-3.5 sm:p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/80 border-2 border-[#FF6500] shadow-xs'
                          : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      {isRecommended && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#FF6500] text-white text-[10px] font-semibold shadow-xs flex items-center gap-1">
                          <FaCircleCheck className="h-2.5 w-2.5" />
                          Recommended Load Match
                        </span>
                      )}

                      <div className="flex items-start gap-3.5">
                        <div className="h-20 w-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
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
                          
                          <p className="text-[10px] text-slate-500 font-normal">{vehicle.description}</p>

                          <div className="flex items-center justify-between pt-1 text-[10px]">
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

              <div className="pt-2 space-y-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Materials Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Allocated Freight Charge ({activeVehicle.name})</span>
                  <span className="font-semibold text-slate-900">₹{activeVehicle.freightFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2">
                  <span>Total Estimated Cost</span>
                  <span className="text-[#FF6500]">₹{(subtotalPrice + activeVehicle.freightFee).toLocaleString()}</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={cartItems.length === 0 || isOverload}
                  onClick={() => onProceedToCheckout(activeVehicle, cartItems)}
                  icon={<FaArrowRight className="h-3.5 w-3.5" />}
                  className="w-full mt-2"
                >
                  Proceed to Checkout &amp; Address
                </Button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
