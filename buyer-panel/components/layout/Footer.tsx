'use client';

import React from 'react';
import {
  FaDownload,
  FaShieldHalved,
  FaLock,
  FaStore,
  FaTruck,
  FaGlobe,
  FaHeadset,
  FaArrowRight
} from 'react-icons/fa6';

interface FooterProps {
  onOpenLanguageModal: () => void;
  currentLanguage: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLanguageModal, currentLanguage }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-14 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-orange-900/60 bg-slate-800 shrink-0">
                <img
                  src="/images/logo.png"
                  alt="MaterialHub Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold text-xl tracking-tight text-white leading-tight">
                Material<span className="text-[#FF6500]">Hub</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-normal">
              Direct wholesale marketplace for construction materials. Connecting contractors and builders with verified local hardware merchants within a 25 KM delivery radius.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium">
                <FaShieldHalved className="h-3 w-3 text-emerald-400" />
                GST Tax Invoice
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium">
                <FaLock className="h-3 w-3 text-[#FF6500]" />
                SSL Secured
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium">
                <FaHeadset className="h-3 w-3 text-emerald-400" />
                24x7 Support
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Download App
              </p>
              <div className="flex items-center gap-2.5">
                <button className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer">
                  <FaDownload className="h-3 w-3 text-[#FF6500]" />
                  <div className="text-left">
                    <div className="text-[9px] text-slate-500 uppercase font-normal leading-none">Get it on</div>
                    <div className="font-semibold text-[11px] leading-tight">Google Play</div>
                  </div>
                </button>
                <button className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer">
                  <FaDownload className="h-3 w-3 text-slate-300" />
                  <div className="text-left">
                    <div className="text-[9px] text-slate-500 uppercase font-normal leading-none">Download on</div>
                    <div className="font-semibold text-[11px] leading-tight">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Material Categories
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              {[
                'Cement & Aggregates',
                'TMT Steel Rods',
                'PVC Pipes & Plumbing',
                'Paints & Wall Putty',
                'Electrical Wires & Switches',
                'Hardware & Power Tools',
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-500 hover:text-[#FF6500] transition-colors flex items-center gap-1.5 group">
                    <FaArrowRight className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6500]" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Ecosystem & Partners
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <a href="../vendor-panel" className="text-slate-500 hover:text-[#FF6500] transition-colors flex items-center gap-2">
                  <FaStore className="h-3 w-3 text-[#FF6500] shrink-0" />
                  Become a Vendor
                </a>
              </li>
              <li>
                <a href="../driver-panel" className="text-slate-500 hover:text-[#FF6500] transition-colors flex items-center gap-2">
                  <FaTruck className="h-3 w-3 text-emerald-400 shrink-0" />
                  Logistics Partner
                </a>
              </li>
              {[
                'B2B Credit Facility',
                'Bulk Order Requests',
                'Merchant Hardware Network',
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-500 hover:text-[#FF6500] transition-colors flex items-center gap-1.5 group">
                    <FaArrowRight className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6500]" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              {[
                '24x7 Customer Support',
                'Buyer FAQs',
                'Terms of Service',
                'Privacy Policy',
                'Quality Return Policy',
                'GST Tax Invoicing Guide',
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-500 hover:text-[#FF6500] transition-colors flex items-center gap-1.5 group">
                    <FaArrowRight className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6500]" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-600 font-normal">
            © 2026 MaterialHub Technologies. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors text-xs cursor-pointer"
            >
              <FaGlobe className="h-3 w-3 text-[#FF6500]" />
              <span className="uppercase">{currentLanguage}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {['UPI / BHIM', 'Visa', 'NetBanking'].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
