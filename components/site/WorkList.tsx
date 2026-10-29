'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/WorkList.tsx
// Project and tool entries (DESIGN.md › Project entry): glyph, name, meta, one line; open for the full
// story and links. Pointing at an entry puts its place in the readout.

import Link from 'next/link';
import { useEffect } from 'react';
import { Glyph } from '@/components/site/Glyph';
import { useReadingHandlers } from '@/components/site/Readout';
import { SITE_LINK, SITE_SOON, SITE_TYPE } from '@/components/site/type';
import type { WorkEntry } from '@/lib/site/work';
import { cn } from '@/lib/utils';

function Entry({ entry, hidden }: { entry: WorkEntry; hidden?: boolean }) {
  const handlers = useReadingHandlers(entry.reading);
  const hasLinks = Boolean(entry.href) || entry.links.length > 0;
  return (
    <li id={entry.id} hidden={hidden} className="scroll-mt-24">
      <details>
        <summary
          {...handlers}
          className="glyph-host grid cursor-pointer list-none grid-cols-[52px_minmax(0,1fr)] gap-x-[18px] gap-y-1 py-[22px] min-[861px]:grid-cols-[72px_minmax(0,1fr)_auto] min-[861px]:gap-x-7 [&::-webkit-details-marker]:hidden"
        >
          <Glyph shape={entry.glyph} className="row-span-3 h-[52px] w-[52px] min-[861px]:row-span-2 min-[861px]:h-[72px] min-[861px]:w-[72px]" />
          <span className={cn(SITE_TYPE.title, 'entry-name')}>
            {entry.name}
            {entry.soon && <span className={SITE_SOON}>Coming soon</span>}
          </span>
          {entry.meta && (
            <span className={cn(SITE_TYPE.label, 'min-[861px]:col-start-3 min-[861px]:row-start-1 min-[861px]:whitespace-nowrap min-[861px]:pt-1.5 min-[861px]:text-right')}>
              {entry.meta}
            </span>
          )}
          <span className={cn(SITE_TYPE.body, 'max-w-[56ch] min-[861px]:col-start-2')}>{entry.summary}</span>
        </summary>
        <div className="grid max-w-[70ch] gap-4 pb-8 pl-[70px] min-[861px]:pl-[100px]">
          {entry.content.map((paragraph, i) => (
            <p key={i} className={SITE_TYPE.body}>{paragraph}</p>
          ))}
          {entry.image && (
            <figure className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
              <img src={entry.image.src} alt={entry.image.alt} loading="lazy" className="block h-auto w-full max-w-xl" />
              {entry.image.caption && <figcaption className={cn(SITE_TYPE.label, 'mt-2')}>{entry.image.caption}</figcaption>}
            </figure>
          )}
          {hasLinks && (
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
              {entry.href && (
                <li>
                  {entry.href.startsWith('/') ? (
                    <Link href={entry.href} className={cn(SITE_LINK, 'font-site text-site-body')}>Open the project page <span aria-hidden="true">→</span></Link>
                  ) : (
                    <a href={entry.href} target="_blank" rel="noopener noreferrer" className={cn(SITE_LINK, 'font-site text-site-body')}>Open the project page <span aria-hidden="true">→</span></a>
                  )}
                </li>
              )}
              {entry.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={cn(SITE_LINK, 'font-site text-site-body')}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export function WorkList({ entries, id, isHidden }: { entries: WorkEntry[]; id: string; isHidden?: (e: WorkEntry) => boolean }) {
  // A link like /portfolio#yuba-recharge opens that entry.
  useEffect(() => {
    let target: string;
    try {
      target = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (!entries.some((e) => e.id === target)) return;
    const details = document.getElementById(target)?.querySelector('details');
    if (details) details.open = true;
  }, [entries]);
  return (
    <ul id={id} className="m-0 mt-10 grid list-none gap-2 p-0">
      {entries.map((e) => <Entry key={e.id} entry={e} hidden={isHidden?.(e)} />)}
    </ul>
  );
}
