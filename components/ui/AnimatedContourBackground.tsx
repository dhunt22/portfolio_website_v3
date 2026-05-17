'use client';

import { useEffect, useState } from 'react';
import { PageBackground } from '@/components/ui/PageBackground';

interface AnimatedContourBackgroundProps {
  backgroundImage: string;
  isMobile: boolean;
  isDark: boolean;
  mounted: boolean;
  /** Path to the SMIL-animated SVG. If absent, always renders the static PageBackground. */
  animatedSrc?: string;
  /** Passthrough to the static PageBackground fallback. */
  dualBackground?: boolean;
}

/**
 * Renders the SMIL-animated contour SVG via <object> when it is safe and
 * appropriate to animate; otherwise (and while the SVG loads) falls back to
 * the unchanged static PageBackground.
 */
export function AnimatedContourBackground({
  backgroundImage,
  isMobile,
  isDark,
  mounted,
  animatedSrc,
  dualBackground = false,
}: AnimatedContourBackgroundProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shouldAnimate = mounted && !isDark && !reducedMotion && !!animatedSrc;

  const staticUnderlay = (
    <div data-bg-underlay>
      <PageBackground
        backgroundImage={backgroundImage}
        isMobile={isMobile}
        dualBackground={dualBackground}
      />
    </div>
  );

  if (!shouldAnimate) {
    return staticUnderlay;
  }

  return (
    <>
      {!loaded && staticUnderlay}
      <div
        className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-full h-full opacity-10">
          <object
            type="image/svg+xml"
            data={animatedSrc}
            aria-hidden="true"
            tabIndex={-1}
            onLoad={() => setLoaded(true)}
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
    </>
  );
}
