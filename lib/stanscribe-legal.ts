// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe-legal.ts
// Server only: reads a legal page's words at build time. scripts/sync-stanscribe-legal.mjs writes them.

import fs from 'node:fs';
import path from 'node:path';
import { APPS, type AppKey, type LegalSlug } from '@/lib/stanscribe';

export function legalWords(app: AppKey, slug: LegalSlug): string {
  return fs.readFileSync(path.join(process.cwd(), 'content/stanscribe-legal', APPS[app].route, `${slug}.html`), 'utf8');
}

/**
 * A legal page's words in two parts, so the page can set the title on the contours and the rest on the card:
 * `head` is the h1 and the one paragraph under it (the effective date, or the Acknowledgements' first line),
 * and `body` is everything after. No word is changed or dropped: head + body is the file.
 */
export function legalParts(app: AppKey, slug: LegalSlug): { head: string; body: string } {
  const words = legalWords(app, slug);
  const head = words.match(/^<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>\s*/)?.[0];
  if (!head) throw new Error(`${APPS[app].route}/${slug}.html does not open with an h1 and a paragraph.`);
  return { head, body: words.slice(head.length) };
}
