'use client';

import React, { useEffect, useState } from 'react';
import { FaLock, FaPhone, FaArrowRight, FaKey, FaUser, FaEnvelope } from 'react-icons/fa6';
import { UserProfile } from '../../types/buyer';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { authApi, apiClient } from '../../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

type Mode = 'signin' | 'signup';

const MIN_PASSWORD_LENGTH = 8;
const GENERIC_ERROR = 'Something went wrong. Please try again.';

const inputClass =
  'w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-[#162137] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500] transition-all';

const iconClass = 'absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center';

const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setConfirmPassword('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrorMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const completeSignIn = (auth: any) => {
    if (!auth?.access_token) throw new Error('Sign-in failed. Check your details and try again.');
    if (auth.role !== 'buyer') throw new Error('This account is not a buyer account. Use the matching panel to sign in.');
    apiClient.setToken(auth.access_token);
    onLoginSuccess({
      name: auth.name || '',
      phone: auth.phone || '',
      email: auth.email || '',
      isLoggedIn: true,
      savedAddresses: [],
    });
    onClose();
  };

  const validate = (): string | null => {
    if (mode === 'signin') {
      if (!identifier.trim() || !password) return 'Enter your phone or email and password.';
      return null;
    }
    if (!name.trim()) return 'Enter your full name.';
    if (!isValidPhone(phone)) return 'Enter a valid mobile number.';
    if (!email.includes('@')) return 'Enter a valid email address.';
    if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (password !== confirmPassword) return 'The passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setErrorMsg(problem);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (mode === 'signin') {
        const auth: any = await authApi.login(identifier.trim(), password);
        completeSignIn(auth);
      } else {
        const auth: any = await authApi.register({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          role: 'buyer',
        });
        completeSignIn(auth);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignin = mode === 'signin';

  const tabClass = (active: boolean) =>
    `flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
      active ? 'bg-[#FF6500] text-white' : 'bg-[#162137] text-slate-400 hover:text-white'
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<FaLock className="h-5 w-5" />}
      iconBg="bg-orange-500/15 border border-orange-500/25"
      iconColor="text-[#FF6500]"
      title={isSignin ? 'Buyer sign in' : 'Create a buyer account'}
      subtitle={
        isSignin
          ? 'Sign in to see your orders, GST invoices and saved sites'
          : 'Create an account to place orders and track deliveries'
      }
      maxWidth="md"
    >
      <div className="flex gap-2 mb-4" role="tablist">
        <button type="button" role="tab" aria-selected={isSignin} className={tabClass(isSignin)} onClick={() => switchMode('signin')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={!isSignin} className={tabClass(!isSignin)} onClick={() => switchMode('signup')}>
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errorMsg && (
          <div role="alert" className="p-3 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {isSignin ? (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-identifier">
              Mobile number or email
            </label>
            <div className="relative flex items-center">
              <div className={`${iconClass} left-3.5`}>
                <FaPhone className="h-3.5 w-3.5" />
              </div>
              <input
                id="auth-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-name">
                Full name
              </label>
              <div className="relative flex items-center">
                <div className={iconClass}>
                  <FaUser className="h-3.5 w-3.5" />
                </div>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-phone">
                Mobile number
              </label>
              <div className="relative flex items-center">
                <div className={iconClass}>
                  <FaPhone className="h-3.5 w-3.5" />
                </div>
                <input
                  id="auth-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-email">
                Email
              </label>
              <div className="relative flex items-center">
                <div className={iconClass}>
                  <FaEnvelope className="h-3.5 w-3.5" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-password">
            Password
          </label>
          <div className="relative flex items-center">
            <div className={iconClass}>
              <FaKey className="h-3.5 w-3.5" />
            </div>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignin ? 'current-password' : 'new-password'}
              className={inputClass}
            />
          </div>
          {!isSignin && (
            <p className="mt-1.5 text-[11px] text-slate-500">At least {MIN_PASSWORD_LENGTH} characters.</p>
          )}
        </div>

        {!isSignin && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="auth-confirm">
              Confirm password
            </label>
            <div className="relative flex items-center">
              <div className={iconClass}>
                <FaKey className="h-3.5 w-3.5" />
              </div>
              <input
                id="auth-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            icon={<FaArrowRight className="h-3 w-3" />}
            className="rounded-xl px-6"
          >
            {isSignin ? 'Sign in' : 'Create account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
