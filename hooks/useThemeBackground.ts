'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect, useMemo } from 'react';

interface ThemeBackgroundOptions {
  lightImage: string;
  darkImage: string;
  animatedLightImage?: string;
  mobileBreakpoint?: number;
}

interface ThemeBackgroundResult {
  mounted: boolean;
  isMobile: boolean;
  resolvedTheme: string | undefined;
  backgroundImage: string;
  isDark: boolean;
  animatedLightSrc?: string;
}

// Background image presets for different pages
export const BACKGROUND_PRESETS = {
  americanRiver: {
    lightImage: '/images/american_river_contour_bwn.svg',
    darkImage: '/images/american_river_contour_dark.svg',
    animatedLightImage: '/images/american_river_contour_bwn.svg',
  },
  upperFolsom: {
    lightImage: '/images/upper_folsom_contour_bwn.svg',
    darkImage: '/images/upper_folsom_contour_dark.svg',
  },
} as const;

/**
 * Hook for managing theme-aware backgrounds with mobile detection
 */
export function useThemeBackground(options: ThemeBackgroundOptions): ThemeBackgroundResult {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mobileBreakpoint = options.mobileBreakpoint ?? 768;

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const isDark = mounted && resolvedTheme === 'dark';

  const backgroundImage = useMemo(() => {
    if (!mounted) return `url(${options.lightImage})`;
    return isDark ? `url(${options.darkImage})` : `url(${options.lightImage})`;
  }, [mounted, isDark, options.lightImage, options.darkImage]);

  return {
    mounted,
    isMobile,
    resolvedTheme,
    backgroundImage,
    isDark,
    animatedLightSrc: options.animatedLightImage,
  };
}

// Convenience hooks for common backgrounds
export function useAmericanRiverBackground() {
  return useThemeBackground(BACKGROUND_PRESETS.americanRiver);
}

export function useUpperFolsomBackground() {
  return useThemeBackground(BACKGROUND_PRESETS.upperFolsom);
}
