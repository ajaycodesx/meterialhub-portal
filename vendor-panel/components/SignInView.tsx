'use client';

import React, { useState, useEffect } from 'react';
import {
  FaArrowRight,
  FaArrowLeft,
  FaShieldHalved,
  FaSpinner,
  FaStore,
  FaFileLines,
  FaCheck,
  FaClock,
  FaCloudArrowUp,
  FaLocationDot,
  FaUser,
  FaFileContract
} from 'react-icons/fa6';
import { authApi, apiClient } from '../lib/api';

interface SignInViewProps {
  panelName: string;
  expectedRole: 'vendor' | 'admin';
  onSignedIn: () => void;
}

export function SignInView({ panelName, expectedRole, onSignedIn }: SignInViewProps) {
  const [viewMode, setViewMode] = useState<'signin' | 'register' | 'submitted'>('signin');
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('Kochi');
  const [mainCategory, setMainCategory] = useState('All Hardware & Building Materials');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('1000');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    fetch(`${apiUrl}/buyer/home`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isMounted) return;
        const cats = (json?.data?.categories || []).map((c: any) => c.title);
        if (cats.length > 0) {
          setAvailableCategories(cats);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [proofs, setProofs] = useState<{
    gstCertificate?: string;
    storePhoto?: string;
    tradeLicense?: string;
  }>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const stepTitles = [
    { number: 1, title: 'Owner Profile', subtitle: 'Proprietor credentials', icon: FaUser },
    { number: 2, title: 'Store Yard', subtitle: 'Location & category', icon: FaLocationDot },
    { number: 3, title: 'Statutory GST', subtitle: 'Tax & licensing', icon: FaFileLines },
    { number: 4, title: 'Proofs & Security', subtitle: 'Documents & access', icon: FaShieldHalved }
  ];

  async function handleFileUpload(field: 'gstCertificate' | 'storePhoto' | 'tradeLicense', file: File) {
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
      if (!ownerName.trim()) {
        setError('Please enter the owner or proprietor name.');
        return false;
      }
      if (!regEmail.trim() || !regEmail.includes('@')) {
        setError('Please provide a valid business email address.');
        return false;
      }
      if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile contact number.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!storeName.trim()) {
        setError('Please enter the store or yard trade name.');
        return false;
      }
      if (!address.trim()) {
        setError('Please enter the physical yard address.');
        return false;
      }
      if (!pincode.trim() || pincode.replace(/\D/g, '').length < 6) {
        setError('Please enter a valid 6-digit PIN code.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const cleanGstin = gstin.trim().toUpperCase();
      if (!cleanGstin || cleanGstin.length < 15) {
        setError('A valid 15-character GSTIN is required for wholesale merchants.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!proofs.gstCertificate) {
        setError('Please upload your GST Registration Certificate proof.');
        return false;
      }
      if (regPassword.length < 8) {
        setError('Account password must be at least 8 characters long.');
        return false;
      }
      if (regPassword !== confirmPassword) {
        setError('Account passwords do not match.');
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
    setSubmitting(true);
    try {
      const auth: any = await authApi.login(identifier.trim(), password);
      if (!auth?.access_token) throw new Error('Sign-in failed. Check your details and try again.');
      if (auth.role !== expectedRole) throw new Error(`This account does not have ${panelName} access.`);
      apiClient.setToken(auth.access_token);
      onSignedIn();
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      await authApi.onboardVendor({
        owner_name: ownerName.trim(),
        store_name: storeName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        address: address.trim(),
        pincode: pincode.trim(),
        city: city.trim(),
        main_category: mainCategory,
        gstin: gstin.trim().toUpperCase(),
        pan_number: panNumber.trim().toUpperCase() || undefined,
        trade_license: tradeLicense.trim() || undefined,
        min_order_value: parseInt(minOrderValue, 10) || 1000,
        proof_documents: proofs
      });
      setViewMode('submitted');
    } catch (err: any) {
      setError(err.message || 'Merchant registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center px-4 py-8 sm:py-12">
      <div className={`w-full mx-auto space-y-6 ${viewMode === 'register' ? 'max-w-3xl' : 'max-w-md'}`}>
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
              {panelName} Console
            </span>
          </div>
        </div>

        {viewMode === 'submitted' ? (
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FaClock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#FF6500] uppercase tracking-widest block">
                APPLICATION SUBMITTED
              </span>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Pending Administrative Review
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Thank you for applying to join MaterialHub as a verified merchant partner. Your store details and statutory proofs have been submitted to Platform Operations.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs bg-slate-50/60">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Applicant:</span>
                <span className="text-slate-900 font-semibold">{ownerName}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Store Yard:</span>
                <span className="text-slate-900 font-semibold">{storeName}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Notification Email:</span>
                <span className="text-slate-900 font-semibold">{regEmail}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>GSTIN:</span>
                <span className="text-slate-900 font-semibold font-mono">{gstin.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Verification State:</span>
                <span className="text-amber-600 font-semibold">Under Inspection</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              You will receive an official approval confirmation email once your GSTIN and yard credentials are confirmed. You can then sign in and begin operations.
            </p>

            <button
              type="button"
              onClick={() => {
                setViewMode('signin');
                setIdentifier(regEmail);
              }}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
            >
              <FaArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : viewMode === 'register' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setViewMode('signin')}
                className="text-xs font-semibold text-[#FF6500] hover:text-[#e05a00] flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
              >
                <FaArrowLeft className="h-3 w-3" />
                <span>Return to Sign In</span>
              </button>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Merchant Partner Onboarding
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Complete the guided steps below to verify your building materials store with platform administration.
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
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-dashed border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Owner / Proprietor Full Name *
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Official Business Email *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="store@domain.in"
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
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Store / Yard Business Name *
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Kakkanad Building Materials Yard"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Primary Material Category
                      </label>
                      <select
                        value={mainCategory}
                        onChange={(e) => setMainCategory(e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500] bg-white"
                      >
                        <option value="All Hardware & Building Materials">All Hardware & Building Materials</option>
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Minimum Order Value (INR)
                      </label>
                      <input
                        type="number"
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(e.target.value)}
                        placeholder="1000"
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Yard Physical Address *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Plot No., Industrial Area / Main Road"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="682030"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Operating City
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

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        GST Identification Number (GSTIN) *
                      </label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="32AAACH7409R1ZZ"
                        required
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 font-mono uppercase focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Business PAN Card Number
                      </label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        placeholder="AAACH7409R"
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 font-mono uppercase focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Trade License / Municipal Reg No.
                      </label>
                      <input
                        type="text"
                        value={tradeLicense}
                        onChange={(e) => setTradeLicense(e.target.value)}
                        placeholder="TR-2024-8849"
                        className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF6500]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                        proofs.gstCertificate
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-[#FF6500] bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">GST Certificate *</span>
                        {proofs.gstCertificate ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <FaCheck className="h-3 w-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Required</span>
                        )}
                      </div>
                      <label className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                        {uploadingDoc === 'gstCertificate' ? (
                          <FaSpinner className="h-3.5 w-3.5 animate-spin text-[#FF6500]" />
                        ) : (
                          <FaCloudArrowUp className="h-3.5 w-3.5 text-[#FF6500]" />
                        )}
                        <span>{proofs.gstCertificate ? 'Replace Certificate' : 'Upload GST File'}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('gstCertificate', file);
                          }}
                        />
                      </label>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                        proofs.storePhoto
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-[#FF6500] bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">Store / Yard Photo</span>
                        {proofs.storePhoto ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <FaCheck className="h-3 w-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Exterior view</span>
                        )}
                      </div>
                      <label className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                        {uploadingDoc === 'storePhoto' ? (
                          <FaSpinner className="h-3.5 w-3.5 animate-spin text-[#FF6500]" />
                        ) : (
                          <FaCloudArrowUp className="h-3.5 w-3.5 text-[#FF6500]" />
                        )}
                        <span>{proofs.storePhoto ? 'Replace Photo' : 'Upload Store Photo'}</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('storePhoto', file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                        Portal Password * (Min 8 Chars)
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
                      <div><span className="font-medium text-slate-400">Yard Name:</span> <span className="font-semibold text-slate-800">{storeName}</span></div>
                      <div><span className="font-medium text-slate-400">Specialization:</span> <span className="font-semibold text-slate-800">{mainCategory}</span></div>
                      <div><span className="font-medium text-slate-400">Proprietor:</span> <span className="font-semibold text-slate-800">{ownerName}</span></div>
                      <div><span className="font-medium text-slate-400">Contact:</span> <span className="font-semibold text-slate-800">{regPhone}</span></div>
                      <div><span className="font-medium text-slate-400">Location:</span> <span className="font-semibold text-slate-800">{city} ({pincode})</span></div>
                      <div><span className="font-medium text-slate-400">GSTIN:</span> <span className="font-mono font-semibold text-slate-800">{gstin.toUpperCase()}</span></div>
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
                    onClick={() => setViewMode('signin')}
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
                    disabled={submitting}
                    className="py-2.5 px-5 bg-[#FF6500] hover:bg-[#e05a00] text-white font-semibold rounded-xl flex items-center gap-2 text-xs transition-colors cursor-pointer ml-auto shadow-sm disabled:opacity-60"
                  >
                    {submitting ? (
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
                {expectedRole === 'admin' ? 'ADMIN OPERATIONS' : 'VENDOR OPERATIONS'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
                {expectedRole === 'admin' ? 'Manage your platform with full control.' : 'Oversee your store, orders, and stock.'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                {expectedRole === 'admin'
                  ? 'Sign in to access merchant verification, platform metrics, commodity rates, and audit logs.'
                  : 'Sign in to manage inventory, fulfil orders, and track your store performance.'}
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
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@materialhub.in"
                  autoComplete="username"
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
                  autoComplete="current-password"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-[#FF6500] hover:bg-[#e05a00] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to {panelName}</span>
                    <FaArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              {expectedRole === 'vendor' && (
                <div className="pt-3 border-t border-dashed border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCurrentStep(1);
                      setViewMode('register');
                    }}
                    className="text-xs font-semibold text-[#FF6500] hover:text-[#e05a00] transition-colors cursor-pointer"
                  >
                    New store or hardware yard? Register as Merchant Partner &rarr;
                  </button>
                </div>
              )}
            </form>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <FaShieldHalved className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Access is restricted to authorized accounts approved by administration.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
