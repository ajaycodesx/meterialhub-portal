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
  FaChevronRight,
  FaTruckFast,
  FaBuilding,
  FaCircleCheck,
  FaPhone
} from 'react-icons/fa6';

interface FooterProps {
  onOpenLanguageModal: () => void;
  currentLanguage: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLanguageModal, currentLanguage }) => {
  return (
    <footer className="bg-slate-100/80 border-t border-slate-200/80 pt-5 sm:pt-8 pb-[72px] md:pb-8 text-slate-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-2.5 sm:space-y-6">
        
        {/* Trust Value Propositions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
              <FaTruckFast className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 leading-tight">25 KM Radius</h4>
              <p className="text-[10px] text-slate-500 font-normal">Same-Day Site Unloading</p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FaShieldHalved className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 leading-tight">GST Tax Invoice</h4>
              <p className="text-[10px] text-slate-500 font-normal">100% Tax Credit Invoice</p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50/10 text-orange-500 flex items-center justify-center shrink-0">
              <FaCircleCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 leading-tight">Verified Stores</h4>
              <p className="text-[10px] text-slate-500 font-normal">Direct Wholesale Stock</p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FaHeadset className="h-4 w-4 text-slate-800" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 leading-tight">24x7 Site Support</h4>
              <p className="text-[10px] text-slate-500 font-normal">Dedicated Helpdesk</p>
            </div>
          </div>
        </div>

        {/* Main Footer Layout */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Brand Info & App Downloads */}
          <div className="lg:col-span-5 space-y-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-orange-100 bg-slate-900 shrink-0 shadow-xs">
                <img
                  src="/images/logo.png"
                  alt="MaterialHub Circular Brand Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <span className="font-semibold text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
                  Material<span className="text-[#FF6500]">Hub</span>
                </span>
                <p className="text-[10px] text-slate-500 font-normal leading-none">
                  Wholesale Construction Supply Platform
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              MaterialHub connects contractors and builders directly with local hardware merchants for factory-rate Cement, TMT Steel Rods, PVC Pipes, Paints, and Electrical supplies.
            </p>

            <div className="pt-1 space-y-2 w-full flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block text-center sm:text-left">
                Get MaterialHub Mobile App
              </span>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full">
                <button className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer">
                  <FaDownload className="h-3 w-3 text-[#FF6500]" />
                  <div className="text-left">
                    <div className="text-[8px] text-slate-400 uppercase font-normal leading-none">Get it on</div>
                    <div className="font-semibold text-[10px] leading-tight">Google Play</div>
                  </div>
                </button>

                <button className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer">
                  <FaDownload className="h-3 w-3 text-slate-300" />
                  <div className="text-left">
                    <div className="text-[8px] text-slate-400 uppercase font-normal leading-none">Download on</div>
                    <div className="font-semibold text-[10px] leading-tight">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Category Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Wholesale Materials
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 text-xs font-normal">
              {[
                'Cement 53 Grade',
                'Fe550 TMT Steel Rods',
                'PVC Plumbing Pipes',
                'Emulsion Wall Putty',
                'Electrical Wires & Switches',
                'Hardware & Tools'
              ].map((item) => (
                <a 
                  key={item} 
                  href="/catalog" 
                  className="text-slate-600 hover:text-[#FF6500] transition-colors flex items-center gap-1 py-0.5"
                >
                  <FaChevronRight className="h-2 w-2 text-slate-400" />
                  <span>{item}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Ecosystem Portals & Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Ecosystem Portals
            </h4>
            <div className="space-y-2">
              <a
                href="../vendor-panel"
                className="p-2.5 rounded-2xl bg-orange-50/80 hover:bg-orange-100/70 border border-orange-200/60 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-xl bg-[#FF6500] text-white flex items-center justify-center shrink-0">
                    <FaStore className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Become a Vendor</div>
                    <div className="text-[10px] text-slate-500 font-normal">Hardware Store Onboarding</div>
                  </div>
                </div>
                <FaChevronRight className="h-3 w-3 text-[#FF6500]" />
              </a>

              <a
                href="../driver-panel"
                className="p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/60 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FaTruck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Logistics Partner</div>
                    <div className="text-[10px] text-slate-500 font-normal">Driver &amp; Fleet Onboarding</div>
                  </div>
                </div>
                <FaChevronRight className="h-3 w-3 text-emerald-600" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[11px] text-slate-500 font-normal text-center sm:text-left">
            © 2026 MaterialHub Technologies. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLanguageModal}
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors text-xs cursor-pointer border border-slate-200/60 shrink-0"
            >
              <FaGlobe className="h-3 w-3 text-[#FF6500]" />
              <span className="uppercase">{currentLanguage}</span>
            </button>

            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-xl bg-slate-100 border border-slate-200/40">UPI / BHIM</span>
              <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-xl bg-slate-100 border border-slate-200/40">NetBanking</span>
              <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-xl bg-slate-100 border border-slate-200/40">B2B Credit</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
