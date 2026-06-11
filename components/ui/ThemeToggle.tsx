// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/ThemeToggle.tsx
// Toggle between light and dark - like the sun and moon over a watershed!

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from './icons/common-icons';

/**
 * Theme toggle button component
 * Toggles between light and dark themes (defaults to system preference)
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  const toggleTheme = () => {
    // If currently on system, switch to the opposite of what's showing
    // Otherwise, toggle between light and dark
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  // Use resolvedTheme to determine which icon to show
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center rounded-md p-2 text-forest-700 dark:text-forest-300 hover:bg-forest-100 dark:hover:bg-forest-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}
