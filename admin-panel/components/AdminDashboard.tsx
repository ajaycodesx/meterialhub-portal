'use client';

import React, { useState, useEffect } from 'react';
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

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  async function fetchOverview() {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
        const auth: any = await authApi.login('admin@materialhub.in', 'admin123');
        apiClient.setToken(auth.access_token);
      }
      const dashboardData = await adminApi.getOverview();
      setData(dashboardData);
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

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isWsConnected={isWsConnected}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <AdminHeader
          activeTab={activeTab}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          systemHealth={data?.systemHealth}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewSection
              data={data}
              loading={loading}
              onNavigateTab={(tab) => setActiveTab(tab)}
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
