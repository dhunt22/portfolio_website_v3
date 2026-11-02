'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/StanScribeHeader.tsx
// Stan Scribe's own header, so its pages stand as one product (PRODUCT.md › Brand Commitments): the name,
// the other edition, Help (App Review looks for a contact), the way to Devin's site and the theme toggle.
// Not sticky, so it never covers the words at 200% zoom.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

const NAV_LINK = 'inline-block py-2 text-ink-strong underline-offset-[6px] decoration-2 hover:underline aria-[current=page]:underline';

export function StanScribeHeader() {
  const pathname = (usePathname() ?? '').replace(/\/$/, '');
  // The legal pages sit under their app's route and have no Help section of their own.
  const home = pathname.startsWith('/stanscribe-light') ? '/stanscribe-light' : '/stanscribe';
  return (
    <header className="px-4 pb-2 pt-4 sm:px-6 md:pt-6">
      {/* The row is the sheet's width, so the name and the toggle line up with the sheet's edges. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-1">
        <Link href="/stanscribe" aria-current={pathname === '/stanscribe' ? 'page' : undefined} className={cn(TYPE.heading, 'py-1 no-underline')}>
          Stan Scribe
        </Link>
        {/* Below 640px the links take their own row under the name and the toggle. */}
        <nav aria-label="Stan Scribe" className="order-last w-full sm:order-0 sm:ml-auto sm:w-auto">
          <ul className={cn(TYPE.body, 'flex flex-wrap gap-x-7')}>
            <li>
              <Link href="/stanscribe-light" aria-current={pathname === '/stanscribe-light' ? 'page' : undefined} className={NAV_LINK}>
                Stan Scribe Light
              </Link>
            </li>
            <li>
              <a href={pathname === home ? '#help' : `${home}#help`} className={NAV_LINK}>Help</a>
            </li>
            <li>
              {/* A plain <a>: the portfolio has its own frame and fonts, so it loads as a page of its own. */}
              <a href="/" className={NAV_LINK}>Devin Hunt</a>
            </li>
          </ul>
        </nav>
        {/* -mr-2.5 sets the icon, not its 44px hit area, on the sheet's edge. */}
        <ThemeToggle className="-mr-2.5 h-11 w-11" />
      </div>
    </header>
  );
}
