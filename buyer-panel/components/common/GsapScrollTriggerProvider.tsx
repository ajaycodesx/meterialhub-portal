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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
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
      {children}
    </div>
  );
};
