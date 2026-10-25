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
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
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
      icon={step === 'input' ? <FaLock className="h-6 w-6" /> : <FaShieldHalved className="h-6 w-6" />}
      iconBg="bg-orange-50"
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
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            <Input
              label="10-Digit Mobile Number or Email"
              icon={<FaPhone className="h-3.5 w-3.5" />}
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              placeholder="e.g. +91 9876543210 or site@builder.com"
              className="rounded-2xl font-medium"
            />

            <Checkbox
              label={
                <span className="text-xs text-slate-600 font-normal leading-relaxed">
                  I agree to MaterialHub&apos;s <strong className="font-semibold text-slate-800">Terms of Service</strong>, <strong className="font-semibold text-slate-800">Return Policy</strong>, and <strong className="font-semibold text-slate-800">GST Wholesale Agreement</strong>.
                </span>
              }
              checked={termsAccepted}
              onChange={(checked) => setTermsAccepted(checked)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={<FaArrowRight className="h-3 w-3" />}
              className="w-full rounded-2xl mt-1"
            >
              Send OTP
            </Button>
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
                  className="w-10 sm:w-11 h-12 text-center text-lg font-semibold rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/25 text-slate-900 shadow-2xs"
                />
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-600 font-medium">
                Auto-Verification enabled for verified contractor registration.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep('input')}
                icon={<FaArrowLeft className="h-3 w-3" />}
                iconPosition="left"
                className="rounded-2xl px-4"
              >
                Back
              </Button>

              <Button
                onClick={handleVerifyOtp}
                isLoading={isVerifying}
                variant="primary"
                size="md"
                icon={<FaCircleCheck className="h-3.5 w-3.5" />}
                className="flex-1 rounded-2xl"
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
