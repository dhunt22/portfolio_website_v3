'use client';

// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/AnimatedContourBackground.tsx
// Backdrop engine v3 — fixed full-viewport contour plate with GSAP reverse-glow overlay.

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
  // Theme-toggle crossfade: once the OPPOSITE theme's plate has been prefetched
  // (idle, post-load), plate gating upgrades from display (lazy first fetch) to
  // opacity + transition (smooth toggle, contours persistent).
  const [xfade, setXfade] = useState(false);
  const glowDivRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldAnimate = mounted && !reducedMotion;

  // CRITICAL: the dangerouslySetInnerHTML wrapper object MUST be referentially
  // stable across re-renders. Next 14's React canary re-applies innerHTML when
  // the wrapper identity changes even if the string is equal — which destroyed
  // the GSAP-animated SVG on the first re-render after markup landed (theme
  // toggle: breathing died and the overlay went inert). Root-caused 2026-06-12
  // by trapping Element#innerHTML: react-dom's setInnerHTML fired on toggle
  // with an identical-length string and no re-fetch.
  const glowHtml = useMemo(
    () => (glowMarkup ? { __html: glowMarkup } : undefined),
    [glowMarkup],
  );

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

  // The INITIAL pin happens pre-paint in the layout <head> bootstrap script
  // (sets --backdrop-h on <html>), so the plate's cover scale is correct from
  // the very first frame — no post-hydration rescale. This callback only
  // MAINTAINS the pin across width changes (orientation flips, window resize).
  const applyPin = useCallback(() => {
    const root = document.documentElement;
    const w = window.innerWidth;
    // Touch-primary devices (phones AND tablets — iPads are ≥768px wide but
    // their Safari chrome still collapses) get the px pin. True desktops
    // (fine primary pointer, no collapsing chrome) keep the 100lvh fallback.
    const coarse =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;
    if (w >= 768 && !coarse) {
      root.style.removeProperty('--backdrop-h');
      pinHeightRef.current = null;
      return;
    }
    // Stable full-screen height from screen dimensions. screen.* are CSS px
    // and do not change during URL-bar animation; min/max normalizes iOS
    // (orientation-fixed dims) vs Android (rotating dims).
    const portrait = window.innerHeight >= window.innerWidth;
    const pinH = portrait
      ? Math.max(window.screen.height, window.screen.width)
      : Math.min(window.screen.height, window.screen.width);
    if (pinH !== pinHeightRef.current) {
      root.style.setProperty('--backdrop-h', `${pinH}px`);
      pinHeightRef.current = pinH;
    }
  }, []);

  useEffect(() => {
    // Reconcile with whatever the head bootstrap set (also covers the edge
    // where hydration happens after a rotation).
    applyPin();

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
        applyPin();
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

  // ── Theme-toggle crossfade upgrade ──────────────────────────────────────────
  // First paint keeps display-gating (lazy: only the active theme's plate is
  // fetched). A few seconds after mount we prefetch the OPPOSITE theme's plate
  // for the current orientation; once cached, gating upgrades to
  // opacity + transition so a theme toggle is a smooth crossfade and contours
  // never vanish behind an in-flight 2MB download.
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const idle = setTimeout(() => {
      const pair =
        isMobile && hasMobilePlates
          ? [lightPlateMobile as string, darkPlateMobile as string]
          : [lightPlate, darkPlate];
      Promise.all(
        pair.map(
          (src) =>
            new Promise((res) => {
              const img = new Image();
              img.onload = img.onerror = res;
              img.src = src;
            }),
        ),
      ).then(() => {
        if (!cancelled) setXfade(true);
      });
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(idle);
    };
  }, [mounted, isMobile, hasMobilePlates, lightPlate, darkPlate, lightPlateMobile, darkPlateMobile]);

  // Theme gating classes for a plate div. Before the crossfade upgrade:
  // display-gated (hidden plates are never fetched). After: opacity-gated with
  // a transition (both plates are cached; toggling fades between them).
  const plateClass = (theme: 'light' | 'dark') =>
    xfade
      ? theme === 'light'
        ? 'absolute inset-0 transition-opacity duration-700 opacity-100 dark:opacity-0'
        : 'absolute inset-0 transition-opacity duration-700 opacity-0 dark:opacity-100'
      : theme === 'light'
        ? 'absolute inset-0 dark:hidden'
        : 'absolute inset-0 hidden dark:block';

  const plateStyle = (url: string) => ({
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  });

  return (
    <div
      ref={containerRef}
      data-contour-plate
      data-light-src={lightPlate}
      data-dark-src={darkPlate}
      data-glow={shouldAnimate ? glowSrc : undefined}
      className="fixed top-0 left-0 right-0 -z-10 overflow-hidden"
      // Pre-paint pinned px height on touch devices (head bootstrap sets the
      // var); 100lvh fallback for desktop / no-JS.
      style={{ height: 'var(--backdrop-h, 100lvh)' }}
      aria-hidden="true"
    >
      {hasMobilePlates ? (
        <>
          {/* Mobile portrait plates (< md); orientation stays display-gated
              (it cannot toggle interactively), themes use plateClass gating. */}
          <div className="md:hidden">
            <div className={plateClass('light')} style={plateStyle(lightPlateMobile as string)} />
            <div className={plateClass('dark')} style={plateStyle(darkPlateMobile as string)} />
          </div>
          {/* Desktop landscape plates (≥ md). */}
          <div className="hidden md:block">
            <div className={plateClass('light')} style={plateStyle(lightPlate)} />
            <div className={plateClass('dark')} style={plateStyle(darkPlate)} />
          </div>
        </>
      ) : (
        <>
          {/* Static plate — two CSS-themed background-image layers. Until the
              crossfade upgrade, the browser only fetches the visible one
              (display:none background-images are never requested). */}
          <div className={plateClass('light')} style={plateStyle(lightPlate)} />
          <div className={plateClass('dark')} style={plateStyle(darkPlate)} />
        </>
      )}
      {/* Animated glow — inlined on top only when motion is allowed.
          glowHtml is memoized: a fresh wrapper object per render makes React
          re-apply innerHTML, destroying the GSAP-animated DOM (see above). */}
      {shouldAnimate ? (
        <div
          ref={glowDivRef}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          // Trusted first-party static asset (generated glow overlay).
          dangerouslySetInnerHTML={glowHtml}
        />
      ) : null}
    </div>
  );
}
