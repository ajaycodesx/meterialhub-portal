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
  FaLocationDot,
  FaArrowRight,
  FaWeightHanging,
  FaTriangleExclamation,
  FaCartShopping,
  FaChevronRight,
  FaReceipt,
  FaStore,
  FaPhone
} from 'react-icons/fa6';
import { HardwareMerchant, CartItem } from '../../types/buyer';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

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
  const { showToast } = useAppContext();
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
      <section className="pt-4 sm:pt-5 lg:pt-6 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={onBackToCatalog}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#FF6500] shadow-xs hover:shadow-md flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Back to Store Catalog"
                aria-label="Back to Catalog"
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-0.5">
                  <span className="hover:text-slate-600 transition-colors cursor-pointer" onClick={onBackToCatalog}>Store Catalog</span>
                  <FaChevronRight className="h-2.5 w-2.5 text-slate-300" />
                  <span className="text-slate-700 font-semibold">Cart &amp; Vehicle Allocation</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                  Store Cart &amp; Vehicle Allocation
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Review your construction material items, calculated payload weight, and select delivery vehicle
                </p>
              </div>
            </div>

            <div className="flex items-center self-start sm:self-center shrink-0">
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-xs">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            
            <div className="lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-6">
              
              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center text-xl shrink-0 shadow-xs">
                      {merchant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900">{merchant.name}</h3>
                        {merchant.verified && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <FaShieldHalved className="h-3 w-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5 mt-0.5">
                        <FaBuilding className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span>{merchant.address}</span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
                    <FaLocationDot className="h-3 w-3 text-[#FF6500]" />
                    {merchant.distanceKm} KM Away
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-50/70 rounded-3xl space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-orange-100 text-[#FF6500] flex items-center justify-center mx-auto shadow-xs">
                      <FaCartShopping className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Your wholesale cart is empty</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-normal leading-relaxed">
                        You haven&apos;t added any construction supplies yet. Browse Cement, TMT Steel Rods, PVC Pipes, and Hardware with direct factory pricing and same-day site delivery.
                      </p>
                    </div>
                    <Button
                      onClick={onBackToCatalog}
                      variant="primary"
                      size="md"
                      icon={<FaArrowRight className="h-3.5 w-3.5" />}
                      className="mx-auto"
                    >
                      Browse Store Catalog &amp; Materials
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                      <span>Order Items ({cartItems.length})</span>
                      <span>Subtotal Price</span>
                    </div>

                    {cartItems.map((item) => {
                      const product = item.product;
                      const itemTotal = product.price * item.quantity;
                      const itemWeightTons = ((product.weightKg || 50) * item.quantity) / 1000;

                      return (
                        <div
                          key={product.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 shadow-2xs transition-all"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="h-16 w-16 rounded-2xl bg-white p-1 shrink-0 overflow-hidden shadow-2xs border border-slate-100">
                              <img
                                src={product.image || '/images/products/cement_bag.jpg'}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">{product.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="text-[#FF6500] font-medium">{product.brand}</span>
                                {product.grade && (
                                  <>
                                    <span className="h-2.5 w-px bg-slate-300 inline-block" />
                                    <span>{product.grade}</span>
                                  </>
                                )}
                                <span className="h-2.5 w-px bg-slate-300 inline-block" />
                                <span>{product.unit} ({itemWeightTons.toFixed(2)} Tons)</span>
                              </div>
                              <div className="text-xs font-semibold text-slate-900 mt-1">
                                ₹{product.price} <span className="text-[10px] font-normal text-slate-400">/ {product.unit}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                            <div className="flex items-center bg-white rounded-xl shadow-2xs p-1">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    onUpdateQuantity(product.id, item.quantity - 1);
                                  } else {
                                    onRemoveItem(product.id);
                                  }
                                }}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#FF6500] hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Decrease quantity"
                              >
                                <FaMinus className="h-2.5 w-2.5" />
                              </button>
                              <span className="w-9 text-center text-xs font-semibold text-slate-900">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(product.id, item.quantity + 1)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#FF6500] hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Increase quantity"
                              >
                                <FaPlus className="h-2.5 w-2.5" />
                              </button>
                            </div>

                            <div className="text-right min-w-[75px]">
                              <div className="text-sm font-semibold text-slate-900">₹{itemTotal.toLocaleString()}</div>
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

              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">Dynamic Vehicle Allocation</h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">Select logistics vehicle based on payload weight</p>
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
                        Your total cart weight ({totalWeightTons.toFixed(2)} Tons) exceeds {activeVehicle.name}&apos;s limit of {activeVehicle.capacityTons} Tons. Switch to a higher capacity vehicle.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3.5">
                  {VEHICLES.map((vehicle) => {
                    const isSelected = vehicle.id === activeVehicle.id;
                    const isRecommended = vehicle.id === recommendedVehicle.id;
                    const fitsLoad = totalWeightTons <= vehicle.capacityTons;
                    const fillPct = Math.min(100, Math.round((totalWeightTons / vehicle.capacityTons) * 100));
                    const meterColor = !fitsLoad ? 'bg-red-500' : fillPct > 80 ? 'bg-amber-500' : 'bg-emerald-500';

                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => {
                          setSelectedVehicleId(vehicle.id);
                          showToast(`Selected ${vehicle.name} (${vehicle.capacityTons}T Payload)`, 'info');
                        }}
                        className={`relative rounded-3xl p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                            : 'bg-slate-50/60 hover:bg-slate-100/70 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-lg bg-[#FF6500] text-white text-[10px] font-semibold shadow-xs flex items-center gap-1">
                            <FaCircleCheck className="h-2.5 w-2.5" />
                            Recommended Match
                          </span>
                        )}

                        <div className="flex items-start gap-3.5">
                          <div className="h-16 w-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-2xs">
                            <img
                              src={vehicle.image}
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-xs text-slate-900">{vehicle.name}</h4>
                              <span className="text-xs font-semibold text-slate-900">₹{vehicle.freightFee}</span>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 font-normal line-clamp-1">{vehicle.description}</p>

                            <div className="space-y-1 pt-0.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className={`font-semibold ${fitsLoad ? 'text-emerald-700' : 'text-red-600'}`}>
                                  {totalWeightTons.toFixed(2)} / {vehicle.capacityTons} Tons ({fillPct}%)
                                </span>
                                <span className="text-slate-500 font-medium">ETA: ~{vehicle.etaMinutes} Mins</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-lg overflow-hidden">
                                <div
                                  className={`h-full ${meterColor} transition-all duration-300 rounded-lg`}
                                  style={{ width: `${Math.min(100, (totalWeightTons / vehicle.capacityTons) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24 self-start">
              
              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900 tracking-tight">Order Cost Summary</h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Direct merchant rates + logistics</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaReceipt className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Materials Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-slate-900">₹{subtotalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Allocated Freight Charge ({activeVehicle.name})</span>
                    <span className="font-semibold text-slate-900">₹{activeVehicle.freightFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-slate-900 pt-3 border-t border-slate-100">
                    <span>Total Estimated Cost</span>
                    <span className="text-[#FF6500] text-base sm:text-lg font-semibold">₹{(subtotalPrice + activeVehicle.freightFee).toLocaleString()}</span>
                  </div>
                </div>

                {isOverload && (
                  <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-medium">
                    Cannot checkout: Payload exceeds {activeVehicle.name} capacity. Please select a larger vehicle.
                  </div>
                )}

                <Button
                  variant="primary"
                  size="md"
                  disabled={cartItems.length === 0 || isOverload}
                  onClick={() => onProceedToCheckout(activeVehicle, cartItems)}
                  icon={<FaArrowRight className="h-3.5 w-3.5" />}
                  className="w-full py-3 sm:py-3.5"
                >
                  Proceed to Checkout &amp; Address
                </Button>

                <div className="text-center text-[11px] text-slate-400 font-normal pt-1">
                  Tax invoice &amp; unloading details are confirmed at next step.
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
