'use client';

import React from 'react';
import { FaCheck } from 'react-icons/fa6';

interface CheckboxProps {
  label?: React.ReactNode;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked,
  onChange,
  className = '',
  disabled = false
}) => {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
        checked
          ? 'bg-orange-50/80 shadow-xs ring-1 ring-orange-200'
          : 'bg-slate-50/80 hover:bg-slate-100 shadow-2xs'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={`h-5 w-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 border ${
          checked
            ? 'bg-[#FF6500] border-[#FF6500] text-white shadow-xs'
            : 'bg-white border-slate-300'
        }`}
      >
        {checked && <FaCheck className="h-3 w-3" />}
      </div>

      {(label || description) && (
        <div className="text-xs">
          {label && <div className="font-medium text-slate-900 leading-tight">{label}</div>}
          {description && <div className="text-[11px] text-slate-500 font-normal mt-0.5">{description}</div>}
        </div>
      )}
    </label>
  );
};
