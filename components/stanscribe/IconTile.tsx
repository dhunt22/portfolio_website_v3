// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/IconTile.tsx
// A 48px tile that holds one icon, as the rows of the app's tour do. The tile is decoration: the words
// beside it carry the meaning, so it is hidden from screen readers.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONE = {
  plain: 'border-border bg-muted text-ink-strong',
  /** The app's own Start tile. */
  start: 'border-transparent bg-[#1c7c45] text-white',
  /** The app's own Stop tile. */
  stop: 'border-transparent bg-[#c0352b] text-white',
} as const;

interface IconTileProps {
  children: ReactNode;
  tone?: keyof typeof TONE;
  className?: string;
}

export function IconTile({ children, tone = 'plain', className }: IconTileProps) {
  return (
    <span aria-hidden="true" className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl border [&>svg]:h-6 [&>svg]:w-6', TONE[tone], className)}>
      {children}
    </span>
  );
}
