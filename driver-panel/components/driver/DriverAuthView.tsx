'use client';

import React, { useState } from 'react';
import {
  FaArrowRight,
  FaShieldHalved,
  FaSpinner,
  FaTruckFast,
  FaClock,
  FaCheck,
  FaArrowLeft,
  FaCloudArrowUp,
  FaIdCard,
  FaUser,
  FaFileContract
} from 'react-icons/fa6';
import { authApi, apiClient } from '../../lib/api';

interface DriverAuthViewProps {
  onAuthenticated: (token: string, user?: any) => void;
}

export function DriverAuthView({ onAuthenticated }: DriverAuthViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'onboard' | 'submitted'>('login');
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [city, setCity] = useState('Kochi');

  const [vehicleType, setVehicleType] = useState('Mini Commercial Truck (3 Ton)');
  const [regNumber, setRegNumber] = useState('');
  const [payloadCapacity, setPayloadCapacity] = useState('3.0');
  const [license, setLicense] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  const [proofs, setProofs] = useState<{
    licenseDoc?: string;
    vehicleRc?: string;
    insuranceDoc?: string;
  }>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const stepTitles = [
    { number: 1, title: 'Personal', subtitle: 'Driver profile', icon: FaUser },
    { number: 2, title: 'Vehicle', subtitle: 'Class & capacity', icon: FaTruckFast },
    { number: 3, title: 'License', subtitle: 'Commercial DL', icon: FaIdCard },
    { number: 4, title: 'Proofs & Access', subtitle: 'RC & credentials', icon: FaShieldHalved }
  ];

  async function handleFileUpload(field: 'licenseDoc' | 'vehicleRc' | 'insuranceDoc', file: File) {
    setUploadingDoc(field);
    setError(null);
    try {
      const res = await authApi.uploadProof(file);
      setProofs((prev) => ({ ...prev, [field]: res.url }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload document proof.');
    } finally {
      setUploadingDoc(null);
    }
  }

  function validateStep(step: number): boolean {
    setError(null);
    if (step === 1) {
      if (!fullName.trim()) {
        setError('Please enter your full legal name.');
        return false;
      }
      if (!regEmail.trim() || !regEmail.includes('@')) {
        setError('Please enter a valid email address.');
        return false;
      }
      if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!regNumber.trim()) {
        setError('Please provide the commercial vehicle registration number.');
        return false;
      }
      const capacity = parseFloat(payloadCapacity);
      if (isNaN(capacity) || capacity <= 0) {
        setError('Please enter a valid certified payload capacity in metric tons.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!license.trim()) {
        setError('Please enter your commercial driving license number.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!proofs.licenseDoc) {
        setError('Please upload a legible copy of your commercial driving license.');
        return false;
      }
      if (regPassword.length < 8) {
        setError('Password must contain at least 8 characters.');
        return false;
      }
      if (regPassword !== confirmPassword) {
        setError('Passwords do not match. Please verify both fields.');
        return false;
      }
      return true;
    }

    return true;
  }

  function handleNextStep() {
    if (validateStep(currentStep)) {
      setError(null);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }

  function handlePrevStep() {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide your driver email and password.');
      return;
    }

    try {
      setLoading(true);
      const res: any = await authApi.login(email.trim(), password);
      if (res?.access_token) {
        if (res.role && res.role.toLowerCase() !== 'driver') {
          throw new Error('Access denied. This account does not have a Driver role.');
        }
        apiClient.setToken(res.access_token);
        onAuthenticated(res.access_token, res);
      } else {
        throw new Error('Authentication token not received.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or unverified driver account.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinishOnboarding(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(4)) return;

    try {
      setLoading(true);
      await authApi.onboardDriver({
        name: fullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        vehicle_type: vehicleType.trim(),
        vehicle_reg_number: regNumber.trim().toUpperCase(),
        payload_capacity_tons: parseFloat(payloadCapacity) || 3.0,
        driver_license: license.trim().toUpperCase(),
        license_expiry: licenseExpiry || undefined,
        city: city.trim(),
        proof_documents: proofs
      });

      setAuthMode('submitted');
    } catch (err: any) {
      setError(err.message || 'Driver onboarding failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center px-4 py-8 sm:py-12">
      <div className={`w-full mx-auto space-y-6 ${authMode === 'onboard' ? 'max-w-3xl' : 'max-w-md'}`}>
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 flex items-center justify-center shrink-0">
            <img
              src="/images/logo.png"
              alt="MaterialHub Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="leading-tight">
            <span className="text-white font-medium tracking-wider text-lg block leading-none">
              Material<span className="text-[#FF6500]">Hub</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block mt-1">
              Carrier & Fleet Console
            </span>
          </div>
        </div>

        {authMode === 'submitted' ? (
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FaClock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#FF6500] uppercase tracking-widest block">
                APPLICATION SUBMITTED
              </span>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Pending Fleet Verification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Your driver credentials, commercial license, and vehicle registration have been submitted to MaterialHub Operations.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs bg-slate-50/60">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Driver Name:</span>
                <span className="text-slate-900 font-semibold">{fullName}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Commercial Vehicle:</span>
                <span className="text-slate-900 font-semibold">{vehicleType}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Plate Number:</span>
                <span className="text-slate-900 font-semibold font-mono">{regNumber.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Notification Email:</span>
                <span className="text-slate-900 font-semibold">{regEmail}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Status:</span>
                <span className="text-amber-600 font-semibold">Under Inspection</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              You will receive an official approval email once your license and vehicle documents are vetted. You can then sign in and receive dispatch offers.
            </p>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setEmail(regEmail);
              }}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <FaArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Driver Sign In</span>
            </button>
          </div>
        ) : authMode === 'onboard' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs font-semibold text-[#FF6500] hover:text-[#e05a00] flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
              >
                <FaArrowLeft className="h-3 w-3" />
                <span>Return to Sign In</span>
              </button>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Commercial Driver Registration
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Complete the guided steps below to verify your commercial vehicle and driver qualifications.
              </p>
            </div>

            <div className="relative pt-2 pb-1">
              <div className="hidden sm:block absolute top-[26px] left-[13.5%] right-[13.5%] h-0 border-t-2 border-dashed border-slate-200 z-0" />

              <div className="relative z-10 grid grid-cols-4 gap-2">
                {stepTitles.map((step) => {
                  const isCompleted = currentStep > step.number;
                  const isActive = currentStep === step.number;
                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => {
                        if (step.number < currentStep) {
                          setCurrentStep(step.number);
                          setError(null);
                        }
                      }}
                      disabled={step.number > currentStep}
                      className="flex flex-col items-center text-center group cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#FF6500] text-white shadow-md shadow-orange-500/25 ring-4 ring-orange-100'
                            : isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-400 border-2 border-dashed border-slate-300'
                        }`}
                      >
                        {isCompleted ? <FaCheck className="h-3 w-3" /> : step.number}
                      </div>
                      <span
                        className={`mt-2 text-[11px] font-semibold transition-colors truncate max-w-full px-1 ${
                          isActive
                            ? 'text-[#FF6500]'
                            : isCompleted
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 hidden sm:block">
                        {step.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Current Section
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {stepTitles[currentStep - 1].title} &bull; {stepTitles[currentStep - 1].subtitle}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#FF6500] px-2.5 py-1 rounded-lg bg-orange-50 border border-dashed border-orange-200">
                Stage {currentStep} of 4
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-dashed border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                <span className="font-semibold block mb-0.5">Registration Notice</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFinishOnboarding} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Manoj Kumar"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="driver@example.in"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98470 12345"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Base Operating City / District
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Kochi"
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Commercial Vehicle Class *
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500] bg-white"
                      >
                        <option value="Mini Commercial Truck (3 Ton)">Mini Commercial Truck (3 Ton)</option>
                        <option value="3-Wheeler Cargo Loader (1.5 Ton)">3-Wheeler Cargo Loader (1.5 Ton)</option>
                        <option value="Medium Rigid Truck (7.5 Ton)">Medium Rigid Truck (7.5 Ton)</option>
                        <option value="Flatbed Heavy Hauler (10 Ton)">Flatbed Heavy Hauler (10 Ton)</option>
                        <option value="Multi-Axle Heavy Carrier (16 Ton)">Multi-Axle Heavy Carrier (16 Ton)</option>
                        <option value="Tipper / Dumper Aggregate Hauler">Tipper / Dumper Aggregate Hauler</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Vehicle Registration Number *
                      </label>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="KL-07-CD-1234"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 font-mono uppercase focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Payload Capacity (Metric Tons) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={payloadCapacity}
                        onChange={(e) => setPayloadCapacity(e.target.value)}
                        placeholder="3.0"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Driving License Number *
                      </label>
                      <input
                        type="text"
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        placeholder="DL-1420110012345"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 font-mono uppercase focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        License Expiry Date
                      </label>
                      <input
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                        proofs.licenseDoc
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-[#FF6500] bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">License Copy *</span>
                        {proofs.licenseDoc ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <FaCheck className="h-3 w-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Required</span>
                        )}
                      </div>
                      <label className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                        {uploadingDoc === 'licenseDoc' ? (
                          <FaSpinner className="h-3.5 w-3.5 animate-spin text-[#FF6500]" />
                        ) : (
                          <FaCloudArrowUp className="h-3.5 w-3.5 text-[#FF6500]" />
                        )}
                        <span>{proofs.licenseDoc ? 'Replace File' : 'Upload License'}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('licenseDoc', file);
                          }}
                        />
                      </label>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                        proofs.vehicleRc
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-[#FF6500] bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">Vehicle RC</span>
                        {proofs.vehicleRc ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <FaCheck className="h-3 w-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">RC document</span>
                        )}
                      </div>
                      <label className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                        {uploadingDoc === 'vehicleRc' ? (
                          <FaSpinner className="h-3.5 w-3.5 animate-spin text-[#FF6500]" />
                        ) : (
                          <FaCloudArrowUp className="h-3.5 w-3.5 text-[#FF6500]" />
                        )}
                        <span>{proofs.vehicleRc ? 'Replace File' : 'Upload RC'}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('vehicleRc', file);
                          }}
                        />
                      </label>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                        proofs.insuranceDoc
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-[#FF6500] bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">Insurance</span>
                        {proofs.insuranceDoc ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <FaCheck className="h-3 w-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Policy file</span>
                        )}
                      </div>
                      <label className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                        {uploadingDoc === 'insuranceDoc' ? (
                          <FaSpinner className="h-3.5 w-3.5 animate-spin text-[#FF6500]" />
                        ) : (
                          <FaCloudArrowUp className="h-3.5 w-3.5 text-[#FF6500]" />
                        )}
                        <span>{proofs.insuranceDoc ? 'Replace File' : 'Upload Policy'}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('insuranceDoc', file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Account Password * (Min 8 Chars)
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create strong password"
                        required
                        minLength={8}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        minLength={8}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <FaFileContract className="h-3.5 w-3.5 text-[#FF6500]" />
                      <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                        Dossier Summary Preview
                      </span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div><span className="font-medium text-slate-400">Driver Name:</span> <span className="font-semibold text-slate-800">{fullName}</span></div>
                      <div><span className="font-medium text-slate-400">Contact:</span> <span className="font-semibold text-slate-800">{regPhone}</span></div>
                      <div><span className="font-medium text-slate-400">Email:</span> <span className="font-semibold text-slate-800">{regEmail}</span></div>
                      <div><span className="font-medium text-slate-400">Vehicle Class:</span> <span className="font-semibold text-slate-800">{vehicleType}</span></div>
                      <div><span className="font-medium text-slate-400">Plate Number:</span> <span className="font-mono font-semibold text-slate-800">{regNumber.toUpperCase()}</span></div>
                      <div><span className="font-medium text-slate-400">Payload Capacity:</span> <span className="font-semibold text-slate-800">{payloadCapacity} Tons</span></div>
                      <div className="sm:col-span-2"><span className="font-medium text-slate-400">Commercial License:</span> <span className="font-mono font-semibold text-slate-800">{license.toUpperCase()}</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <FaArrowLeft className="h-3 w-3" />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-2.5 px-5 bg-[#FF6500] hover:bg-[#e05a00] text-white font-semibold rounded-xl flex items-center gap-2 text-xs transition-colors cursor-pointer ml-auto shadow-sm"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <FaArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2.5 px-5 bg-[#FF6500] hover:bg-[#e05a00] text-white font-semibold rounded-xl flex items-center gap-2 text-xs transition-colors cursor-pointer ml-auto shadow-sm disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application for Review</span>
                        <FaArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#FF6500] uppercase tracking-widest block">
                CARRIER LOGISTICS
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
                Reliable freight dispatch for building materials.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                Sign in to access driver feeds, accept material haul jobs, and manage delivery routes.
              </p>
            </div>

            <form onSubmit={handleLogin} className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-dashed border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                  <span className="font-semibold block mb-0.5">Authentication Notice</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  DRIVER EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.in"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#FF6500] hover:bg-[#e05a00] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in as Driver</span>
                    <FaArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-dashed border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCurrentStep(1);
                    setAuthMode('onboard');
                  }}
                  className="text-xs font-semibold text-[#FF6500] hover:text-[#e05a00] transition-colors cursor-pointer"
                >
                  New commercial driver or fleet owner? Register here &rarr;
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs pt-1">
                <FaShieldHalved className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Only drivers verified by Platform Operations can sign in.</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
