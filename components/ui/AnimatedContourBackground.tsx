'use client';

// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/AnimatedContourBackground.tsx
// Backdrop engine v2 — fixed full-viewport contour plate with GSAP comet glow.

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
   * Theme-resolved ANIMATED glow SVG URL (the comet system only, transparent
   * canvas). Fetched + inlined ON TOP of the plate when motion is allowed so
   * its GSAP MotionPath sprites animate in their own small paint object. Under
   * reduced motion it is simply not loaded (the static plate remains). Resolved
   * by JS post-mount, which is fine: the glow fetch already happens after mount.
   */
  glowSrc: string;
  /** Resolved only after mount (gates the post-mount glow fetch). */
  mounted: boolean;
  /** Whether the viewport is mobile-width (< 768 px by default). */
  isMobile?: boolean;
}

// ---------------------------------------------------------------------------
// Phase-seeding math (maps old CSS animation-delay → GSAP totalTime)
//
// Old CSS emission per circle:
//   head:      animation-delay = scatter                  (scatter = -(i * 3.83))
//   tail k:    animation-delay = scatter + k * dt         (k = 1..tailN)
//              where dt = gapU / speed
//
// A negative CSS animation-delay means the animation started |delay| seconds
// BEFORE the element was created → the animation has progressed |delay| into
// its cycle at t=0.
//
//   cssDelay          = scatter + lag           (lag = 0 for head, k*dt for tail k)
//   timeAdvanced      = -cssDelay = scatterAbs - lag   (scatterAbs = i * 3.83)
//
// GSAP totalTime seeding:
//   phase = ((scatterAbs - lag) % dur + dur) % dur
//   tween.totalTime(phase + 10 * dur)    // +10*dur keeps totalTime positive
//
// This exactly reproduces the old position. The +10*dur offset is invisible
// to the animation because totalTime() on an infinite repeat tween wraps
// correctly; it just guarantees we never pass a negative value.
// ---------------------------------------------------------------------------

function seedTotalTime(
  tween: { totalTime: (t: number) => void },
  scatterAbs: number,
  lag: number,
  dur: number,
) {
  const advanced = scatterAbs - lag;
  const phase = ((advanced % dur) + dur) % dur;
  tween.totalTime(phase + 10 * dur);
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
 *   sprites animate via GSAP MotionPathPlugin (GPU-composited transform) and
 *   a repeating opacity timeline — no CSS @keyframes in the SVG file.
 *
 * Reduced motion: the glow is not loaded; only the static plate background
 * shows. Inlining (not <object>) keeps the glow transparent and small.
 */
export function AnimatedContourBackground({
  lightPlate,
  darkPlate,
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

        // Iterate over every comet group in the inlined SVG.
        const groups = svgEl.querySelectorAll<SVGGElement>('g[data-route]');
        groups.forEach((group) => {
          const routeIdx = Number(group.getAttribute('data-route'));
          const dur = Number(group.getAttribute('data-dur'));
          const fadeT = Number(group.getAttribute('data-fade'));
          const scatterAbs = Number(group.getAttribute('data-scatter'));
          const fadePeak = Number(group.getAttribute('data-fade-peak') ?? '0.6');

          // Mobile budget: only routes 0–7 animate; surplus groups are hidden.
          if (mobile && routeIdx > 7) {
            gsap.set(group, { display: 'none' });
            return;
          }

          // Reference the invisible route path in <defs> for MotionPathPlugin.
          // Build the id from the group's class: "{page}-comet" → "{page}-route{i}"
          const groupClass = group.getAttribute('class') ?? '';
          const pageMatch = groupClass.match(/^(\S+)-comet/);
          if (!pageMatch) return;
          const page = pageMatch[1];
          const routePathEl = svgEl.querySelector<SVGPathElement>(
            `#${page}-route${routeIdx}`,
          );
          if (!routePathEl) return;

          // Circles inside this group.
          const circles = Array.from(group.querySelectorAll<SVGCircleElement>('circle'));

          // Animate each circle along the motion path.
          circles.forEach((circle) => {
            const k = Number(circle.getAttribute('data-k') ?? '0');
            const lag = Number(circle.getAttribute('data-lag') ?? '0');

            // Mobile budget: only sprites 0–6 (head + first 6 followers).
            if (mobile && k > 6) {
              gsap.set(circle, { display: 'none' });
              return;
            }

            // GPU compositing hint — only on animated circles.
            gsap.set(circle, { willChange: 'transform' });

            // Movement tween: travel the route path, repeat infinitely.
            // `align` is REQUIRED: without it, MotionPathPlugin treats the path
            // coordinates as relative transform deltas from the element's current
            // position rather than absolute canvas positions, and `alignOrigin`
            // is inert. With `align: routePathEl`, GSAP snapshots both the path
            // and the element via getBoundingClientRect at tween creation and
            // compensates so the element's centre lands exactly on the path point.
            const moveTween = gsap.to(circle, {
              motionPath: {
                path: routePathEl,
                align: routePathEl,
                alignOrigin: [0.5, 0.5],
              },
              duration: dur,
              ease: 'none',
              repeat: -1,
            });

            // Seed the phase to match the old CSS animation-delay behavior:
            //   old delay = scatter + lag  (scatter = -(i*3.83), negative = started ahead)
            //   timeAdvanced = -delay = scatterAbs - lag
            //   phase = ((scatterAbs - lag) % dur + dur) % dur
            seedTotalTime(moveTween, scatterAbs, lag, dur);
          });

          // Ignition fade: a repeating timeline on the GROUP opacity through
          // the 5-point curve: 0%→0, 14%→peak, 45%→peak, 62%→0, 100%→0.
          // Period = data-fade (an exact integer divisor of data-dur, preserving
          // the loop-wrap-lands-dark property from the original CSS emission).
          const fadeTl = gsap.timeline({ repeat: -1 });
          const p14 = fadeT * 0.14;
          const p45 = fadeT * 0.45;
          const p62 = fadeT * 0.62;
          fadeTl
            .set(group, { opacity: 0 })
            .to(group, { opacity: fadePeak, duration: p14, ease: 'sine.inOut' })
            .to(group, { opacity: fadePeak, duration: p45 - p14, ease: 'none' })
            .to(group, { opacity: 0, duration: p62 - p45, ease: 'sine.inOut' })
            .to(group, { opacity: 0, duration: fadeT - p62, ease: 'none' });

          // Seed fade timeline to the same scatter offset as the movement.
          // The fade uses the same -scatter CSS delay as the move tween, so
          // phase = scatterAbs % fadeT (+ fadeT for safety).
          const fadePhase = ((scatterAbs % fadeT) + fadeT) % fadeT;
          fadeTl.totalTime(fadePhase + 10 * fadeT);
        });
      }, container);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [glowMarkup, isMobile]);

  return (
    <div
      data-contour-plate
      data-light-src={lightPlate}
      data-dark-src={darkPlate}
      data-glow={shouldAnimate ? glowSrc : undefined}
      className="fixed top-0 left-0 right-0 h-lvh -z-10 overflow-hidden"
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
          ref={glowDivRef}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          // Trusted first-party static asset (generated glow overlay).
          dangerouslySetInnerHTML={glowMarkup ? { __html: glowMarkup } : undefined}
        />
      ) : null}
    </div>
  );
}
