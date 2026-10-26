'use client';

import React, { useState } from 'react';
import {
  FaTruckFast,
  FaArrowRight,
  FaShieldHalved,
  FaSpinner
} from 'react-icons/fa6';
import { authApi, apiClient } from '../../lib/api';

interface DriverAuthViewProps {
  onAuthenticated: (token: string, user?: any) => void;
}

export function DriverAuthView({ onAuthenticated }: DriverAuthViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'setup-profile'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [fullName, setFullName] = useState('Arun Raj');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [license, setLicense] = useState('KL-07-2024-0012345');
  const [vehicleName, setVehicleName] = useState('Ashok Leyland 1618');
  const [regNumber, setRegNumber] = useState('KL 07 AB 1234');
  const [loadCapacity, setLoadCapacity] = useState('16');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        apiClient.setToken(res.access_token);
        onAuthenticated(res.access_token, res);
      } else {
        throw new Error('Authentication token not received.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive driver account.');
    } finally {
      setLoading(false);
    }
  }

  function handleProceedToSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and a password with at least 6 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setAuthMode('setup-profile');
  }

  async function handleFinishOnboarding(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !license.trim()) {
      setError('Please provide your name, phone number, and commercial driving license.');
      return;
    }

    try {
      setLoading(true);
      const res: any = await authApi.onboardDriver({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        vehicle_type: vehicleName.trim() || 'Mini Commercial Truck (3 Ton)',
        driver_license: license.trim(),
        vehicle_reg_number: regNumber.trim()
      });

      if (res?.access_token) {
        apiClient.setToken(res.access_token);
        onAuthenticated(res.access_token, res);
      } else {
        const loginRes: any = await authApi.login(email.trim(), password);
        apiClient.setToken(loginRes.access_token);
        onAuthenticated(loginRes.access_token, loginRes);
      }
    } catch (err: any) {
      setError(err.message || 'Onboarding registration failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setEmail('driver@materialhub.in');
    setPassword('driver123');
  }

  if (authMode === 'setup-profile') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-[#F5A623] text-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
              <FaTruckFast className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
                STEP 1 OF 1
              </span>
              <h1 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
                Set up your driver profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                This information helps vendors identify you and makes sure the right vehicle receives each load.
              </p>
            </div>
          </div>

          <form onSubmit={handleFinishOnboarding} className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/60 space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                YOUR DETAILS
              </span>
              
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arun Raj"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  DRIVING LICENSE
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="KL-07-2024-0012345"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                YOUR VEHICLE
              </span>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  VEHICLE NAME / MODEL
                </label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="Ashok Leyland 1618"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  REGISTRATION NUMBER
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="KL 07 AB 1234"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  LOAD CAPACITY (TONS)
                </label>
                <input
                  type="text"
                  value={loadCapacity}
                  onChange={(e) => setLoadCapacity(e.target.value)}
                  placeholder="16"
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#F5A623] hover:bg-[#E0901A] text-slate-900 font-medium rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Configuring Carrier Profile...</span>
                </>
              ) : (
                <>
                  <span>Finish onboarding</span>
                  <FaArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-2 text-slate-500 text-xs px-2">
            <FaShieldHalved className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>After onboarding, switch online to become available for vendor assignments.</span>
          </div>
        </div>
      </div>
    );
  }

  const isSignup = authMode === 'signup';

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F5A623] text-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <FaTruckFast className="h-6 w-6" />
          </div>
          <span className="text-white font-medium tracking-widest text-base">
            MATERIALHUB
          </span>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#F5A623] uppercase tracking-widest block">
            DRIVER OPERATIONS
          </span>
          <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight leading-tight">
            {isSignup ? 'Start your driver profile.' : 'Move every order with confidence.'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            {isSignup
              ? 'Create your driver account to receive orders from vendors and complete buyer deliveries.'
              : 'Sign in to see vendor pickups, delivery instructions, and your collection ledger.'}
          </p>
        </div>

        <form
          onSubmit={isSignup ? handleProceedToSetup : handleLogin}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4"
        >
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="At least 6 characters"
              className="w-full py-3 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#F5A623] hover:bg-[#E0901A] text-slate-900 font-medium rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>{isSignup ? 'Create account' : 'Sign in'}</span>
                <FaArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {!isSignup && (
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full text-center text-[11px] font-medium text-slate-500 hover:text-slate-800 pt-1"
            >
              Fill Demo Carrier Credentials
            </button>
          )}
        </form>

        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
            <FaShieldHalved className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Your delivery and cash records are protected by your account.</span>
          </div>

          <div>
            {isSignup ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode('login');
                }}
                className="text-xs font-medium text-[#F5A623] hover:underline cursor-pointer"
              >
                Already onboarded? Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode('signup');
                }}
                className="text-xs font-medium text-[#F5A623] hover:underline cursor-pointer"
              >
                New driver? Create an account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
