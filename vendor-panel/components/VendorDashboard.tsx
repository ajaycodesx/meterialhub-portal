'use client';

import { useState, useEffect } from 'react';
import {
  FaStore,
  FaBox,
  FaTruckFast,
  FaChartLine,
  FaClock,
  FaIndianRupeeSign,
  FaExclamation,
  FaSpinner,
  FaCircleCheck,
  FaPen,
  FaXmark,
  FaCheck,
  FaBoxesStacked
} from 'react-icons/fa6';
import { vendorApi, authApi, apiClient } from '../lib/api';

interface DashboardData {
  merchantId: string;
  storeName: string;
  isOnline: boolean;
  walletBalance: number;
  todayRevenue: number;
  activeOrdersCount: number;
  pendingDispatchCount: number;
  lowStockCount: number;
  recentOrders: any[];
  inventoryOverview: any[];
  quickStats: {
    fulfillmentRate: string;
    avgPackingMinutes: number;
    rating: number;
  };
}

export function VendorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isWsConnected, setIsWsConnected] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [stockEditItem, setStockEditItem] = useState<any | null>(null);
  const [editStockQty, setEditStockQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

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

  async function fetchDashboard() {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
        const auth: any = await authApi.login('vendor@materialhub.in', 'vendor123');
        apiClient.setToken(auth.access_token);
      }
      const dashboardData: any = await vendorApi.getDashboard();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    function setupWs() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token') || 'u_vendor_1';
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => setIsWsConnected(true);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (['order_status_update', 'new_order', 'trip_status_update'].includes(msg.event)) {
              if (msg.event === 'new_order') {
                playOrderChime();
                setNewOrderAlert(`New Wholesale Material Order #${msg.order_id || 'MH-NEW'} received! Ready for packing.`);
              }
              fetchDashboard();
            }
          } catch (e) {
            console.error('Vendor WS parse error:', e);
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

    fetchDashboard();
    setupWs();
    const pollInterval = setInterval(fetchDashboard, 5000);

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
    };
  }, []);

  const handlePackOrder = async (orderId: string) => {
    setActionLoading(orderId);
    setActionSuccess(null);
    setActionError(null);
    try {
      await vendorApi.updateOrderStatus({ orderId, status: 'packing' });
      setActionSuccess(`Order ${orderId} marked as Packed & Ready for Driver Pickup.`);
      await fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenStockModal = (item: any) => {
    setStockEditItem(item);
    setEditStockQty(item.stockQty);
    setEditPrice(item.price);
  };

  const handleSaveStock = async () => {
    if (!stockEditItem) return;
    setSavingStock(true);
    setActionError(null);
    try {
      await vendorApi.updateStock({
        productId: stockEditItem.productId,
        newStockQty: Number(editStockQty),
        newPrice: Number(editPrice)
      });
      setActionSuccess(`Stock updated for ${stockEditItem.title}`);
      setStockEditItem(null);
      await fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update stock');
    } finally {
      setSavingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <FaSpinner className="h-6 w-6 animate-spin text-[#FF6500]" />
          <span>Loading MaterialHub Vendor Portal...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FaExclamation className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Unable to Load Dashboard</h3>
          <p className="text-sm text-slate-500">{error || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="bg-white shadow-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
              <img
                src="/images/logo_dark.png"
                alt="MaterialHub Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{data.storeName}</h1>
              <p className="text-xs text-slate-500">Verified Wholesale Depot</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className={`h-2 w-2 rounded-xs ${isWsConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={isWsConnected ? 'text-emerald-600' : 'text-slate-500'}>{isWsConnected ? 'Live Store Push' : 'Syncing'}</span>
            </span>
            <span className="h-3 w-px bg-slate-200 inline-block" />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className={`h-2 w-2 rounded-xs ${data.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={data.isOnline ? 'text-emerald-600' : 'text-slate-500'}>{data.isOnline ? 'Store Open' : 'Store Offline'}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {newOrderAlert && (
          <div className="p-4 rounded-3xl bg-[#FF6500] text-white text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-white shrink-0" />
              <span>{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white hover:text-slate-100 px-3 py-1 rounded-xl bg-orange-600 cursor-pointer text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <FaExclamation className="h-4 w-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Today Revenue</span>
              <div className="h-9 w-9 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center">
                <FaIndianRupeeSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{data.todayRevenue.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Real-time GMV settled</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Wallet Balance</span>
              <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaStore className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{data.walletBalance.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Auto-payout every Tuesday</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Active Orders</span>
              <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaTruckFast className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.activeOrdersCount}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">{data.pendingDispatchCount} awaiting dispatch</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Stock Alerts</span>
              <div className="h-9 w-9 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <FaBox className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.lowStockCount}</p>
            <p className={`text-xs mt-1 ${data.lowStockCount > 0 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {data.lowStockCount > 0 ? 'Products below MOQ threshold' : 'All materials well stocked'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4.5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaChartLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{data.quickStats.fulfillmentRate}</p>
              <p className="text-xs text-slate-500">Fulfillment Success Rate</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FaClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{data.quickStats.avgPackingMinutes} min</p>
              <p className="text-xs text-slate-500">Average Packing Duration</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <FaStore className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{data.quickStats.rating} / 5.0</p>
              <p className="text-xs text-slate-500">Merchant Store Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Supply Orders</h2>
              <p className="text-xs text-slate-500 font-normal">Fulfill incoming contractor orders and prepare loading batches</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-2xl bg-slate-100 text-slate-700">
              {data.recentOrders.length} Orders
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No incoming supply orders at this moment</div>
            ) : (
              data.recentOrders.map((order) => {
                const isConfirmed = order.status === 'confirmed';
                const isPacking = order.status === 'packing';
                const isDelivered = order.status === 'delivered';
                const isOut = order.status === 'out_for_delivery';

                return (
                  <div key={order.orderId} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                        <FaBoxesStacked className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{order.invoiceNumber || order.orderId}</p>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-2xl capitalize ${
                            isDelivered ? 'bg-emerald-50 text-emerald-700' :
                            isOut ? 'bg-blue-50 text-blue-700' :
                            isPacking ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{order.deliveryAddress}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Payload Weight: {order.weightKg} kg</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">₹{order.grandTotal.toLocaleString()}</p>
                        <p className="text-[11px] text-slate-400">Total Invoice</p>
                      </div>

                      {isConfirmed && (
                        <button
                          disabled={actionLoading === order.orderId}
                          onClick={() => handlePackOrder(order.orderId)}
                          className="px-4.5 py-2.5 rounded-xl bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
                        >
                          {actionLoading === order.orderId ? 'Updating...' : 'Pack & Ready for Driver'}
                        </button>
                      )}

                      {isPacking && (
                        <span className="px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold shadow-2xs">
                          Awaiting Truck Pickup
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Store Inventory Stock</h2>
              <p className="text-xs text-slate-500 font-normal">Live store warehouse stock count and wholesale unit pricing</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
              {data.inventoryOverview.length} SKUs
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.inventoryOverview.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No inventory items registered</div>
            ) : (
              data.inventoryOverview.map((item) => (
                <div key={item.productId} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <FaBox className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span>{item.brand}</span>
                        <span className="h-2.5 w-px bg-slate-300 inline-block" />
                        <span>{item.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">₹{item.price.toLocaleString()} / {item.unit}</p>
                      <p className={`text-xs font-medium ${item.isLowStock ? 'text-red-600' : 'text-slate-500'}`}>
                        In Stock: {item.stockQty} {item.unit}s {item.isLowStock && '(Restock Needed)'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenStockModal(item)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      title="Adjust Stock or Price"
                    >
                      <FaPen className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {stockEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Adjust Inventory Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{stockEditItem.title}</p>
              </div>
              <button onClick={() => setStockEditItem(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <FaXmark className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Warehouse Stock ({stockEditItem.unit}s)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStockQty}
                  onChange={(e) => setEditStockQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wholesale Unit Price (INR ₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={savingStock}
                onClick={handleSaveStock}
                className="flex-1 py-3 rounded-xl bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30"
              >
                {savingStock ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaCheck className="h-3.5 w-3.5" />}
                <span>Save Stock &amp; Pricing</span>
              </button>
              <button
                type="button"
                onClick={() => setStockEditItem(null)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
