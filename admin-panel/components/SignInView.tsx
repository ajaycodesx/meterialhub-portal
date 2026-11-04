'use client';

import React, { useState } from 'react';
import {
  FaArrowRight,
  FaShieldHalved,
  FaSpinner
} from 'react-icons/fa6';
import { authApi, apiClient } from '../lib/api';

interface SignInViewProps {
  panelName: string;
  expectedRole: 'vendor' | 'admin';
  onSignedIn: () => void;
}

export function SignInView({ panelName, expectedRole, onSignedIn }: SignInViewProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const heroTitle = expectedRole === 'admin'
    ? 'Manage your platform with full control.'
    : 'Oversee your store, orders, and stock.';

  const heroSubtitle = expectedRole === 'admin'
    ? 'Sign in to access merchant verification, platform metrics, commodity rates, and audit logs.'
    : 'Sign in to manage inventory, fulfil orders, and track your store performance.';

  const badgeLabel = expectedRole === 'admin' ? 'ADMIN OPERATIONS' : 'VENDOR OPERATIONS';

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
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

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#FF6500] uppercase tracking-widest block">
            {badgeLabel}
          </span>
          <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight leading-tight">
            {heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            {heroSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
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
            className="w-full py-3.5 px-4 bg-[#FF6500] hover:bg-[#e05a00] text-white font-medium rounded-2xl flex items-center justify-center gap-2 shadow-sm text-sm transition-all cursor-pointer disabled:opacity-60"
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
        </form>

        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
          <FaShieldHalved className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Access is restricted to authorised {panelName.toLowerCase()} accounts only.</span>
        </div>
      </div>
    </div>
  );
}
