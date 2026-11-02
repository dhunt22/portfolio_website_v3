// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/EntryLink.tsx
// Portfolio routes navigate in place (no full reload); Stan Scribe is its own product and loads as a page of
// its own (DESIGN.md › Decision log).

import Link from 'next/link';
import type { ComponentProps } from 'react';

export function EntryLink({ href, ...rest }: ComponentProps<'a'>) {
  return href?.startsWith('/') && !href.startsWith('/stanscribe') ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}
