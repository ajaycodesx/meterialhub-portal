'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSpinner,
  FaCircleCheck,
  FaTriangleExclamation,
  FaXmark,
  FaBell
} from 'react-icons/fa6';
import { vendorApi, authApi, apiClient } from '../lib/api';
import { VendorSidebar, VendorTab } from './layout/VendorSidebar';
import { VendorHeader } from './layout/VendorHeader';

import { VendorOverviewSection } from './sections/VendorOverviewSection';
import { VendorOrdersSection } from './sections/VendorOrdersSection';
import { VendorHandoverSection } from './sections/VendorHandoverSection';
import { VendorProductsSection } from './sections/VendorProductsSection';
import { VendorStockSection } from './sections/VendorStockSection';
import { VendorBoqSection } from './sections/VendorBoqSection';
import { VendorPricingSection } from './sections/VendorPricingSection';
import { VendorFinanceSection } from './sections/VendorFinanceSection';
import { VendorProfileSection } from './sections/VendorProfileSection';

export function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<VendorTab>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [commodityRates, setCommodityRates] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [settlementData, setSettlementData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [isWsConnected, setIsWsConnected] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function playOrderChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
    }
  }

  const loadAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
        const auth: any = await authApi.login('vendor@materialhub.in', 'vendor123');
        apiClient.setToken(auth.access_token);
      }

      const [
        dashRes,
        ordersRes,
        prodRes,
        quotesRes,
        ratesRes,
        dealsRes,
        settleRes,
        profRes
      ] = await Promise.allSettled([
        vendorApi.getDashboard(),
        vendorApi.getOrders(),
        vendorApi.getProducts(),
        vendorApi.getBoqQuotes(),
        vendorApi.getCommodityRates(),
        vendorApi.getDeals(),
        vendorApi.getSettlements(),
        vendorApi.getProfile()
      ]);

      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value?.items || ordersRes.value || []);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value?.items || prodRes.value || []);
      if (quotesRes.status === 'fulfilled') setQuotes(quotesRes.value || []);
      if (ratesRes.status === 'fulfilled') setCommodityRates(ratesRes.value || []);
      if (dealsRes.status === 'fulfilled') setDeals(dealsRes.value || []);
      if (settleRes.status === 'fulfilled') setSettlementData(settleRes.value);
      if (profRes.status === 'fulfilled') setProfile(profRes.value);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to depot backend');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    function setupWs() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token') || 'u_vendor_1';
      const wsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => setIsWsConnected(true);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (['order_status_update', 'new_order', 'trip_status_update'].includes(msg.event)) {
              if (msg.event === 'new_order') {
                playOrderChime();
                setNewOrderAlert(
                  `New Contractor Material Order #${msg.order_id || 'MH-NEW'} received! Ready for stage & packing.`
                );
              }
              loadAllData(true);
            }
          } catch (e) {
          }
        };
        socket.onclose = () => {
          setIsWsConnected(false);
          reconnectTimer = setTimeout(setupWs, 3000);
        };
        socket.onerror = () => setIsWsConnected(false);
      } catch (e) {
        setIsWsConnected(false);
      }
    }

    loadAllData();
    setupWs();
    const interval = setInterval(() => loadAllData(true), 6000);

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
      clearInterval(interval);
    };
  }, [loadAllData]);

  async function handleToggleOnline() {
    try {
      const res = await vendorApi.toggleOnline();
      setProfile((prev: any) => ({ ...prev, isOnline: res.isOnline }));
      setFeedbackToast({
        type: 'success',
        message: res.isOnline
          ? 'Depot marked Online: Accepting contractor orders'
          : 'Depot marked Offline: Paused incoming order flow'
      });
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to toggle depot status'
      });
    }
  }

  async function handlePackOrder(orderId: string) {
    try {
      await vendorApi.packOrder(orderId);
      setFeedbackToast({
        type: 'success',
        message: `Order #${orderId.slice(0, 8).toUpperCase()} packed and marked ready for driver pickup!`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to pack order'
      });
      throw err;
    }
  }

  async function handleRejectOrder(orderId: string, reason: string) {
    try {
      await vendorApi.rejectOrder(orderId, reason);
      setFeedbackToast({
        type: 'success',
        message: `Order #${orderId.slice(0, 8).toUpperCase()} rejected. Escrow returned.`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to reject order'
      });
      throw err;
    }
  }

  async function handleCreateProduct(data: any) {
    try {
      await vendorApi.createProduct(data);
      setFeedbackToast({
        type: 'success',
        message: `Material SKU "${data.title}" successfully published to catalog.`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to create product SKU'
      });
      throw err;
    }
  }

  async function handleUpdateProduct(productId: string, data: any) {
    try {
      await vendorApi.updateProduct(productId, data);
      setFeedbackToast({
        type: 'success',
        message: `Material SKU updated successfully.`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to update product SKU'
      });
      throw err;
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      await vendorApi.deleteProduct(productId);
      setFeedbackToast({
        type: 'success',
        message: `Material SKU removed from catalog.`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to delete product SKU'
      });
      throw err;
    }
  }

  async function handleAdjustStock(productId: string, adjustmentQty: number, reason: string) {
    try {
      await vendorApi.adjustStock(productId, adjustmentQty, reason);
      setFeedbackToast({
        type: 'success',
        message: `Stock balance adjusted by ${adjustmentQty > 0 ? `+${adjustmentQty}` : adjustmentQty} units.`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to adjust stock'
      });
      throw err;
    }
  }

  async function handleSubmitBoqQuote(quoteId: string, estimatedTotal: number, notes?: string) {
    try {
      await vendorApi.submitBoqQuote(quoteId, estimatedTotal, notes);
      setFeedbackToast({
        type: 'success',
        message: `Wholesale bid of ₹${estimatedTotal.toLocaleString('en-IN')} submitted to builder!`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to submit quote'
      });
      throw err;
    }
  }

  async function handleProposeDeal(data: any) {
    try {
      await vendorApi.proposeDeal(data);
      setFeedbackToast({
        type: 'success',
        message: `Promotional deal "${data.title}" published!`
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to publish deal'
      });
      throw err;
    }
  }

  async function handleUpdateProfile(data: any) {
    try {
      const res = await vendorApi.updateProfile(data);
      setProfile(res);
      setFeedbackToast({
        type: 'success',
        message: 'Depot business profile and address updated successfully!'
      });
      await loadAllData(true);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Failed to update profile'
      });
      throw err;
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <FaSpinner className="h-10 w-10 animate-spin text-[#FF6500]" />
        <p className="text-sm font-medium tracking-wide">
          Connecting to MaterialHub Vendor Depot Network...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <VendorSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileOpen(false);
        }}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isWsConnected={isWsConnected}
        storeName={profile?.name || dashboardData?.storeName || 'Kakkanad Building Supplies'}
        isOnline={profile?.isOnline ?? dashboardData?.isOnline ?? true}
        onToggleOnline={handleToggleOnline}
        onLogout={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.reload();
          }
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader
          activeTab={activeTab}
          onOpenMobile={() => setIsMobileOpen(true)}
          onRefresh={() => loadAllData(false)}
          isRefreshing={isRefreshing}
          storeName={profile?.name || dashboardData?.storeName}
          isOnline={profile?.isOnline ?? dashboardData?.isOnline ?? true}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {newOrderAlert && (
            <div className="p-4 rounded-2xl bg-[#FF6500] text-white shadow-md flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <FaBell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">New Wholesale Order Alert</h4>
                  <p className="text-xs text-orange-100 font-medium">{newOrderAlert}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setNewOrderAlert(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#FF6500] text-xs font-bold hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  View Packing Queue
                </button>
                <button
                  onClick={() => setNewOrderAlert(null)}
                  className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <FaXmark className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {feedbackToast && (
            <div
              className={`p-4 rounded-2xl shadow-xs flex items-center justify-between border ${
                feedbackToast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                {feedbackToast.type === 'success' ? (
                  <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <FaTriangleExclamation className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
              >
                <FaXmark className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => loadAllData(false)}
                className="underline hover:text-amber-950 font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <VendorOverviewSection
              data={dashboardData}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenPackModal={(order) => {
                setActiveTab('orders');
              }}
            />
          )}

          {activeTab === 'profile' && (
            <VendorProfileSection
              profile={profile || dashboardData}
              onUpdateProfile={handleUpdateProfile}
              onToggleOnline={handleToggleOnline}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'orders' && (
            <VendorOrdersSection
              orders={orders}
              onPackOrder={handlePackOrder}
              onRejectOrder={handleRejectOrder}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'handover' && (
            <VendorHandoverSection
              orders={orders}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'products' && (
            <VendorProductsSection
              products={products}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'stock' && (
            <VendorStockSection
              products={products}
              onAdjustStock={handleAdjustStock}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'boq' && (
            <VendorBoqSection
              quotes={quotes}
              onSubmitQuote={handleSubmitBoqQuote}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'pricing' && (
            <VendorPricingSection
              commodityRates={commodityRates}
              deals={deals}
              onProposeDeal={handleProposeDeal}
              onRefresh={() => loadAllData(false)}
            />
          )}

          {activeTab === 'finance' && (
            <VendorFinanceSection
              settlementData={settlementData}
              onRefresh={() => loadAllData(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
