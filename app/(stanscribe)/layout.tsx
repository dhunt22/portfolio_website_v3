// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/layout.tsx
// The Stan Scribe pages keep the June 2026 site chrome until they get their own product site.

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function StanScribeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
