'use client';

import { useEffect, useState } from 'react';
import { PageBackground } from '@/components/ui/PageBackground';

interface AnimatedContourBackgroundProps {
  backgroundImage: string;
  isMobile: boolean;
  /** Accepted for caller convenience; the pulse overlay renders in both themes. */
  isDark?: boolean;
  mounted: boolean;
  /**
   * Path to the SMIL-animated pulse-overlay SVG. When present (and conditions
   * allow) it is layered on top of the static contour backdrop.
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
 * - Pulse overlay: a separate, small SMIL-animated SVG of glow pulses that
 *   trace the contour routes, fetched and inlined on top. Rendered (in both
 *   light and dark themes) when mounted, motion is allowed, and a pulse
 *   source is provided.
 *
 * The pulse SVG is inlined (not embedded via <object>): an <object>'s
 * embedded document composites on an opaque white backing in this layered
 * context, which washed out the dark theme. Inline SVG is transparent,
 * still runs SMIL, and is small (~20 paths). Its translucency is baked into
 * the SVG gradient stop-opacity.
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
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shouldAnimate = mounted && !reducedMotion && !!animatedSrc;

  useEffect(() => {
    if (!shouldAnimate || !animatedSrc || typeof fetch === 'undefined') {
      setSvgMarkup(null);
      return;
    }
    let cancelled = false;
    fetch(animatedSrc)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        // Strip XML prolog (invalid inside HTML innerHTML) and force the
        // inlined <svg> to scale to the container width by its viewBox ratio.
        const cleaned = text
          .replace(/^\s*<\?xml[^>]*\?>\s*/i, '')
          .replace(
            /<svg\b/i,
            '<svg style="width:100%;height:auto;display:block"',
          );
        setSvgMarkup(cleaned);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldAnimate, animatedSrc]);

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
          data-src={animatedSrc}
          className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '250%' : '100%',
              pointerEvents: 'none',
            }}
            // Trusted first-party static asset (generated pulse overlay).
            dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
          />
        </div>
      )}
    </>
  );
}
