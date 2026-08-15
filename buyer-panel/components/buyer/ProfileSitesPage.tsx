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
    <div className="flex-1 bg-[#F8FAFC] py-4 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
        
        <div>
          <h1 className="text-xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Profile &amp; Construction Sites
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Manage your contractor account, saved unloading site locations, and B2B bank details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white font-semibold text-xl flex items-center justify-center shrink-0 shadow-xs">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-base text-slate-900">{userName}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                        <FaShieldHalved className="h-2.5 w-2.5 text-emerald-600" />
                        Verified Builder
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Contractor / Site Manager</p>
                  </div>
                </div>
              </div>

              {isEditingUser ? (
                <div className="space-y-3 pt-2">
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
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" size="sm" onClick={handleSaveUser} className="w-full">
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingUser(false)} className="w-full">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="flex items-center gap-2 text-slate-500 font-normal">
                      <FaPhone className="h-3 w-3 text-[#FF6500]" /> Phone:
                    </span>
                    <span className="font-semibold text-slate-900">{userPhone}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="flex items-center gap-2 text-slate-500 font-normal">
                      <FaEnvelope className="h-3 w-3 text-slate-400" /> Email:
                    </span>
                    <span className="font-semibold text-slate-900">{userEmail}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditingUser(true)}
                    icon={<FaPenToSquare className="h-3.5 w-3.5 text-[#FF6500]" />}
                    className="w-full mt-2"
                  >
                    Edit Account Information
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-3xl shadow-xs space-y-1">
              <button
                onClick={() => setActiveTab('sites')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'sites' ? 'bg-orange-50 text-[#FF6500]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FaBuilding className="h-4 w-4" /> Saved Construction Sites
                </span>
                <FaChevronRight className="h-3 w-3" />
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'payments' ? 'bg-orange-50 text-[#FF6500]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FaCreditCard className="h-4 w-4" /> Bank Accounts &amp; Refunds
                </span>
                <FaChevronRight className="h-3 w-3" />
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-orange-50 text-[#FF6500]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FaHeart className="h-4 w-4" /> Wishlist &amp; Favorite Stores
                </span>
                <FaChevronRight className="h-3 w-3" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'bg-orange-50 text-[#FF6500]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FaGear className="h-4 w-4" /> Account Settings &amp; Preferences
                </span>
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>

          </div>

          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === 'sites' && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-slate-900">Saved Construction Sites &amp; Addresses</h3>
                    <p className="text-xs text-slate-500 font-normal">GPS pinned unloading sites for heavy logistics delivery</p>
                  </div>
                  <Link href="/site-delivery">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenSiteModal}
                      icon={<FaPlus className="h-3 w-3" />}
                    >
                      Add New Site
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  
                  <div className="p-4 rounded-2xl bg-orange-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaBuilding className="h-3.5 w-3.5 text-orange-400" />
                        Kakkanad Commercial Tower Project (Default Site)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                        <FaCircleCheck className="h-2.5 w-2.5" /> GPS Pinned
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-normal">
                      <p>Address: <strong className="font-semibold text-slate-800">Site #14, Kakkanad Zone (Pincode: 682030)</strong></p>
                      <p>Supervisor: <strong className="font-semibold text-slate-800">Suresh Nair (+91 98765 43210)</strong></p>
                      <p>Access Width: <strong className="font-semibold text-slate-800">12ft+ Standard Truck</strong></p>
                      <p>Unloading Slot: <strong className="font-semibold text-slate-800">08:00 AM - 01:00 PM</strong></p>
                    </div>

                    <div className="pt-1 flex gap-2">
                      <Link href="/site-delivery">
                        <Button variant="outline" size="sm" onClick={onOpenSiteModal}>
                          Edit Site Instructions
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <FaBuilding className="h-3.5 w-3.5 text-slate-500" />
                        Palarivattom Residential Villa Project
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                        Secondary Site
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-normal">
                      <p>Address: <strong className="font-semibold text-slate-800">Plot #402, Palarivattom (Pincode: 682025)</strong></p>
                      <p>Supervisor: <strong className="font-semibold text-slate-800">Rajesh Menon (+91 94471 22334)</strong></p>
                      <p>Access Width: <strong className="font-semibold text-slate-800">Narrow Road (&lt; 10ft Mini Truck)</strong></p>
                      <p>Unloading Slot: <strong className="font-semibold text-slate-800">01:00 PM - 06:00 PM</strong></p>
                    </div>

                    <div className="pt-1 flex gap-2">
                      <Button variant="outline" size="sm" onClick={onOpenSiteModal}>
                        Edit Site Instructions
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-5">
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Connected Bank Accounts &amp; Payment Methods</h3>
                  <p className="text-xs text-slate-500 font-normal">Saved UPI IDs, bank accounts, and GST refund ledger history</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Saved Digital Payment Methods
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-white space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <FaMoneyBillWave className="h-3 w-3 text-emerald-600" /> Default UPI ID
                        </span>
                        <p className="font-semibold text-slate-900">builder.gpay@okaxis</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <FaLandmark className="h-3 w-3 text-emerald-600" /> HDFC B2B Bank Account
                        </span>
                        <p className="font-semibold text-slate-900">A/C *****8491 (IFSC: HDFC0001824)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaRotateLeft className="h-3.5 w-3.5 text-[#FF6500]" />
                      Instant Refund History Ledger
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">₹12,400 GST Refund Processed</p>
                          <p className="text-[10px] text-slate-500 font-normal">Returned 10 Bundles TMT Rods • Order #MH-739102</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          Completed
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">₹2,800 Freight Adjustment Refund</p>
                          <p className="text-[10px] text-slate-500 font-normal">Vehicle Load Adjustment • Order #MH-654891</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-5">
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Wishlist &amp; Favorite Hardware Merchants</h3>
                  <p className="text-xs text-slate-500 font-normal">Saved stores and frequently reordered construction materials</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Favorite Hardware Stores
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center">
                            K
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">Kakkanad Building Supplies Co.</h4>
                            <p className="text-[10px] text-slate-500">4.9 Rating • 4.2 KM Away</p>
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

                      <div className="p-3.5 rounded-2xl bg-white space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center">
                            E
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">Express Tools &amp; Plumbing Mart</h4>
                            <p className="text-[10px] text-slate-500">4.8 Rating • 19.5 KM Away</p>
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

                  <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FaBoxesStacked className="h-3.5 w-3.5 text-[#FF6500]" />
                      Frequently Reordered Materials
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">UltraTech PPC Cement 53 Grade</p>
                          <p className="text-[10px] text-slate-500 font-normal">₹385 / 50kg Bag • Kakkanad Building Supplies</p>
                        </div>
                        <Button variant="primary" size="sm">Quick Reorder</Button>
                      </div>

                      <div className="p-3 rounded-2xl bg-white flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">Supreme PVC Pipe 110mm 4kg/cm²</p>
                          <p className="text-[10px] text-slate-500 font-normal">₹1,240 / 6m Length • Express Tools</p>
                        </div>
                        <Button variant="primary" size="sm">Quick Reorder</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs space-y-5">
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Account Settings &amp; Preferences</h3>
                  <p className="text-xs text-slate-500 font-normal">App language, notifications, privacy, and session control</p>
                </div>

                <div className="space-y-3 text-xs">
                  
                  <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
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

                  <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBell className="h-4 w-4 text-emerald-600" />
                      <div>
                        <h4 className="font-semibold text-slate-900">Delivery &amp; SMS Dispatch Updates</h4>
                        <p className="text-[10px] text-slate-500 font-normal">Receive live WhatsApp tracking alerts</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      Enabled
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between">
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

                  <div className="pt-2">
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

      </div>
    </div>
  );
};
