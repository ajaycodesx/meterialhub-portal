'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FaChevronLeft, 
  FaLocationDot, 
  FaArrowRight, 
  FaTruckFast, 
  FaUserCheck, 
  FaPhone, 
  FaPeopleCarryBox, 
  FaRoad, 
  FaCircleCheck,
  FaShieldHalved,
  FaBuilding
} from 'react-icons/fa6';
import { LocationState } from '../../types/buyer';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface SiteInstructionsState {
  accessOption: 'narrow' | 'no_heavy' | 'crane' | 'ground';
  laborAssistance: 'none' | 'two_helpers' | 'four_helpers';
  supervisorName: string;
  supervisorPhone: string;
}

interface SiteDeliveryPageProps {
  location: LocationState;
  onBack: () => void;
  onSaveInstructions: (instructions: SiteInstructionsState) => void;
}

export const SiteDeliveryPage: React.FC<SiteDeliveryPageProps> = ({
  location,
  onBack,
  onSaveInstructions
}) => {
  const [accessOption, setAccessOption] = useState<'narrow' | 'no_heavy' | 'crane' | 'ground'>('ground');
  const [laborAssistance, setLaborAssistance] = useState<'none' | 'two_helpers' | 'four_helpers'>('two_helpers');
  const [supervisorName, setSupervisorName] = useState('Suresh Nair (Site Supervisor)');
  const [supervisorPhone, setSupervisorPhone] = useState('+91 98765 43210');

  const handleSave = () => {
    onSaveInstructions({
      accessOption,
      laborAssistance,
      supervisorName,
      supervisorPhone
    });
    onBack();
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <Link href="/profile">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
            >
              <FaChevronLeft className="h-3 w-3" />
              <span>Back to Previous Setup</span>
            </button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Site Delivery &amp; Access Instructions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Configure site access constraints, labor assistance, and site supervisor contact details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                  <FaRoad className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Site Access Options</h3>
                  <p className="text-xs text-slate-500 font-normal">Select road access width and unloading vehicle constraints</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                <button
                  type="button"
                  onClick={() => setAccessOption('narrow')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    accessOption === 'narrow'
                      ? 'bg-orange-50/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaRoad className="h-4 w-4 text-orange-500" />
                      Narrow Lane (&lt; 10ft)
                    </span>
                    {accessOption === 'narrow' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Narrow road access. Restricted to compact pickup trucks (Tata Ace / Mahindra Bolero).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessOption('no_heavy')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    accessOption === 'no_heavy'
                      ? 'bg-orange-50/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaTruckFast className="h-4 w-4 text-amber-600" />
                      No Heavy Vehicles
                    </span>
                    {accessOption === 'no_heavy' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Residential neighborhood restriction. No 10-wheeler or 16-wheeler heavy trucks allowed.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessOption('crane')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    accessOption === 'crane'
                      ? 'bg-orange-50/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaShieldHalved className="h-4 w-4 text-emerald-600" />
                      Crane Offloading Required
                    </span>
                    {accessOption === 'crane' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Heavy structural TMT steel rods or concrete slab beams requiring hydraulic crane unloading.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessOption('ground')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    accessOption === 'ground'
                      ? 'bg-orange-50/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <FaLocationDot className="h-4 w-4 text-emerald-600" />
                      Ground Floor Unloading
                    </span>
                    {accessOption === 'ground' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Standard driveway dumping or ground floor unloading site access.
                  </p>
                </button>

              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FaPeopleCarryBox className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Unloading Labor Assistance Option</h3>
                  <p className="text-xs text-slate-500 font-normal">Option to request extra unloading labor helpers for heavy construction goods</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                
                <button
                  type="button"
                  onClick={() => setLaborAssistance('two_helpers')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    laborAssistance === 'two_helpers'
                      ? 'bg-emerald-50/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <FaPeopleCarryBox className="h-4 w-4 text-emerald-600" />
                      2 Unloading Helpers
                    </span>
                    {laborAssistance === 'two_helpers' && <FaCircleCheck className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-1">+₹400 Helper Fee (Bag &amp; Pipe Stacking)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLaborAssistance('four_helpers')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    laborAssistance === 'four_helpers'
                      ? 'bg-emerald-50/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <FaPeopleCarryBox className="h-4 w-4 text-emerald-600" />
                      4 Unloading Helpers
                    </span>
                    {laborAssistance === 'four_helpers' && <FaCircleCheck className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-1">+₹800 Fast Offload (Heavy Steel/Bulk Cement)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLaborAssistance('none')}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    laborAssistance === 'none'
                      ? 'bg-slate-200/90 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900">No Extra Labor</span>
                    {laborAssistance === 'none' && <FaCircleCheck className="h-4 w-4 text-slate-600" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-1">Self/Site Contractor Labor</p>
                </button>

              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                  <FaUserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900">Site Contact Person Details</h3>
                  <p className="text-xs text-slate-500 font-normal">Site supervisor name and phone number for driver contact and delivery OTP verification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Site Supervisor Name"
                  icon={<FaUserCheck className="h-4 w-4 text-slate-400" />}
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="e.g. Suresh Nair (Site Engineer)"
                />

                <Input
                  label="Supervisor Mobile Number (OTP Verification)"
                  icon={<FaPhone className="h-4 w-4 text-slate-400" />}
                  value={supervisorPhone}
                  onChange={(e) => setSupervisorPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-xs space-y-5">
              <h3 className="font-semibold text-sm text-slate-900">Delivery Instructions Summary</h3>

              <div className="space-y-3 text-xs text-slate-600 font-normal">
                <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Site</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FaBuilding className="h-3 w-3 text-orange-400" />
                    {location.address || 'Site #14, Kakkanad Zone'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Access Constraints</span>
                  <p className="font-semibold text-slate-900">
                    {accessOption === 'narrow' && 'Narrow Road (< 10ft Mini Truck Only)'}
                    {accessOption === 'no_heavy' && 'No Heavy Vehicles Allowed'}
                    {accessOption === 'crane' && 'Crane Required for Offloading'}
                    {accessOption === 'ground' && 'Ground Floor Unloading Access'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unloading Helpers</span>
                  <p className="font-semibold text-slate-900 text-emerald-700">
                    {laborAssistance === 'two_helpers' && '2 Unloading Helpers (+₹400)'}
                    {laborAssistance === 'four_helpers' && '4 Unloading Helpers (+₹800)'}
                    {laborAssistance === 'none' && 'No Extra Labor (Self Offloading)'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Supervisor Contact</span>
                  <p className="font-semibold text-slate-900">{supervisorName}</p>
                  <p className="text-slate-500 font-medium">{supervisorPhone}</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSave}
                icon={<FaArrowRight className="h-3.5 w-3.5" />}
                className="w-full py-3.5 text-sm"
              >
                Save &amp; Update Site Instructions
              </Button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
