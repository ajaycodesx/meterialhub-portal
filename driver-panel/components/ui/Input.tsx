'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  leftIcon,
  error,
  helperText,
  className = '',
  disabled,
  ...props
}) => {
  const activeIcon = icon || leftIcon;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {activeIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center text-xs">
            {activeIcon}
          </div>
        )}

        <input
          disabled={disabled}
          className={`w-full py-2 text-xs font-medium rounded-xl bg-slate-50 border transition-all text-slate-900 placeholder-slate-400 focus:outline-none ${
            activeIcon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
              : 'border-slate-200 focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/20'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
          } ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-[11px] font-normal text-red-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-[11px] font-normal text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
