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
    <div className="flex items-center justify-between gap-3 w-full">
      <Button
        variant="outline"
        size="md"
        onClick={onClose}
        className="px-5 sm:px-6 rounded-2xl"
      >
        Cancel
      </Button>

      <Button
        variant="primary"
        size="md"
        onClick={handleSave}
        icon={<FaArrowRight className="h-3.5 w-3.5" />}
        className="px-6 sm:px-7 rounded-2xl"
      >
        Save Language
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<FaGlobe className="h-6 w-6" />}
      iconBg="bg-orange-50"
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
              className={`p-3.5 sm:p-4 rounded-2xl text-left flex flex-col justify-between transition-all duration-300 relative cursor-pointer ${
                isSelected
                  ? 'bg-orange-50/90 text-[#FF6500] shadow-xs ring-1 ring-orange-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-200/70 text-slate-700">
                  {lang.flag}
                </span>
                {isSelected && (
                  <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">{lang.nativeName}</h4>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">{lang.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
