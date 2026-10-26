'use client';

import React from 'react';
import {
  FaUserCheck,
  FaTruckFast,
  FaIdCard,
  FaBuildingColumns,
  FaStar,
  FaArrowRightFromBracket,
  FaHeadset
} from 'react-icons/fa6';

interface DriverAccountTabProps {
  profile: any;
  isOnline: boolean;
  onToggleOnline: () => Promise<void>;
  onLogout: () => void;
}

export function DriverAccountTab({
  profile,
  isOnline,
  onToggleOnline,
  onLogout,
}: DriverAccountTabProps) {
  const [toggling, setToggling] = React.useState(false);

  async function handleToggle() {
    try {
      setToggling(true);
      await onToggleOnline();
    } finally {
      setToggling(false);
    }
  }

  const name = profile?.name || 'Manoj K';
  const phone = profile?.phone || '+91 98470 54321';
  const email = profile?.email || 'driver@materialhub.in';
  const vehicleName = profile?.vehicleType || 'Ashok Leyland 1618';
  const regNumber = profile?.vehicleRegNumber || 'KL 07 AB 1234';
  const licenseNumber = profile?.licenseNumberMasked || 'KL-07-2024-0012345';
  const payloadCapacity = profile?.payloadCapacityTons || 16;
  const rating = profile?.rating || 4.95;
  const completedTrips = profile?.completedTripsLifetime || 128;
  const bankName = profile?.bankName || 'State Bank of India';
  const bankAccount = profile?.bankAccountMasked || '•••• •••• •••• 9214';
  const ifsc = profile?.ifsc || 'SBIN0007821';

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="pt-2 space-y-0.5">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
          CARRIER PROFILE
        </span>
        <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
          Account
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-xs inline-block ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Duty Status
                </span>
              </div>
              <h2 className="text-base font-medium text-slate-900">
                {isOnline ? 'Active · Accepting Dispatches' : 'Inactive · Availability Paused'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isOnline
                  ? 'Vendors and automated dispatch will route nearby orders to your vehicle.'
                  : 'Switch active when ready to receive vehicle assignments.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              disabled={toggling}
              aria-label={isOnline ? 'Switch to Inactive' : 'Switch to Active'}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-xl p-1 transition-colors duration-200 disabled:opacity-50 ${
                isOnline ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-lg bg-white shadow-md transition duration-200 ${
                  isOnline ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center font-medium text-xl shadow-md shrink-0">
                {name.charAt(0)}
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-slate-900">
                    {name}
                  </h2>
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <FaUserCheck className="h-3 w-3" />
                    <span>Verified Carrier</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{phone}</p>
                <p className="text-xs text-slate-400 font-medium">{email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-medium text-slate-400 uppercase block">
                  CARRIER RATING
                </span>
                <div className="flex items-center gap-1 pt-0.5">
                  <FaStar className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-sm font-medium text-slate-900">{rating} / 5.0</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-medium text-slate-400 uppercase block">
                  LIFETIME DELIVERIES
                </span>
                <span className="text-sm font-medium text-slate-900 block pt-0.5">
                  {completedTrips} Trips
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <a
              href="tel:+919876543210"
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
            >
              <FaHeadset className="h-4 w-4 text-[#FF6500]" />
              <span>Contact Dispatch Support Hotline</span>
            </a>

            <button
              onClick={onLogout}
              className="w-full py-3 px-4 bg-white hover:bg-rose-50/60 border border-slate-200 text-rose-700 font-medium rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
            >
              <FaArrowRightFromBracket className="h-4 w-4" />
              <span>Sign Out of Driver Account</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <FaTruckFast className="h-4 w-4 text-[#FF6500]" />
              <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                Vehicle & Road Permits
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Vehicle Name / Model</span>
                <span className="font-medium text-slate-900">{vehicleName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Registration Number</span>
                <span className="font-medium text-slate-900">{regNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Commercial Payload</span>
                <span className="font-medium text-slate-900">{payloadCapacity} Tons</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Commercial Driving License</span>
                <span className="font-medium text-slate-900 flex items-center gap-1">
                  <FaIdCard className="h-3 w-3 text-slate-400" />
                  <span>{licenseNumber}</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">State Goods Permit</span>
                <span className="font-medium text-emerald-700">Valid & Insured</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <FaBuildingColumns className="h-4 w-4 text-[#FF6500]" />
              <h3 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                Payout Bank Account
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Bank Name</span>
                <span className="font-medium text-slate-900">{bankName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Account Number</span>
                <span className="font-mono font-medium text-slate-900">{bankAccount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">IFSC Code</span>
                <span className="font-mono font-medium text-slate-900">{ifsc}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Payout Cycle</span>
                <span className="font-medium text-emerald-700">Every Tuesday Direct Deposit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
