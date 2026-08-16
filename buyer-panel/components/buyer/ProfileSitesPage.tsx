'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FaUser, 
  FaPenToSquare, 
  FaBuilding, 
  FaLocationDot, 
  FaPlus, 
  FaCreditCard, 
  FaLandmark, 
  FaHeart, 
  FaStore, 
  FaGear, 
  FaBell, 
  FaGlobe, 
  FaRightFromBracket, 
  FaCircleCheck, 
  FaShieldHalved, 
  FaChevronRight, 
  FaPhone, 
  FaEnvelope, 
  FaRotateLeft,
  FaBoxesStacked,
  FaMoneyBillWave,
  FaTruckFast,
  FaStar,
  FaReceipt,
  FaArrowRight
} from 'react-icons/fa6';
import { UserProfile, LocationState, HardwareMerchant } from '../../types/buyer';
import { HARDWARE_MERCHANTS } from '../../data/mockBuyerData';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

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
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userName, setUserName] = useState(user.name || 'Ajay Kumar');
  const [userPhone, setUserPhone] = useState(user.phone || '+91 98765 43210');
  const [userEmail, setUserEmail] = useState(user.email || 'ajay.builder@materialhub.in');
  const [activeTab, setActiveTab] = useState<'sites' | 'payments' | 'wishlist' | 'settings'>('sites');

  const handleSaveUser = () => {
    setIsEditingUser(false);
  };

  return (
    <div className="flex-1 bg-transparent">
      <section className="py-5 sm:py-10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          
          {/* Cover Banner & Contractor Profile Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-xl space-y-6">
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Profile Identity */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-[#FF6500] to-amber-400 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-lg ring-4 ring-white/10">
                  {userName.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-white">{userName}</h1>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Verified Class-A Contractor
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-300 font-normal">
                    Civil Contractor &bull; GSTIN: <span className="font-mono text-slate-200 font-medium">32AABCU9603R1ZM</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FaPhone className="h-3 w-3 text-[#FF6500]" /> {userPhone}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1.5">
                      <FaEnvelope className="h-3 w-3 text-slate-400" /> {userEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Procurement Quick Stats */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700/60 shrink-0">
                <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">Total Procurement</p>
                  <p className="text-base sm:text-xl font-semibold text-white">₹14.80L</p>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">Active Sites</p>
                  <p className="text-base sm:text-xl font-semibold text-emerald-400">2 Pinned</p>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">Deliveries</p>
                  <p className="text-base sm:text-xl font-semibold text-orange-400">18 Orders</p>
                </div>
              </div>

            </div>

            {/* Quick Profile Edit Drawer Toggle */}
            <div className="relative z-10 pt-2 flex items-center justify-between border-t border-slate-700/60">
              <span className="text-xs text-slate-400">Primary Unloading Zone: <strong className="text-slate-200 font-semibold">Kakkanad IT Zone</strong></span>
              <button
                onClick={() => setIsEditingUser(!isEditingUser)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-300 transition-all cursor-pointer"
              >
                <FaPenToSquare className="h-3.5 w-3.5" />
                <span>{isEditingUser ? 'Close Form' : 'Update Profile Info'}</span>
              </button>
            </div>

            {/* Editing Form */}
            {isEditingUser && (
              <div className="relative z-10 pt-4 border-t border-slate-700 bg-slate-800/80 p-4 sm:p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-white">Update Contractor Account Details</h3>
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
          </div>

          {/* Equal-Width Divided Platform Navigation Buttons Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <button
              onClick={() => setActiveTab('sites')}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all h-10 sm:h-11 shadow-2xs cursor-pointer ${
                activeTab === 'sites'
                  ? 'bg-slate-900 text-white border border-slate-900'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800'
              }`}
            >
              <FaBuilding className={`h-3.5 w-3.5 ${activeTab === 'sites' ? 'text-[#FF6500]' : 'text-slate-500'}`} />
              <span className="truncate">Saved Construction Sites</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all h-10 sm:h-11 shadow-2xs cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-slate-900 text-white border border-slate-900'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800'
              }`}
            >
              <FaCreditCard className={`h-3.5 w-3.5 ${activeTab === 'payments' ? 'text-[#FF6500]' : 'text-slate-500'}`} />
              <span className="truncate">B2B Banking &amp; Refunds</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all h-10 sm:h-11 shadow-2xs cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-slate-900 text-white border border-slate-900'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800'
              }`}
            >
              <FaHeart className={`h-3.5 w-3.5 ${activeTab === 'wishlist' ? 'text-red-500' : 'text-slate-500'}`} />
              <span className="truncate">Favorite Merchants &amp; Reorder</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all h-10 sm:h-11 shadow-2xs cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white border border-slate-900'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800'
              }`}
            >
              <FaGear className={`h-3.5 w-3.5 ${activeTab === 'settings' ? 'text-slate-300' : 'text-slate-500'}`} />
              <span className="truncate">Security &amp; Preferences</span>
            </button>
          </div>

          {/* Active Tab View Panels */}
          <div className="space-y-6">
            
            {/* TAB 1: Saved Construction Sites */}
            {activeTab === 'sites' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Registered Construction Sites</h2>
                    <p className="text-xs text-slate-500 font-normal">GPS coordinates and heavy truck access protocols for automated dispatch</p>
                  </div>

                  <Link href="/site-delivery">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenSiteModal}
                      icon={<FaPlus className="h-3.5 w-3.5" />}
                    >
                      Add New Construction Site
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  
                  {/* Site Card 1 */}
                  <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                            <FaBuilding className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base text-slate-900">Kakkanad Commercial Tower</h3>
                            <p className="text-xs text-slate-500 font-normal">Primary Default Site &bull; Zone 14</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 shrink-0">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span>GPS Pinned</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-normal">
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Physical Address</span>
                          <p className="font-semibold text-slate-900">Site #14, Kakkanad Zone, Kochi (682030)</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Site Supervisor</span>
                          <p className="font-semibold text-slate-900">Suresh Nair (+91 98765 43210)</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                            <FaTruckFast className="h-3 w-3 text-emerald-600" /> Truck Compatibility
                          </span>
                          <p className="font-semibold text-slate-900">12ft+ Standard Multi-Axle Ready</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Unloading Time Window</span>
                          <p className="font-semibold text-slate-900">08:00 AM - 01:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <Link href="/site-delivery" className="w-full">
                        <Button variant="outline" size="sm" onClick={onOpenSiteModal} className="w-full justify-center">
                          Edit Delivery Protocol
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Site Card 2 */}
                  <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <FaBuilding className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base text-slate-900">Palarivattom Residential Villa</h3>
                            <p className="text-xs text-slate-500 font-normal">Secondary Site &bull; Plot #402</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold shrink-0">
                          Secondary Site
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-normal">
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Physical Address</span>
                          <p className="font-semibold text-slate-900">Plot #402, Palarivattom, Kochi (682025)</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Site Supervisor</span>
                          <p className="font-semibold text-slate-900">Rajesh Menon (+91 94471 22334)</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                            <FaTruckFast className="h-3 w-3 text-orange-500" /> Truck Compatibility
                          </span>
                          <p className="font-semibold text-slate-900">Narrow Road (&lt; 10ft Mini Truck)</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Unloading Time Window</span>
                          <p className="font-semibold text-slate-900">01:00 PM - 06:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={onOpenSiteModal} className="w-full justify-center">
                        Edit Delivery Protocol
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: B2B Banking & Refund Ledger */}
            {activeTab === 'payments' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                <div className="border-b border-slate-100 pb-3.5">
                  <h2 className="text-lg font-semibold text-slate-900">Connected B2B Bank Accounts &amp; Refunds</h2>
                  <p className="text-xs text-slate-500 font-normal">Verified payment credentials, credit limit ledgers, and automated GST refund tracking</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Saved Payment Methods */}
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaCreditCard className="h-4 w-4 text-[#FF6500]" />
                      Saved Payment Credentials
                    </h3>
                    
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-1 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FaMoneyBillWave className="h-3 w-3 text-emerald-600" /> Default UPI VPA
                          </span>
                          <p className="font-semibold text-slate-900 text-sm mt-0.5">builder.gpay@okaxis</p>
                        </div>
                        
                        {/* Glowing Emerald Dot Status Indicator Only */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-1 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FaLandmark className="h-3 w-3 text-emerald-600" /> HDFC Corporate Current Account
                          </span>
                          <p className="font-semibold text-slate-900 text-sm mt-0.5">A/C *****8491 (IFSC: HDFC0001824)</p>
                        </div>
                        
                        {/* Glowing Emerald Dot Status Indicator Only */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instant Refund Ledger */}
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaRotateLeft className="h-4 w-4 text-[#FF6500]" />
                      Automated Refund Ledger
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">₹12,400 GST Refund Processed</p>
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5">10 Bundles TMT Rods Returned &bull; Order #MH-739102</p>
                        </div>
                        
                        {/* Glowing Emerald Dot Status Indicator Only */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">₹2,800 Freight Adjustment Refund</p>
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5">Vehicle Load Adjustment &bull; Order #MH-654891</p>
                        </div>
                        
                        {/* Glowing Emerald Dot Status Indicator Only */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: Favorite Merchants & Reorder */}
            {activeTab === 'wishlist' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                <div className="border-b border-slate-100 pb-3.5">
                  <h2 className="text-lg font-semibold text-slate-900">Favorite Hardware Merchants &amp; Reorder Catalog</h2>
                  <p className="text-xs text-slate-500 font-normal">Fast 1-tap reorder for high volume construction materials</p>
                </div>

                <div className="space-y-6">
                  
                  {/* Favorite Hardware Stores Grid */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaStore className="h-4 w-4 text-[#FF6500]" /> Saved Hardware Stores
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center text-sm shrink-0">
                            K
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">Kakkanad Building Supplies Co.</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-normal mt-0.5">
                              <span className="flex items-center gap-1 text-amber-500 font-semibold"><FaStar className="h-3 w-3" /> 4.9</span>
                              <span>•</span>
                              <span>4.2 KM Away</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenStore(HARDWARE_MERCHANTS[0])}
                          className="w-full justify-center"
                        >
                          Explore Store Catalog
                        </Button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center text-sm shrink-0">
                            E
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">Express Tools &amp; Plumbing Mart</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-normal mt-0.5">
                              <span className="flex items-center gap-1 text-amber-500 font-semibold"><FaStar className="h-3 w-3" /> 4.8</span>
                              <span>•</span>
                              <span>19.5 KM Away</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenStore(HARDWARE_MERCHANTS[1])}
                          className="w-full justify-center"
                        >
                          Explore Store Catalog
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Frequently Reordered Materials */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaBoxesStacked className="h-4 w-4 text-[#FF6500]" /> Frequently Reordered Materials
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">UltraTech PPC Cement 53 Grade</p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">₹385 / 50kg Bag &bull; Kakkanad Building Supplies</p>
                        </div>
                        <Button variant="primary" size="sm" className="shrink-0">
                          1-Tap Reorder
                        </Button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Supreme PVC Pipe 110mm 4kg/cm²</p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">₹1,240 / 6m Length &bull; Express Tools</p>
                        </div>
                        <Button variant="primary" size="sm" className="shrink-0">
                          1-Tap Reorder
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: Security & Preferences */}
            {activeTab === 'settings' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                <div className="border-b border-slate-100 pb-3.5">
                  <h2 className="text-lg font-semibold text-slate-900">Security &amp; Preference Controls</h2>
                  <p className="text-xs text-slate-500 font-normal">Manage regional display languages, WhatsApp dispatch alerts, and session controls</p>
                </div>

                <div className="space-y-4 text-xs">
                  
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                        <FaGlobe className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">Platform Display Language</h3>
                        <p className="text-xs text-slate-500 font-normal">Select English, Malayalam, Hindi, or Tamil</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onOpenLanguageModal}>
                      Change Language
                    </Button>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FaBell className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">Live Dispatch WhatsApp Alerts</h3>
                        <p className="text-xs text-slate-500 font-normal">Instant driver location links sent to site supervisor phone</p>
                      </div>
                    </div>
                    
                    {/* Glowing Emerald Dot Status Indicator Only */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <FaShieldHalved className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">B2B Compliance &amp; GST Terms</h3>
                        <p className="text-xs text-slate-500 font-normal">MaterialHub B2B buyer legal agreement</p>
                      </div>
                    </div>
                    <button onClick={() => alert('Opening MaterialHub Terms of Service...')} className="text-xs font-semibold text-[#FF6500] hover:underline cursor-pointer">
                      View Terms
                    </button>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onLogout}
                      icon={<FaRightFromBracket className="h-4 w-4 text-red-500" />}
                      className="w-full text-red-600 hover:bg-red-50 justify-center h-12"
                    >
                      Logout from Account
                    </Button>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
};
