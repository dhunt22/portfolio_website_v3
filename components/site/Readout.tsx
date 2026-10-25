'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/Readout.tsx
// The readout strip (DESIGN.md › Readout strip): a context any entry, pin or map can feed, the sticky
// strip that shows it, and the page's resting reading. aria-live is off: the same facts are on the page.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Reading } from '@/lib/site/reading';

interface ReadoutApi {
  reading: Reading | null;
  show: (reading: Reading) => void;
  clear: () => void;
  setDefault: (reading: Reading) => void;
}

const ReadoutContext = createContext<ReadoutApi | null>(null);
const INERT: ReadoutApi = { reading: null, show: () => {}, clear: () => {}, setDefault: () => {} };

export function ReadoutProvider({ children }: { children: ReactNode }) {
  const [resting, setResting] = useState<Reading | null>(null);
  const [current, setCurrent] = useState<Reading | null>(null);
  const show = useCallback((r: Reading) => setCurrent(r), []);
  const clear = useCallback(() => setCurrent(null), []);
  const setDefault = useCallback((r: Reading) => setResting(r), []);
  const api = useMemo(() => ({ reading: current ?? resting, show, clear, setDefault }), [current, resting, show, clear, setDefault]);
  return <ReadoutContext.Provider value={api}>{children}</ReadoutContext.Provider>;
}

export function useReadout(): ReadoutApi {
  return useContext(ReadoutContext) ?? INERT;
}

/** Sets the page's resting reading. Renders nothing. */
export function ReadoutDefault({ reading }: { reading: Reading }) {
  const { setDefault } = useReadout();
  useEffect(() => setDefault(reading), [reading, setDefault]);
  return null;
}

/** Pointer and focus handlers that show `reading` while an element is pointed at or focused. */
export function useReadingHandlers(reading?: Reading) {
  const { show, clear } = useReadout();
  return useMemo(
    () =>
      reading
        ? { onMouseEnter: () => show(reading), onMouseLeave: clear, onFocus: () => show(reading), onBlur: clear }
        : {},
    [reading, show, clear],
  );
}

export function ReadoutStrip() {
  const { reading } = useReadout();
  return (
    <div
      data-testid="readout"
      aria-live="off"
      className="sticky top-0 z-30 flex min-h-10 gap-4 overflow-hidden whitespace-nowrap bg-site-strip px-gutter py-[9px] font-site text-site-label tabular-nums text-site-strip-ink print:hidden min-[861px]:gap-7"
    >
      {reading?.fields.map((f) => (
        <span key={f.label} className={f.wide ? 'hidden min-[861px]:inline' : undefined}>
          <span className="mr-1.5 font-medium text-site-strip-label">{f.label}</span>
          {f.value}
        </span>
      ))}
      {reading?.note && <span className="ml-auto hidden text-site-strip-label min-[861px]:inline">{reading.note}</span>}
    </div>
  );
}
