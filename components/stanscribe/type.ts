// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/type.ts
// The one type scale both Stan Scribe pages use: Newsreader headings, Hanken text, six sizes, one
// line-height per role. No mono, tracked caps or italics (test-utils' findTypeViolations checks).

export const TYPE = {
  /** The page's h1. */
  display: 'font-display text-[clamp(2.75rem,6vw,4.5rem)] font-medium leading-tight-display tracking-display text-ink-strong',
  /** Section h2s, and the hero's tagline under the h1. */
  title: 'font-display text-[clamp(2rem,4vw,2.75rem)] font-medium leading-tight tracking-display text-ink-strong',
  /** h3s, app names and the support email. */
  heading: 'font-display text-2xl font-medium leading-snug text-ink-strong',
  lead: 'text-xl leading-relaxed text-ink-body',
  body: 'text-lg leading-relaxed text-ink-body',
  /** Legal fine print only: everything else is at least 18px. */
  small: 'text-base leading-relaxed text-ink-muted',
  /** The deeper blue (text-link-hover), so links clear 7:1 like body text in both themes; text-link does not at night. */
  link: 'text-link-hover underline decoration-1 underline-offset-4 transition-colors hover:text-ink-strong hover:decoration-2',
} as const;
