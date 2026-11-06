'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaHelmetSafety,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaPenToSquare,
  FaBuilding,
  FaFileInvoiceDollar,
  FaLandmark,
  FaHeart,
  FaGear,
  FaTruckFast,
  FaShieldHalved,
  FaCircleCheck,
  FaHeadset,
  FaCheck,
  FaChevronRight,
  FaPlus,
  FaFileLines,
  FaBolt,
  FaCompass,
  FaCalculator,
  FaFileArrowUp,
  FaChartColumn,
  FaCartShopping,
  FaIndianRupeeSign,
  FaWhatsapp,
  FaArrowRight,
  FaUser,
  FaClock,
  FaStore,
  FaRightFromBracket,
  FaGlobe,
  FaStar,
  FaXmark,
  FaBoxesStacked,
  FaRotateLeft
} from 'react-icons/fa6';
import { UserProfile, LocationState, HardwareMerchant } from '../../types/buyer';
import { buyerApi, apiClient } from '../../lib/api';
import { Button } from '../ui/Button';
import { NoData } from '../common/NoData';
import { Input } from '../ui/Input';
import { PageBanner } from './PageBanner';
import { BoqQuoteModal } from './BoqQuoteModal';
import { OrderRatingModal } from './OrderRatingModal';

interface ProfileSitesPageProps {
  user: UserProfile;
  location: LocationState;
  onOpenSiteModal: () => void;
  onOpenLanguageModal: () => void;
  onLogout: () => void;
  onOpenStore: (merchant: HardwareMerchant) => void;
}

