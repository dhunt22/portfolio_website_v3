'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/ProjectsIndex.tsx
// The portfolio's project filters and list. Categories are the ones in lib/portfolio-data.ts.

import { useState } from 'react';
import { WorkList } from '@/components/site/WorkList';
import { SITE_TYPE } from '@/components/site/type';
import type { WorkEntry } from '@/lib/site/work';
import { cn } from '@/lib/utils';

const FILTERS = [
  ['all', 'All'],
  ['water', 'Water resources'],
  ['geospatial', 'Geospatial'],
  ['research', 'Research'],
] as const;

type Filter = (typeof FILTERS)[number][0];

export function ProjectsIndex({ entries }: { entries: WorkEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const count = (k: Filter) => (k === 'all' ? entries.length : entries.filter((e) => e.categories.includes(k)).length);
  return (
    <>
      <div role="group" aria-label="Filter projects" className="mt-6 flex flex-wrap gap-x-7 gap-y-2">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={cn(
              SITE_TYPE.label,
              'py-1.5 aria-pressed:font-semibold aria-pressed:text-ink-strong aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-[0.35em]',
            )}
          >
            {label} {count(k)}
          </button>
        ))}
      </div>
      <WorkList id="projects-list" entries={entries} isHidden={(e) => filter !== 'all' && !e.categories.includes(filter)} />
    </>
  );
}
