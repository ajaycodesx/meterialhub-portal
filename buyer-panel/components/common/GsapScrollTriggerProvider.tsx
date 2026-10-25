'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const GsapScrollTriggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: document.documentElement,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.15
            }
          }
        );
      }

      const revealSections = gsap.utils.toArray<HTMLElement>('.gsap-reveal-section, [data-gsap="reveal"]');
      revealSections.forEach((section) => {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 28
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      const staggerContainers = gsap.utils.toArray<HTMLElement>('.gsap-stagger-group, [data-gsap="stagger"]');
      staggerContainers.forEach((group) => {
        const cards = group.querySelectorAll('.gsap-card, [data-gsap-item="card"]');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 24
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: group,
                start: 'top 86%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div ref={containerRef} className="contents">
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 sm:h-1.5 pointer-events-none overflow-hidden bg-transparent">
        <div
          ref={progressBarRef}
          className="h-full w-full bg-gradient-to-r from-[#FF6500] via-[#FF8A00] to-[#FF5100] origin-left scale-x-0 shadow-xs"
        />
      </div>
      {children}
    </div>
  );
};
