// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe-light/page.tsx
// Stan Scribe Light's Support and Marketing URL in App Store Connect. App Review opens it looking
// for a contact, so Help sits directly under the hero. Copy is copy.md's Light section.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { PANEL, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { BOTH_APPS_SHARE, LIGHT_NOT_SURE, LIGHT_SUMMARY, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

const TITLE = 'Stan Scribe Light: live captions, the simple edition';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. The simple edition of Stan Scribe, free. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = 'https://devinhunt.com/stanscribe-light/';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: null,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', locale: 'en_US', url: PAGE_URL, siteName: 'Devin Hunt', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

export default function StanScribeLightPage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" quiet />

      <div className="container relative z-10 mx-auto space-y-8 px-4 pb-8 pt-8 sm:px-6 md:space-y-12 md:pt-12">
        <section aria-labelledby="light-page-title" className={cn(PANEL, 'grid items-center gap-10 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16')}>
          <HeroLoadIn>
            <h1 id="light-page-title" className={TYPE.display}>
              Stan Scribe Light
            </h1>
            <p className={cn(TYPE.title, 'mt-3')}>The simple edition. Free.</p>
            <p className={cn(TYPE.lead, 'mt-6')}>{LIGHT_SUMMARY}</p>
            <DownloadBlock app="light" className="mt-8 max-w-sm" />
          </HeroLoadIn>
          <PhoneShot image={SHOTS.lightBlackAndWhite} priority className="mx-auto max-w-[22rem] lg:max-w-[30rem]" />
        </section>

        <HelpBlock apps={['light']} />

        <Section id="compare" title="Which one is for you?">
          <p className={cn(TYPE.lead, 'max-w-[44rem]')}>{BOTH_APPS_SHARE}</p>
          <ComparisonTable className="mt-8" />
          <p className={cn(TYPE.body, 'mt-6 max-w-[44rem]')}>
            <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
            <Link href="/stanscribe" className={cn(TYPE.body, TYPE.link, 'inline-block py-1')}>
              See everything in Stan Scribe <span aria-hidden="true">→</span>
            </Link>
            <Link href="/stanscribe#story" className={cn(TYPE.body, TYPE.link, 'inline-block py-1')}>
              Why I built Stan Scribe <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
