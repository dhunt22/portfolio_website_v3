// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/stanscribe-light/page.tsx
// Stan Scribe Light's Support and Marketing URL in App Store Connect. App Review opens it looking
// for a contact, so Help sits directly under the hero. Copy is copy.md's Light section.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { Section } from '@/components/stanscribe/Section';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { LIGHT_NOT_SURE, LIGHT_SUMMARY, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';

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
      <ContourBackdrop page="interests" />

      <div className="container relative z-10 mx-auto space-y-8 px-4 pb-8 text-lg sm:px-6 md:space-y-12">
        <section aria-labelledby="light-page-title" className="grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16">
          <HeroLoadIn>
            <p className="eyebrow-mono mb-6 text-sm normal-case">For iPhone and iPad</p>
            <h1 id="light-page-title" className="display mb-4 text-[clamp(2.75rem,6.5vw,4.75rem)]">
              Stan Scribe Light
            </h1>
            <p className="mb-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] italic leading-snug text-ink-strong">
              The simple edition. Free.
            </p>
            <p className="mb-10 max-w-[34rem] text-xl leading-relaxed text-ink-body">{LIGHT_SUMMARY}</p>
            <DownloadBlock app="light" className="max-w-sm" />
          </HeroLoadIn>
          <PhoneShot image={SHOTS.lightBlackAndWhite} priority className="mx-auto max-w-[22rem] lg:max-w-[30rem]" />
        </section>

        <HelpBlock apps={['light']} />

        <Section id="compare" eyebrow="Two apps" title="Which one is for you?">
          <ComparisonTable />
          <p className="mt-6 max-w-[44rem] text-lg leading-relaxed text-ink-body md:text-xl">
            <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
          </p>
          <Link href="/stanscribe" className="mt-8 inline-block py-1 text-lg text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover">
            See everything in Stan Scribe <span aria-hidden="true">→</span>
          </Link>
        </Section>
      </div>
    </div>
  );
}
