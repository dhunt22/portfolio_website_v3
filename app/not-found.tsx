// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/not-found.tsx
// A 404 page inside the site chrome

import Link from 'next/link';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { ReadoutDefault } from '@/components/site/Readout';
import { SiteChrome } from '@/components/site/SiteChrome';
import { SITE_BUTTON, SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { plateReading } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

/**
 * 404 Not Found page component
 * @returns {React.JSX.Element} The rendered 404 page
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <ContourBackdrop page="notFound" />
      <ReadoutDefault reading={plateReading('notFound')} />
      <section aria-labelledby="nf-title" className="grid min-h-[60svh] content-start gap-6 px-gutter pb-16 pt-[clamp(40px,10vh,120px)]">
        <p className={cn(SITE_TYPE.display, 'halo')} aria-hidden="true">404</p>
        <h1 id="nf-title" className={cn(SITE_TYPE.headline, 'halo')}>Page not found</h1>
        <p className={cn(SITE_TYPE.lead, 'halo max-w-[40ch]')}>
          Looks like this stream dried up. The page wandered off like water finding a new path.
        </p>
        <nav aria-label="Ways back" className="halo flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/" className={SITE_BUTTON}>Home</Link>
          <Link href="/portfolio" className={cn(SITE_LINK, 'font-site text-site-body')}>Portfolio</Link>
          <Link href="/resume" className={cn(SITE_LINK, 'font-site text-site-body')}>Résumé</Link>
          <Link href="/interests" className={cn(SITE_LINK, 'font-site text-site-body')}>Outdoors</Link>
          <a href="mailto:contact@devinhunt.com" className={cn(SITE_LINK, 'font-site text-site-body')}>contact@devinhunt.com</a>
        </nav>
      </section>
    </SiteChrome>
  );
}
