'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  helperText,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          disabled={disabled}
          className={`w-full py-2.5 text-xs font-medium rounded-xl bg-slate-50 border transition-all text-slate-900 placeholder-slate-400 focus:outline-none ${
            icon ? 'pl-10 pr-4' : 'px-4'
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
        <p className="text-xs font-normal text-red-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs font-normal text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
