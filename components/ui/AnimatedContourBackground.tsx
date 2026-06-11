'use client';

import { useEffect, useState } from 'react';

interface AnimatedContourBackgroundProps {
  /**
   * Theme-resolved plate SVG URL (light or dark). When motion is allowed it is
   * fetched + inlined so the CSS motion-path comets animate. Under reduced
   * motion the same URL is painted as a static CSS background-image instead.
   */
  plateSrc: string;
  /** Resolved only after mount (avoids an SSR/client theme mismatch flash). */
  mounted: boolean;
}

/**
 * Backdrop engine v2 — fixed full-viewport contour plate.
 *
 * A single fixed layer (`fixed inset-0 -z-10`) so the plate covers the viewport
 * at EVERY scroll position; the old -200px / dual / repeat-y machinery is
 * obsolete for these landscape plates.
 *
 * - Motion allowed: the plate SVG is fetched and inlined (not <object>: an
 *   embedded document composites on opaque white and washed out the dark theme;
 *   inline SVG is transparent and small). The comets animate via CSS motion
 *   path (offset-path / offset-distance) + opacity — GPU-composited, no
 *   per-frame rasterization. The plate's own `.plate{opacity}` knob carries the
 *   subtlety; translucency of the glows is baked into the gradient stops.
 * - Reduced motion: do NOT inline. The same plate URL is painted as a static
 *   CSS background-image (cover, center) so the contours still read, with no
 *   animation.
 */
export function AnimatedContourBackground({
  plateSrc,
  mounted,
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

  const shouldAnimate = mounted && !reducedMotion;

  useEffect(() => {
    if (!shouldAnimate || !plateSrc || typeof fetch === 'undefined') {
      setSvgMarkup(null);
      return;
    }
    let cancelled = false;
    fetch(plateSrc)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        // Strip the XML prolog (invalid inside HTML innerHTML) and force the
        // inlined <svg> to fill the fixed layer.
        const cleaned = text
          .replace(/^\s*<\?xml[^>]*\?>\s*/i, '')
          .replace(
            /<svg\b/i,
            '<svg style="width:100%;height:100%;display:block"',
          );
        setSvgMarkup(cleaned);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldAnimate, plateSrc]);

  return (
    <div
      data-contour-plate
      data-src={plateSrc}
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {shouldAnimate ? (
        <div
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          // Trusted first-party static asset (generated contour plate).
          dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
        />
      ) : (
        // Reduced motion (or pre-mount): static plate as a CSS background.
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${plateSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
}
