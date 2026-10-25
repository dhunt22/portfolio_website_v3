'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/Highlights.tsx
// The home page's Selected work (DESIGN.md › Lead project, Project entry): the lead drawn large beside
// its text, then the highlights as glyph entries. Pointing at one puts it in the readout.

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Glyph } from '@/components/site/Glyph';
import { useReadingHandlers } from '@/components/site/Readout';
import { SITE_LINK, SITE_SOON, SITE_TYPE } from '@/components/site/type';
import type { GlyphShape } from '@/lib/site/glyphs';
import type { WorkEntry } from '@/lib/site/work';
import { cn } from '@/lib/utils';

/** Portfolio routes navigate in place (no full reload); Stan Scribe is its own product and loads as its own site. */
function EntryLink({ href, ...rest }: ComponentProps<'a'>) {
  return href?.startsWith('/') && !href.startsWith('/stanscribe') ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}

export function LeadProject({ entry, figure, description }: { entry: WorkEntry; figure: GlyphShape; description: string }) {
  const handlers = useReadingHandlers(entry.reading);
  return (
    <div className="mt-12 grid max-w-[76rem] items-center gap-[clamp(28px,5vw,72px)] min-[861px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <EntryLink href={entry.href} {...handlers} className="lead-figure block" aria-label={`${entry.name}: every prison in the study`}>
        <Glyph shape={figure} className="h-auto w-full" />
      </EntryLink>
      <div>
        {/* Name first, then its meta, as in every entry: a label above a heading would be an eyebrow. */}
        <h3 className={SITE_TYPE.headline}>{entry.name}</h3>
        {entry.meta && <p className={cn(SITE_TYPE.label, 'mt-1.5')}>{entry.meta}</p>}
        <p className={cn(SITE_TYPE.body, 'mt-3.5 max-w-[42ch]')}>{description}</p>
        <EntryLink href={entry.href} className={cn(SITE_LINK, 'mt-[18px] inline-block')}>
          Explore the map <span aria-hidden="true">→</span>
        </EntryLink>
      </div>
    </div>
  );
}

const ITEM = 'glyph-host grid grid-cols-[52px_minmax(0,1fr)] gap-x-[18px] gap-y-1 py-[22px] text-inherit no-underline min-[861px]:grid-cols-[72px_minmax(0,1fr)] min-[861px]:gap-x-7';

function Highlight({ entry }: { entry: WorkEntry }) {
  const handlers = useReadingHandlers(entry.reading);
  const body = (
    <>
      <Glyph shape={entry.glyph} className="row-span-3 h-[52px] w-[52px] min-[861px]:h-[72px] min-[861px]:w-[72px]" />
      <span className={cn(SITE_TYPE.title, 'entry-name')}>
        {entry.name}
        {entry.soon && <span className={SITE_SOON}>Coming soon</span>}
      </span>
      {entry.meta && <span className={SITE_TYPE.label}>{entry.meta}</span>}
      <span className={cn(SITE_TYPE.body, 'max-w-[56ch]')}>{entry.summary}</span>
    </>
  );
  return (
    <li>
      {entry.href ? (
        <EntryLink href={entry.href} {...handlers} className={ITEM}>{body}</EntryLink>
      ) : (
        <div {...handlers} className={ITEM}>{body}</div>
      )}
    </li>
  );
}

export function HighlightList({ entries }: { entries: WorkEntry[] }) {
  return (
    <ul className="m-0 mt-14 grid max-w-[76rem] list-none gap-x-[clamp(28px,5vw,72px)] gap-y-2 p-0 min-[861px]:grid-cols-2">
      {entries.map((e) => <Highlight key={e.id} entry={e} />)}
    </ul>
  );
}
