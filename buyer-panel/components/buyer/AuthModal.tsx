'use client';

import React, { useState } from 'react';
import {
  FaLock,
  FaPhone,
  FaArrowRight,
  FaShieldHalved,
  FaCircleCheck,
  FaArrowLeft
} from 'react-icons/fa6';
import { UserProfile } from '../../types/buyer';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [otpValues, setOtpValues] = useState(['5', '9', '2', '8', '4', '1']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleProceedOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail || phoneOrEmail.length < 5) {
      setErrorMsg('Please enter a valid 10-digit mobile number or email');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept Terms of Service to continue');
      return;
    }
    setErrorMsg('');
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const isEmail = phoneOrEmail.includes('@');
      const user: UserProfile = {
        name: isEmail ? phoneOrEmail.split('@')[0] : 'Verified Buyer',
        phone: isEmail ? '+91 9876543210' : phoneOrEmail,
        email: isEmail ? phoneOrEmail : 'buyer@meterialhub.com',
        isLoggedIn: true,
        savedAddresses: [
          { id: '1', label: 'Primary Site', address: 'Site #14, Kakkanad Zone' }
        ]
      };
      onLoginSuccess(user);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={step === 'input' ? <FaLock className="h-5 w-5" /> : <FaShieldHalved className="h-5 w-5" />}
      iconBg="bg-orange-500/15 border border-orange-500/25"
      iconColor="text-[#FF6500]"
      title={step === 'input' ? 'Buyer Account Verification' : 'Verify Account OTP'}
      subtitle={
        step === 'input'
          ? 'Enter mobile number or email to access GST invoices & wholesale rates'
          : `6-digit verification code sent to ${phoneOrEmail || 'your phone'}`
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {step === 'input' && (
          <form onSubmit={handleProceedOtp} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                10-Digit Mobile Number or Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
                  <FaPhone className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="e.g. +91 9876543210 or site@builder.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-[#162137] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500] transition-all"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded-md accent-[#FF6500] mt-0.5 shrink-0"
              />
              <span className="text-xs text-slate-400 font-normal leading-relaxed">
                I agree to MaterialHub&apos;s <strong className="font-semibold text-slate-200">Terms of Service</strong>, <strong className="font-semibold text-slate-200">Return Policy</strong>, and <strong className="font-semibold text-slate-200">GST Wholesale Agreement</strong>.
              </span>
            </label>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<FaArrowRight className="h-3 w-3" />}
                className="rounded-xl px-6"
              >
                Send OTP
              </Button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2 py-1">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newArr = [...otpValues];
                    newArr[idx] = e.target.value;
                    setOtpValues(newArr);
                  }}
                  className="w-10 sm:w-11 h-12 text-center text-lg font-semibold rounded-2xl bg-[#162137] border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500] text-white shadow-2xs"
                />
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141d33] border border-slate-700/60 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Auto-Verification enabled for verified contractor registration.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/70 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FaArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </button>

              <Button
                onClick={handleVerifyOtp}
                isLoading={isVerifying}
                variant="primary"
                size="md"
                icon={<FaCircleCheck className="h-3.5 w-3.5" />}
                className="rounded-xl px-6"
              >
                Verify &amp; Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
