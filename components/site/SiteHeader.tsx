'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/SiteHeader.tsx
// The portfolio's header (DESIGN.md › Navigation): wordmark, three plain links, the theme toggle and one
// action. No dropdowns.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SITE_BUTTON } from '@/components/site/type';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/resume', label: 'Résumé' },
  { href: '/interests', label: 'Outdoors' },
] as const;

export function SiteHeader() {
  const pathname = usePathname() ?? '';
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-gutter py-[18px] print:hidden">
      <Link href="/" className="font-site text-lg whitespace-nowrap font-bold tracking-[-0.01em] text-ink-strong no-underline">
        Devin Hunt
      </Link>
      <nav aria-label="Main" className="order-last w-full min-[640px]:order-none min-[640px]:w-auto">
        <ul className="m-0 flex list-none gap-[18px] p-0 min-[861px]:gap-7">
          {LINKS.map(({ href, label }) => {
            const current = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? 'page' : undefined}
                  className="font-site text-site-body text-ink-strong no-underline decoration-2 underline-offset-[0.35em] hover:underline aria-[current=page]:underline"
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle className="rounded-none text-ink-strong hover:bg-site-band focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring dark:text-ink-strong dark:hover:bg-site-band" />
        <a href="mailto:contact@devinhunt.com" className={cn(SITE_BUTTON, 'hidden min-[521px]:inline-flex')}>
          Email me
        </a>
      </div>
    </header>
  );
}
