// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/ComparisonTable.tsx
// "Which one is for you?": the two apps side by side as a real table (th scope), "Yes" as text.
// Rows are copy.md's table verbatim. Cells hyphenate so the table fits 320px; the focusable region
// is the keyboard fallback if a very large text size still overflows.

import { cn } from '@/lib/utils';

const ROWS: [feature: string, scribe: string, light: string][] = [
  ['Price', 'Pay once', 'Free'],
  ['Live captions, offline', 'Yes', 'Yes'],
  ['Speaker colors and names', 'Yes', 'Yes, or turn them off'],
  ['Voices it knows', 'Yes', 'Yes'],
  ['25 languages', 'Yes', 'Yes'],
  ['Big text and labeled buttons', 'Yes', 'Yes'],
  ['Keeps listening in the background', 'Yes', 'Yes'],
  ['Saved conversations, search, summaries', 'Yes', 'Yes'],
  ['Export, Obsidian, iCloud backup', 'Yes', 'Yes'],
  ['Speech models', 'Advanced and Basic', 'Basic'],
  ['Looks', '28 themes, painted ones, and your own photos', 'Black or white'],
  ['Motion', "Follows your iPhone's Reduce Motion setting", 'Always calm'],
  ['Download', 'Larger', 'Smaller'],
  ['In-app purchases', 'None', 'None'],
];

const CELL = 'px-2 py-3 align-top hyphens-auto sm:p-3 md:px-5 md:py-4';

export function ComparisonTable({ className }: { className?: string }) {
  return (
    <div
      role="region"
      aria-labelledby="compare-caption"
      tabIndex={0}
      className={cn('overflow-x-auto rounded-lg border border-border bg-card', className)}
    >
      <table className="w-full border-collapse text-left text-base md:text-lg">
        <caption id="compare-caption" className="sr-only">
          Stan Scribe and Stan Scribe Light compared
        </caption>
        <thead className="bg-muted">
          <tr>
            <td className={CELL} />
            <th scope="col" className={cn(CELL, 'font-display text-base font-medium text-ink-strong sm:text-lg md:text-xl')}>
              Stan Scribe
            </th>
            <th scope="col" className={cn(CELL, 'font-display text-base font-medium text-ink-strong sm:text-lg md:text-xl')}>
              Stan Scribe Light
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([feature, scribe, light]) => (
            <tr key={feature} className="border-t border-border">
              <th scope="row" className={cn(CELL, 'font-medium text-ink-strong')}>
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
