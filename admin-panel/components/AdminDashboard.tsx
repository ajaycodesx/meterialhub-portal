'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { adminApi, authApi, apiClient } from '../lib/api';
import { AdminSidebar, AdminTab } from './layout/AdminSidebar';
import { AdminHeader } from './layout/AdminHeader';
import { OverviewSection } from './sections/OverviewSection';
import { OrdersSection } from './sections/OrdersSection';
import { MerchantsSection } from './sections/MerchantsSection';
import { ProductsSection } from './sections/ProductsSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { BuyersSection } from './sections/BuyersSection';
import { DriversSection } from './sections/DriversSection';
import { DispatchSection } from './sections/DispatchSection';
import { FinanceSection } from './sections/FinanceSection';
import { BoqSection } from './sections/BoqSection';
import { CommodityRatesSection } from './sections/CommodityRatesSection';
import { DealsSection } from './sections/DealsSection';
import { DisputesSection } from './sections/DisputesSection';
import { ReportsSection } from './sections/ReportsSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { AuditLogsSection } from './sections/AuditLogsSection';
import { SettingsSection } from './sections/SettingsSection';

interface AdminDashboardProps {
  initialSlug?: string;
}

function getTabFromSlug(slugOrPath?: string): AdminTab {
  if (!slugOrPath) return 'overview';
  const stripped = slugOrPath.startsWith('/') ? slugOrPath.slice(1) : slugOrPath;
  const clean = stripped.replace(/-/g, '_').toLowerCase();
  switch (clean) {
    case '':
    case 'overview':
      return 'overview';
    case 'reports':
      return 'reports';
    case 'orders':
      return 'orders';
    case 'merchants':
      return 'merchants';
    case 'boq':
      return 'boq';
    case 'finance':
      return 'finance';
    case 'disputes':
      return 'disputes';
    case 'categories':
      return 'categories';
    case 'products':
      return 'products';
    case 'commodity_rates':
      return 'commodity_rates';
    case 'deals':
      return 'deals';
    case 'drivers':
      return 'drivers';
    case 'dispatch':
      return 'dispatch';
    case 'buyers':
      return 'buyers';
    case 'audit_logs':
      return 'audit_logs';
    case 'notifications':
      return 'notifications';
    case 'settings':
      return 'settings';
    default:
      return 'overview';
  }
}

const TAB_TO_SLUG: Record<AdminTab, string> = {
  overview: 'overview',
  reports: 'reports',
  orders: 'orders',
  merchants: 'merchants',
  boq: 'boq',
  finance: 'finance',
  disputes: 'disputes',
  categories: 'categories',
  products: 'products',
  commodity_rates: 'commodity-rates',
  deals: 'deals',
  drivers: 'drivers',
  dispatch: 'dispatch',
  buyers: 'buyers',
  audit_logs: 'audit-logs',
  notifications: 'notifications',
  settings: 'settings'
};

export function AdminDashboard({ initialSlug }: AdminDashboardProps = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab: AdminTab = getTabFromSlug(pathname) || getTabFromSlug(initialSlug) || 'overview';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  async function fetchOverview() {
    try {
      let token = apiClient.getToken();
      if (!token) {
        const auth: any = await authApi.login('admin@materialhub.in', 'admin123');
        if (auth?.access_token) {
          apiClient.setToken(auth.access_token);
        }
      }

      try {
        const dashboardData = await adminApi.getOverview();
        setData(dashboardData);
      } catch (innerErr: any) {
        if (innerErr?.status === 401 || innerErr?.status === 403) {
          const auth: any = await authApi.login('admin@materialhub.in', 'admin123');
          if (auth?.access_token) {
            apiClient.setToken(auth.access_token);
            const dashboardData = await adminApi.getOverview();
            setData(dashboardData);
            return;
          }
        }
        throw innerErr;
      }
    } catch (err: any) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    function setupWs() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token') || 'u_admin_1';
      const wsUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        `ws://${window.location.hostname}:8000/api/v1/ws/connect?token=${token}`;

      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => setIsWsConnected(true);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (
              msg.type === 'NEW_ORDER' ||
              msg.type === 'ORDER_STATUS_UPDATE' ||
              msg.type === 'TRIP_STATUS_UPDATE'
            ) {
              fetchOverview();
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };
        socket.onclose = () => {
          setIsWsConnected(false);
          reconnectTimer = setTimeout(setupWs, 5000);
        };
        socket.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (err) {
        console.error('WS connection error:', err);
      }
    }

    setupWs();

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchOverview();
  }

  function handleLogout() {
    apiClient.setToken(null);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  function handleNavigateTab(tab: AdminTab) {
    const slug = TAB_TO_SLUG[tab] || tab;
    router.push(`/${slug}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row w-full">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleNavigateTab}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isWsConnected={isWsConnected}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          activeTab={activeTab}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          systemHealth={data?.systemHealth}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 w-full">
          {activeTab === 'overview' && (
            <OverviewSection
              data={data}
              loading={loading}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'orders' && <OrdersSection />}

          {activeTab === 'merchants' && <MerchantsSection />}

          {activeTab === 'products' && <ProductsSection />}

          {activeTab === 'categories' && <CategoriesSection />}

          {activeTab === 'buyers' && <BuyersSection />}

          {activeTab === 'drivers' && <DriversSection />}

          {activeTab === 'dispatch' && <DispatchSection />}

          {activeTab === 'finance' && <FinanceSection />}

          {activeTab === 'boq' && <BoqSection />}

          {activeTab === 'commodity_rates' && <CommodityRatesSection />}

          {activeTab === 'deals' && <DealsSection />}

          {activeTab === 'disputes' && <DisputesSection />}

          {activeTab === 'reports' && <ReportsSection />}

          {activeTab === 'notifications' && <NotificationsSection />}

          {activeTab === 'audit_logs' && <AuditLogsSection />}

          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}
