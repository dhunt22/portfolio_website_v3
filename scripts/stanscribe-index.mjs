// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/stanscribe-index.mjs
// Runs after `next build`. With trailingSlash off, Next exports out/stanscribe.html, but App Store
// Connect links /stanscribe/ and /stanscribe-light/, folders that hold only the legal pages. Copying
// each page to <route>/index.html makes those exact URLs real files. netlify.toml rewrites to them, since
// Netlify's pretty URLs would otherwise 301 the slash URL to the slashless page.
//
// The legal pages' slash URLs are in the apps themselves. Moving each to <page>/index.html leaves no
// <page>.html for pretty URLs to redirect to, so they need no rewrites.
//
// Usage: node scripts/stanscribe-index.mjs [--out out]

import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const ROUTES = ['stanscribe', 'stanscribe-light'];
const LEGAL_PAGES = ['privacy', 'terms', 'acknowledgements'];

const { values } = parseArgs({ options: { out: { type: 'string', default: 'out' } } });
const out = resolve(values.out);

// Check everything first, so a failed build never leaves out/ half moved.
const needed = ROUTES.flatMap((route) => [`${route}.html`, ...LEGAL_PAGES.map((legal) => `${route}/${legal}.html`)]);
const missing = needed.filter((file) => !existsSync(join(out, file)));
if (missing.length > 0) {
  console.error(`stanscribe-index: not found in ${out}. Did next build export them?\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

// A page that links the App Store badge must ship the badge file, or the launch goes out with a broken image.
const BADGE = 'app-store-badge.svg';
if (readFileSync(join(out, 'stanscribe.html'), 'utf8').includes(BADGE) && !existsSync(join(out, 'images', 'stanscribe', BADGE))) {
  console.error(`stanscribe-index: stanscribe.html references ${BADGE} but ${join(out, 'images', 'stanscribe', BADGE)} is missing.`);
  console.error('Save Apple\'s badge to public/images/stanscribe/app-store-badge.svg.');
  process.exit(1);
}

for (const route of ROUTES) {
  mkdirSync(join(out, route), { recursive: true });
  copyFileSync(join(out, `${route}.html`), join(out, route, 'index.html'));
  console.log(`${route}.html -> ${route}/index.html`);
  for (const legal of LEGAL_PAGES) {
    mkdirSync(join(out, route, legal), { recursive: true });
    renameSync(join(out, route, `${legal}.html`), join(out, route, legal, 'index.html'));
    console.log(`${route}/${legal}.html -> ${route}/${legal}/index.html`);
  }
}
