// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/ComparisonTable.tsx
// "Which one is for you?": only the rows where the two apps differ, in copy.md's words, as a real
// table (th scope). What they share is one line above it (BOTH_APPS_SHARE). No box around it: a rule
// under the app names and one between rows, with the two apps' columns the same width. Cells hyphenate
// and drop to 16px below sm so the table fits 320px; the focusable region is the fallback at larger text
// sizes.

import { cn } from '@/lib/utils';

const ROWS: [feature: string, scribe: string, light: string][] = [
  ['Price', 'Pay once', 'Free'],
  ['Speech models', 'Advanced and Basic', 'Basic'],
  ['Looks', '28 themes, painted ones, and your own photos', 'Black or white'],
  ['Speaker colors', 'Yes', 'Yes, or turn them off'],
  ['Motion', "Follows your iPhone's Reduce Motion setting", 'Always calm'],
  ['Download', 'Larger', 'Smaller'],
];

// With no box, the outer columns sit flush with the text above and below the table.
const CELL = 'px-2 py-3 align-top hyphens-auto first:pl-0 last:pr-0 sm:p-3 sm:first:pl-0 sm:last:pr-0 md:px-5 md:py-4 md:first:pl-0 md:last:pr-0';
const HEADER = 'font-semibold text-ink-strong';

export function ComparisonTable({ className }: { className?: string }) {
  return (
    <div
      role="region"
      aria-labelledby="compare-caption"
      tabIndex={0}
      className={cn('overflow-x-auto', className)}
    >
      <table className="w-full border-collapse text-left text-base leading-relaxed sm:text-lg">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[35%]" />
          <col className="w-[35%]" />
        </colgroup>
        <caption id="compare-caption" className="sr-only">
          How Stan Scribe and Stan Scribe Light differ
        </caption>
        <thead>
          <tr className="border-b-2 border-ink-strong">
            <td className={CELL} />
            <th scope="col" className={cn(CELL, HEADER)}>
              Stan Scribe
            </th>
            <th scope="col" className={cn(CELL, HEADER)}>
              Stan Scribe Light
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([feature, scribe, light]) => (
            <tr key={feature} className="border-t border-border">
              <th scope="row" className={cn(CELL, HEADER)}>
                {feature}
              </th>
              <td className={cn(CELL, 'text-ink-body')}>{scribe}</td>
              <td className={cn(CELL, 'text-ink-body')}>{light}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
