// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/type.ts
// The portfolio's six type roles and its controls (DESIGN.md › Typography, Components). Public Sans only;
// no size outside these roles, no monospace, no tracked capitals.

export const SITE_TYPE = {
  /** The page's h1: the name or the page title. */
  display: 'font-site text-site-display text-ink-strong',
  /** Section h2s and the lead project's name. */
  headline: 'font-site text-site-headline text-ink-strong',
  /** Project, tool and role names. */
  title: 'font-site text-site-title text-ink-strong',
  /** The opening statement, max 30ch. */
  lead: 'font-site text-site-lead text-ink-body',
  body: 'font-site text-site-body text-ink-body',
  /** Meta lines, filters, captions, the readout. */
  label: 'font-site text-site-label tabular-nums text-ink-muted',
} as const;

/** The one primary button: ink fill, ground text, square, 44px tall. Never haloed. */
export const SITE_BUTTON =
  'inline-flex min-h-11 items-center bg-ink-strong px-5 font-site text-site-body font-medium text-background no-underline transition-opacity duration-150 [text-shadow:none] hover:opacity-[0.88]';

/** A text link: water blue, underlined, thicker on hover. */
export const SITE_LINK = 'text-link underline decoration-1 underline-offset-[0.2em] hover:decoration-2';

/** The "Coming soon" label after a name. */
export const SITE_SOON = 'ml-2.5 align-[0.3em] font-site text-site-label font-medium tracking-normal text-site-selected';
