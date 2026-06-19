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
}

/**
 * Single client-side entry point for the per-page fixed contour plate, so the
 * pages themselves stay server components. Resolves the theme-specific plate
 * and hands it to the fixed inlining layer.
 */
export function ContourBackdrop({ page }: ContourBackdropProps) {
  const { lightPlate, darkPlate, lightPlateMobile, darkPlateMobile, glowSrc, mounted, isMobile, isDark } =
    useThemeBackground(PLATE_PRESETS[page]);
  return (
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
  );
}
