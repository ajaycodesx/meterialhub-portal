'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';

export interface SelectOption {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
}

export interface SelectProps {
  label?: string;
  options?: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  popoverWidth?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Select: React.FC<SelectProps> = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  icon,
  className = '',
  disabled = false,
  trigger,
  children,
  popoverWidth = 'w-full',
  align = 'left',
  size = 'md',
  variant = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const getSizeClasses = (s: 'sm' | 'md' | 'lg') => {
    switch (s) {
      case 'sm':
        return 'h-9 px-3 text-xs font-semibold rounded-xl';
      case 'lg':
        return 'h-12 px-4 text-sm font-semibold rounded-xl';
      case 'md':
      default:
        return 'h-10 sm:h-11 px-3.5 text-xs font-semibold rounded-xl';
    }
  };

  const getLabelClasses = (s: 'sm' | 'md' | 'lg', v: 'light' | 'dark') => {
    const textColor = v === 'dark' ? 'text-slate-300' : 'text-slate-700';
    switch (s) {
      case 'sm':
        return `text-[10px] font-semibold uppercase tracking-wider ${textColor}`;
      case 'lg':
      case 'md':
      default:
        return `text-xs font-semibold ${textColor}`;
    }
  };

  const getTriggerVariantClasses = (v: 'light' | 'dark') => {
    switch (v) {
      case 'dark':
        return 'bg-[#162137] hover:bg-[#1c2842] border border-slate-700/80 text-white focus:ring-2 focus:ring-[#FF6500]/25 focus:border-[#FF6500]';
      case 'light':
      default:
        return 'bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]';
    }
  };

  const getPopoverVariantClasses = (v: 'light' | 'dark') => {
    switch (v) {
      case 'dark':
        return 'bg-[#0d1527] border border-slate-700/90 shadow-2xl shadow-black/80';
      case 'light':
      default:
        return 'bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60';
    }
  };

  const getOptionClasses = (v: 'light' | 'dark', isSelected: boolean) => {
    if (v === 'dark') {
      if (isSelected) {
        return 'bg-[#FF6500]/15 text-[#FF6500] font-semibold border-l-2 border-[#FF6500]';
      }
      return 'text-slate-300 hover:text-white hover:bg-[#162137] font-medium';
    } else {
      if (isSelected) {
        return 'bg-orange-50 text-[#FF6500] font-semibold border-l-2 border-[#FF6500]';
      }
      return 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium';
    }
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block ${getLabelClasses(size, variant)}`}>
          {label}
        </label>
      )}

      {trigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${getSizeClasses(size)} ${getTriggerVariantClasses(variant)} transition-all flex items-center justify-between gap-2 text-left focus:outline-hidden cursor-pointer shadow-2xs ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className={selectedOption ? (variant === 'dark' ? 'text-white' : 'text-slate-800') : 'text-slate-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <FaChevronDown
            className={`h-2.5 w-2.5 shrink-0 transition-transform duration-200 ${
              variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
            } ${isOpen ? 'rotate-180 text-[#FF6500]' : ''}`}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            popoverWidth === 'w-full' && !trigger ? 'left-0 right-0' : popoverWidth
          } mt-1.5 rounded-2xl z-50 animate-in fade-in duration-150 overflow-hidden ${getPopoverVariantClasses(variant)}`}
        >
          <div className="max-h-60 overflow-y-auto py-1.5 p-1 space-y-0.5 scrollbar-none">
            {children ? (
              <div onClick={() => setIsOpen(false)}>{children}</div>
            ) : options.length === 0 ? (
              <div className="px-4 py-2.5 text-xs text-slate-400 font-normal">No options available</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${getOptionClasses(
                      variant,
                      isSelected
                    )}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className={`text-[10px] font-normal ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <FaCheck className="h-3 w-3 text-[#FF6500] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
