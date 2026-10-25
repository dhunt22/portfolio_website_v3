// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteChrome.tsx
// The portfolio's frame: the .site token scope, the readout strip, header, main and footer. Used by the
// (site) route group's layout and by the root 404.

import type { ReactNode } from 'react';
import { ReadoutProvider, ReadoutStrip } from '@/components/site/Readout';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <ReadoutProvider>
        <ReadoutStrip />
        <SiteHeader />
        <main id="main" className="flex-grow">
          {children}
        </main>
        <SiteFooter />
      </ReadoutProvider>
    </div>
  );
}
