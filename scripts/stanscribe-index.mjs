// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/stanscribe-index.mjs
// Runs after `next build`. With trailingSlash off, Next exports out/stanscribe.html, but App Store
// Connect links /stanscribe/ and /stanscribe-light/, folders that hold only the legal pages. Copying
// each page to <route>/index.html makes those exact URLs real files. netlify.toml rewrites to them, since
// Netlify's pretty URLs would otherwise 301 the slash URL to the slashless page.
//
// Usage: node scripts/stanscribe-index.mjs [--out out]

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const ROUTES = ['stanscribe', 'stanscribe-light'];

const { values } = parseArgs({ options: { out: { type: 'string', default: 'out' } } });
const out = resolve(values.out);

for (const route of ROUTES) {
  const page = join(out, `${route}.html`);
  if (!existsSync(page)) {
    console.error(`stanscribe-index: ${page} not found. Did next build export it?`);
    process.exit(1);
  }
  mkdirSync(join(out, route), { recursive: true });
  copyFileSync(page, join(out, route, 'index.html'));
  console.log(`${route}.html -> ${route}/index.html`);
}

// A page that links the App Store badge must ship the badge file, or the launch goes out with a broken image.
const BADGE = 'app-store-badge.svg';
if (readFileSync(join(out, 'stanscribe.html'), 'utf8').includes(BADGE) && !existsSync(join(out, 'images', 'stanscribe', BADGE))) {
  console.error(`stanscribe-index: stanscribe.html references ${BADGE} but ${join(out, 'images', 'stanscribe', BADGE)} is missing.`);
  console.error('Save Apple\'s badge to public/images/stanscribe/app-store-badge.svg.');
  process.exit(1);
}
