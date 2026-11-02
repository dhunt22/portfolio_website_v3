// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/ui/ThemeToggle.tsx
// Toggle between light and dark - like the sun and moon over a watershed!

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SunIcon, MoonIcon } from './icons/common-icons';

/**
 * Theme toggle button component
 * Toggles between light and dark themes (defaults to system preference)
 */
export function ThemeToggle({ className }: { className?: string } = {}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('w-9 h-9', className)} />; // Placeholder to prevent layout shift
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
      className={cn('relative inline-flex items-center justify-center rounded-md p-2 text-ink-strong hover:bg-muted transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring', className)}
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
