// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/LegalLinks.tsx
// One app's Privacy Policy, Terms of Use and Acknowledgements. Plain <a>: these are static pages
// generated in the app repo (synced into public/), outside the Next router.

import { TYPE } from '@/components/stanscribe/type';
import { APPS, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

export function LegalLinks({ app }: { app: AppKey }) {
  const info = APPS[app];
  return (
    <nav aria-label={`${info.name} legal`} className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-5">
      <span className="font-semibold text-ink-strong">{info.name}:</span>
      <ul className="flex flex-wrap gap-x-5">
        {info.legal.map(({ label, href }) => (
          <li key={href}>
            <a href={href} className={cn(TYPE.link, 'inline-block py-1.5')}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
