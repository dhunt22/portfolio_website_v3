// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/StanScribeFooter.tsx
// One centred line that closes the page on a band: who made the app, linking to his own site. The legal links, the
// copyright and Apple's trademark line stay in each page's Help section, where App Review looks for them.

import { TYPE } from '@/components/stanscribe/type';
import { portfolioHref } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

export function StanScribeFooter() {
  return (
    <footer className={cn(TYPE.body, 'band-foot px-5 pb-12 pt-16 text-center sm:px-10')}>
      Made by{' '}
      <a href={portfolioHref()} className={TYPE.link}>
        Devin Hunt
      </a>
    </footer>
  );
}
