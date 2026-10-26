'use client';

import React, { useState } from 'react';
import {
  FaLocationDot,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCompass,
  FaArrowRight,
  FaClock,
  FaShieldHalved
} from 'react-icons/fa6';
import { LocationState } from '../../types/buyer';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface LocationServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationState: LocationState;
  onUpdateLocation: (newLocation: LocationState) => void;
  onProceedNext: () => void;
}

const ROAD_WIDTH_OPTIONS: SelectOption[] = [
  { label: '12ft+ (Standard Dump Truck Access)', value: '12ft+ (Standard Truck)' },
  { label: 'Narrow Road (< 10ft - Mini Truck Only)', value: 'Narrow Road (< 10ft)' },
  { label: 'Unpaved Construction Path', value: 'Unpaved Path' },
];

const TIME_SLOT_OPTIONS: SelectOption[] = [
  { label: '08:00 AM - 01:00 PM (Morning Slot)', value: '08:00 AM - 01:00 PM' },
  { label: '01:00 PM - 06:00 PM (Afternoon Slot)', value: '01:00 PM - 06:00 PM' },
  { label: 'Night Unloading', value: 'Night Unloading' },
];

export const LocationServiceModal: React.FC<LocationServiceModalProps> = ({
  isOpen,
  onClose,
  locationState,
  onUpdateLocation,
  onProceedNext
}) => {
  const [pinCode, setPinCode] = useState(locationState.pinCode || '682030');
  const [selectedRadius, setSelectedRadius] = useState<'10' | '20'>('20');
  const [isChecking, setIsChecking] = useState(false);
  const [activeStep, setActiveStep] = useState<'check' | 'constraints' | 'pindrop'>('check');

  const [roadWidth, setRoadWidth] = useState('12ft+ (Standard Truck)');
  const [heavyVehicleAccess, setHeavyVehicleAccess] = useState(true);
  const [craneNeeded, setCraneNeeded] = useState(false);
  const [unloadingTimeSlot, setUnloadingTimeSlot] = useState('08:00 AM - 01:00 PM');

  const handleCheckAvailability = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      const serviceable = pinCode.startsWith('6') || pinCode.startsWith('5') || pinCode.startsWith('1');

      const updated: LocationState = {
        ...locationState,
        pinCode,
        address: serviceable ? `Site #${pinCode}, Kakkanad Zone` : `Location #${pinCode}`,
        isServiceable: serviceable,
        distanceKm: serviceable ? 8.5 : 34.2,
      };

      onUpdateLocation(updated);
      setActiveStep(serviceable ? 'constraints' : 'pindrop');
    }, 700);
  };

  const handleSaveConstraints = () => {
    const updated: LocationState = {
      ...locationState,
      siteConstraints: {
        roadWidth,
        heavyVehicleAccess,
        craneNeeded,
        unloadingTimeSlot,
      }
    };
    onUpdateLocation(updated);
    onProceedNext();
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={() => {
          if (activeStep !== 'check') setActiveStep('check');
          else onClose();
        }}
        className="px-5 py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
      >
        {activeStep === 'check' ? 'Skip for Now' : 'Back'}
      </button>

      {activeStep === 'check' ? (
        <Button
          variant="primary"
          size="md"
          onClick={handleCheckAvailability}
          icon={<FaArrowRight className="h-3.5 w-3.5" />}
          className="px-6 rounded-xl text-xs font-medium"
        >
          Next
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={handleSaveConstraints}
          icon={<FaArrowRight className="h-3.5 w-3.5" />}
          className="px-6 rounded-xl text-xs font-medium"
        >
          Save &amp; Continue
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<FaLocationDot className="h-5 w-5" />}
      iconBg="bg-orange-500/15 border border-orange-500/25"
      iconColor="text-[#FF6500]"
      title="Delivery Radius & Site Check"
      subtitle="20 KM Wholesale Supplier Radius Check"
      maxWidth="lg"
      footer={footerContent}
    >
      <div className="space-y-4">
        {activeStep === 'check' && (
          <div className="space-y-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141d33] border border-slate-700/60 flex items-start gap-3 shadow-2xs">
              <FaShieldHalved className="h-4.5 w-4.5 text-[#FF6500] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Bulk construction materials (Cement bags, TMT Steel, PVC pipes) require quick delivery from verified local merchants within a <strong className="font-medium text-white">20 KM radius</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Enter Pincode or Delivery City
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 682030"
                  className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-[#162137] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500] transition-all"
                />
                <Button
                  onClick={handleCheckAvailability}
                  isLoading={isChecking}
                  variant="primary"
                  size="md"
                  icon={<FaArrowRight className="h-3 w-3" />}
                  className="shrink-0 rounded-xl px-4 text-xs font-medium"
                >
                  Verify 20KM
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <button
                type="button"
                onClick={() => setSelectedRadius('10')}
                className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  selectedRadius === '10'
                    ? 'border-[#FF6500] bg-[#FF6500]/15 text-white shadow-xs ring-1 ring-[#FF6500]/40'
                    : 'border-slate-700/70 bg-[#162137] hover:bg-[#1c2842] hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white">10 KM Express</span>
                  <div
                    className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all ${
                      selectedRadius === '10'
                        ? 'bg-[#FF6500] border-[#FF6500] text-white'
                        : 'border-slate-600 bg-[#0d1527]'
                    }`}
                  >
                    {selectedRadius === '10' && <FaCircleCheck className="h-3 w-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-relaxed">Same-Day Urgent Orders</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRadius('20')}
                className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  selectedRadius === '20'
                    ? 'border-[#FF6500] bg-[#FF6500]/15 text-white shadow-xs ring-1 ring-[#FF6500]/40'
                    : 'border-slate-700/70 bg-[#162137] hover:bg-[#1c2842] hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white">20 KM Standard</span>
                  <div
                    className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all ${
                      selectedRadius === '20'
                        ? 'bg-[#FF6500] border-[#FF6500] text-white'
                        : 'border-slate-600 bg-[#0d1527]'
                    }`}
                  >
                    {selectedRadius === '20' && <FaCircleCheck className="h-3 w-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-normal leading-relaxed">Wholesale Price Direct</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setPinCode('682024');
                handleCheckAvailability();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <FaCompass className="h-3.5 w-3.5 text-[#FF6500]" />
              <span>Use GPS Location Pinning</span>
            </button>
          </div>
        )}

        {activeStep === 'constraints' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
              <FaCircleCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-emerald-200">Service Available in Your Area</h4>
                <p className="text-[11px] text-emerald-400 font-normal mt-0.5">14 Verified Hardware Merchants within 8.5 km</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                Capture Unloading Site Constraints
              </h4>

              <Select
                label="Unloading Site Road Access Width"
                options={ROAD_WIDTH_OPTIONS}
                value={roadWidth}
                onChange={(val) => setRoadWidth(String(val))}
                variant="dark"
                direction="down"
                size="md"
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#162137] border border-slate-700/60 cursor-pointer text-xs font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={heavyVehicleAccess}
                    onChange={(e) => setHeavyVehicleAccess(e.target.checked)}
                    className="h-4 w-4 rounded-md accent-[#FF6500]"
                  />
                  <span>Heavy Truck OK (10T/16T)</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#162137] border border-slate-700/60 cursor-pointer text-xs font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={craneNeeded}
                    onChange={(e) => setCraneNeeded(e.target.checked)}
                    className="h-4 w-4 rounded-md accent-[#FF6500]"
                  />
                  <span>Crane Required (Heavy)</span>
                </label>
              </div>

              <Select
                label="Preferred Delivery Slot"
                options={TIME_SLOT_OPTIONS}
                value={unloadingTimeSlot}
                onChange={(val) => setUnloadingTimeSlot(String(val))}
                icon={<FaClock className="h-3 w-3 text-[#FF6500]" />}
                variant="dark"
                direction="up"
                size="md"
              />
            </div>
          </div>
        )}

        {activeStep === 'pindrop' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3">
              <FaTriangleExclamation className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-amber-200">Outside Standard 20KM Radius</h4>
                <p className="text-[11px] text-amber-400 font-normal mt-0.5">Drop a pin on map to request custom logistics quote.</p>
              </div>
            </div>

            <div className="relative h-44 rounded-2xl bg-[#162137] border border-slate-700/60 overflow-hidden flex items-center justify-center">
              <div className="relative text-center p-4 bg-[#141d33] border border-slate-700 rounded-2xl max-w-xs shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <FaLocationDot className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-medium text-white">Pin Dropped: Site #402</h4>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">Lat: 10.0124 | Lng: 76.3150</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
