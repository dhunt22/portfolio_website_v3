// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Section.tsx
// A Stan Scribe page section on a solid panel (text keeps its 7:1 contrast over the contour
// backdrop), with a serif h2 that labels the section for screen readers.

import type { ReactNode } from 'react';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

/** Every block on these pages, the hero included, sits on this panel. */
export const PANEL = 'panel p-4 sm:p-8 md:p-12';

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(PANEL, 'scroll-mt-24', className)}>
      <h2 id={`${id}-title`} className={TYPE.title}>
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
