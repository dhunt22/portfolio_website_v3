// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// app/stanscribe/page.tsx
// Stan Scribe and Stan Scribe Light: the product page, and both apps' Support and Marketing URL in
// App Store Connect. Words come from transcript_stan/docs/marketing/stanscribe-page/copy.md; the
// rules they follow (no prices, no model names, privacy wording) are in README.md beside it.

import type { Metadata } from 'next';
import { ComparisonTable } from '@/components/stanscribe/ComparisonTable';
import { DownloadBlock } from '@/components/stanscribe/DownloadBlock';
import { HelpBlock } from '@/components/stanscribe/HelpBlock';
import { PhoneShot } from '@/components/stanscribe/PhoneShot';
import { Section } from '@/components/stanscribe/Section';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { HeroLoadIn } from '@/components/ui/HeroLoadIn';
import { APPS, LANGUAGES, LIGHT_NOT_SURE, LIGHT_SUMMARY, SHOTS, SOCIAL_IMAGE } from '@/lib/stanscribe';
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

const STEPS: Feature[] = [
  { title: 'Tap Start.', body: 'Captions begin as soon as people speak. They never start on their own.' },
  { title: 'Follow along.', body: 'Each speaker gets their own color and name. Make the words as big as you need.' },
  { title: 'Tap Stop.', body: 'The conversation is saved as text, ready to read, search or share. No audio is kept.' },
];

const READING: Feature[] = [
  { title: 'Speakers in color.', body: 'A color and a name for each speaker, so you can tell who said what.' },
  { title: 'Voices it knows.', body: 'Teach it the people you talk with most, with their permission, and it labels them by name.' },
  { title: 'Big text you control.', body: 'Make the words as large as you like with the A+ and A− buttons, and choose a text style: Standard, Rounded or Extra clear.' },
  { title: 'Buttons with words.', body: 'Every control is large and says what it does: Smaller, Larger, Save, Stop. No guessing at icons.' },
];

const LISTENING: Feature[] = [
  { title: 'Keeps listening.', body: 'Switch to another app or lock your iPhone, and captions keep going until you tap Stop. A Captioning card on the Lock Screen shows that captions are on, and it never shows the words.' },
  { title: 'Start Captions from the Lock Screen.', body: 'Add Start Captions to your Lock Screen or Control Center, and captions are one tap away.' },
  { title: 'Save a moment.', body: 'One tap on Save highlights the last 30 seconds, so you can find it later.' },
];

const KEEPING: Feature[] = [
  { title: 'Your conversations, kept tidy.', body: 'A calendar, a filter by person, search for any word, and smart titles. On iPhones with Apple Intelligence, a short summary too, written on your iPhone.' },
  { title: 'Take it with you.', body: 'Export a conversation as text or Markdown, send it to a notes folder such as Obsidian, or back it up to your own iCloud.' },
];

const MAKE_IT_YOURS: Feature[] = [
  { title: 'Make it yours.', body: '28 color themes, including a gallery of painted ones, plus as many themes as you like from your own photos.' },
];

const PRIVACY: Feature[] = [
  { title: 'Everything happens on your iPhone or iPad.', body: 'The speech models are built into the app, so captions work in airplane mode.' },
  { title: 'No account. No ads. No tracking.', body: 'The app never connects to the internet.' },
  { title: 'No audio is saved.', body: 'Sound is turned into captions as you listen, then gone. Only the words of conversations you keep are saved, on your device.' },
  { title: 'Your words leave only when you send them:', body: 'when you share or export a conversation, sync it to a notes folder, or turn on iCloud backup to your own iCloud.' },
  { title: 'Voice profiles stay on your device.', body: 'They are never backed up or sent anywhere, and you can delete any of them at any time.' },
];