export const ProfileSitesPage: React.FC<ProfileSitesPageProps> = ({
  user,
  location,
  onOpenSiteModal,
  onOpenLanguageModal,
  onLogout,
  onOpenStore
}) => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<HardwareMerchant[]>([]);

  useEffect(() => {
    buyerApi
      .getHome()
      .then((data: any) => setSuppliers((data?.nearbyMerchants ?? []).slice(0, 3)))
      .catch(() => setSuppliers([]));
  }, []);

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userName, setUserName] = useState(user.name || '');
  const [userPhone, setUserPhone] = useState(user.phone || '');
  const [userEmail, setUserEmail] = useState(user.email || '');
  const [activeTab, setActiveTab] = useState<'sites' | 'orders' | 'boq' | 'payments' | 'wishlist' | 'settings'>('sites');
  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [boqQuotes, setBoqQuotes] = useState<any[]>([]);

  const handleSaveUser = () => {
    setIsEditingUser(false);
  };

  const STATUS_COLORS: Record<string, string> = {
    delivered: 'text-emerald-600 font-medium',
    out_for_delivery: 'text-blue-600 font-medium',
    packing: 'text-[#FF6500] font-medium',
    confirmed: 'text-slate-700 font-medium',
    pending: 'text-slate-700 font-medium',
    cancelled: 'text-rose-600 font-medium',
    refunded: 'text-rose-600 font-medium',
  };
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const totalProcurement = recentOrders.reduce((sum, ord) => {
    const raw = typeof ord.amount === 'string' ? ord.amount.replace(/[^0-9.]/g, '') : ord.amount;
    return sum + (parseFloat(raw) || 0);
  }, 0);

  const loadOrders = () => {
    if (!apiClient.getToken()) return;
    buyerApi
      .getOrders()
      .then((data: any) =>
        setRecentOrders(
          (data?.orders ?? []).map((o: any) => ({
            id: o.invoiceNumber || o.orderId,
            rawId: o.orderId,
            rawStatus: o.status,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'No data',
            items: o.totalWeightKg ? `${o.totalWeightKg} kg` : 'No data',
            amount: o.grandTotal != null ? `₹${Number(o.grandTotal).toLocaleString('en-IN')}` : 'No data',
            status: String(o.status).replace(/_/g, ' '),
            statusColor: STATUS_COLORS[o.status] ?? 'text-slate-600 font-medium',
          }))
        )
      )
      .catch(() => setRecentOrders([]));
  };

  const loadBoqQuotes = () => {
    if (!apiClient.getToken()) return;
    buyerApi
      .getBoqQuotes()
      .then((data: any) => setBoqQuotes(data?.quotes ?? []))
      .catch(() => setBoqQuotes([]));
  };

  useEffect(() => {
    loadOrders();
    loadBoqQuotes();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? Inventory will be released back to the store.')) {
      return;
    }
    try {
      setCancellingOrderId(orderId);
      await buyerApi.cancelOrder(orderId, 'Contractor cancelled through portal');
      loadOrders();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="flex-1 bg-transparent">
      <PageBanner
        backHref="/"
        backTitle="Back to Dashboard"
        breadcrumbs={[
          { label: 'Buyer Account', href: '/' },
          { label: 'Profile & Sites Management' }
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <FaShieldHalved className="h-3.5 w-3.5 text-emerald-600" />
            <span>Buyer account</span>
          </span>
        }
        icon={
          <div className="relative shrink-0">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#FF6500] text-white font-medium text-lg sm:text-xl flex items-center justify-center shadow-xs">
              {userName.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
              <FaCheck className="h-2 w-2 stroke-[2]" />
            </div>
          </div>
        }
        title={userName}
        subtitle={
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>Civil Contractor</span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span>GSTIN: <strong className="font-mono text-slate-800 font-medium">{user.gstin || 'Registered Contractor'}</strong></span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span className="flex items-center gap-1">
              <FaPhone className="h-3 w-3 text-[#FF6500]" />
              {userPhone}
            </span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span className="flex items-center gap-1">
              <FaEnvelope className="h-3 w-3 text-slate-400" />
              {userEmail}
            </span>
            <span className="h-2.5 w-px bg-slate-300 inline-block" />
            <span className="flex items-center gap-1">
              <FaLocationDot className="h-3 w-3 text-[#FF6500]" />
              Primary Zone: <strong className="text-slate-800 font-medium">No data</strong>
            </span>
          </div>
        }
        rightContent={
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xs text-xs font-medium text-slate-700">
              <FaIndianRupeeSign className="h-3.5 w-3.5 text-amber-500" />
              <span>Procurement: <strong className="text-slate-900 font-medium">₹{totalProcurement > 0 ? totalProcurement.toLocaleString('en-IN') : '0'}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xs text-xs font-medium text-slate-700">
              <FaBuilding className="h-3.5 w-3.5 text-[#FF6500]" />
              <span>Active Sites: <strong className="text-emerald-600 font-medium">{user.savedAddresses?.length || 0} Pinned</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-xs text-xs font-medium text-slate-700">
              <FaCartShopping className="h-3.5 w-3.5 text-blue-500" />
              <span>Orders: <strong className="text-slate-900 font-medium">{recentOrders.length} Placed</strong></span>
            </div>
            <button
              onClick={() => setIsEditingUser(!isEditingUser)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 hover:text-[#FF6500] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FaPenToSquare className="h-3 w-3 text-[#FF6500]" />
              <span>Edit Profile</span>
            </button>
          </div>
        }
      />

      <section className="pt-4 sm:pt-6 pb-12 sm:pb-16 gsap-reveal-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">

            {isEditingUser && (
              <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-white shadow-xs border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Update Contractor Account Details</h3>
                  <button onClick={() => setIsEditingUser(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <FaXmark className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Full Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  <Input
                    label="Phone Number"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="primary" size="sm" onClick={handleSaveUser}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

          <div className="bg-white rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 w-full overflow-x-auto no-scrollbar scrollbar-none">
            <button
              onClick={() => setActiveTab('sites')}
              className={`flex-1 min-w-[160px] md:min-w-0 justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'sites'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FaBuilding className={`h-3.5 w-3.5 ${activeTab === 'sites' ? 'text-[#FF6500]' : 'text-slate-500'}`} />
              <span>Construction Sites</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 min-w-[160px] md:min-w-0 justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'orders'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FaFileLines className={`h-3.5 w-3.5 ${activeTab === 'orders' ? 'text-[#FF6500]' : 'text-slate-500'}`} />
              <span>Order History</span>
            </button>

            <button
              onClick={() => setActiveTab('boq')}
              className={`flex-1 min-w-[160px] md:min-w-0 justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'boq'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FaFileArrowUp className={`h-3.5 w-3.5 ${activeTab === 'boq' ? 'text-[#FF6500]' : 'text-slate-500'}`} />
              <span>BOQ Quotes ({boqQuotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 min-w-[160px] md:min-w-0 justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'payments'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FaLandmark className={`h-3.5 w-3.5 ${activeTab === 'payments' ? 'text-[#FF6500]' : 'text-slate-500'}`} />
              <span>B2B Banking &amp; Refunds</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 min-w-[160px] md:min-w-0 justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'wishlist'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FaHeart className={`h-3.5 w-3.5 ${activeTab === 'wishlist' ? 'text-red-500' : 'text-slate-500'}`} />
              <span>Favorite Merchants</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 min-w-[160px] md:min-w-0 justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer text-center ${
                activeTab === 'settings'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FaGear className={`h-3.5 w-3.5 ${activeTab === 'settings' ? 'text-slate-200' : 'text-slate-500'}`} />
              <span>Security &amp; Preferences</span>
            </button>
          </div>

          {activeTab === 'sites' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaHelmetSafety className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-medium text-slate-900 tracking-tight leading-snug">
                        My Construction Sites
                      </h2>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        Manage your registered sites and access GPS, delivery and procurement details.
                      </p>
                    </div>
                  </div>

                  <Link href="/site-delivery">
                    <button
                      onClick={onOpenSiteModal}
                      className="px-4 py-2 rounded-2xl bg-[#FF6500] hover:bg-[#E05800] text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <FaPlus className="h-3 w-3" />
                      <span>Add New Construction Site</span>
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.savedAddresses && user.savedAddresses.length > 0 ? (
                    user.savedAddresses.map((site: any) => (
                      <div key={site.id} className="bg-white p-5 rounded-3xl shadow-xs space-y-2">
                        <h3 className="font-medium text-sm sm:text-base text-slate-900">{site.label || 'Delivery site'}</h3>
                        <p className="text-xs text-slate-600">{site.address || 'No data'}</p>
                        <p className="text-[11px] text-slate-500">Pincode {site.pincode || 'No data'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 bg-white rounded-3xl shadow-xs">
                      <NoData title="No sites saved" description="Your delivery sites appear here once they are added to your account." />
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                      <FaTruckFast className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-900 leading-tight">20 KM Radius</h4>
                      <p className="text-[11px] text-slate-500 font-normal">Same-Day Site Unloading</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FaShieldHalved className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-900 leading-tight">GST Tax Invoice</h4>
                      <p className="text-[11px] text-slate-500 font-normal">100% Tax Credit Invoice</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FaCircleCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-900 leading-tight">Verified Stores</h4>
                      <p className="text-[11px] text-slate-500 font-normal">Direct Wholesale Stock</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <FaHeadset className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-900 leading-tight">24x7 Site Support</h4>
                      <p className="text-[11px] text-slate-500 font-normal">Call 1800-425-9999</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  
                  <div className="bg-white p-5 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                            <FaFileLines className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-slate-900">Recent Orders</h3>
                            <p className="text-[10px] text-slate-500">Track your latest material orders and delivery status.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-[11px] font-medium text-slate-600 hover:text-[#FF6500] transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
                        >
                          <span>View All</span>
                          <FaChevronRight className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100 pt-1 text-[11px]">
                        {recentOrders.map((ord) => (
                          <div
                            key={ord.id}
                            onClick={() => router.push('/tracking')}
                            className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 px-1 rounded-xl transition-colors cursor-pointer group"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 group-hover:text-[#FF6500] transition-colors">{ord.id}</span>
                                <span className="text-[10px] text-slate-400">{ord.date}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{ord.items}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <span className="font-medium text-slate-900">{ord.amount}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-medium ${ord.statusColor}`}>
                                {ord.status}
                              </span>
                              <FaChevronRight className="h-2.5 w-2.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="h-8 w-8 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                          <FaBolt className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-slate-900">Quick Actions</h3>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 pt-1">
                        <Link
                          href="/catalog"
                          className="py-2.5 px-1 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-orange-50 group-hover:text-[#FF6500] transition-colors">
                              <FaCompass className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900 group-hover:text-[#FF6500] transition-colors">Browse Full Catalog</p>
                              <p className="text-[10px] text-slate-400">Explore construction materials</p>
                            </div>
                          </div>
                          <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <div
                          onClick={() => router.push('/catalog')}
                          className="py-2.5 px-1 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-orange-50 group-hover:text-[#FF6500] transition-colors">
                              <FaCalculator className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900 group-hover:text-[#FF6500] transition-colors">Calculate Order</p>
                              <p className="text-[10px] text-slate-400">Get instant cost estimate</p>
                            </div>
                          </div>
                          <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>

                        <Link
                          href="/tracking"
                          className="py-2.5 px-1 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-orange-50 group-hover:text-[#FF6500] transition-colors">
                              <FaTruckFast className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900 group-hover:text-[#FF6500] transition-colors">Track Delivery</p>
                              <p className="text-[10px] text-slate-400">Live shipment tracking</p>
                            </div>
                          </div>
                          <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <div
                          onClick={() => setIsBoqModalOpen(true)}
                          className="py-2.5 px-1 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-orange-50 group-hover:text-[#FF6500] transition-colors">
                              <FaFileArrowUp className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900 group-hover:text-[#FF6500] transition-colors">Request BOQ Quote</p>
                              <p className="text-[10px] text-slate-400">Upload &amp; get quotation</p>
                            </div>
                          </div>
                          <FaChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                
                <div className="bg-white p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <FaChartColumn className="h-4 w-4 text-[#FF6500]" />
                    <h3 className="text-sm font-medium text-slate-900">Quick Stats</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 space-y-2">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaCartShopping className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900 leading-none">{recentOrders.length}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Orders</p>
                        <button onClick={() => setActiveTab('orders')} className="text-[10px] text-slate-600 hover:text-[#FF6500] transition-colors font-medium mt-1 inline-flex items-center gap-0.5 cursor-pointer">
                          <span>View Details</span>
                          <FaChevronRight className="h-2 w-2" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/80 space-y-2">
                      <div className="h-8 w-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaIndianRupeeSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900 leading-none">₹{totalProcurement > 0 ? totalProcurement.toLocaleString('en-IN') : '0'}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Procurement</p>
                        <button onClick={() => setActiveTab('payments')} className="text-[10px] text-slate-600 hover:text-[#FF6500] transition-colors font-medium mt-1 inline-flex items-center gap-0.5 cursor-pointer">
                          <span>View Details</span>
                          <FaChevronRight className="h-2 w-2" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/80 space-y-2">
                      <div className="h-8 w-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaBuilding className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900 leading-none">{user.savedAddresses?.length || 0}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active Sites</p>
                        <button onClick={() => setActiveTab('sites')} className="text-[10px] text-slate-600 hover:text-[#FF6500] transition-colors font-medium mt-1 inline-flex items-center gap-0.5 cursor-pointer">
                          <span>Manage Sites</span>
                          <FaChevronRight className="h-2 w-2" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50/80 space-y-2">
                      <div className="h-8 w-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaHeart className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900 leading-none">{suppliers.length}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Favorite Merchants</p>
                        <button onClick={() => setActiveTab('wishlist')} className="text-[10px] text-slate-600 hover:text-[#FF6500] transition-colors font-medium mt-1 inline-flex items-center gap-0.5 cursor-pointer">
                          <span>View Merchants</span>
                          <FaChevronRight className="h-2 w-2" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-[#0B1528] text-white p-5 shadow-md space-y-3">
                  <img
                    src="/images/hero_banner.png"
                    alt="Watermark"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                  />
                  <div className="relative z-10 space-y-2">
                    <div className="h-9 w-9 rounded-2xl bg-white/10 text-[#FF6500] flex items-center justify-center">
                      <FaHelmetSafety className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Need Help with Bulk Orders?</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        Our team is here to support you with better rates and faster delivery.
                      </p>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => router.push('/catalog')}
                        className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Contact Support</span>
                        <FaArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <FaHeadset className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Need Assistance?</h3>
                      <p className="text-[10px] text-slate-400">Our support team is available 24/7 for all your queries.</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    
                    <a
                      href="tel:18004259999"
                      className="p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 flex items-center gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaPhone className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Call Us</p>
                        <p className="font-medium text-slate-900">1800-425-9999</p>
                      </div>
                    </a>

                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 flex items-center gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaWhatsapp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">WhatsApp</p>
                        <p className="font-medium text-slate-900">No data</p>
                      </div>
                    </a>

                    <a
                      href="mailto:support@materialhub.in"
                      className="p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 flex items-center gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FaEnvelope className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Email Us</p>
                        <p className="font-medium text-slate-900 truncate">support@materialhub.in</p>
                      </div>
                    </a>

                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-medium text-slate-900">Material Procurement Order History</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit trail of factory-direct orders, GST tax invoices, and site dispatch status</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/catalog')}>
                  New Material Order
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-2xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium text-slate-900 text-sm">{ord.id}</span>
                        <span className={`text-xs ${ord.statusColor}`}>{ord.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{ord.items}</p>
                      <p className="text-[11px] text-slate-400">Placed on {ord.date} <span className="h-2 w-px bg-slate-300 inline-block mx-1.5" /></p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                      <span className="text-sm font-semibold text-slate-900">{ord.amount}</span>
                      {(ord.rawStatus === 'pending' || ord.rawStatus === 'confirmed') && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(ord.rawId || ord.id)}
                          disabled={cancellingOrderId === (ord.rawId || ord.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          {cancellingOrderId === (ord.rawId || ord.id) ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {ord.rawStatus === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRatingOrderId(ord.rawId || ord.id)}
                        >
                          Rate Store
                        </Button>
                      )}
                      <Button variant="primary" size="sm" onClick={() => router.push('/tracking')}>
                        Track Delivery
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                    {activeTab === 'boq' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-medium text-slate-900">Factory Bill of Quantities (BOQ) Quotes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Bulk procurement schedules submitted for pre-negotiated factory wholesale pricing</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsBoqModalOpen(true)}>
                  Submit New BOQ Request
                </Button>
              </div>

              {boqQuotes.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <FaFileArrowUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">No BOQ Schedules Submitted</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Upload your construction drawings, material spreadsheets, or paste quantities to receive factory-direct estimates.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setIsBoqModalOpen(true)}>
                    Upload BOQ Schedule
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {boqQuotes.map((q: any) => (
                    <div key={q.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-900 text-sm">{q.projectName || q.project_name}</span>
                          <span className={`text-xs font-semibold ${
                            q.status === 'quoted'
                              ? 'text-emerald-600'
                              : q.status === 'approved'
                              ? 'text-blue-600'
                              : 'text-amber-600'
                          }`}>
                            {q.status === 'under_review' ? 'Under Review' : q.status === 'quoted' ? 'Quote Ready' : q.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium line-clamp-2">
                          {q.rawMaterialsText || q.raw_materials_text || 'Materials schedule attached via document upload'}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Site: {q.siteAddress || q.site_address || q.deliveryPincode || q.delivery_pincode}</span>
                          <span className="h-2 w-px bg-slate-300 inline-block" />
                          <span>Submitted: {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : 'Recent'}</span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                        <span className="text-xs text-slate-400 font-medium">Wholesale Estimate</span>
                        <span className="text-base font-semibold text-slate-900">
                          {Number(q.estimatedTotal || q.estimated_total || 0) > 0
                            ? `₹${Number(q.estimatedTotal || q.estimated_total).toLocaleString('en-IN')}`
                            : 'Awaiting Pricing'}
                        </span>
                        {(q.fileUrl || q.file_url) && (
                          <a
                            href={q.fileUrl || q.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-[#FF6500] hover:underline"
                          >
                            View Attached File
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-medium text-slate-900">B2B Banking &amp; Procurement Credit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Approved contractor credit terms, payment receipts, and settlement bank accounts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FaLandmark className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-900">HDFC Corporate Bank Account</h4>
                      <p className="text-xs text-slate-400">Primary settlement account for GST refunds</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{user.bankAccount ? `A/C: ${user.bankAccount}` : 'A/C Linked via GSTIN Corporate Verification'}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <FaCircleCheck className="h-3 w-3" /> Auto-Debit &amp; Refunds Active
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center">
                      <FaFileInvoiceDollar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-900">B2B Wholesale Credit Limit</h4>
                      <p className="text-xs text-slate-400">Contractor 30-Day revolving terms</p>
                    </div>
                  </div>
                  <p className="text-xl font-medium text-slate-900">{user.creditLimit ? `₹${Number(user.creditLimit).toLocaleString('en-IN')}` : 'Wholesale Net-30'} <span className="text-xs text-slate-400 font-normal">Active Facility</span></p>
                  <p className="text-xs text-slate-500">Available: <strong className="text-emerald-600">Eligible on Verified BOQ</strong> <span className="h-2 w-px bg-slate-300 inline-block mx-1.5" /> Direct Merchant Invoicing</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-medium text-slate-900">Verified Hardware Merchants</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your pinned suppliers with pre-negotiated wholesale pricing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50/80 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 text-sm">{m.name}</h4>
                        <span className="text-xs font-medium text-amber-500 flex items-center gap-1"><FaStar className="h-3 w-3" /> {m.rating}</span>
                      </div>
                      <p className="text-xs text-slate-500">{m.address}</p>
                      <p className="text-[11px] text-slate-400">{m.distanceKm} KM Away <span className="h-2 w-px bg-slate-300 inline-block mx-1.5" /> {m.deliveryEtaMinutes} Mins Dispatch</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onOpenStore(m)} className="w-full justify-center">
                      View Store Catalog
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-medium text-slate-900">Security &amp; Language Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage portal credentials and app preferences</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaGlobe className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-900">Regional Language</p>
                      <p className="text-[11px] text-slate-400">English / Malayalam / Hindi</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={onOpenLanguageModal}>
                    Change Language
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaRightFromBracket className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-900">End Active Session</p>
                      <p className="text-[11px] text-slate-400">Sign out of this contractor workstation</p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-all cursor-pointer"
                  >
                    Logout Session
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
      <BoqQuoteModal
        isOpen={isBoqModalOpen}
        onClose={() => setIsBoqModalOpen(false)}
        onSuccess={loadBoqQuotes}
      />

      <OrderRatingModal
        isOpen={Boolean(ratingOrderId)}
        onClose={() => setRatingOrderId(null)}
        orderId={ratingOrderId || ''}
        onSuccess={loadOrders}
      />
    </div>
  );
};
