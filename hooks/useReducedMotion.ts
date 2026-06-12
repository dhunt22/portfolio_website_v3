'use client';

// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// hooks/useReducedMotion.ts
// Reusable hook: reads + watches the OS-level prefers-reduced-motion preference.
// Syncs initial state from matchMedia (avoids FOUC on first render), then
// subscribes to live changes and cleans up on unmount.

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reducedMotion;
}
