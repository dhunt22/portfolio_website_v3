// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/layout.tsx
// The portfolio pages' layout.

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
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
