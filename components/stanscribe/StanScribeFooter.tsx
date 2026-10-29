// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/StanScribeFooter.tsx
// One centred line under the sheet: who made the app, linking to his own site. The legal links, the
// copyright and Apple's trademark line stay in each page's Help section, where App Review looks for them.

import { TYPE } from '@/components/stanscribe/type';
import { cn } from '@/lib/utils';

export function StanScribeFooter() {
  return (
    <footer className={cn(TYPE.body, 'mx-auto w-full max-w-6xl px-4 pb-12 pt-10 text-center sm:px-6')}>
      Made by{' '}
      <a href="https://devinhunt.com/" className={TYPE.link}>
        Devin Hunt
      </a>
    </footer>
  );
}
