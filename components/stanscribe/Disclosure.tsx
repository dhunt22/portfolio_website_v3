// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Disclosure.tsx
// A row that opens on a click: the label is always visible, and the words under it show when the reader asks.
// A native <details>, so it needs no script, opens from the keyboard, and opens by itself when the browser's
// find-in-page matches its words. Rows sit in a plain wrapper and draw the rule between them.

import type { ReactNode } from 'react';
import { ChevronIcon } from '@/components/stanscribe/icons';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

interface DisclosureProps {
  label: string;
  /** An IconTile, shown before the label. */
  icon?: ReactNode;
  /** Start open. The reader can still close it. */
  open?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, icon, open = false, children }: DisclosureProps) {
  return (
    <details open={open} className="group border-b border-border first:border-t">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-3 [&::-webkit-details-marker]:hidden">
        {icon}
        <h3 className={cn(TYPE.heading, 'flex-1')}>{label}</h3>
        <ChevronIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-ink-strong transition-transform group-open:rotate-180" />
      </summary>
      <div className={cn(TYPE.body, 'pb-6 pr-10', icon ? 'pl-16' : undefined)}>{children}</div>
    </details>
  );
}
