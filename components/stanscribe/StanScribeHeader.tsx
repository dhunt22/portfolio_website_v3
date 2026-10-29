'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/StanScribeHeader.tsx
// Stan Scribe's own header, so its pages stand as one product (PRODUCT.md › Brand Commitments): the name,
// the other edition, Help (App Review looks for a contact) and the theme toggle. Not sticky, so it never
// covers the words at 200% zoom.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

const NAV_LINK = 'inline-block py-2 text-ink-strong underline-offset-[6px] decoration-2 hover:underline aria-[current=page]:underline';

export function StanScribeHeader() {
  const pathname = usePathname() ?? '';
  const onLight = pathname.startsWith('/stanscribe-light');
  return (
    <header className="px-4 pb-2 pt-4 sm:px-6 md:pt-6">
      {/* The row is the sheet's width, so the name and the toggle line up with the sheet's edges. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-1">
        <Link href="/stanscribe" aria-current={onLight ? undefined : 'page'} className={cn(TYPE.heading, 'py-1 no-underline')}>
          Stan Scribe
        </Link>
        {/* Below 520px the links take their own row under the name and the toggle. */}
        <nav aria-label="Stan Scribe" className="order-last w-full min-[520px]:order-0 min-[520px]:ml-auto min-[520px]:w-auto">
          <ul className={cn(TYPE.body, 'flex flex-wrap gap-x-7')}>
            <li>
              <Link href="/stanscribe-light" aria-current={onLight ? 'page' : undefined} className={NAV_LINK}>
                Stan Scribe Light
              </Link>
            </li>
            <li>
              <a href="#help" className={NAV_LINK}>Help</a>
            </li>
          </ul>
        </nav>
        {/* -mr-2.5 sets the icon, not its 44px hit area, on the sheet's edge. */}
        <ThemeToggle className="-mr-2.5 h-11 w-11 rounded-md text-ink-strong hover:bg-muted dark:text-ink-strong dark:hover:bg-muted" />
      </div>
    </header>
  );
}
