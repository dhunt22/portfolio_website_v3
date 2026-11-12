// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/LegalLinks.tsx

import { TYPE } from '@/components/stanscribe/type';
import { APPS, legalLinks, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

export function LegalLinks({ app }: { app: AppKey }) {
  const info = APPS[app];
  return (
    <nav aria-label={`${info.name} legal`} className="flex flex-col items-center gap-x-5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-center">
      <span className="font-semibold text-ink-strong">{info.name}:</span>
      <ul className="flex flex-wrap justify-center gap-x-5">
        {legalLinks(app).map(({ label, href }) => (
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
