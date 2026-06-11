'use client';

import { useEffect, useState } from 'react';
import { PageBackground } from '@/components/ui/PageBackground';

interface AnimatedContourBackgroundProps {
  backgroundImage: string;
  isMobile: boolean;
  mounted: boolean;
  /**
   * Path to the theme-specific overlay SVG (light or dark variant). When
   * present (and conditions allow) it is layered on top of the static contour
   * backdrop. The caller supplies the correct theme variant; this component
   * fetches and inlines it.
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
 * - Overlay: a separate SVG of drafted route lines + comet ignition sprites,
 *   fetched and inlined on top. Theme-specific variants (light/dark) are
 *   supplied by the caller. Rendered when mounted, motion is allowed, and an
 *   overlay source is provided.
 *
 * The overlay SVG is inlined (not embedded via <object>): an <object>'s
 * embedded document composites on an opaque white backing in this layered
 * context, which washed out the dark theme. Inline SVG is transparent and
 * small. The sprites are animated with CSS motion path
 * (offset-path/offset-distance) + opacity — GPU-composited, so there is no
 * per-frame rasterization (SMIL gradient animation here saturated the
 * renderer to ~12fps and wrecked INP). Translucency is baked into the
 * static gradient stop-opacity.
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
