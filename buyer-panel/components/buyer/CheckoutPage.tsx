'use client';

import React, { useState } from 'react';
import { 
  FaChevronLeft, 
  FaLocationDot, 
  FaBuilding, 
  FaClock, 
  FaTruckFast, 
  FaShieldHalved, 
  FaCircleCheck, 
  FaCreditCard, 
  FaLandmark, 
  FaMoneyBillWave, 
  FaFileInvoiceDollar, 
  FaLock, 
  FaArrowRight
} from 'react-icons/fa6';
import { HardwareMerchant, CartItem, LocationState } from '../../types/buyer';
import { VehicleOption } from './CartVehicleSelection';
import { Button } from '../ui/Button';

interface CheckoutPageProps {
  merchant: HardwareMerchant;
  cartItems: CartItem[];
  vehicle: VehicleOption;
  location: LocationState;
  onBackToCart: () => void;
  onPlaceOrderSuccess: (orderId: string) => void;
}

export type PaymentMethod = 'upi' | 'netbanking' | 'card' | 'cod' | 'credit';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  merchant,
  cartItems,
  vehicle,
  location,
  onBackToCart,
  onPlaceOrderSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalWeightKg = cartItems.reduce((acc, item) => acc + (item.product.weightKg * item.quantity), 0);
  const totalWeightTons = totalWeightKg / 1000;

  const freightFee = vehicle.freightFee;
  const handlingFee = 250; // Site offloading support fee
  const gstAmount = Math.round(subtotal * 0.18); // 18% GST average on materials
  const grandTotal = subtotal + freightFee + handlingFee + gstAmount;

  const handleConfirmOrder = () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      const generatedOrderId = `MH-${Math.floor(100000 + Math.random() * 900000)}`;
      onPlaceOrderSuccess(generatedOrderId);
    }, 1200);
  };

  return (
    <div className="flex-1 bg-transparent">
      <section className="py-5 sm:py-10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
          
          {/* Top Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4 sm:pb-6">
            <div>
              <div className="mb-2">
                <button
                  onClick={onBackToCart}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  <FaChevronLeft className="h-3 w-3" />
                  <span>Back to Cart &amp; Vehicle Selection</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Checkout &amp; Site Delivery Confirmation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                Verify unloading site address, payment method, and GST tax invoice details
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shrink-0">
              <FaLock className="h-3.5 w-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>

          {/* Master-Detail Split Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT SIDE: Site Details, Logistics Summary & Payment Options */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              
              {/* Delivery Address & Site Details */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaLocationDot className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900">Delivery Address &amp; Site Details</h3>
                      <p className="text-xs text-slate-500 font-normal">Verified unloading site for heavy logistics</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold flex items-center gap-1 border border-emerald-200">
                    <FaCircleCheck className="h-2.5 w-2.5 text-emerald-600" />
                    GPS Pinned
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <FaBuilding className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                      {location.address || 'Kakkanad Construction Site Zone'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-normal space-y-1 pt-1.5 border-t border-slate-200/50">
                    <p>Pincode: <strong className="font-semibold text-slate-800">{location.pinCode || '682030'}</strong></p>
                    <p>Site Access Width: <strong className="font-semibold text-slate-800">{location.siteConstraints?.roadWidth || '12ft+ (Standard Truck Access)'}</strong></p>
                    <p>Site Supervisor Contact: <strong className="font-semibold text-slate-800">+91 98765 43210 (Suresh Nair)</strong></p>
                  </div>
                </div>
              </div>

              {/* Order Summary & Allocated Logistics Vehicle */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FaTruckFast className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900">Allocated Vehicle &amp; Payload</h3>
                      <p className="text-xs text-slate-500 font-normal">Delivery vehicle and timeframe for unloading</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-16 w-20 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/60">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{vehicle.name}</h4>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">{vehicle.subtitle}</p>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-600 font-medium mt-1">
                        <span>Payload: <strong className="text-slate-900">{totalWeightTons.toFixed(2)} Tons</strong></span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <FaClock className="h-3 w-3 text-orange-500" />
                          ETA ~{vehicle.etaMinutes} Mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 text-slate-900 text-xs font-semibold text-center shrink-0">
                    Freight: ₹{freightFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaCreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900">Select Payment Method</h3>
                      <p className="text-xs text-slate-500 font-normal">Instant digital payment or B2B credit terms</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-white border-2 border-[#FF6500] shadow-lg ring-2 ring-[#FF6500]/20'
                        : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaMoneyBillWave className="h-4 w-4 text-emerald-600" />
                        UPI / GPay / BHIM
                      </span>
                      {paymentMethod === 'upi' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                      Zero transaction fee. Instant payment confirmation &amp; fast site dispatch.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'bg-white border-2 border-[#FF6500] shadow-lg ring-2 ring-[#FF6500]/20'
                        : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaLandmark className="h-4 w-4 text-blue-600" />
                        NetBanking / NEFT
                      </span>
                      {paymentMethod === 'netbanking' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                      Direct corporate bank transfer for large construction material orders.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-white border-2 border-[#FF6500] shadow-lg ring-2 ring-[#FF6500]/20'
                        : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaCreditCard className="h-4 w-4 text-purple-600" />
                        Debit / Credit Card
                      </span>
                      {paymentMethod === 'card' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                      All major Visa, MasterCard, and RuPay cards accepted securely.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === 'credit'
                        ? 'bg-white border-2 border-[#FF6500] shadow-lg ring-2 ring-[#FF6500]/20'
                        : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaFileInvoiceDollar className="h-4 w-4 text-[#FF6500]" />
                        Wholesale B2B Credit (15 Days)
                      </span>
                      {paymentMethod === 'credit' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                      Pre-approved contractor credit line with 15-day GST invoice settlement.
                    </p>
                  </button>

                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Order Total & Tax Invoice Summary */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-6">
              
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
                
                <div className="border-b border-slate-100 pb-3.5 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Fulfill Merchant &amp; Tax Invoice
                  </div>
                  <h3 className="font-semibold text-base text-slate-900">{merchant.name}</h3>
                  <p className="text-xs text-slate-500 font-normal">{merchant.address}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Materials Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Allocated Freight Charge ({vehicle.name})</span>
                    <span className="font-semibold text-slate-900">₹{freightFee.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Site Unloading Support</span>
                    <span className="font-semibold text-slate-900">₹{handlingFee.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated GST (18% Tax Invoice)</span>
                    <span className="font-semibold text-slate-900">₹{gstAmount.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">Grand Total</span>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-semibold text-[#FF6500]">
                        ₹{grandTotal.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Incl. GST Invoice &amp; Unloading</div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  disabled={isPlacingOrder}
                  onClick={handleConfirmOrder}
                  icon={<FaArrowRight className="h-3.5 w-3.5" />}
                  className="w-full mt-4 py-3 sm:py-3.5"
                >
                  {isPlacingOrder ? 'Processing Supply Order...' : 'Place Supply Order Now'}
                </Button>

                <div className="text-center text-[11px] text-slate-400 font-normal pt-1">
                  By placing this order, you agree to MaterialHub's Wholesale B2B Terms &amp; Conditions.
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
