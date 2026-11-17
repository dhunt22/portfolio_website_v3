'use client';

import {
  PLATE_PRESETS,
  useThemeBackground,
  type PlatePage,
} from '@/hooks/useThemeBackground';
import { AnimatedContourBackground } from '@/components/ui/AnimatedContourBackground';

interface ContourBackdropProps {
  /** Which page's landscape plate to render. */
  page: PlatePage;
  /**
   * Lay a page-colored veil over the plate so the contours sit well back from long reading (the
   * Stan Scribe pages). A fixed sibling at the same -z-10, later in the DOM, so it paints on top.
   */
  quiet?: boolean;
}

/**
 * Single client-side entry point for the per-page fixed contour plate, so the
 * pages themselves stay server components. Resolves the theme-specific plate
 * and hands it to the fixed inlining layer.
 */
export function ContourBackdrop({ page, quiet = false }: ContourBackdropProps) {
  const { lightPlate, darkPlate, lightPlateMobile, darkPlateMobile, glowSrc, mounted, isMobile, isDark } =
    useThemeBackground(PLATE_PRESETS[page]);
  return (
    <>
      <AnimatedContourBackground
        lightPlate={lightPlate}
        darkPlate={darkPlate}
        lightPlateMobile={lightPlateMobile}
        darkPlateMobile={darkPlateMobile}
        glowSrc={glowSrc}
        mounted={mounted}
        isMobile={isMobile}
        isDark={isDark}
      />
      {quiet && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 right-0 top-0 -z-10 bg-background opacity-60 print:hidden"
          style={{ height: 'var(--backdrop-h, 100lvh)' }}
        />
      )}
    </>
  );
}
