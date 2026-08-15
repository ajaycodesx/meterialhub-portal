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
    <div className="flex-1 bg-[#F8FAFC] py-2 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-6">
        
        <div>
          <button
            onClick={onBackToCart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <FaChevronLeft className="h-3 w-3" />
            <span>Back to Cart &amp; Vehicle Selection</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Checkout &amp; Site Delivery Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Verify unloading site address, payment method, and GST tax invoice details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                    <FaLocationDot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Delivery Address &amp; Site Details</h3>
                    <p className="text-xs text-slate-500 font-normal">Verified unloading site for heavy logistics</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <FaBuilding className="h-3 w-3 text-orange-400" />
                    {location.address || 'Kakkanad Construction Site Zone'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                    <FaCircleCheck className="h-2.5 w-2.5" />
                    GPS Pinned
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-normal space-y-1 pt-1">
                  <p>Pincode: <strong className="font-semibold text-slate-800">{location.pinCode || '682030'}</strong></p>
                  <p>Site Access Width: <strong className="font-semibold text-slate-800">{location.siteConstraints?.roadWidth || '12ft+ (Standard Truck Access)'}</strong></p>
                  <p>Contact Phone: <strong className="font-semibold text-slate-800">+91 98765 43210</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaTruckFast className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Order Summary &amp; Delivery Slot</h3>
                    <p className="text-xs text-slate-500 font-normal">Allocated vehicle and supply timeframe</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 flex items-center gap-4">
                <div className="h-16 w-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs text-slate-900">{vehicle.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-normal mt-0.5">
                    <span>Payload: <strong>{totalWeightTons.toFixed(2)} Tons</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FaClock className="h-2.5 w-2.5 text-slate-400" />
                      ETA ~{vehicle.etaMinutes} Mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="p-3 rounded-2xl bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{product.title}</span>
                      <span className="text-slate-500 font-normal ml-2">x {quantity} {product.unit}s</span>
                    </div>
                    <span className="font-semibold text-slate-900">₹{(product.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaCreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Payment Method Selector</h3>
                    <p className="text-xs text-slate-500 font-normal">Choose digital UPI, NetBanking, COD, or B2B Credit</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-orange-50/80 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaMoneyBillWave className="h-3.5 w-3.5 text-emerald-600" />
                      UPI / BHIM Instant
                    </span>
                    {paymentMethod === 'upi' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal">Google Pay, PhonePe, Paytm, BHIM</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-orange-50/80 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaLandmark className="h-3.5 w-3.5 text-emerald-600" />
                      NetBanking
                    </span>
                    {paymentMethod === 'netbanking' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal">HDFC, ICICI, SBI, Axis Bank</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'bg-orange-50/80 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaTruckFast className="h-3.5 w-3.5 text-emerald-600" />
                      Pay on Unloading (COD)
                    </span>
                    {paymentMethod === 'cod' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal">Pay cash or UPI after material inspection</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    paymentMethod === 'credit'
                      ? 'bg-orange-50/80 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaFileInvoiceDollar className="h-3.5 w-3.5 text-emerald-600" />
                      B2B Credit Line
                    </span>
                    {paymentMethod === 'credit' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal">30-day builder credit line facility</p>
                </button>

              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900">Billing &amp; GST Tax Breakdown</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold flex items-center gap-1">
                  <FaShieldHalved className="h-2.5 w-2.5 text-emerald-600" />
                  GST Tax Invoice
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Materials Subtotal (Excl. GST)</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Logistics Freight ({vehicle.name})</span>
                  <span className="font-semibold text-slate-900">₹{freightFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Site Offloading &amp; Support Fee</span>
                  <span className="font-semibold text-slate-900">₹{handlingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated GST (18% Input Credit)</span>
                  <span className="font-semibold text-slate-900">₹{gstAmount.toLocaleString()}</span>
                </div>

                <div className="pt-2 flex justify-between text-sm font-semibold text-slate-900">
                  <span>Grand Total Payable</span>
                  <span className="text-[#FF6500] text-base">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-50/60 text-slate-700 text-xs font-normal flex items-start gap-2">
                <FaLock className="h-3.5 w-3.5 text-[#FF6500] shrink-0 mt-0.5" />
                <span>
                  GST Tax Invoice with Input Tax Credit (ITC) will be generated automatically upon site unloading.
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                isLoading={isPlacingOrder}
                onClick={handleConfirmOrder}
                icon={<FaArrowRight className="h-3.5 w-3.5" />}
                className="w-full py-3.5 text-sm"
              >
                Place Supply Order
              </Button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
