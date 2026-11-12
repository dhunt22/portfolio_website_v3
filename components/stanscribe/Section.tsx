// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Section.tsx
// A Stan Scribe page is a run of bands, each the full width of the window, in two solid tones that take
// turns (text keeps its 7:1 contrast on both). The contours show behind the header and the hero only.
// Each section opens on a centred serif h2 that also labels it for screen readers.

import type { ReactNode } from 'react';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

/** A page's bands. Every <section> directly inside is one: `.bands` in globals.css sets the tones and the blends. */
export const BANDS = 'bands relative z-10';

/** A band's own padding. Its words sit in BAND_COLUMN, centred. */
export const BAND = 'px-5 py-[clamp(4rem,8vw,7rem)] sm:px-10';
export const BAND_COLUMN = 'mx-auto max-w-5xl';

/** A reading column inside a band, for prose: centred as a block, its lines set left. */
export const COLUMN = 'mx-auto max-w-2xl';

/** A hero's intro under the centred title: centred where it fits in three or four lines, set left on
 *  narrower screens, where centring six or more lines would make each one harder to find. */
export const INTRO = 'mx-auto mt-6 max-w-2xl text-left md:text-center';

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(BAND, 'scroll-mt-8')}>
      <div className={BAND_COLUMN}>
        <h2 id={`${id}-title`} className={cn(TYPE.title, 'text-center')}>
          {title}
        </h2>
        <div className="mt-8 md:mt-12">{children}</div>
      </div>
    </section>
  );
}
