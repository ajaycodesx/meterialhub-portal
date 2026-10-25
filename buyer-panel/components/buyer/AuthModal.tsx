'use client';

import React,{ useState } from 'react';
import {
FaLock,
FaPhone,
FaXmark,
FaArrowRight,
FaShieldHalved,
FaCircleCheck
} from 'react-icons/fa6';
import { UserProfile } from '../../types/buyer';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 relative flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <FaXmark className="h-4 w-4" />
        </button>

        <div className="mb-6 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 text-center sm:text-left">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0 shadow-xs">
            <FaLock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-base text-slate-900 tracking-tight">Buyer Account Verification</h4>
            <p className="text-xs text-slate-500 font-normal">Access GST Tax Invoices &amp; Wholesale Rates</p>
          </div>
        </div>

        <div className="space-y-5">
          {step === 'input' && (
            <form onSubmit={handleProceedOtp} className="space-y-4">
              <div className="text-center pb-2">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center mx-auto mb-2 font-semibold">
                  <FaPhone className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Enter Mobile Number or Email</h4>
                <p className="text-xs text-slate-500 font-normal mt-0.5">We will send a 6-digit OTP to verify your account</p>
              </div>

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
              />

              <Checkbox
                label={
                  <span>
                    I agree to MaterialHub's <strong>Terms of Service</strong>, <strong>Quality Return Policy</strong>, and <strong>GST Wholesale Agreement</strong>.
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
                className="w-full"
              >
                Send OTP (Next)
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <FaShieldHalved className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Enter 6-Digit Verification Code</h4>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Code sent to <strong className="text-slate-900 font-semibold">{phoneOrEmail}</strong>
                </p>
              </div>

              <div className="flex justify-center gap-2">
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
                    className="w-11 h-12 text-center text-lg font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/25 text-slate-900 shadow-2xs"
                  />
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 text-center">
                <p className="text-xs text-emerald-800 font-medium">
                  Auto-Verification active for verified site registration.
                </p>
              </div>

              <Button
                onClick={handleVerifyOtp}
                isLoading={isVerifying}
                variant="primary"
                size="lg"
                icon={<FaCircleCheck className="h-4 w-4" />}
                className="w-full"
              >
                Verify OTP &amp; Proceed to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
