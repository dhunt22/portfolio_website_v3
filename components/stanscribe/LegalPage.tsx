// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/LegalPage.tsx
// One legal page, laid out as the portfolio's pages and the app's own are: its title and the line under it on
// the contours, then the rest of its words on the card, then the way to the app's other two. The words come
// from the app repo through scripts/sync-stanscribe-legal.mjs, are set by .legal in globals.css, and are never
// edited here: the page only chooses where each part sits.

import type { Metadata } from 'next';
import { LegalLinks } from '@/components/stanscribe/LegalLinks';
import { BAND, BAND_COLUMN, BANDS, COLUMN } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { APPS, LEGAL_PAGES, SITE_NAME, SOCIAL_IMAGE, pageUrl, type AppKey, type LegalSlug } from '@/lib/stanscribe';
import { legalParts } from '@/lib/stanscribe-legal';
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
    openGraph: { type: 'website', locale: 'en_US', url, siteName: SITE_NAME, title, description, images: [SOCIAL_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SOCIAL_IMAGE] },
  };
}

export async function LegalPage({ app, params }: LegalRouteProps & { app: AppKey }) {
  const { page } = await params;
  const { head, body } = legalParts(app, page as LegalSlug);
  return (
    <div className="relative">
      <ContourBackdrop page="interests" quiet />
      <div className={BANDS}>
        {/* The first section of .bands has no fill, so the title sits on the contours. */}
        {head && (
          <section className={cn(BAND, 'pb-10 pt-8 md:pb-12 md:pt-12')}>
            <div className={BAND_COLUMN}>
              <div className={cn('legal', COLUMN)} dangerouslySetInnerHTML={{ __html: head }} />
            </div>
          </section>
        )}
        {/* Words that open without a title have no hero, so the card is the only section and starts where the
            hero would. */}
        <section className={cn(BAND, 'min-h-svh', !head && 'pt-8 md:pt-12')}>
          <div className={BAND_COLUMN}>
            <div className={cn('legal *:first:mt-0', COLUMN)} dangerouslySetInnerHTML={{ __html: body }} />
            <div className={cn(TYPE.small, COLUMN, 'mt-16')}>
              <LegalLinks app={app} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
