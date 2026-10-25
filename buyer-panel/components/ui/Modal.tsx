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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/45 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 bg-white rounded-3xl shadow-xl shadow-slate-950/10 ring-1 ring-slate-900/5 flex flex-col w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${getMaxWidthClass(
          maxWidth
        )} ${className}`}
      >
        {(icon || title) && (
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              {icon && (
                <div
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-snug truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 font-normal mt-0.5 truncate leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8.5 w-8.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
              title="Close dialog"
              aria-label="Close"
            >
              <FaXmark className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={`p-5 sm:p-6 overflow-y-auto flex-1 scrollbar-none ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <div className="p-4 sm:p-5 px-5 sm:px-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
