// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/ThemeToggle.tsx
// Toggle between light and dark - like the sun and moon over a watershed!

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Icon } from './icons/Icon';

/**
 * Theme toggle button component
 * Allows users to switch between light, dark, and system themes
 */
export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative inline-flex items-center justify-center rounded-md p-2 text-forest-700 dark:text-forest-300 hover:bg-forest-100 dark:hover:bg-forest-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
      title={`Current: ${theme} (${currentTheme})`}
    >
      {currentTheme === 'dark' ? (
        <Icon name="moon" className="h-5 w-5" />
      ) : (
        <Icon name="sun" className="h-5 w-5" />
      )}
      {theme === 'system' && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-forest-500"></span>
        </span>
      )}
    </button>
  );
}
