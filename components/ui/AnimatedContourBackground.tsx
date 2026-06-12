'use client';

// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/AnimatedContourBackground.tsx
// Backdrop engine v3 — fixed full-viewport contour plate with GSAP reverse-glow overlay.

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldAnimate = mounted && !reducedMotion;

  // ── Mobile height pin ────────────────────────────────────────────────────────
  // On iOS, `lvh` re-resolves frame-by-frame as the URL bar collapses
  // (WebKit bugs 255708 / 261185: at load lvh ≈ svh, then grows to full height
  // as chrome retracts). On Chrome Android, `interactive-widget=resizes-visual`
  // only governs the virtual keyboard — the URL bar STILL causes height changes
  // on fixed/lvh elements. Both produce visible scale-bounce on mobile because
  // the plate's `cover` scale is height-driven (portrait: height/254 > width/190.5
  // at all phone heights), so any height delta = visible zoom.
  //
  // Fix: on mobile (< 768 px), measure once and pin the container height in px.
  // `screen.*` are CSS px. On iOS they are orientation-FIXED (portrait-major);
  // on Android they follow orientation — we normalise with min/max so we always
  // pin to the longer dimension in portrait and the shorter in landscape.
  // This produces a constant small overdraw (screen includes system bars) rather
  // than any visible rescale. Desktop (≥ 768 px) must NOT be pinned — lvh is
  // correct there and browsers have no collapsing chrome.
  //
  // Re-pin on orientation/viewport-width change only; height-only changes
  // (URL-bar collapse) are the very thing we're suppressing — ignore them.
  const pinHeightRef = useRef<number | null>(null);

  const applyPin = useCallback((el: HTMLDivElement) => {
    const w = window.innerWidth;
    // Touch-primary devices (phones AND tablets — iPads are ≥768px wide but
    // their Safari chrome still collapses) get the px pin. True desktops
    // (fine primary pointer, no collapsing chrome) keep h-lvh.
    const coarse =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;
    if (w >= 768 && !coarse) {
      // Desktop: remove any previously set inline height; h-lvh takes over.
      if (el.style.height) el.style.height = '';
      pinHeightRef.current = null;
      return;
    }
    // Mobile: compute the stable full-screen height from screen dimensions.
    // screen.* are CSS px and do not change during URL-bar animation.
    const portrait = window.innerHeight >= window.innerWidth;
    const pinH = portrait
      ? Math.max(window.screen.height, window.screen.width)
      : Math.min(window.screen.height, window.screen.width);
    if (pinH !== pinHeightRef.current) {
      el.style.height = `${pinH}px`;
      pinHeightRef.current = pinH;
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial pin (synchronous on mount, before first paint).
    applyPin(el);

    let lastWidth = window.innerWidth;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Height-only change (URL-bar collapse) — width is unchanged. Ignore it;
      // that's the exact event we're suppressing with the pin.
      if (currentWidth === lastWidth) return;

      // Width changed: true orientation flip or window resize. Debounce ~150 ms
      // to let the browser finish the transition before reading screen dimensions.
      lastWidth = currentWidth;
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyPin(el);
        debounceTimer = null;
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (debounceTimer !== null) clearTimeout(debounceTimer);
    };
  }, [applyPin]);

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
  //
  // v4 — elevation-band wave. The glow SVG is a full twin of the plate whose
  // paths are grouped into <g data-band> elevation bands (banded by the
  // hypsometric ramp in the build script). A wave of erasure sweeps through
  // the bands in elevation order: each band fades toward the page background
  // (its strokes ARE the page colour) and back. Whole terraces of the terrain
  // visibly breathe — unmissable, yet registration is pixel-perfect because
  // the twin shares the plate's exact geometry, viewBox, and cover/slice math.
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

        const bands = Array.from(
          svgEl.querySelectorAll<SVGGElement>('g[data-band]'),
        );
        if (bands.length === 0) return;

        // ── Wave tuning (single source of truth; assets carry no timing) ──
        // Window = IN + HOLD + OUT = 5.6s. STEP = 2s between adjacent bands →
        // at most ceil(5.6 / 2) = 3 bands mid-transition at any instant
        // (compositor-layer budget: willChange is toggled around the active
        // window, so ≤ 3 transient layers exist, none at rest).
        const FADE_IN = 2.2;
        const HOLD = 1.2;
        const FADE_OUT = 2.2;
        const STEP = 2.0;
        // Erase depth: 0.9 leaves a faint ghost of the band so the artwork
        // never looks broken while a band is "out".
        const PEAK = 0.9;
        const WINDOW = FADE_IN + HOLD + FADE_OUT;
        // The wave is perpetual: band b starts at b*STEP and the cycle length
        // is bands*STEP, so band 0 re-ignites right as the wave wraps.
        const CYCLE = Math.max(bands.length * STEP, WINDOW + STEP);
        const DEAD = CYCLE - WINDOW;

        bands.forEach((bandEl, b) => {
          const tl = gsap.timeline({ repeat: -1 });
          tl
            .set(bandEl, { opacity: 0 })
            // Promote to a compositor layer only while the band animates.
            .call(() => { gsap.set(bandEl, { willChange: 'opacity' }); })
            .to(bandEl, { opacity: PEAK, duration: FADE_IN, ease: 'sine.inOut' })
            .to(bandEl, { opacity: PEAK, duration: HOLD, ease: 'none' })
            .to(bandEl, { opacity: 0, duration: FADE_OUT, ease: 'sine.inOut' })
            .call(() => { gsap.set(bandEl, { willChange: 'auto' }); })
            .to(bandEl, { opacity: 0, duration: DEAD, ease: 'none' });

          // Phase-seed so the wave is already travelling on load: band b sits
          // b*STEP into the cycle (+10 cycles keeps totalTime positive).
          const phase = ((b * STEP) % CYCLE + CYCLE) % CYCLE;
          tl.totalTime(phase + 10 * CYCLE);
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
      ref={containerRef}
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
