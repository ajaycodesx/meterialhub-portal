'use client';

import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa6';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
      className={`fixed bottom-20 sm:bottom-8 right-5 sm:right-7 z-40 h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#0F172A]/90 hover:bg-[#FF6500] text-white backdrop-blur-md shadow-lg hover:shadow-orange-500/25 ring-1 ring-white/10 flex items-center justify-center transition-all duration-300 ease-out cursor-pointer group ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
    >
      <FaArrowUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
};