const QUESTIONS: Feature[] = [
  { title: 'Does it need the internet?', body: 'No. The speech models are built into the app, and captions work in airplane mode. The first caption after installing takes a little longer while your iPhone prepares the speech model.' },
  { title: 'Does it record audio?', body: 'No. The app turns sound into captions a few seconds at a time, in memory, and never saves it. Only the words of conversations you keep are saved, on your device.' },
  { title: 'How accurate are the captions?', body: 'They’re automatic, so they can be wrong, especially with background noise, accents, people talking over each other, and names. Please don’t rely on them for emergencies, or for medical, legal or safety decisions. Stan Scribe is not a medical device and doesn’t replace a professional interpreter or captioner.' },
  { title: 'Do I need to ask people first?', body: 'Yes. Tell people the app is on. In some places, everyone in a conversation must agree before it is captured. Set up someone’s voice only with their permission.' },
  { title: 'What do I need?', body: 'An iPhone or iPad with iOS 18 or later.' },
  { title: 'Is there a subscription?', body: 'No. Stan Scribe is a one-time purchase, and Stan Scribe Light is free. Neither has in-app purchases, ads or subscriptions, and every theme comes with Stan Scribe.' },
  { title: 'Where are my conversations kept?', body: 'On your device, until you delete them. If you turn on iCloud backup, a copy of the text goes to your own iCloud, so your other devices can import it. I can’t see it.' },
  { title: 'Can I delete everything?', body: 'Yes. Delete a conversation or a voice in the app, or delete the app to remove everything it kept on your device.' },
];

const JUMP_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#light', label: 'Stan Scribe Light' },
  { href: '#questions', label: 'Questions' },
  { href: '#help', label: 'Help' },
];

const LINK = 'text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover';

