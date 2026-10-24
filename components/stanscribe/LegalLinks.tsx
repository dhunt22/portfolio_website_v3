// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/LegalLinks.tsx
// One app's Privacy Policy, Terms of Use and Acknowledgements. Plain <a>: these are static pages
// generated in the app repo (synced into public/), outside the Next router.

import { APPS, type AppKey } from '@/lib/stanscribe';

export function LegalLinks({ app }: { app: AppKey }) {
  const info = APPS[app];
  return (
    <nav aria-label={`${info.name} legal`} className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-5">
      <span className="font-medium text-ink-strong">{info.name}:</span>
      <ul className="flex flex-wrap gap-x-5">
        {info.legal.map(({ label, href }) => (
          <li key={href}>
            <a href={href} className="inline-block py-1.5 text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
