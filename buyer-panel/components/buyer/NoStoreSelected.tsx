'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaTruckFast } from 'react-icons/fa6';

interface NoStoreSelectedProps {
  message?: string;
  description?: string;
  buttonText?: string;
  onAction?: () => void;
}

export function NoStoreSelected({
  message = 'No active order to track.',
  description = 'Place an order from verified merchants to monitor live GPS transit and site delivery updates.',
  buttonText = 'Browse Materials Catalog',
  onAction
}: NoStoreSelectedProps) {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      router.push('/catalog');
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] px-4 py-12 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xs border border-slate-100/80 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center mx-auto shadow-2xs">
          <FaTruckFast className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-medium text-slate-900 tracking-tight leading-snug">
            {message}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF6500] hover:bg-[#e05a00] text-white font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
}
