'use client';

import React, { useState } from 'react';
import { FaGlobe, FaCircleCheck, FaArrowRight } from 'react-icons/fa6';
import { LanguageCode, LanguageOption } from '../../types/buyer';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: 'ML' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'TA' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: 'KN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: 'TE' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage
}) => {
  const [current, setCurrent] = useState<LanguageCode>(selectedLanguage);

  const handleSave = () => {
    onSelectLanguage(current);
    onClose();
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#253248] border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
      >
        Cancel
      </button>

      <Button
        variant="primary"
        size="md"
        onClick={handleSave}
        icon={<FaArrowRight className="h-3.5 w-3.5" />}
        className="px-6 rounded-xl text-xs font-medium"
      >
        Save Language
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<FaGlobe className="h-5 w-5" />}
      iconBg="bg-orange-500/15 border border-orange-500/25"
      iconColor="text-[#FF6500]"
      title="Select Preferred Language"
      subtitle="Regional language for pricing, support, and tax invoices"
      maxWidth="md"
      footer={footerContent}
    >
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => {
          const isSelected = current === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setCurrent(lang.code)}
              className={`p-3.5 sm:p-4 rounded-2xl text-left flex flex-col justify-between transition-all duration-200 relative cursor-pointer border ${
                isSelected
                  ? 'border-[#FF6500] bg-orange-500/10 text-white shadow-xs ring-1 ring-[#FF6500]/30'
                  : 'border-slate-700/60 bg-[#162137] hover:bg-[#1c2842] text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2.5">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[#1c2638] border border-slate-700/50 text-slate-300">
                  {lang.flag}
                </span>
                {isSelected && (
                  <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-medium text-white">{lang.nativeName}</h4>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">{lang.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
