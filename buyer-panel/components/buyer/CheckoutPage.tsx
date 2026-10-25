'use client';

import React, { useState } from 'react';
import {
  FaChevronLeft,
  FaLocationDot,
  FaBuilding,
  FaClock,
  FaTruckFast,
  FaCircleCheck,
  FaCreditCard,
  FaLandmark,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaLock,
  FaArrowRight,
  FaShieldHalved,
  FaSpinner,
  FaXmark,
  FaBolt,
  FaCheck,
  FaChevronRight
} from 'react-icons/fa6';
import { HardwareMerchant, CartItem, LocationState } from '../../types/buyer';
import { VehicleOption } from './CartVehicleSelection';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { buyerApi, authApi, apiClient, paymentApi } from '../../lib/api';
import { PageBanner } from './PageBanner';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState<{
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    keyId: string;
    method: PaymentMethod;
  } | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerifiedSuccess, setPaymentVerifiedSuccess] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalWeightKg = cartItems.reduce((acc, item) => acc + (item.product.weightKg * item.quantity), 0);
  const totalWeightTons = totalWeightKg / 1000;

  const freightFee = vehicle.freightFee;
  const handlingFee = 250;
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + freightFee + handlingFee + gstAmount;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmOrder = async () => {
    setIsPlacingOrder(true);
    setError(null);

    try {
      const demoEmail = process.env.NEXT_PUBLIC_DEMO_BUYER_EMAIL || 'buyer@materialhub.in';
      const demoPassword = process.env.NEXT_PUBLIC_DEMO_BUYER_PASSWORD || 'buyer123';

      if (!localStorage.getItem('access_token')) {
        try {
          const auth: any = await authApi.login(demoEmail, demoPassword);
          if (auth?.access_token) {
            apiClient.setToken(auth.access_token);
          }
        } catch (loginErr) {
          console.warn('Initial auto-login attempt failed:', loginErr);
        }
      }

      const orderData = {
        merchantId: merchant.id,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        deliveryAddress: location.address,
        pincode: location.pinCode,
        siteConstraints: {
          roadWidth: location.siteConstraints?.roadWidth || 'Standard',
          craneNeeded: location.siteConstraints?.craneNeeded || false,
          unloadingTimeSlot: location.siteConstraints?.unloadingTimeSlot || 'Flexible'
        },
        paymentMode: paymentMethod === 'cod'
          ? 'Cash on Unloading'
          : paymentMethod === 'credit'
          ? 'Wholesale B2B Credit'
          : 'Online Payment (Razorpay)'
      };

      let response: any;
      try {
        response = await buyerApi.createOrder(orderData);
      } catch (orderErr: any) {
        if (orderErr?.status === 401 || orderErr?.message?.includes('credentials')) {
          const auth: any = await authApi.login(demoEmail, demoPassword);
          if (auth?.access_token) {
            apiClient.setToken(auth.access_token);
            response = await buyerApi.createOrder(orderData);
          } else {
            throw orderErr;
          }
        } else {
          throw orderErr;
        }
      }

      const placedId = response?.orderId || response?.id || `MH-${Date.now().toString().slice(-6)}`;

      if (paymentMethod === 'cod' || paymentMethod === 'credit') {
        onPlaceOrderSuccess(placedId);
        return;
      }

      const paymentOrder: any = await paymentApi.createOrder({
        order_id: placedId,
        amount: grandTotal * 100,
        currency: 'INR',
        receipt: `rcpt_${placedId}`
      });

      const keyId = paymentOrder.key_id || 'sim_key_id';

      if (keyId.startsWith('rzp_')) {
        const loaded = await loadRazorpayScript();
        if (loaded && (window as any).Razorpay) {
          const options = {
            key: keyId,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency || 'INR',
            name: 'MaterialHub B2B',
            description: `Order ${placedId} - ${merchant.name}`,
            order_id: paymentOrder.id,
            handler: async (resp: any) => {
              try {
                await paymentApi.verifyPayment({
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature
                });
                onPlaceOrderSuccess(placedId);
              } catch (verifyErr: any) {
                setError(verifyErr.message || 'Payment verification failed');
              }
            },
            prefill: {
              name: 'Ajay Construction Corp',
              email: 'buyer@materialhub.in',
              contact: '+919876543210'
            },
            theme: {
              color: '#FF6500'
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }
      }

      setRazorpayOrderData({
        orderId: placedId,
        razorpayOrderId: paymentOrder.id,
        amount: grandTotal,
        keyId,
        method: paymentMethod
      });
      setShowRazorpayModal(true);

    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
      console.error('Order placement error:', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleVerifySimulatedPayment = async () => {
    if (!razorpayOrderData) return;
    setIsVerifyingPayment(true);
    try {
      const simPaymentId = `pay_sim_${Date.now()}`;
      await paymentApi.verifyPayment({
        razorpay_order_id: razorpayOrderData.razorpayOrderId,
        razorpay_payment_id: simPaymentId,
        razorpay_signature: 'sim_verified_signature'
      });
      setPaymentVerifiedSuccess(true);
      setTimeout(() => {
        setShowRazorpayModal(false);
        onPlaceOrderSuccess(razorpayOrderData.orderId);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed. Please try again.');
      setShowRazorpayModal(false);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent">
      <PageBanner
        onBack={onBackToCart}
        backTitle="Back to Cart & Vehicle Selection"
        breadcrumbs={[
          { label: 'Store Cart', onClick: onBackToCart },
          { label: 'Checkout Confirmation' }
        ]}
        title="Checkout & Site Delivery Confirmation"
        subtitle="Verify unloading site address, payment method, and GST tax invoice details"
        rightContent={(
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xs text-xs font-semibold text-emerald-600">
            <FaLock className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-slate-800">256-Bit SSL Encrypted Checkout</span>
          </div>
        )}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

            <div className="lg:col-span-7 space-y-5 sm:space-y-6">

              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaLocationDot className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">Delivery Address &amp; Site Details</h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 leading-relaxed">Verified unloading site for heavy logistics</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0 ml-2">
                    <FaCircleCheck className="h-3 w-3 text-emerald-600" />
                    <span className="hidden xs:inline">GPS Pinned</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 space-y-2">
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

              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-4">
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

                <div className="p-4 rounded-2xl bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-16 w-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{vehicle.name}</h4>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">{vehicle.subtitle}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium mt-1">
                        <span>Payload: <strong className="text-slate-900">{totalWeightTons.toFixed(2)} Tons</strong></span>
                        <span className="h-2.5 w-px bg-slate-300 inline-block" />
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <FaClock className="h-3 w-3 text-orange-500" />
                          ETA ~{vehicle.etaMinutes} Mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-white shadow-2xs text-slate-900 text-xs font-semibold text-center shrink-0">
                    Freight: ₹{freightFee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaCreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">Select Payment Method</h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 leading-relaxed">Instant digital payment or B2B credit terms</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 shadow-2xs hover:shadow-xs'
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
                        ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 shadow-2xs hover:shadow-xs'
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
                        ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 shadow-2xs hover:shadow-xs'
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
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaTruckFast className="h-4 w-4 text-amber-600" />
                        Cash on Unloading
                      </span>
                      {paymentMethod === 'cod' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                      Inspect goods at site and verify count before handing payment to driver.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer sm:col-span-2 ${
                      paymentMethod === 'credit'
                        ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 shadow-2xs hover:shadow-xs'
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

            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24 self-start">
              
              <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm space-y-5">
                
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

                {error && (
                  <div className="mt-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-medium shadow-xs">
                    {error}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="md"
                  disabled={isPlacingOrder}
                  onClick={handleConfirmOrder}
                  icon={isPlacingOrder ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaArrowRight className="h-3.5 w-3.5" />}
                  className="w-full mt-4 py-3 sm:py-3.5"
                >
                  {isPlacingOrder
                    ? 'Processing Supply Order...'
                    : paymentMethod === 'cod'
                    ? 'Place Order (Cash on Unloading)'
                    : paymentMethod === 'credit'
                    ? 'Confirm B2B Credit Order'
                    : `Proceed to Pay ₹${grandTotal.toLocaleString()}`}
                </Button>

                <div className="text-center text-[11px] text-slate-400 font-normal pt-1">
                  By placing this order, you agree to MaterialHub&apos;s Wholesale B2B Terms &amp; Conditions.
                </div>

              </div>

            </div>

          </div>
        </div>

      {showRazorpayModal && razorpayOrderData && (
        <Modal
          isOpen={showRazorpayModal}
          onClose={() => {
            if (!isVerifyingPayment) setShowRazorpayModal(false);
          }}
          icon={<FaCreditCard className="h-5 w-5" />}
          iconBg="bg-orange-500/15 border border-orange-500/25"
          iconColor="text-[#FF6500]"
          title="Complete Online Payment"
          subtitle={`Merchant: ${merchant.name} · Razorpay Secure 256-Bit SSL`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#141d33] border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Order Reference</span>
                <span className="font-semibold text-slate-200">{razorpayOrderData.orderId}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Gateway Transaction Ref</span>
                <span className="font-mono text-[11px] text-slate-300">{razorpayOrderData.razorpayOrderId}</span>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-200">Total Payable</span>
                <span className="text-xl font-semibold text-[#FF6500]">
                  ₹{razorpayOrderData.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <FaBolt className="h-3.5 w-3.5 text-blue-400" />
                <span>Payment Channel: {razorpayOrderData.method.toUpperCase()}</span>
              </div>
              <p className="text-[11px] text-blue-300 font-normal leading-relaxed">
                Development Simulation Mode is enabled. Confirming below will trigger real-time cryptographic webhook verification with the backend.
              </p>
            </div>

            {paymentVerifiedSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 text-emerald-300 flex items-center justify-center gap-2 text-sm font-semibold border border-emerald-800/60">
                <FaCircleCheck className="h-5 w-5 text-emerald-400" />
                <span>Payment Verified Successfully! Redirecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={isVerifyingPayment}
                  onClick={() => setShowRazorpayModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/70 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={isVerifyingPayment}
                  onClick={handleVerifySimulatedPayment}
                  icon={isVerifyingPayment ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaCheck className="h-3.5 w-3.5" />}
                  className="px-6 rounded-xl text-xs font-semibold"
                >
                  {isVerifyingPayment ? 'Verifying...' : `Authorize ₹${razorpayOrderData.amount.toLocaleString()}`}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
