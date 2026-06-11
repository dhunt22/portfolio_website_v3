'use client';

import { BACKGROUND_PRESETS, useThemeBackground } from '@/hooks/useThemeBackground';
import { AnimatedContourBackground } from '@/components/ui/AnimatedContourBackground';

interface ContourBackdropProps {
  preset: keyof typeof BACKGROUND_PRESETS;
  dual?: boolean;
}

/** Single client-side entry point for the page background so pages stay server components. */
export function ContourBackdrop({ preset, dual = false }: ContourBackdropProps) {
  const { isMobile, backgroundImage, mounted, animatedSrc } = useThemeBackground(BACKGROUND_PRESETS[preset]);
  return (
    <AnimatedContourBackground
      backgroundImage={backgroundImage}
      isMobile={isMobile}
      mounted={mounted}
      animatedSrc={animatedSrc}
      dualBackground={dual}
    />
  );
}
