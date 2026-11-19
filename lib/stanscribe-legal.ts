// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe-legal.ts
// Server only: reads a legal page's words at build time. scripts/sync-stanscribe-legal.mjs writes them, except
// the Labels and Markings page, which the apps do not show and so is written here, in content/stanscribe-site/.

import fs from 'node:fs';
import path from 'node:path';
import { APPS, type AppKey, type LegalSlug } from '@/lib/stanscribe';

export function legalWords(app: AppKey, slug: LegalSlug): string {
  return fs.readFileSync(path.join(process.cwd(), 'content/stanscribe-legal', APPS[app].route, `${slug}.html`), 'utf8');
}

export interface LegalParts {
  head: string;
  body: string;
}

/** The h1 that opens the words, and the one paragraph directly under it when there is one. */
const HEAD = /^<h1>[\s\S]*?<\/h1>\s*(?:<p>[\s\S]*?<\/p>\s*)?/;

/**
 * Legal words in two parts, so the page can set the title on the contours and the rest on the card: `head` is
 * the h1 and the one paragraph directly under it (the effective date, or the Acknowledgements' first line), or
 * the h1 alone when no paragraph follows it, and `body` is everything after. Words that do not open with an h1
 * have an empty head, so a sync that changes how a page opens never stops the build. No word is changed or
 * dropped: head + body is always the words.
 */
export function splitLegal(words: string): LegalParts {
  const head = words.match(HEAD)?.[0] ?? '';
  return { head, body: words.slice(head.length) };
}

/** One legal page's words, split by splitLegal. */
export function legalParts(app: AppKey, slug: LegalSlug): LegalParts {
  return splitLegal(legalWords(app, slug));
}

/** The Labels and Markings page's words, split by splitLegal. One page covers both apps. */
export function labelsParts(): LegalParts {
  return splitLegal(fs.readFileSync(path.join(process.cwd(), 'content/stanscribe-site/labels.html'), 'utf8'));
}
