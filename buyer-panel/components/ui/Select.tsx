'use client';

import React,{ useState,useRef,useEffect } from 'react';
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
  size = 'md'
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

  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs font-semibold rounded-xl',
    md: 'h-10 sm:h-11 px-3.5 text-xs font-semibold rounded-xl',
    lg: 'h-12 px-4 text-sm font-semibold rounded-xl'
  }[size];

  const labelSizeClasses = {
    sm: 'text-[10px] font-semibold text-slate-500 uppercase tracking-wider',
    md: 'text-xs font-semibold text-slate-700',
    lg: 'text-xs font-semibold text-slate-700'
  }[size];

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block ${labelSizeClasses}`}>
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
          className={`w-full ${sizeClasses} bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all flex items-center justify-between gap-2 text-left focus:outline-none cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <FaChevronDown className={`h-2.5 w-2.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <div 
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            popoverWidth === 'w-full' && !trigger ? 'left-0 right-0' : popoverWidth
          } mt-1.5 bg-white rounded-2xl shadow-xl z-50 animate-in fade-in duration-150 overflow-hidden`}
        >
          <div className="max-h-60 overflow-y-auto py-1.5 p-1">
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
                    className={`w-full px-3.5 py-2 text-xs font-medium rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-[#FF6500] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div>
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-slate-400 font-normal">{opt.description}</div>
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
