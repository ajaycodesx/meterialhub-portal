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
  FaMoneyBillWave
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
          
          {/* Full-Width Contractor Profile Header Banner Card */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white font-semibold text-2xl flex items-center justify-center shrink-0 shadow-xs border border-slate-700">
                  {userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{userName}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                      <FaShieldHalved className="h-3 w-3 text-emerald-600" />
                      Verified Builder
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">Contractor / Site Manager &bull; B2B Account</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditingUser(!isEditingUser)}
                icon={<FaPenToSquare className="h-3.5 w-3.5 text-[#FF6500]" />}
                className="shrink-0"
              >
                {isEditingUser ? 'Cancel Editing' : 'Edit Account Info'}
              </Button>
            </div>

            {isEditingUser ? (
              <div className="space-y-4 pt-4 border-t border-slate-100">
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
                    Save Profile Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                  <span className="flex items-center gap-2 text-slate-500 font-normal">
                    <FaPhone className="h-3.5 w-3.5 text-[#FF6500]" /> Phone:
                  </span>
                  <span className="font-semibold text-slate-900">{userPhone}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                  <span className="flex items-center gap-2 text-slate-500 font-normal">
                    <FaEnvelope className="h-3.5 w-3.5 text-slate-400" /> Email:
                  </span>
                  <span className="font-semibold text-slate-900">{userEmail}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 col-span-1 sm:col-span-2 lg:col-span-1">
                  <span className="flex items-center gap-2 text-slate-500 font-normal">
                    <FaBuilding className="h-3.5 w-3.5 text-emerald-600" /> Default Site:
                  </span>
                  <span className="font-semibold text-slate-900 truncate max-w-[160px]">Kakkanad Tower</span>
                </div>
              </div>
            )}
          </div>

          {/* Full-Width Horizontal Navigation Tabs Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('sites')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'sites'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-700'
              }`}
            >
              <FaBuilding className="h-3.5 w-3.5" />
              <span>Saved Construction Sites</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-700'
              }`}
            >
              <FaCreditCard className="h-3.5 w-3.5" />
              <span>Bank Accounts &amp; Refunds</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-700'
              }`}
            >
              <FaHeart className="h-3.5 w-3.5" />
              <span>Wishlist &amp; Favorites</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-700'
              }`}
            >
              <FaGear className="h-3.5 w-3.5" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Full-Width Tab Content Area */}
          <div className="space-y-6">
            
            {/* TAB 1: Saved Sites */}
            {activeTab === 'sites' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900">Saved Construction Sites &amp; Addresses</h3>
                    <p className="text-xs text-slate-500 font-normal">GPS pinned unloading sites for heavy logistics delivery</p>
                  </div>
                  <Link href="/site-delivery">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenSiteModal}
                      icon={<FaPlus className="h-3 w-3" />}
                      className="shrink-0"
                    >
                      Add New Site
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <FaBuilding className="h-3.5 w-3.5 text-[#FF6500]" />
                          Kakkanad Commercial Tower Project (Default Site)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                          <FaCircleCheck className="h-2.5 w-2.5 text-emerald-600" /> GPS Pinned
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-normal pt-1">
                        <p>Address: <strong className="font-semibold text-slate-800">Site #14, Kakkanad Zone (Pincode: 682030)</strong></p>
                        <p>Supervisor: <strong className="font-semibold text-slate-800">Suresh Nair (+91 98765 43210)</strong></p>
                        <p>Access Width: <strong className="font-semibold text-slate-800">12ft+ Standard Truck</strong></p>
                        <p>Unloading Slot: <strong className="font-semibold text-slate-800">08:00 AM - 01:00 PM</strong></p>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link href="/site-delivery" className="w-full">
                        <Button variant="outline" size="sm" onClick={onOpenSiteModal} className="w-full">
                          Edit Site Instructions
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <FaBuilding className="h-3.5 w-3.5 text-slate-500" />
                          Palarivattom Residential Villa Project
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold shrink-0">
                          Secondary Site
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-normal pt-1">
                        <p>Address: <strong className="font-semibold text-slate-800">Plot #402, Palarivattom (Pincode: 682025)</strong></p>
                        <p>Supervisor: <strong className="font-semibold text-slate-800">Rajesh Menon (+91 94471 22334)</strong></p>
                        <p>Access Width: <strong className="font-semibold text-slate-800">Narrow Road (&lt; 10ft Mini Truck)</strong></p>
                        <p>Unloading Slot: <strong className="font-semibold text-slate-800">01:00 PM - 06:00 PM</strong></p>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={onOpenSiteModal} className="w-full">
                        Edit Site Instructions
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: Payment Methods & Refunds */}
            {activeTab === 'payments' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
                <div className="border-b border-slate-100 pb-3.5">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900">Connected Bank Accounts &amp; Payment Methods</h3>
                  <p className="text-xs text-slate-500 font-normal">Saved UPI IDs, bank accounts, and GST refund ledger history</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Saved Digital Payment Methods
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <FaMoneyBillWave className="h-3 w-3 text-emerald-600" /> Default UPI ID
                        </span>
                        <p className="font-semibold text-slate-900">builder.gpay@okaxis</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <FaLandmark className="h-3 w-3 text-emerald-600" /> HDFC B2B Bank Account
                        </span>
                        <p className="font-semibold text-slate-900">A/C *****8491 (IFSC: HDFC0001824)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaRotateLeft className="h-3.5 w-3.5 text-[#FF6500]" />
                      Instant Refund History Ledger
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">₹12,400 GST Refund Processed</p>
                          <p className="text-[10px] text-slate-500 font-normal">Returned 10 Bundles TMT Rods &bull; Order #MH-739102</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                          Completed
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">₹2,800 Freight Adjustment Refund</p>
                          <p className="text-[10px] text-slate-500 font-normal">Vehicle Load Adjustment &bull; Order #MH-654891</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Wishlist & Favorites */}
            {activeTab === 'wishlist' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
                <div className="border-b border-slate-100 pb-3.5">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900">Wishlist &amp; Favorite Hardware Merchants</h3>
                  <p className="text-xs text-slate-500 font-normal">Saved stores and frequently reordered construction materials</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Favorite Hardware Stores
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center">
                            K
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">Kakkanad Building Supplies Co.</h4>
                            <p className="text-[10px] text-slate-500">4.9 Rating &bull; 4.2 KM Away</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenStore(HARDWARE_MERCHANTS[0])}
                          className="w-full justify-center text-[11px]"
                        >
                          Open Store Catalog
                        </Button>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center">
                            E
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">Express Tools &amp; Plumbing Mart</h4>
                            <p className="text-[10px] text-slate-500">4.8 Rating &bull; 19.5 KM Away</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenStore(HARDWARE_MERCHANTS[1])}
                          className="w-full justify-center text-[11px]"
                        >
                          Open Store Catalog
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaBoxesStacked className="h-3.5 w-3.5 text-[#FF6500]" />
                      Frequently Reordered Materials
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">UltraTech PPC Cement 53 Grade</p>
                          <p className="text-[10px] text-slate-500 font-normal">₹385 / 50kg Bag &bull; Kakkanad Building Supplies</p>
                        </div>
                        <Button variant="primary" size="sm">Quick Reorder</Button>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Supreme PVC Pipe 110mm 4kg/cm²</p>
                          <p className="text-[10px] text-slate-500 font-normal">₹1,240 / 6m Length &bull; Express Tools</p>
                        </div>
                        <Button variant="primary" size="sm">Quick Reorder</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Account Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md space-y-5">
                <div className="border-b border-slate-100 pb-3.5">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900">Account Settings &amp; Preferences</h3>
                  <p className="text-xs text-slate-500 font-normal">App language, notifications, privacy, and session control</p>
                </div>

                <div className="space-y-3 text-xs">
                  
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaGlobe className="h-4 w-4 text-[#FF6500]" />
                      <div>
                        <h4 className="font-semibold text-slate-900">Platform Display Language</h4>
                        <p className="text-[10px] text-slate-500 font-normal">Select English, Malayalam, Hindi, or Tamil</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onOpenLanguageModal}>
                      Change Language
                    </Button>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBell className="h-4 w-4 text-emerald-600" />
                      <div>
                        <h4 className="font-semibold text-slate-900">Delivery &amp; SMS Dispatch Updates</h4>
                        <p className="text-[10px] text-slate-500 font-normal">Receive live WhatsApp tracking alerts</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                      Enabled
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaShieldHalved className="h-4 w-4 text-slate-600" />
                      <div>
                        <h4 className="font-semibold text-slate-900">Privacy &amp; GST Terms of Service</h4>
                        <p className="text-[10px] text-slate-500 font-normal">MaterialHub B2B buyer compliance agreement</p>
                      </div>
                    </div>
                    <button onClick={() => alert('Opening MaterialHub Terms of Service...')} className="text-xs font-semibold text-[#FF6500] hover:underline cursor-pointer">
                      View Terms
                    </button>
                  </div>

                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onLogout}
                      icon={<FaRightFromBracket className="h-3.5 w-3.5 text-red-500" />}
                      className="w-full text-red-600 hover:bg-red-50"
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