/** Feature cards: a hairline above each, serif title, body at reading size. */
function FeatureList({ items, className }: { items: Feature[]; className?: string }) {
  return (
    <ul className={cn('grid gap-x-10 gap-y-8', className)}>
      {items.map(({ title, body }) => (
        <li key={title} className="border-t border-border pt-5">
          <h3 className="font-display text-2xl leading-snug text-ink-strong">{title}</h3>
          <p className="mt-2 text-lg leading-relaxed text-ink-body">{body}</p>
        </li>
      ))}
    </ul>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className="mt-1 h-6 w-6 text-primary">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function StanScribePage() {
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" />

      <div className="container relative z-10 mx-auto space-y-8 px-4 pb-8 text-lg sm:px-6 md:space-y-12">
        {/* 1. Hero */}
        <section aria-labelledby="stanscribe-title" className="grid items-center gap-12 py-12 md:py-16 lg:min-h-[78svh] lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-16">
          <HeroLoadIn>
            <p className="eyebrow-mono mb-6 text-sm normal-case">For iPhone and iPad</p>
            <h1 id="stanscribe-title" className="display mb-4 text-[clamp(3rem,7vw,5.25rem)]">
              Stan Scribe
            </h1>
            <p className="mb-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] italic leading-snug text-ink-strong">
              Live captions for every voice.
            </p>
            <p className="mb-10 max-w-[34rem] text-xl leading-relaxed text-ink-body">
              Put your iPhone on the table and tap Start. The words appear as people talk: big, clear, and in a different
              color for each person. It all happens on your iPhone, with no internet and no account.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <DownloadBlock app="scribe" />
              <DownloadBlock app="light" />
            </div>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base">
              {JUMP_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className={cn(LINK, 'inline-block py-1')}>
                  {label}
                </a>
              ))}
            </nav>
          </HeroLoadIn>
          <PhoneShot image={SHOTS.hero} priority className="mx-auto max-w-[34rem] lg:max-w-none" />
        </section>

        {/* 2. The story */}
        <Section id="story" eyebrow="Why it exists" title="Built as a scribe for my grandpa Stan" className="mx-auto max-w-4xl">
          <div className="max-w-[44rem] space-y-5 font-display text-[clamp(1.375rem,2.6vw,1.75rem)] leading-relaxed text-ink-strong">
            <p>
              My grandpa is hard of hearing. At the table, the conversation moves faster than he can catch it. So I made
              him an app: put the iPhone down, tap Start, and the words appear as people talk, in big text, with a
              different color for each person.
            </p>
            <p>Now it’s here for anyone who needs the same thing.</p>
          </div>
          <p className="mt-6 font-mono text-sm uppercase tracking-caps text-eyebrow">— Devin</p>
        </Section>

        {/* 3. How it works */}
        <Section id="how-it-works" eyebrow="Three steps" title="How it works">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_minmax(0,17rem)] lg:gap-20">
            <ol className="space-y-8">
              {STEPS.map(({ title, body }, i) => (
                <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span aria-hidden="true" className="pt-2 font-mono text-base text-eyebrow">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-ink-strong md:text-3xl">{title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-ink-body md:text-xl">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <PhoneShot image={SHOTS.liveGraphite} className="mx-auto max-w-[17rem]" />
          </div>
        </Section>

        {/* 4. What you get */}
        <Section id="features" eyebrow="What you get" title="Made to be read across the table">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,17rem)] lg:gap-16">
            <FeatureList items={READING} className="sm:grid-cols-2" />
            <PhoneShot image={SHOTS.liveLarge} className="mx-auto max-w-[17rem]" />
          </div>
          <FeatureList items={LISTENING} className="mt-12 md:grid-cols-3" />
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <FeatureList items={KEEPING} />
            <div className="mx-auto grid max-w-[30rem] grid-cols-2 gap-4">
              <PhoneShot image={SHOTS.conversation} />
              <PhoneShot image={SHOTS.library} />
            </div>
          </div>
          <div className="mt-16">
            <PhoneShot image={SHOTS.paintedThemes} className="mx-auto max-w-[56rem]" />
            <FeatureList items={MAKE_IT_YOURS} className="mx-auto mt-8 max-w-[40rem]" />
          </div>
        </Section>

        {/* 5. Privacy */}
        <Section id="privacy" eyebrow="Privacy" title="Private by design">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-16">
            <ul className="space-y-6">
              {PRIVACY.map(({ title, body }) => (
                <li key={title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <CheckIcon />
                  <p className="text-lg leading-relaxed text-ink-body md:text-xl">
                    <strong className="font-semibold text-ink-strong">{title}</strong> {body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="self-start border-l-4 border-accent bg-muted p-6 md:p-8">
              <h3 className="font-display text-2xl text-ink-strong">Ask before you caption people.</h3>
              <p className="mt-3 text-lg leading-relaxed text-ink-body">
                The app hears everyone nearby. In some places, everyone in a conversation must agree before it is
                captured, so tell people the app is on. Set up someone’s voice only with their permission.
              </p>
            </div>
          </div>
          <p className="mt-10 text-lg text-ink-body">
            Read the <a href={APPS.scribe.legal.find((l) => l.label === 'Privacy Policy')!.href} className={LINK}>Privacy Policy</a>.
          </p>
        </Section>

        {/* 6. Stan Scribe Light */}
        <Section id="light" eyebrow="Two apps" title="Stan Scribe Light">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
            <div>
              <p className="font-display text-[clamp(1.5rem,3vw,2rem)] italic text-ink-strong">The simple edition. Free.</p>
              <p className="mt-5 max-w-[38rem] text-xl leading-relaxed text-ink-body">{LIGHT_SUMMARY}</p>
              <DownloadBlock app="light" className="mt-8 max-w-sm" />
            </div>
            <PhoneShot image={SHOTS.lightBlackAndWhite} className="mx-auto max-w-[26rem]" />
          </div>
          <h3 className="mt-16 font-display text-2xl text-ink-strong md:text-3xl">Which one is for you?</h3>
          <ComparisonTable className="mt-6" />
          <p className="mt-6 max-w-[44rem] text-lg leading-relaxed text-ink-body md:text-xl">
            <strong className="font-semibold text-ink-strong">Not sure?</strong> {LIGHT_NOT_SURE}
          </p>
        </Section>

        {/* 7. Languages */}
        <Section id="languages" eyebrow="Languages" title="25 languages">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,17rem)] lg:gap-16">
            <div>
              <p className="max-w-[38rem] text-xl leading-relaxed text-ink-body">
                Captions work in English and 24 other European languages. Choose one in Settings, or leave it on Auto.
              </p>
              <ul aria-label="Caption languages" className="mt-8 flex flex-wrap gap-2.5">
                {LANGUAGES.map((language) => (
                  <li key={language} className="rounded-full border border-input px-4 py-1.5 text-base text-ink-strong">
                    {language}
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-[38rem] text-lg leading-relaxed text-ink-body">
                Smart titles name conversations by topic in English, and in more languages on iPhones with Apple
                Intelligence.
              </p>
            </div>
            <PhoneShot image={SHOTS.languages} className="mx-auto max-w-[17rem]" />
          </div>
        </Section>

        {/* 8. Questions — every answer open, so "they can be wrong" is never hidden */}
        <Section id="questions" eyebrow="FAQ" title="Questions">
          <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
            {QUESTIONS.map(({ title, body }) => (
              <div key={title}>
                <h3 className="font-display text-2xl leading-snug text-ink-strong">{title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-ink-body">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 9. Help and fine print */}
        <HelpBlock apps={['scribe', 'light']} />
      </div>
    </div>
  );
}
