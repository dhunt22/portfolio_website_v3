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
import { COLUMN, INTRO, SHEET, Section } from '@/components/stanscribe/Section';
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
    <div className="relative min-h-svh px-4 pt-2 sm:px-6 md:pt-4">
      <ContourBackdrop page="interests" quiet />

      <div className={cn(SHEET, 'relative z-10')}>
        <section aria-labelledby="light-page-title" className="text-center">
          <HeroLoadIn>
            <h1 id="light-page-title" className={TYPE.display}>
              Stan Scribe Light
            </h1>
            <p className={cn(TYPE.title, 'mt-3')}>The simple edition. Free.</p>
            <p className={cn(TYPE.lead, INTRO)}>{LIGHT_SUMMARY}</p>
            <DownloadBlock app="light" withName={false} className="mt-8" />
          </HeroLoadIn>
          <PhoneShot image={SHOTS.lightBlackAndWhite} priority className="mx-auto mt-12 max-w-[26rem]" />
        </section>

        <HelpBlock apps={['light']} />

        <Section id="compare" title="Which one is for you?">
          <div className={COLUMN}>
            <p className={TYPE.lead}>{BOTH_APPS_SHARE}</p>
            <ComparisonTable className="mt-8" />
            <p className={cn(TYPE.body, 'mt-6')}>
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
          </div>
        </Section>
      </div>
    </div>
  );
}
