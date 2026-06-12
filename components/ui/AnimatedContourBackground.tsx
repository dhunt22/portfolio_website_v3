'use client';

// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/AnimatedContourBackground.tsx
// Backdrop engine v3 — fixed full-viewport contour plate with GSAP reverse-glow overlay.

import { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
   * Portrait (mobile) plate URLs. When provided the component renders TWO sets
   * of plate wrapper divs: `md:hidden` pointing at the mobile plates and
   * `hidden md:block` pointing at the desktop plates. `display:none` parents
   * ensure the browser never fetches the hidden variant.
   */
  lightPlateMobile?: string;
  darkPlateMobile?: string;
  /**
   * Theme-resolved ANIMATED glow SVG URL (the reverse-glow overlay only,
   * transparent canvas). Fetched + inlined ON TOP of the plate when motion is
   * allowed so its GSAP opacity tweens animate in their own small paint object.
   * Under reduced motion it is simply not loaded (the static plate remains).
   * Resolved by JS post-mount, which is fine: the glow fetch already happens
   * after mount. When a mobile glow variant exists, the hook resolves this to
   * the portrait glow URL when isMobile is true.
   */
  glowSrc: string;
  /** Resolved only after mount (gates the post-mount glow fetch). */
  mounted: boolean;
  /** Whether the viewport is mobile-width (< 768 px by default). */
  isMobile?: boolean;
}

/**
 * Backdrop engine v3 — fixed full-viewport contour plate (two-layer model).
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
 * - ANIMATED glow (motion allowed only): the reverse-glow overlay SVG fetched
 *   and inlined on top (transparent canvas, same viewBox so it registers 1:1).
 *   Each overlay path has stroke = theme page-background colour, opacity 0 at
 *   rest. GSAP fades a line's opacity 0→1 (ERASING it into the background) then
 *   0 again — a reverse-glow "breathe" with zero registration drift since the
 *   overlay paths are verbatim copies of the plate paths. No MotionPathPlugin,
 *   no sprite circles, no comet system.
 *
 * Reduced motion: the glow is not loaded; only the static plate background
 * shows. Inlining (not <object>) keeps the glow transparent and small.
 */
export function AnimatedContourBackground({
  lightPlate,
  darkPlate,
  lightPlateMobile,
  darkPlateMobile,
  glowSrc,
  mounted,
  isMobile = false,
}: AnimatedContourBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [glowMarkup, setGlowMarkup] = useState<string | null>(null);
  const glowDivRef = useRef<HTMLDivElement>(null);

  const shouldAnimate = mounted && !reducedMotion;

  // Fetch + clean the glow SVG whenever the source or motion preference changes.
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

  // Build GSAP timelines after the glow markup is injected into the DOM.
  useEffect(() => {
    const container = glowDivRef.current;
    if (!glowMarkup || !container) return;

    // Dynamic import to keep GSAP out of the server bundle entirely.
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    import('@/lib/gsap').then(({ gsap }) => {
      if (cancelled || !glowDivRef.current) return;

      // GSAP context for clean revert on unmount / re-run.
      ctx = gsap.context(() => {
        const svgEl = container.querySelector('svg');
        if (!svgEl) return;

        const mobile = isMobile;

        // Iterate over every glow overlay path in the inlined SVG.
        const paths = svgEl.querySelectorAll<SVGPathElement>('path[data-line]');

        paths.forEach((pathEl) => {
          const lineIdx = Number(pathEl.getAttribute('data-line') ?? '0');
          const cycle = Number(pathEl.getAttribute('data-cycle') ?? '35');
          const delay = Number(pathEl.getAttribute('data-delay') ?? '0');

          // Mobile budget: only animate lines 0–7; hide the rest before creating tweens.
          if (mobile && lineIdx >= 8) {
            gsap.set(pathEl, { display: 'none' });
            return;
          }

          // Fade timeline: per-line repeating breathe sequence.
          //   - hold at 0 for the scatter delay (handled via phase seeding)
          //   - fade IN over 2.5s (sine.inOut)
          //   - hold at 1 for 2s
          //   - fade OUT over 2.5s (sine.inOut)
          //   - hold at 0 for remainder of cycle
          // Total active fade window = 7s; remainder = cycle - 7s (dead time).
          const FADE_IN = 2.5;
          const HOLD = 2.0;
          const FADE_OUT = 2.5;
          const FADE_WINDOW = FADE_IN + HOLD + FADE_OUT; // 7s
          const DEAD = cycle - FADE_WINDOW; // 28s at 35s cycle

          // willChange is toggled on/off per-leg to avoid static compositor layers.
          // At most ~3 lines are mid-fade at any instant (verified: worst-case 3
          // with cycle=35, delay spacing=2.5s, fade_window=7s over 2000s simulation).
          const tl = gsap.timeline({ repeat: -1 });
          tl
            .set(pathEl, { opacity: 0 })
            // Fade-in leg: promote to compositor layer only while animating.
            .call(() => { gsap.set(pathEl, { willChange: 'opacity' }); })
            .to(pathEl, { opacity: 1, duration: FADE_IN, ease: 'sine.inOut' })
            // Hold at full opacity (still compositor layer).
            .to(pathEl, { opacity: 1, duration: HOLD, ease: 'none' })
            // Fade-out leg.
            .to(pathEl, { opacity: 0, duration: FADE_OUT, ease: 'sine.inOut' })
            // Demote compositor layer during dead time.
            .call(() => { gsap.set(pathEl, { willChange: 'auto' }); })
            // Hold at 0 for the remainder of the cycle.
            .to(pathEl, { opacity: 0, duration: DEAD, ease: 'none' });

          // Seed the phase so lines are mid-cycle on load (no synchronized start).
          // delay = initial scatter offset in seconds; phase within the cycle.
          const phase = ((delay % cycle) + cycle) % cycle;
          tl.totalTime(phase + 10 * cycle);
        });
      }, container);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [glowMarkup, isMobile]);

  // Whether this page has portrait (mobile) plate variants.
  const hasMobilePlates = !!(lightPlateMobile && darkPlateMobile);

  return (
    <div
      data-contour-plate
      data-light-src={lightPlate}
      data-dark-src={darkPlate}
      data-glow={shouldAnimate ? glowSrc : undefined}
      className="fixed top-0 left-0 right-0 h-lvh -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {hasMobilePlates ? (
        <>
          {/* Mobile portrait plates (< md). TWO wrapper divs for theme gating so
              display:none parents prevent the hidden plate from being fetched. */}
          <div className="md:hidden">
            <div
              className="absolute inset-0 dark:hidden"
              style={{
                backgroundImage: `url(${lightPlateMobile})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div
              className="absolute inset-0 hidden dark:block"
              style={{
                backgroundImage: `url(${darkPlateMobile})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
          {/* Desktop landscape plates (≥ md). */}
          <div className="hidden md:block">
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
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
      {/* Animated glow — inlined on top only when motion is allowed. */}
      {shouldAnimate ? (
        <div
          ref={glowDivRef}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          // Trusted first-party static asset (generated glow overlay).
          dangerouslySetInnerHTML={glowMarkup ? { __html: glowMarkup } : undefined}
        />
      ) : null}
    </div>
  );
}
