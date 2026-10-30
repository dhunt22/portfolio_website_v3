// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(site)/layout.tsx
// The portfolio pages' layout: the Working Map frame (DESIGN.md).

import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site/SiteChrome';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
