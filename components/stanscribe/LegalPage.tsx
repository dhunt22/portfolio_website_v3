// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/LegalPage.tsx
// One legal page, as a single band: its words, then the way to the app's other two. The words come from
// the app repo through scripts/sync-stanscribe-legal.mjs, are set by .legal in globals.css, and are never edited here.

import type { Metadata } from 'next';
import { LegalLinks } from '@/components/stanscribe/LegalLinks';
import { BAND, BAND_COLUMN, BANDS, COLUMN } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { APPS, LEGAL_PAGES, SOCIAL_IMAGE, pageUrl, type AppKey, type LegalSlug } from '@/lib/stanscribe';
import { legalWords } from '@/lib/stanscribe-legal';
import { cn } from '@/lib/utils';

export interface LegalRouteProps {
  params: Promise<{ page: string }>;
}

export const legalParams = () => LEGAL_PAGES.map(({ slug }) => ({ page: slug }));

export async function legalMetadata(app: AppKey, { params }: LegalRouteProps): Promise<Metadata> {
  const { page } = await params;
  const { name } = APPS[app];
  const legal = LEGAL_PAGES.find(({ slug }) => slug === page);
  if (!legal) throw new Error(`No Stan Scribe legal page is named "${page}".`);
  const title = `${legal.label} · ${name}`;
  const description = `${legal.label} for ${name}.`;
  const url = pageUrl(app, legal.slug);
  return {
    title,
    description,
    keywords: null,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_US', url, siteName: 'Devin Hunt', title, description, images: [SOCIAL_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SOCIAL_IMAGE] },
  };
}

export async function LegalPage({ app, params }: LegalRouteProps & { app: AppKey }) {
  const { page } = await params;
  return (
    <div className="relative">
      <ContourBackdrop page="interests" quiet />
      <div className={BANDS}>
        <section className={cn(BAND, 'band-only min-h-svh')}>
          <div className={BAND_COLUMN}>
            <article className={cn('legal', COLUMN)} dangerouslySetInnerHTML={{ __html: legalWords(app, page as LegalSlug) }} />
            <div className={cn(TYPE.small, COLUMN, 'mt-16')}>
              <LegalLinks app={app} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
