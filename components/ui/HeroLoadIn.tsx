'use client';

// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/HeroLoadIn.tsx
// GSAP-driven hero stagger entrance. Wraps hero children in a data-hero-loadin
// container; globals.css hides them (opacity:0) when JS is present so there is
// no FOUC before the tween runs. No-JS browsers never get the html.js class so
// children are always visible. Reduced-motion: CSS keeps them at opacity:1 and
// GSAP is not invoked.

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeroLoadInProps {
  children: React.ReactNode;
}

export function HeroLoadIn({ children }: HeroLoadInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Under reduced motion the CSS rule `html.js [data-hero-loadin] > * { opacity:1 }`
    // already shows the elements; nothing to do.
    if (reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    import('@/lib/gsap').then(({ gsap }) => {
      if (cancelled || !containerRef.current) return;

      const children = Array.from(containerRef.current.children) as HTMLElement[];
      if (children.length === 0) return;

      ctx = gsap.context(() => {
        // Start each child 14px below (matches the old `rise` keyframe
        // translateY(14px) → translateY(0)). GSAP from-values are set
        // synchronously before any paint so there is no visible jump.
        gsap.set(children, { y: 14 });

        // Stagger up into place. Cadence: 0 / 130 / 260 / 390 ms ≈ old
        // 0 / 120 / 260 / 400 ms delays (stagger 0.13 × 3 = 0.39 s total).
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.13,
        });
      }, container);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // Only run once on mount (reducedMotion changes are handled by CSS).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} data-hero-loadin>
      {children}
    </div>
  );
}
