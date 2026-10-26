'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
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

function resolveTabFromPath(path: string | null): VendorTab {
  if (!path) return 'overview';
  const stripped = path.startsWith('/') ? path.slice(1) : path;
  const clean = stripped.split('/')[0];
  const validTabs: VendorTab[] = [
    'overview',
    'profile',
    'orders',
    'handover',
    'products',
    'stock',
    'boq',
    'pricing',
    'finance'
  ];
  return validTabs.includes(clean as VendorTab) ? (clean as VendorTab) : 'overview';
}

export function VendorDashboard({ initialSlug }: { initialSlug?: VendorTab } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<VendorTab>(() => initialSlug || resolveTabFromPath(pathname));

  useEffect(() => {
    const fromPath = resolveTabFromPath(pathname);
    if (fromPath !== activeTab) {
      setActiveTab(fromPath);
    }
  }, [pathname]);

  const handleTabChange = (tab: VendorTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      router.push(`/${tab}`);
    }
  };

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
      let token = apiClient.getToken();
      if (!token) {
        const auth: any = await authApi.login('vendor@materialhub.in', 'vendor123');
        if (auth?.access_token) {
          apiClient.setToken(auth.access_token);
        }
      }

      const results = await Promise.allSettled([
        vendorApi.getDashboard(),
        vendorApi.getOrders(),
        vendorApi.getProducts(),
        vendorApi.getBoqQuotes(),
        vendorApi.getCommodityRates(),
        vendorApi.getDeals(),
        vendorApi.getSettlements(),
        vendorApi.getProfile()
      ]);

      const isAuthError = results.some(
        (r) => r.status === 'rejected' && ((r.reason as any)?.status === 401 || (r.reason as any)?.status === 403)
      );

      let [
        dashRes,
        ordersRes,
        prodRes,
        quotesRes,
        ratesRes,
        dealsRes,
        settleRes,
        profRes
      ] = results;

      if (isAuthError) {
        const auth: any = await authApi.login('vendor@materialhub.in', 'vendor123');
        if (auth?.access_token) {
          apiClient.setToken(auth.access_token);
          const retriedResults = await Promise.allSettled([
            vendorApi.getDashboard(),
            vendorApi.getOrders(),
            vendorApi.getProducts(),
            vendorApi.getBoqQuotes(),
            vendorApi.getCommodityRates(),
            vendorApi.getDeals(),
            vendorApi.getSettlements(),
            vendorApi.getProfile()
          ]);
          [
            dashRes,
            ordersRes,
            prodRes,
            quotesRes,
            ratesRes,
            dealsRes,
            settleRes,
            profRes
          ] = retriedResults;
        }
      }

      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value);
      if (ordersRes.status === 'fulfilled') {
        const val = ordersRes.value;
        const list = Array.isArray(val) ? val : (val?.orders || val?.items || []);
        setOrders(list);
      }
      if (prodRes.status === 'fulfilled') {
        const val = prodRes.value;
        const list = Array.isArray(val) ? val : (val?.products || val?.items || []);
        setProducts(list);
      }
      if (quotesRes.status === 'fulfilled') {
        const val: any = quotesRes.value;
        setQuotes(Array.isArray(val) ? val : (val?.quotes || val?.items || []));
      }
      if (ratesRes.status === 'fulfilled') {
        const val: any = ratesRes.value;
        setCommodityRates(Array.isArray(val) ? val : (val?.rates || val?.items || []));
      }
      if (dealsRes.status === 'fulfilled') {
        const val: any = dealsRes.value;
        setDeals(Array.isArray(val) ? val : (val?.deals || val?.items || []));
      }
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row w-full relative">
      <VendorSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          handleTabChange(tab);
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
          onToggleOnline={handleToggleOnline}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 w-full space-y-6">
          {newOrderAlert && (
            <div className="p-4 rounded-2xl bg-[#FF6500] text-white shadow-md flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <FaBell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">New Wholesale Order Alert</h4>
                  <p className="text-xs text-orange-100 font-medium">{newOrderAlert}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleTabChange('orders');
                    setNewOrderAlert(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#FF6500] text-xs font-medium hover:bg-orange-50 transition-colors cursor-pointer"
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
              className={`p-4 rounded-2xl shadow-xs flex items-center justify-between border bg-slate-50 border-slate-200/80 ${
                feedbackToast.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs font-medium">
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
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => loadAllData(false)}
                className="underline hover:text-amber-950 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <VendorOverviewSection
              data={dashboardData}
              orders={orders}
              products={products}
              loading={loading}
              onNavigateTab={(tab) => handleTabChange(tab)}
              onOpenPackModal={(order) => {
                handleTabChange('orders');
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
