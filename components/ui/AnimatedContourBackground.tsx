'use client';

import { useEffect, useState } from 'react';
import { PageBackground } from '@/components/ui/PageBackground';

interface AnimatedContourBackgroundProps {
  backgroundImage: string;
  isMobile: boolean;
  /** Accepted for caller convenience; the pulse overlay now renders in both themes. */
  isDark?: boolean;
  mounted: boolean;
  /**
   * Path to the SMIL-animated pulse-overlay SVG. When present (and conditions
   * allow) it is layered, brighter, on top of the static contour backdrop.
   */
  animatedSrc?: string;
  /** Passthrough to the static PageBackground backdrop. */
  dualBackground?: boolean;
}

/**
 * Two-layer contour background:
 *
 * - Backdrop: the unchanged faint static contour (PageBackground) — always
 *   rendered, so there is never a blank/flashing state.
 * - Pulse overlay: a separate, brighter SMIL-animated SVG of glow pulses that
 *   trace the contour routes, layered exactly on top. Rendered (in both light
 *   and dark themes) when mounted, motion is allowed, and a pulse source is
 *   provided.
 *
 * Keeping the bright pulses on their own higher-opacity layer (instead of
 * inside the backdrop's opacity-10 wrapper) is what makes the animation
 * perceptible without making the backdrop compete with foreground content.
 */
export function AnimatedContourBackground({
  backgroundImage,
  isMobile,
  mounted,
  animatedSrc,
  dualBackground = false,
}: AnimatedContourBackgroundProps) {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shouldAnimate = mounted && !reducedMotion && !!animatedSrc;

  return (
    <>
      <PageBackground
        backgroundImage={backgroundImage}
        isMobile={isMobile}
        dualBackground={dualBackground}
      />
      {shouldAnimate && (
        <div
          data-pulse-overlay
          className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="w-full h-full opacity-[0.48]">
            <object
              type="image/svg+xml"
              data={animatedSrc}
              aria-hidden="true"
              tabIndex={-1}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: isMobile ? '250%' : '100%',
                height: 'auto',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
