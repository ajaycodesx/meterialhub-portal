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
    <div className="flex items-center justify-between gap-3 w-full">
      <Button
        variant="outline"
        size="md"
        onClick={() => {
          if (activeStep !== 'check') setActiveStep('check');
          else onClose();
        }}
        className="px-5 sm:px-6 rounded-2xl"
      >
        {activeStep === 'check' ? 'Skip for Now' : 'Back'}
      </Button>

      {activeStep === 'check' ? (
        <Button
          variant="primary"
          size="md"
          onClick={handleCheckAvailability}
          icon={<FaArrowRight className="h-3.5 w-3.5" />}
          className="px-6 sm:px-7 rounded-2xl"
        >
          Next
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={handleSaveConstraints}
          icon={<FaArrowRight className="h-3.5 w-3.5" />}
          className="px-6 sm:px-7 rounded-2xl"
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
      icon={<FaLocationDot className="h-6 w-6" />}
      iconBg="bg-orange-50"
      iconColor="text-[#FF6500]"
      title="Delivery Radius & Site Check"
      subtitle="20 KM Wholesale Supplier Radius Check"
      maxWidth="lg"
      footer={footerContent}
    >
      <div className="space-y-4">
        {activeStep === 'check' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-orange-100/80 flex items-start gap-3 shadow-2xs">
              <FaShieldHalved className="h-4.5 w-4.5 text-[#FF6500] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Bulk construction materials (Cement bags, TMT Steel, PVC pipes) require quick delivery from verified local merchants within a <strong className="font-semibold text-slate-900">20 KM radius</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter Pincode or Delivery City
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 682030"
                  className="font-semibold text-slate-900 rounded-2xl"
                />
                <Button
                  onClick={handleCheckAvailability}
                  isLoading={isChecking}
                  variant="primary"
                  size="md"
                  icon={<FaArrowRight className="h-3 w-3" />}
                  className="shrink-0 rounded-2xl px-4.5"
                >
                  Verify 20KM
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedRadius('10')}
                className={`p-3.5 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
                  selectedRadius === '10'
                    ? 'bg-orange-50/90 text-[#FF6500] shadow-xs ring-1 ring-orange-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">10 KM Express</span>
                  {selectedRadius === '10' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Same-Day Urgent Orders</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRadius('20')}
                className={`p-3.5 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
                  selectedRadius === '20'
                    ? 'bg-orange-50/90 text-[#FF6500] shadow-xs ring-1 ring-orange-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">20 KM Standard</span>
                  {selectedRadius === '20' && <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Wholesale Price Direct</p>
              </button>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setPinCode('682024');
                handleCheckAvailability();
              }}
              icon={<FaCompass className="h-4 w-4 text-[#FF6500]" />}
              iconPosition="left"
              className="w-full rounded-2xl text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs"
            >
              Use GPS Location Pinning
            </Button>
          </div>
        )}

        {activeStep === 'constraints' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 flex items-center gap-3">
              <FaCircleCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-emerald-900">Service Available in Your Area</h4>
                <p className="text-[11px] text-emerald-700 font-normal mt-0.5">14 Verified Hardware Merchants within 8.5 km</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Capture Unloading Site Constraints
              </h4>

              <Select
                label="Unloading Site Road Access Width"
                options={ROAD_WIDTH_OPTIONS}
                value={roadWidth}
                onChange={(val) => setRoadWidth(String(val))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Checkbox
                  label="Heavy Truck OK"
                  description="10T/16T Access"
                  checked={heavyVehicleAccess}
                  onChange={(checked) => setHeavyVehicleAccess(checked)}
                />

                <Checkbox
                  label="Crane Required"
                  description="Heavy Offloading"
                  checked={craneNeeded}
                  onChange={(checked) => setCraneNeeded(checked)}
                />
              </div>

              <Select
                label="Preferred Delivery Slot"
                icon={<FaClock className="h-3 w-3 text-slate-400" />}
                options={TIME_SLOT_OPTIONS}
                value={unloadingTimeSlot}
                onChange={(val) => setUnloadingTimeSlot(String(val))}
              />
            </div>
          </div>
        )}

        {activeStep === 'pindrop' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 flex items-center gap-3">
              <FaTriangleExclamation className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-amber-900">Outside Standard 20KM Radius</h4>
                <p className="text-[11px] text-amber-700 font-normal mt-0.5">Drop a pin on map to request custom logistics quote.</p>
              </div>
            </div>

            <div className="relative h-44 rounded-2xl bg-slate-100/70 overflow-hidden flex items-center justify-center">
              <div className="relative text-center p-4 bg-white rounded-2xl max-w-xs shadow-sm">
                <div className="h-10 w-10 rounded-2xl bg-[#FF6500] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <FaLocationDot className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900">Pin Dropped: Site #402</h4>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">Lat: 10.0124 | Lng: 76.3150</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
