// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/providers/ThemeProvider.tsx
// Managing light and dark themes - like day and night cycles in nature!

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

/**
 * Theme provider component that wraps the application
 * Provides system preference detection and theme switching functionality
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
