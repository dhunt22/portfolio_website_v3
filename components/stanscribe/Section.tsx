// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Section.tsx
// A Stan Scribe page is one solid sheet over the veiled contours (text keeps its 7:1 contrast), and its
// sections are chapters on that sheet, separated by space rather than boxes. Each opens on a centred
// serif h2 that also labels the section for screen readers.

import type { ReactNode } from 'react';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

/** The one sheet a page sits on, centred, with the contours showing around it. */
export const SHEET = 'panel mx-auto max-w-6xl space-y-20 px-5 py-12 sm:px-10 md:space-y-28 md:px-16 md:py-20';

/** A reading column inside the sheet, for prose: centred as a block, its lines set left. */
export const COLUMN = 'mx-auto max-w-2xl';

/** A hero's intro under the centred title: centred where it fits in three or four lines, set left on
 *  narrower screens, where centring six or more lines would make each one harder to find. */
export const INTRO = 'mx-auto mt-6 max-w-2xl text-left md:text-center';

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-8', className)}>
      <h2 id={`${id}-title`} className={cn(TYPE.title, 'text-center')}>
        {title}
      </h2>
      <div className="mt-8 md:mt-12">{children}</div>
    </section>
  );
}
