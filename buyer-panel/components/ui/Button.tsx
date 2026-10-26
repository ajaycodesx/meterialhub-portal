'use client';

import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {

  const getVariantClasses = (v: ButtonVariant): string => {
    switch (v) {
      case 'primary':
        return 'bg-[#FF6500] hover:bg-[#E05800] text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-xs';
      case 'secondary':
        return 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-xs';
      case 'outline':
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 text-slate-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-xs';
      default:
        return 'bg-[#FF6500] hover:bg-[#E05800] text-white';
    }
  };

  const getSizeClasses = (s: ButtonSize): string => {
    switch (s) {
      case 'sm':
        return 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5 h-8 sm:h-9';
      case 'md':
        return 'px-4.5 py-2 text-xs rounded-xl gap-2 h-10 sm:h-11';
      case 'lg':
        return 'px-6 py-2.5 text-xs rounded-xl gap-2 h-11 sm:h-12';
      default:
        return 'px-4.5 py-2 text-xs rounded-xl gap-2 h-10 sm:h-11';
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
        variant
      )} ${getSizeClasses(size)} ${className}`}
      {...props}
    >
      {isLoading ? (
        <FaSpinner className="animate-spin h-3.5 w-3.5 mr-1.5 shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
