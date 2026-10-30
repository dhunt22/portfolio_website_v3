// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/(stanscribe)/stanscribe/page.tsx
// Stan Scribe and Stan Scribe Light: the product page, and both apps' Support and Marketing URL in
// App Store Connect. Words come from transcript_stan/docs/marketing/stanscribe-page/copy.md, plus the
// owner's story, trimmed (2026-10-24) so each thing is said once; the rules they all follow (no
// prices, no model names, privacy wording) are in README.md beside copy.md.

import type { Metadata } from 'next';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { COLUMN, INTRO, SHEET, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { APPS, BOTH_APPS_SHARE, LANGUAGES, LIGHT_NOT_SURE, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

const TITLE = 'Stan Scribe: live captions for every voice';
const DESCRIPTION =
  'Live captions for the conversation in front of you, with a color for each speaker. Works offline on iPhone and iPad. No account, no ads, no tracking.';
const PAGE_URL = 'https://devinhunt.com/stanscribe/';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: null,
  alternates: { canonical: PAGE_URL },
  openGraph: { type: 'website', locale: 'en_US', url: PAGE_URL, siteName: 'Devin Hunt', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

interface Feature {
  title: string;
  body: string;
}

// The owner's story and how it was built, told once, in the brief's words: "captions", never
// "transcription"; other apps' pricing as a "monthly fee", since "subscription" appears only as
// "no subscription".
const STORY = [
  'My grandpa Stan is hard of hearing. At the table, the conversation moves faster than he can catch it.',
  'When my parents tried a live captions app with my grandparents, it changed the conversations they could have together. But the apps we found all charged a monthly fee, and something you need every day shouldn’t cost you every month.',
  'So I used AI to help me build my own, and made it as easy to get as I could. Stan Scribe Light is free, and the full Stan Scribe is a one-time purchase with no subscription.',
  'Now it’s here for anyone who needs the same thing. It’s only the start: I want to keep building tools like this, and keep using AI for good.',
];

const STEPS: Feature[] = [
  { title: 'Tap Start.', body: 'Captions begin as soon as people speak. They never start on their own.' },
  { title: 'Follow along.', body: 'Each speaker gets their own color and name, in words as big as you need.' },
  { title: 'Tap Stop.', body: 'The conversation is saved as text, ready to read, search or share. No audio is kept.' },
];

const FEATURES: Feature[] = [
  { title: 'Speakers in color.', body: 'A color and a name for each speaker, so you can tell who said what.' },
  { title: 'Voices it knows.', body: 'Teach it the people you talk with most, with their permission, and it labels them by name.' },
  { title: 'Big text, clear buttons.', body: 'Make the words as large as you like. Every button is large and says what it does: Smaller, Larger, Save, Stop.' },
  { title: 'Keeps listening.', body: 'Switch apps or lock your iPhone, and captions keep going until you tap Stop. Start Captions from the Lock Screen or Control Center.' },
  { title: 'Conversations you keep.', body: 'Find any conversation by date, by person or by any word. Export it, send it to a notes folder such as Obsidian, or back it up to your own iCloud.' },
  { title: 'Make it yours.', body: '28 color themes, painted ones, and themes from your own photos, because something you use every day should be a pleasure to look at.' },
];

const PRIVACY: Feature[] = [
  { title: 'Everything happens on your iPhone or iPad.', body: 'The speech models are built into the app, so captions work in airplane mode.' },
  { title: 'No account. No ads. No tracking.', body: 'The app never connects to the internet.' },
  { title: 'No audio is saved.', body: 'Sound is turned into captions as you listen, then gone. Only the words of conversations you keep are saved, on your device.' },
  { title: 'Your words leave only when you send them:', body: 'when you share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud.' },
];

const QUESTIONS: Feature[] = [
  { title: 'How accurate are the captions?', body: 'They’re automatic, so they can be wrong, especially with background noise, accents, people talking over each other, and names. Please don’t rely on them for emergencies, or for medical, legal or safety decisions. Stan Scribe is not a medical device and doesn’t replace a professional interpreter or captioner.' },
  { title: 'What do I need?', body: 'An iPhone or iPad with iOS 18 or later. No internet and no account.' },
  { title: 'Where are my conversations kept?', body: 'On your device, until you delete them: delete a conversation or a voice in the app, or delete the app to remove everything it kept. If you turn on iCloud backup, a copy of the text goes to your own iCloud. I can’t see it.' },
  { title: 'Which languages does it caption?', body: `${LANGUAGES.slice(0, -1).join(', ')} and ${LANGUAGES[LANGUAGES.length - 1]}. Choose one in Settings, or leave it on Auto.` },
];

const JUMP_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#light', label: 'Which app?' },
  { href: '#help', label: 'Help' },
];

/** A heading and a paragraph per item, at the same two sizes everywhere on the page. */
function FeatureList({ items, className }: { items: Feature[]; className?: string }) {
  return (
    <ul role="list" className={cn('grid gap-x-12 gap-y-8', className)}>
      {items.map(({ title, body }) => (
        <li key={title}>
          <h3 className={TYPE.heading}>{title}</h3>
          <p className={cn(TYPE.body, 'mt-2')}>{body}</p>
        </li>
      ))}
    </ul>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-6 w-6 text-primary">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function StanScribePage() {
  return (
    <div className="relative min-h-svh px-4 pt-2 sm:px-6 md:pt-4">
      <ContourBackdrop page="interests" quiet />

      <div className={cn(SHEET, 'relative z-10')}>
        {/* Hero: one centred column, so the reading order is name, what it does, how to get it, then the picture */}
        <section aria-labelledby="stanscribe-title" className="text-center">
          <HeroLoadIn>
            <h1 id="stanscribe-title" className={TYPE.display}>
              Stan Scribe
            </h1>
            <p className={cn(TYPE.title, 'mt-3')}>Live captions for every voice.</p>
            <p className={cn(TYPE.lead, INTRO)}>
              Put your iPhone on the table and tap Start. The words appear as people talk: big, clear, and in a different
              color for each person. It all happens on your iPhone or iPad, with no internet and no account.
            </p>
            <div className="mx-auto mt-10 grid max-w-160 gap-x-10 gap-y-8 sm:grid-cols-2">
              <DownloadBlock app="scribe" />
              <DownloadBlock app="light" />
            </div>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1">
              {JUMP_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className={cn(TYPE.body, TYPE.link, 'inline-block py-1')}>
                  {label}
                </a>
              ))}
            </nav>
          </HeroLoadIn>
          <PhoneShot image={SHOTS.hero} priority className="mx-auto mt-12 max-w-xl" />
        </section>

        <Section id="story" title="Built for my grandpa Stan">
          <div className={cn(COLUMN, 'space-y-5')}>
            {STORY.map((paragraph) => (
              <p key={paragraph} className={TYPE.lead}>
                {paragraph}
              </p>
            ))}
            <p className={cn(TYPE.lead, 'pt-1 text-ink-strong')}>— Devin</p>
          </div>
        </Section>

        <Section id="how-it-works" title="How it works">
          <div className="mx-auto grid max-w-208 items-center gap-12 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-16">
            <ol role="list" className="space-y-8">
              {STEPS.map(({ title, body }, i) => (
                <li key={title} className="grid grid-cols-[2rem_1fr] gap-x-2">
                  <span aria-hidden="true" className={TYPE.heading}>
                    {i + 1}.
                  </span>
                  <div>
                    <h3 className={TYPE.heading}>{title}</h3>
                    <p className={cn(TYPE.body, 'mt-2')}>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <PhoneShot image={SHOTS.liveGraphite} className="mx-auto max-w-52" />
          </div>
        </Section>

        <Section id="features" title="Made to be read across the table">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-16">
            <FeatureList items={FEATURES} className="sm:grid-cols-2" />
            <PhoneShot image={SHOTS.liveLarge} className="mx-auto max-w-52" />
          </div>
          <PhoneShot image={SHOTS.paintedThemes} className="mx-auto mt-16 max-w-3xl" />
        </Section>

        <Section id="privacy" title="Private by design">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
            <div>
              <ul role="list" className="space-y-6">
                {PRIVACY.map(({ title, body }) => (
                  <li key={title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                    <CheckIcon />
                    <p className={TYPE.body}>
                      <strong className="font-semibold text-ink-strong">{title}</strong> {body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className={cn(TYPE.body, 'mt-8')}>
                Read the <a href={APPS.scribe.legal.find((l) => l.label === 'Privacy Policy')!.href} className={TYPE.link}>Privacy Policy</a>.
              </p>
            </div>
            {/* The consent note keeps its own column on wide screens; its heading carries it, no box needed. */}
            <div className="self-start">
              <h3 className={TYPE.heading}>Ask before you caption people.</h3>
              <p className={cn(TYPE.body, 'mt-2')}>
                The app hears everyone nearby. In some places, everyone in a conversation must agree before it is
                captured, so tell people the app is on. Set up someone’s voice only with their permission.
              </p>
            </div>
          </div>
        </Section>

        <Section id="light" title="Which one is for you?">
          <div className={COLUMN}>
            <p className={TYPE.lead}>Stan Scribe Light is the simple edition, and it’s free. {BOTH_APPS_SHARE}</p>
            <ComparisonTable className="mt-8" />
            <p className={cn(TYPE.body, 'mt-6')}>
              <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
            </p>
          </div>
        </Section>

        {/* Every answer open, so "they can be wrong" is never hidden */}
        <Section id="questions" title="Questions">
          <FeatureList items={QUESTIONS} className="md:grid-cols-2" />
        </Section>

        <HelpBlock apps={['scribe', 'light']} />
      </div>
    </div>
  );
}
