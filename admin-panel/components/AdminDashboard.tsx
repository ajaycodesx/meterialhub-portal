'use client';

import { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaStore,
  FaTruckFast,
  FaBox,
  FaIndianRupeeSign,
  FaCheck,
  FaExclamation,
  FaSpinner,
  FaGlobe,
  FaHeart,
  FaPen,
  FaXmark,
  FaShieldHalved,
  FaCircleCheck,
  FaClockRotateLeft
} from 'react-icons/fa6';
import { adminApi, authApi, apiClient } from '../lib/api';
import { Modal } from './ui/Modal';

interface DashboardData {
  totalGmv: number;
  totalOrders: number;
  activeMerchantsCount: number;
  activeDriversCount: number;
  todaysTonnageDispatched: number;
  recentOrders: any[];
  merchantRoster: any[];
  liveCommodityRates: any[];
  systemHealth: {
    dbStatus: string;
    activeRadius: string;
    uptime: string;
  };
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [rateEditItem, setRateEditItem] = useState<any | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);
  const [editTrend, setEditTrend] = useState<string>('stable');
  const [editChangePct, setEditChangePct] = useState<number>(0);
  const [savingRate, setSavingRate] = useState(false);

  const [togglingMerchantId, setTogglingMerchantId] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
        const auth: any = await authApi.login('admin@materialhub.in', 'admin123');
        apiClient.setToken(auth.access_token);
      }
      const dashboardData: any = await adminApi.getOverview();
      setData(dashboardData);

      try {
        const logs: any = await adminApi.getAuditLogs(15);
        setAuditLogs(logs || []);
      } catch (logErr) {
        console.error('Audit logs error:', logErr);
      }
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
      const token = localStorage.getItem('access_token') || 'u_admin_1';
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => setIsWsConnected(true);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (['order_status_update', 'trip_status_update', 'payment_status', 'system_alert'].includes(msg.event)) {
              fetchDashboard();
            }
          } catch (e) {
            console.error('Admin WS parse error:', e);
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
    const pollTimer = setInterval(fetchDashboard, 6000);

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
      clearInterval(pollTimer);
    };
  }, []);

  const handleOpenRateEdit = (rate: any) => {
    setRateEditItem(rate);
    setEditRateValue(rate.rate);
    setEditTrend(rate.trend || 'stable');
    setEditChangePct(rate.changePercent || 0.0);
  };

  const handleSaveRate = async () => {
    if (!rateEditItem) return;
    setSavingRate(true);
    setActionError(null);
    try {
      await adminApi.updateCommodityRate({
        id: rateEditItem.id,
        wholesale_rate: Number(editRateValue),
        trend: editTrend,
        change_percent: Number(editChangePct)
      });
      setActionSuccess(`Updated rate for ${rateEditItem.material}`);
      setRateEditItem(null);
      await fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update commodity rate');
    } finally {
      setSavingRate(false);
    }
  };

  const handleToggleMerchant = async (merchantId: string, field: string) => {
    setTogglingMerchantId(merchantId);
    setActionSuccess(null);
    setActionError(null);
    try {
      await adminApi.toggleMerchant({ merchantId, field });
      setActionSuccess(`Updated merchant ${field === 'verified' ? 'verification' : 'operational'} status`);
      await fetchDashboard();
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle merchant status');
    } finally {
      setTogglingMerchantId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <FaSpinner className="h-6 w-6 animate-spin text-[#FF6500]" />
          <span>Loading MaterialHub Admin Portal...</span>
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
              <h1 className="text-lg font-semibold text-slate-900">MaterialHub Platform Admin</h1>
              <p className="text-xs text-slate-500">Regional B2B Operations Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className={`h-2 w-2 rounded-xs ${isWsConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className={isWsConnected ? 'text-emerald-600' : 'text-slate-500'}>{isWsConnected ? 'Live Operations' : 'Syncing'}</span>
            </span>
            <span className="h-3 w-px bg-slate-200 inline-block" />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <FaHeart className="h-3 w-3" />
              Cluster Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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
              <span className="text-xs font-medium text-slate-500">Gross Merchandise Value</span>
              <div className="h-9 w-9 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center">
                <FaIndianRupeeSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{data.totalGmv.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Platform Total Volume</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Total Supply Orders</span>
              <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaBox className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.totalOrders}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Dispatched Orders</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Active Merchants</span>
              <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaStore className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.activeMerchantsCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Verified Hardware Depots</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">Active Trucks</span>
              <div className="h-9 w-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FaTruckFast className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.activeDriversCount}</p>
            <p className="text-xs text-purple-600 font-medium mt-1">Payload Trucks Fleet</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Wholesale Commodity Rate Index</h2>
              <p className="text-xs text-slate-500 font-normal">Daily spot rates published to contractors and verified stores</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-2xl bg-slate-100 text-slate-700">
              Live Index
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.liveCommodityRates.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No commodity rate index available</div>
            ) : (
              data.liveCommodityRates.map((rate) => (
                <div key={rate.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <FaGlobe className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rate.material}</p>
                      <p className="text-xs text-slate-500 font-normal">Previous Spot Rate: ₹{rate.prevRate.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">₹{rate.rate.toLocaleString()}</p>
                      <p className={`text-xs font-medium ${
                        rate.trend === 'up' ? 'text-emerald-600' : rate.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {rate.trend === 'up' ? 'Increase' : rate.trend === 'down' ? 'Decrease' : 'Stable'} ({rate.changePercent}%)
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenRateEdit(rate)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      title="Update Commodity Price Index"
                    >
                      <FaPen className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Merchant Roster &amp; Operational Controls</h2>
              <p className="text-xs text-slate-500 font-normal">Partner hardware stores, verification status, and wallet holdings</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
              {data.merchantRoster.length} Merchants
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.merchantRoster.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No merchants registered</div>
            ) : (
              data.merchantRoster.map((merchant) => (
                <div key={merchant.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaStore className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{merchant.name}</p>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                          merchant.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {merchant.verified ? 'Verified Store' : 'Pending Verification'}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                          merchant.isOnline ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {merchant.isOnline ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{merchant.ownerName}</span>
                        <span className="h-2.5 w-px bg-slate-300 inline-block" />
                        <span>Pincode {merchant.pincode}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">₹{merchant.walletBalance.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-400">Wallet Balance</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={togglingMerchantId === merchant.id}
                        onClick={() => handleToggleMerchant(merchant.id, 'verified')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                          merchant.verified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {merchant.verified ? 'Revoke Partner' : 'Verify Partner'}
                      </button>
                      <button
                        disabled={togglingMerchantId === merchant.id}
                        onClick={() => handleToggleMerchant(merchant.id, 'is_online')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                          merchant.isOnline
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                        }`}
                      >
                        {merchant.isOnline ? 'Set Offline' : 'Set Online'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FaClockRotateLeft className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Platform Audit Trail Logs</h2>
                <p className="text-xs text-slate-500 font-normal">Immutable ledger of sensitive operations, payments, and delivery verifications</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-2xl bg-slate-100 text-slate-700">
              {auditLogs.length} Events Logged
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No audit records recorded yet</div>
            ) : (
              auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-xs bg-[#FF6500]" />
                    <div>
                      <p className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">{log.action}</p>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
                        <span>Actor: {log.actorRole} ({log.actorId})</span>
                        <span className="h-2.5 w-px bg-slate-300 inline-block" />
                        <span>Target: {log.targetType} {log.targetId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[10px] text-emerald-600">
                      {log.status}
                    </span>
                    <p className="text-slate-400 text-[10px] mt-0.5">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">System Health &amp; Cluster Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FaCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Database Engine</p>
                <p className="text-sm font-semibold text-slate-900">{data.systemHealth.dbStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaGlobe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Service Coverage</p>
                <p className="text-sm font-semibold text-slate-900">{data.systemHealth.activeRadius}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaHeart className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Uptime Reliability</p>
                <p className="text-sm font-semibold text-slate-900">{data.systemHealth.uptime}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {rateEditItem && (
        <Modal
          isOpen={!!rateEditItem}
          onClose={() => setRateEditItem(null)}
          icon={<FaChartLine className="h-5 w-5" />}
          iconBg="bg-orange-500/15 border border-orange-500/25"
          iconColor="text-[#FF6500]"
          title="Update Commodity Spot Rate"
          subtitle={rateEditItem.material}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Wholesale Rate (INR ₹)
              </label>
              <input
                type="number"
                min="1"
                value={editRateValue}
                onChange={(e) => setEditRateValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#162137] border border-slate-700 text-sm font-semibold text-white focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Market Trend
                </label>
                <select
                  value={editTrend}
                  onChange={(e) => setEditTrend(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#162137] border border-slate-700 text-xs font-semibold text-white focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500]"
                >
                  <option value="up" className="bg-[#0d1527] text-white">Upward (Bullish)</option>
                  <option value="down" className="bg-[#0d1527] text-white">Downward (Bearish)</option>
                  <option value="stable" className="bg-[#0d1527] text-white">Stable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Change %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editChangePct}
                  onChange={(e) => setEditChangePct(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#162137] border border-slate-700 text-xs font-semibold text-white focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setRateEditItem(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/70 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingRate}
                onClick={handleSaveRate}
                className="px-6 py-2.5 rounded-xl bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
              >
                {savingRate ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaCheck className="h-3.5 w-3.5" />}
                <span>Publish Spot Rate</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
