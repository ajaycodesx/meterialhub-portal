'use client';

import React, { useState } from 'react';
import { FaGlobe, FaCircleCheck, FaXmark, FaArrowRight } from 'react-icons/fa6';
import { LanguageCode, LanguageOption } from '../../types/buyer';
import { Button } from '../ui/Button';

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

  if (!isOpen) return null;

  const handleSave = () => {
    onSelectLanguage(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 relative flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <FaXmark className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
            <FaGlobe className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-base text-slate-900 tracking-tight">Select Preferred Language</h4>
            <p className="text-xs text-slate-500 font-normal">Regional language for pricing &amp; support</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto mb-6">
          {LANGUAGES.map((lang) => {
            const isSelected = current === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setCurrent(lang.code)}
                className={`p-4 rounded-2xl text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50 text-[#FF6500] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/65 text-slate-700">
                    {lang.flag}
                  </span>
                  {isSelected && (
                    <FaCircleCheck className="h-4 w-4 text-[#FF6500]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{lang.nativeName}</h4>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">{lang.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<FaArrowRight className="h-3 w-3" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
