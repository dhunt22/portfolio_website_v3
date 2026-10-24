// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// test-utils/stanscribe.ts
// The Stan Scribe brief's word rules (transcript_stan/docs/marketing/stanscribe-page/README.md) as
// checks the page tests run over rendered text, alt text and metadata. Lives outside __tests__ so
// Jest doesn't collect it as a suite.

const BANNED: [RegExp, string][] = [
  [/whisper/i, 'never name the speech model'],
  [/\b(nvidia|moondream|parakeet|sortformer|fluidinference|fluid inference|openai)\b/i, 'no model or model-company names'],
  [/transcri/i, 'say "captions", not transcription'],
  [/\$|\b\d+\.\d\d\b/, 'no prices'],
  [/\b(tip|tips|tipping|donate|donation)\b/i, 'never "tip" or "donate"'],
  [/\b(lite|trial|crippled)\b/i, 'Light is "the simple edition"'],
  [/nothing ever leaves/i, 'that privacy claim needs its qualifier'],
];

/** Every way `text` breaks the brief's word rules; empty when it follows them. */
export function findCopyViolations(text: string): string[] {
  const found = BANNED.filter(([re]) => re.test(text)).map(([re, why]) => `${why}: "${text.match(re)?.[0]}"`);
  // "subscription" only as a denial ("No subscription", "Neither has ... subscriptions") or the FAQ question.
  for (const sentence of text.split(/[.?!]\s+/)) {
    if (/subscription/i.test(sentence) && !/\b(no|neither|is there)\b/i.test(sentence)) {
      found.push(`"subscription" outside a denial: "${sentence.trim()}"`);
    }
  }
  return found;
}

/** Text nodes plus alt / aria-label / title, space-separated so sentences stay apart. */
export function pageText(root: HTMLElement): string {
  const parts: string[] = [];
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) parts.push(node.textContent ?? '');
  Array.from(root.querySelectorAll('[alt], [aria-label], [title]')).forEach((el) => {
    ['alt', 'aria-label', 'title'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value) parts.push(value);
    });
  });
  return parts.join(' ').replace(/\s+/g, ' ');
}

/** Heading levels in document order, e.g. [1, 2, 3, 3, 2]. */
export function headingLevels(root: HTMLElement): number[] {
  return Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => Number(h.tagName[1]));
}
