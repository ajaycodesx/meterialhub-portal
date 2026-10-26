'use client';

import React, { useState } from 'react';
import {
  FaIdCard,
  FaTruckFast,
  FaBuildingColumns,
  FaCircleCheck,
  FaPen,
  FaStar
} from 'react-icons/fa6';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface DriverProfileSectionProps {
  profile: any;
  onUpdateProfile: (data: any) => Promise<void>;
  onRefresh?: () => void;
}

export const DriverProfileSection: React.FC<DriverProfileSectionProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(profile?.name || 'Manoj K');
  const [phone, setPhone] = useState(profile?.phone || '+91 94470 98765');
  const [vehicleType, setVehicleType] = useState(
    profile?.vehicleType || 'Mini Commercial Truck (3 Ton)'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    try {
      setIsSubmitting(true);
      await onUpdateProfile({
        name,
        phone,
        vehicleType
      });
      setShowEditModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-orange-50 text-[#FF6500] shrink-0">
            <FaTruckFast className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-medium text-slate-900">
                {profile?.name || 'Manoj K'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <FaCircleCheck className="h-3 w-3" />
                Verified Carrier
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Carrier ID: {profile?.driverId || 'u_driver_1'} • Assigned Unit: {profile?.vehicleRegNumber || 'KL-07-CD-8921'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-500 block">Carrier Rating</span>
            <span className="font-medium text-slate-900 text-sm flex items-center gap-1">
              <FaStar className="h-3 w-3 text-amber-500" />
              {profile?.rating || 4.95} / 5.0
            </span>
          </div>

          <Button
            variant="secondary"
            size="md"
            icon={<FaPen className="h-3.5 w-3.5" />}
            iconPosition="left"
            onClick={() => {
              setName(profile?.name || 'Manoj K');
              setPhone(profile?.phone || '+91 94470 98765');
              setVehicleType(profile?.vehicleType || 'Mini Commercial Truck (3 Ton)');
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
          <h3 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FaIdCard className="h-4 w-4 text-[#FF6500]" />
            <span>Driver Commercial Credentials</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Heavy Driving Licence (HMV)</span>
                <span className="font-medium text-slate-900 tracking-wider">
                  {profile?.licenseNumberMasked || 'KL-07-••••••••492'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Licence Validity</span>
                <span className="font-medium text-slate-900">
                  Valid till {profile?.licenseExpiry || '2029-08-15'}
                </span>
              </div>
              <span className="text-slate-500 font-medium">Kerala Motor Vehicles</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Lifetime Completed Trips</span>
                <span className="font-medium text-slate-900">
                  {profile?.completedTripsLifetime || 128} site deliveries
                </span>
              </div>
              <span className="text-emerald-600 font-medium">Gold Carrier Tier</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Contact Phone Number</span>
                <span className="font-medium text-slate-900">
                  {profile?.phone || '+91 94470 98765'}
                </span>
              </div>
              <span className="text-slate-500 font-medium">SMS Notifications</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FaTruckFast className="h-4 w-4 text-[#FF6500]" />
            <span>Commercial Vehicle Compliance</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Commercial Vehicle Type</span>
                <span className="font-medium text-slate-900">
                  {profile?.vehicleType || 'Mini Commercial Truck (3 Ton)'}
                </span>
              </div>
              <span className="text-slate-500 font-medium">Tata Ace / 407</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Vehicle Registration Number</span>
                <span className="font-medium text-slate-900 tracking-wider">
                  {profile?.vehicleRegNumber || 'KL-07-CD-8921'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800">
                Commercial Permit
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Payload Capacity</span>
                <span className="font-medium text-slate-900">
                  {profile?.payloadCapacityTons || 3.5} Metric Tons
                </span>
              </div>
              <span className="text-slate-500 font-medium">Heavy Freight</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50">
              <div>
                <span className="text-slate-500 block mb-0.5">Insurance &amp; Fitness Certificates</span>
                <span className="font-medium text-slate-900">
                  Comprehensive Commercial Coverage
                </span>
              </div>
              <span className="text-emerald-600 font-medium">Active &amp; Insured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FaBuildingColumns className="h-4 w-4 text-[#FF6500]" />
          <span>Direct Payout Commercial Beneficiary</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">Beneficiary Bank</span>
            <span className="font-medium text-slate-900 text-sm">
              {profile?.bankName || 'State Bank of India'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">Account Number (Masked)</span>
            <span className="font-medium text-slate-900 text-sm tracking-wider">
              {profile?.bankAccountMasked || '•••• •••• •••• 9214'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50">
            <span className="text-slate-500 block mb-0.5">IFSC Routing Code</span>
            <span className="font-medium text-slate-900 text-sm">
              {profile?.ifsc || 'SBIN0007821'}
            </span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Update Carrier Profile"
          subtitle="Update direct contact details and commercial vehicle association"
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleSave}
              >
                Save Profile
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Driver Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Contact Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="Commercial Vehicle Model / Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
