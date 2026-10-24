// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Section.tsx
// A Stan Scribe page section on a solid panel (text keeps its 7:1 contrast over the contour
// backdrop), with a mono eyebrow and a large serif h2 that labels the section for screen readers.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The section heading size, shared with anything that sits at h2 rank on these pages. */
export const SECTION_TITLE =
  'font-display text-[clamp(1.875rem,4vw,2.75rem)] font-medium leading-tight tracking-display text-ink-strong';

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('panel scroll-mt-24 md:p-10', className)}>
      <p className="eyebrow-mono mb-4">{eyebrow}</p>
      <h2 id={`${id}-title`} className={SECTION_TITLE}>
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
