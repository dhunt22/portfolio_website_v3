// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/layout.tsx
// The Stan Scribe pages keep the June 2026 site chrome until they get their own product site.

import type { ReactNode } from 'react';
import { newsreader, hanken } from '@/app/fonts/stanscribe';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function StanScribeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(newsreader.variable, hanken.variable, 'flex flex-1 flex-col font-sans')}>
      {/* Skip link — first focusable element; visually hidden until focused. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-ink-strong focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
