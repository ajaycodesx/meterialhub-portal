'use client';

import React from 'react';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface PageBannerProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backHref?: string;
  backTitle?: string;
  badge?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const PageBanner: React.FC<PageBannerProps> = ({
  breadcrumbs,
  title,
  subtitle,
  onBack,
  backHref,
  backTitle = 'Go Back',
  badge,
  rightContent,
  className = '',
  icon
}) => {
  return (
    <section className={`pt-4 sm:pt-5 lg:pt-6 pb-0 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        <div className="flex flex-col items-center text-center gap-2.5 sm:gap-3">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 mb-0.5 flex-wrap">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {crumb.label}
                      </Link>
                    ) : crumb.onClick ? (
                      <span
                        onClick={crumb.onClick}
                        className="hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <span className={isLast ? 'text-slate-700 font-semibold' : ''}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <FaChevronRight className="h-2.5 w-2.5 text-slate-300 shrink-0" />}
                  </React.Fragment>
                );
              })}
              {badge && <span className="ml-2">{badge}</span>}
            </div>
          )}

          {icon && (
            <div className="shrink-0 flex justify-center">
              {icon}
            </div>
          )}

          <div className="space-y-1 max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>

            {subtitle && (
              <div className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 flex flex-wrap items-center justify-center gap-2">
                {subtitle}
              </div>
            )}
          </div>

          {rightContent && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-0.5">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
