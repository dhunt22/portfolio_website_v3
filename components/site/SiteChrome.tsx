// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteChrome.tsx
// The portfolio's frame: the .site token scope, the readout strip, header, main and footer. Used by the
// (site) route group's layout and by the root 404.

import type { ReactNode } from 'react';
import { publicSans } from '@/app/fonts/site';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className={`${publicSans.variable} site`}>
      {/* Skip link: first focusable element; visually hidden until focused, then a square, light label over the dark strip. */}
      <a
        href="#main"
        className="sr-only bg-site-strip-ink font-site text-site-body text-site-strip focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <ReadoutProvider>
        <ReadoutStrip />
        <SiteHeader />
        <main id="main" className="grow">
          {children}
        </main>
        <SiteFooter />
      </ReadoutProvider>
    </div>
  );
}
