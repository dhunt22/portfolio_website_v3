// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/ComparisonTable.tsx
// "Which one is for you?": the four differences a buyer weighs, as a real table (th scope). What the apps
// share is one line above it (BOTH_APPS_SHARE). Its columns are drawn plainly for readers who are not
// technical: a frame, a filled header row with each app's icon, and a rule beside each app's column. Cells
// hyphenate and drop to 16px below sm so the table fits 320px; the focusable region is the fallback at
// larger text sizes.

import { AppIcon } from '@/components/stanscribe/AppIcon';
import { cn } from '@/lib/utils';

const ROWS: [feature: string, scribe: string, light: string][] = [
  ['Price', 'Pay once', 'Free'],
  ['Speech models', 'Advanced and Basic', 'Basic'],
  ['Looks', '28 themes, painted ones, and your own photos', 'Black or white'],
  ['Download', 'Larger', 'Smaller'],
];

const CELL = 'p-2.5 align-top hyphens-auto sm:p-3 md:px-5 md:py-4';
const HEADER = 'font-semibold text-ink-strong';
/** The rule that sets an app's column apart from the one before it. */
const COLUMN = 'border-l border-ink-muted';

export function ComparisonTable({ className }: { className?: string }) {
  return (
    <div role="region" aria-labelledby="compare-caption" tabIndex={0} className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse border-2 border-ink-strong text-left text-base leading-relaxed sm:text-lg">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[35%]" />
          <col className="w-[35%]" />
        </colgroup>
        <caption id="compare-caption" className="sr-only">
          How Stan Scribe and Stan Scribe Light differ
        </caption>
        <thead>
          <tr className="border-b-2 border-ink-strong bg-muted">
            <td className={CELL} />
            <th scope="col" className={cn(CELL, HEADER, COLUMN)}>
              <AppIcon app="scribe" className="mb-2 block h-10 w-10" />
              Stan Scribe
            </th>
            <th scope="col" className={cn(CELL, HEADER, COLUMN)}>
              <AppIcon app="light" className="mb-2 block h-10 w-10" />
              Stan Scribe Light
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([feature, scribe, light]) => (
            <tr key={feature} className="border-t border-ink-muted">
              <th scope="row" className={cn(CELL, HEADER)}>
                {feature}
              </th>
              <td className={cn(CELL, COLUMN, 'text-ink-body')}>{scribe}</td>
              <td className={cn(CELL, COLUMN, 'text-ink-body')}>{light}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
