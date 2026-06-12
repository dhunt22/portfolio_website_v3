'use client';

import { useEffect, useState } from 'react';

interface AnimatedContourBackgroundProps {
  /**
   * LIGHT-theme STATIC plate SVG URL (contours only). Painted as the CSS
   * background-image of a `dark:hidden` div. Because the dark plate lives on a
   * `display:none` sibling in dark mode, the browser never fetches it — and
   * vice-versa — so each visitor downloads exactly ONE plate, with the correct
   * theme chosen from SSR HTML (next-themes sets `.dark` before first paint).
   * The giant vector is rasterized once and never re-rasterized per frame.
   */
  lightPlate: string;
  /** DARK-theme STATIC plate SVG URL — painted on the `hidden dark:block` div. */
  darkPlate: string;
  /**
   * Theme-resolved ANIMATED glow SVG URL (the comet system only, transparent
   * canvas). Fetched + inlined ON TOP of the plate when motion is allowed so
   * its CSS motion-path sprites animate in their own small paint object. Under
   * reduced motion it is simply not loaded (the static plate remains). Resolved
   * by JS post-mount, which is fine: the glow fetch already happens after mount.
   */
  glowSrc: string;
  /** Resolved only after mount (gates the post-mount glow fetch). */
  mounted: boolean;
}

/**
 * Backdrop engine v2 — fixed full-viewport contour plate (two-layer model).
 *
 * A single fixed layer (`fixed inset-0 -z-10`) so the backdrop covers the
 * viewport at EVERY scroll position. It composites two layers:
 *
 * - STATIC plate (always): the contour-only plate, painted as a CSS
 *   background-image. Two sibling divs carry the light and dark plate — one is
 *   `dark:hidden`, the other `hidden dark:block` — so the correct plate is
 *   chosen by the `.dark` class from SSR (no JS, no flash) and the browser only
 *   fetches the visible one (background-images of `display:none` elements are
 *   never requested). This never animates and never re-rasters, so scrolling no
 *   longer stalls behind a giant per-frame vector repaint.
 * - ANIMATED glow (motion allowed only): the comet-only glow SVG fetched and
 *   inlined on top (transparent canvas, same viewBox so it registers 1:1). Its
 *   sprites animate via CSS motion path (offset-path / offset-distance) +
 *   opacity — GPU-composited, in a small isolated paint object.
 *
 * Reduced motion: the glow is not loaded; only the static plate background
 * shows. Inlining (not <object>) keeps the glow transparent and small.
 */
export function AnimatedContourBackground({
  lightPlate,
  darkPlate,
  glowSrc,
  mounted,
}: AnimatedContourBackgroundProps) {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const [glowMarkup, setGlowMarkup] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const shouldAnimate = mounted && !reducedMotion;

  useEffect(() => {
    if (!shouldAnimate || !glowSrc || typeof fetch === 'undefined') {
      setGlowMarkup(null);
      return;
    }
    let cancelled = false;
    fetch(glowSrc)
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
        setGlowMarkup(cleaned);
      })
      .catch(() => {
        if (!cancelled) setGlowMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldAnimate, glowSrc]);

  return (
    <div
      data-contour-plate
      data-light-src={lightPlate}
      data-dark-src={darkPlate}
      data-glow={shouldAnimate ? glowSrc : undefined}
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Static plate — two CSS-themed background-image layers. The browser
          only fetches the visible one (display:none background-images are never
          requested), and the .dark class is applied from SSR, so each visitor
          downloads exactly one plate with the correct theme and no flash. */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `url(${lightPlate})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `url(${darkPlate})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Animated glow — inlined on top only when motion is allowed. */}
      {shouldAnimate ? (
        <div
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          // Trusted first-party static asset (generated glow overlay).
          dangerouslySetInnerHTML={glowMarkup ? { __html: glowMarkup } : undefined}
        />
      ) : null}
    </div>
  );
}
