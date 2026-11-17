// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe/page.tsx
// Stan Scribe and Stan Scribe Light: the product page, and both apps' Support and Marketing URL in
// App Store Connect. It reads as an extension of the App Store listing (spec 2026-11-12): a header on the
// contours, then short lines with icons on one card, with the detail in rows that open. The copy rules (no
// prices, no model names, privacy wording) are in the app repo's docs/marketing/stanscribe-page/README.md.

import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { AppIcon } from '@/components/stanscribe/AppIcon';
import { CaptionDemo } from '@/components/stanscribe/CaptionDemo';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { Disclosure } from '@/components/stanscribe/Disclosure';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { Faq } from '@/components/stanscribe/Faq';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { IconTile } from '@/components/stanscribe/IconTile';
import {
  AskIcon,
  CaptionsIcon,
  ChevronIcon,
  ConversationsIcon,
  DeviceIcon,
  LockIcon,
  LooksIcon,
  NoAccountIcon,
  NoAudioIcon,
  NoTrackingIcon,
  OfflineIcon,
  SearchIcon,
  SendIcon,
  SpeakerDots,
  StartIcon,
  StopIcon,
  TextSizeIcon,
  VoicesIcon,
} from '@/components/stanscribe/icons';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { BAND, BAND_COLUMN, BANDS, COLUMN, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { BOTH_APPS_SHARE, LIGHT_NOT_SURE, SHOTS, SITE_NAME, SOCIAL_IMAGE, pageHref, pageUrl, type ShotImage } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

const TITLE = 'Stan Scribe: live captions for every voice';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = pageUrl('scribe');

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: null,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', locale: 'en_US', url: PAGE_URL, siteName: SITE_NAME, title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

/** How far the hero's picture hangs into the first band of the card. The card carries it as `--hang`, which
 *  the picture's margin and that band's padding both read. */
const HANG: CSSProperties & { '--hang': string } = { '--hang': 'clamp(8rem,22vw,17rem)' };

interface Row {
  icon: ReactNode;
  title: string;
  body: string;
}

/** The first page of the app's tour, with the speakers fact naming names. */
const FACTS: { icon: ReactNode; label: string }[] = [
  { icon: <CaptionsIcon />, label: 'Live captions' },
  { icon: <SpeakerDots />, label: 'A color and a name for each speaker' },
  { icon: <OfflineIcon />, label: 'Works offline' },
  { icon: <NoAccountIcon />, label: 'No account needed' },
];

const STEPS: (Row & { tone?: 'start' | 'stop' })[] = [
  { icon: <StartIcon />, tone: 'start', title: 'Tap Start.', body: 'Captions begin as people speak. They never start on their own.' },
  { icon: <SpeakerDots />, title: 'Follow along.', body: 'Each speaker gets a color and a name.' },
  { icon: <StopIcon />, tone: 'stop', title: 'Tap Stop.', body: 'The conversation is saved as text. No audio is kept.' },
  { icon: <ConversationsIcon />, title: 'View conversations.', body: 'Find any conversation later by date, by person or by any word.' },
];

const STORY = [
  'My grandpa Stan is hard of hearing. At the table, the conversation moves faster than he can catch it.',
  'With live captions he could keep up and answer, instead of pretending he had heard. The app my parents tried charged a monthly fee and needed the internet for its best captions, so I built this one. Stan uses it every day at dinner.',
];

const STORY_MORE = [
  'I used AI to help me build it. I wanted as many people as possible to have it, at the lowest cost I could manage. Stan Scribe Light is free. The full Stan Scribe is a one-time purchase, with no subscription. Both work without the internet.',
  'Stan took it to a doctor’s appointment too, and my mom didn’t have to shout and repeat what the doctor said.',
  'Next I want to add more languages, make the speech models smaller and faster, and build a live translation app the same way. That one is in progress.',
];

const FEATURES: Row[] = [
  { icon: <SpeakerDots />, title: 'Speakers in color', body: 'A color and a name for each speaker.' },
  { icon: <VoicesIcon />, title: 'Voices it knows', body: 'Teach it the people you talk with most, with their permission.' },
  { icon: <TextSizeIcon />, title: 'Big text, clear buttons', body: 'Every button says what it does: Smaller, Larger, Save, Stop.' },
  { icon: <LockIcon />, title: 'Keeps listening', body: 'Lock your iPhone and captions keep going until you tap Stop.' },
  { icon: <SearchIcon />, title: 'Conversations you keep', body: 'Find any one by date, person or word. Export it, or back it up to your own iCloud.' },
  { icon: <LooksIcon />, title: 'Choose how it looks', body: '23 themes I curated, or make your own from your photos.' },
];

/** Five screens in a row, as a store listing shows them. */
const SCREENS: { image: ShotImage; label: string }[] = [
  { image: SHOTS.liveGraphite, label: 'Speakers in color' },
  { image: SHOTS.liveLarge, label: 'Text as big as you need' },
  { image: SHOTS.conversation, label: 'Saved as text' },
  { image: SHOTS.library, label: 'Find any conversation' },
  { image: SHOTS.languages, label: '25 languages' },
];

const PRIVACY: Row[] = [
  { icon: <DeviceIcon />, title: 'Everything stays on your iPhone or iPad', body: 'The speech models are built into the app, so captions work in airplane mode.' },
  { icon: <NoTrackingIcon />, title: 'No account. No ads. No tracking.', body: 'The app never connects to the internet.' },
  { icon: <NoAudioIcon />, title: 'No audio is saved', body: 'The app turns sound into captions as you listen and keeps none of the sound. It saves only the words of conversations you keep, on your device.' },
  { icon: <SendIcon />, title: 'Your words leave only when you send them', body: 'That is when you share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud.' },
  { icon: <AskIcon />, title: 'Ask before you caption people', body: 'The app hears everyone nearby. In some places, everyone in a conversation must agree before it is captured, so tell people the app is on. Set up someone’s voice only with their permission.' },
];

/** An icon tile, a name and one line, at the same two sizes everywhere on the page. */
function IconRow({ icon, title, body, tone }: Row & { tone?: 'start' | 'stop' }) {
  return (
    <li className="grid grid-cols-[3rem_1fr] gap-x-4">
      <IconTile tone={tone}>{icon}</IconTile>
      <div>
        <h3 className={TYPE.heading}>{title}</h3>
        <p className={cn(TYPE.body, 'mt-1')}>{body}</p>
      </div>
    </li>
  );
}

export default function StanScribePage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" quiet />

      <div className={BANDS} style={HANG}>
        {/* Hero: the listing's header, on the contours with no fill. `relative z-10` keeps the picture that
            hangs into the next band above that band's fill. */}
        <section aria-labelledby="stanscribe-title" className={cn(BAND, 'relative z-10 pb-0 pt-8 text-center md:pt-12')}>
          <div className={BAND_COLUMN}>
            <HeroLoadIn>
              <AppIcon app="scribe" className="h-26 w-26" />
              <h1 id="stanscribe-title" className={cn(TYPE.display, 'mt-5')}>
                Stan Scribe
              </h1>
              <p className={cn(TYPE.title, 'mt-3')}>Live captions for every voice.</p>
              {/* One aligned column on a phone, two by two up to 1279px, one row from 1280px, where it fits. */}
              <ul role="list" className="mx-auto mt-8 grid w-fit gap-x-10 gap-y-4 sm:grid-cols-2 xl:flex xl:gap-x-8">
                {FACTS.map(({ icon, label }) => (
                  <li key={label} className={cn(TYPE.body, 'flex items-center gap-3 text-left font-semibold text-ink-strong')}>
                    <IconTile>{icon}</IconTile>
                    {label}
                  </li>
                ))}
              </ul>
              <div className="mx-auto mt-10 grid max-w-160 gap-x-10 gap-y-8 sm:grid-cols-2">
                <DownloadBlock app="scribe" />
                <DownloadBlock app="light" />
              </div>
            </HeroLoadIn>
            <PhoneShot image={SHOTS.hero} priority className="mx-auto mt-12 max-w-xl" style={{ marginBottom: 'calc(-1 * var(--hang))' }} />
          </div>
        </section>

        <Section id="how-it-works" title="How it works" className="pt-[calc(var(--hang)_+_3rem)]">
          <div className="mx-auto grid max-w-208 items-center gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
            <ol role="list" className="space-y-7">
              {STEPS.map((step) => (
                <IconRow key={step.title} {...step} />
              ))}
            </ol>
            <CaptionDemo />
          </div>
        </Section>

        <Section id="story" title="Built for my grandpa Stan">
          <div className={cn(COLUMN, 'space-y-5')}>
            {STORY.map((paragraph) => (
              <p key={paragraph} className={TYPE.lead}>
                {paragraph}
              </p>
            ))}
            <details className="group">
              <summary className={cn(TYPE.body, TYPE.link, 'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden')}>
                Read the whole story
                <ChevronIcon aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-5">
                {STORY_MORE.map((paragraph) => (
                  <p key={paragraph} className={TYPE.body}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
            <p className={cn(TYPE.lead, 'pt-1 text-ink-strong')}>Devin</p>
          </div>
        </Section>

        <Section id="features" title="Features">
          <ul role="list" className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <IconRow key={feature.title} {...feature} />
            ))}
          </ul>
          {/* A grid at every width. A sideways scroller is easy to miss. */}
          <ul role="list" data-screens className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {SCREENS.map(({ image, label }) => (
              <li key={label}>
                <PhoneShot image={image} />
                <p className={cn(TYPE.body, 'mt-3 text-center font-semibold text-ink-strong')}>{label}</p>
              </li>
            ))}
          </ul>
          <p className={cn(TYPE.heading, 'mt-16 text-center')}>Something you use every day should not look clinical.</p>
        </Section>

        <Section id="privacy" title="Privacy">
          <div className={COLUMN}>
            <div>
              {PRIVACY.map(({ icon, title, body }) => (
                <Disclosure key={title} label={title} icon={<IconTile>{icon}</IconTile>}>
                  <p>{body}</p>
                </Disclosure>
              ))}
            </div>
            <p className={cn(TYPE.body, 'mt-8')}>
              Read the <a href={pageHref('scribe', 'privacy')} className={TYPE.link}>Privacy Policy</a>.
            </p>
          </div>
        </Section>

        <Section id="light" title="Which one is for you?">
          <div className={COLUMN}>
            <p className={TYPE.lead}>{BOTH_APPS_SHARE}</p>
            <ComparisonTable className="mt-8" />
            <p className={cn(TYPE.body, 'mt-6')}>
              <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
            </p>
          </div>
        </Section>

        <Faq app="scribe" />

        <HelpBlock apps={['scribe', 'light']} />
      </div>
    </div>
  );
}
