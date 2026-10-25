'use client';

import React, { useEffect } from 'react';
import { FaXmark } from 'react-icons/fa6';

export type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  maxWidth?: ModalMaxWidth;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  icon,
  iconBg = 'bg-orange-50',
  iconColor = 'text-[#FF6500]',
  title,
  subtitle,
  maxWidth = 'lg',
  children,
  footer,
  className = '',
  bodyClassName = ''
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getMaxWidthClass = (width: ModalMaxWidth): string => {
    switch (width) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 bg-white rounded-3xl sm:rounded-[32px] shadow-2xl flex flex-col w-full max-h-[92vh] overflow-hidden transition-all duration-300 ${getMaxWidthClass(
          maxWidth
        )} ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs z-20"
          title="Close dialog"
          aria-label="Close"
        >
          <FaXmark className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7 pb-0 shrink-0">
          {(icon || title) && (
            <div className="text-center">
              {icon && (
                <div
                  className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-xs shrink-0`}
                >
                  {icon}
                </div>
              )}
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed max-w-sm mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={`p-5 sm:p-7 pt-4 sm:pt-5 overflow-y-auto flex-1 scrollbar-none ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <div className="p-5 sm:p-7 pt-3.5 sm:pt-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
