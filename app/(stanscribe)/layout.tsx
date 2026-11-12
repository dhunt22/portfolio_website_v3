// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/layout.tsx
// The Stan Scribe pages' frame: their own header and footer, not the portfolio's.

import type { ReactNode } from 'react';
import { newsreader, hanken } from '@/app/fonts/stanscribe';
import { StanScribeFooter } from '@/components/stanscribe/StanScribeFooter';
import { StanScribeHeader } from '@/components/stanscribe/StanScribeHeader';
import { cn } from '@/lib/utils';

export default function StanScribeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(newsreader.variable, hanken.variable, 'flex flex-1 flex-col font-sans')}>
      {/* Skip link — first focusable element; visually hidden until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-ink-strong focus:shadow-lg"
      >
        Skip to content
      </a>
      <StanScribeHeader />
      <main id="main" className="grow">
        {children}
      </main>
      <StanScribeFooter />
    </div>
  );
}
