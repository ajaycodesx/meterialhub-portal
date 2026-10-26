'use client';

import React, { useState } from 'react';
import {
  FaStore,
  FaCircleCheck,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPen
} from 'react-icons/fa6';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface VendorProfileSectionProps {
  profile: any;
  onUpdateProfile: (data: any) => Promise<void>;
  onToggleOnline: () => Promise<void>;
  onRefresh?: () => void;
}

export const VendorProfileSection: React.FC<VendorProfileSectionProps> = ({
  profile,
  onUpdateProfile,
  onToggleOnline
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [storeName, setStoreName] = useState(profile?.name || 'Kakkanad Building Supplies');
  const [proprietorName, setProprietorName] = useState(profile?.proprietorName || 'Ramesh Kumar');
  const [phone, setPhone] = useState(profile?.phone || '+91 98470 12345');
  const [address, setAddress] = useState(profile?.address || 'Seaport-Airport Road, Kakkanad, Kochi');
  const [pincode, setPincode] = useState(profile?.pincode || '682030');
  const [gstin, setGstin] = useState(profile?.gstin || '32AABCU9603R1ZX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSaveProfile() {
    try {
      setIsSubmitting(true);
      await onUpdateProfile({
        name: storeName,
        proprietorName,
        phone,
        address,
        pincode,
        gstin
      });
      setShowEditModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isOnline = profile?.isOnline ?? true;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-[#FF6500] shrink-0">
            <FaStore className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-medium text-slate-900">
                {profile?.name || 'Kakkanad Building Supplies'}
              </h2>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <FaCircleCheck className="h-3 w-3" />
                Verified Depot
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <span>Registered Merchant ID: {profile?.id || 'm1'}</span>
              <span className="h-2.5 w-px bg-slate-300 inline-block" />
              <span>Proprietor: {profile?.proprietorName || 'Ramesh Kumar'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleOnline}
            className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
              isOnline
                ? 'text-emerald-700 bg-white border-slate-200 hover:bg-slate-50'
                : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-xs inline-block ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>{isOnline ? 'Store Accepting Orders' : 'Store Offline'}</span>
          </button>

          <Button
            variant="secondary"
            size="md"
            icon={<FaPen className="h-3.5 w-3.5" />}
            iconPosition="left"
            onClick={() => {
              setStoreName(profile?.name || 'Kakkanad Building Supplies');
              setProprietorName(profile?.proprietorName || 'Ramesh Kumar');
              setPhone(profile?.phone || '+91 98470 12345');
              setAddress(profile?.address || 'Seaport-Airport Road, Kakkanad, Kochi');
              setPincode(profile?.pincode || '682030');
              setGstin(profile?.gstin || '32AABCU9603R1ZX');
              setShowEditModal(true);
            }}
            className="shrink-0"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-3">
            Depot Physical Address & Contact
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <FaLocationDot className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-500 block mb-0.5">Yard Location</span>
                <p className="font-medium text-slate-800 leading-relaxed">
                  {profile?.address || 'Seaport-Airport Road, Kakkanad, Kochi, Kerala'}
                </p>
                <p className="text-slate-500 font-medium">PIN: {profile?.pincode || '682030'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <FaPhone className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 block mb-0.5">Commercial Phone</span>
                <span className="font-medium text-slate-800">
                  {profile?.phone || '+91 98470 12345'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <FaEnvelope className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 block mb-0.5">Contact Email</span>
                <span className="font-medium text-slate-800">
                  {profile?.email || 'vendor@materialhub.in'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <FaClock className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 block mb-0.5">Loading Bay Hours</span>
                <span className="font-medium text-slate-800">
                  Monday – Saturday: 06:00 AM – 08:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-3">
            Statutory & Tax Registrations
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block mb-0.5">GSTIN Registration</span>
                <span className="font-medium text-slate-900 tracking-wider">
                  {profile?.gstin || '32AABCU9603R1ZX'}
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-600">
                Active Taxpayer
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block mb-0.5">Permanent Account Number (PAN)</span>
                <span className="font-medium text-slate-900 tracking-wider">
                  AABCU9603R
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-600">
                Verified
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block mb-0.5">Commercial Delivery Radius</span>
                <span className="font-medium text-slate-900">
                  35 km radius from Kakkanad Depot
                </span>
              </div>
              <span className="text-slate-500 font-medium">Standard Logistics</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block mb-0.5">Platform Service Agreement</span>
                <span className="font-medium text-slate-900">
                  MaterialHub Verified Partner v2.4
                </span>
              </div>
              <span className="text-emerald-600 font-medium">Executed</span>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Update Store Profile & Operations"
          subtitle="Keep your depot address, contact numbers, and legal records up to date"
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleSaveProfile}
              >
                Save Profile
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Depot / Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Proprietor Full Name"
                value={proprietorName}
                onChange={(e) => setProprietorName(e.target.value)}
                required
              />

              <Input
                label="Direct Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Input
              label="Physical Depot Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Postal PIN Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />

              <Input
                label="GSTIN Number"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
