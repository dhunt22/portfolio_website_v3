// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/sync-stanscribe-legal.mjs
// Copies Stan Scribe's generated legal pages (Scripts/legal.py in the app repo) into public/, byte
// for byte. Only privacy/, terms/ and acknowledgements/ — never the generated plain index.html,
// which would shadow the designed page. Never hand-edit the copies; regenerate in the app repo.
//
// Usage: node scripts/sync-stanscribe-legal.mjs [--src ../transcript_stan/site] [--dest public]

import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const APPS = ['stanscribe', 'stanscribe-light'];
const PAGES = ['privacy', 'terms', 'acknowledgements'];

// Defaults resolve against this file, so the script works from any directory. Explicit arguments
// resolve against the cwd.
const { values } = parseArgs({ options: { src: { type: 'string' }, dest: { type: 'string' } } });
const src = values.src ? resolve(values.src) : fileURLToPath(new URL('../../transcript_stan/site', import.meta.url));
const dest = values.dest ? resolve(values.dest) : fileURLToPath(new URL('../public', import.meta.url));

// Check everything first so a half-generated site never lands half-copied.
const missing = APPS.flatMap((app) => PAGES.map((page) => join(src, app, page, 'index.html'))).filter(
  (file) => !existsSync(file),
);
if (missing.length > 0) {
  console.error(`sync-stanscribe-legal: missing generated pages:\n  ${missing.join('\n  ')}`);
  console.error('Run `python3 Scripts/legal.py` in the app repo first.');
  process.exit(1);
}

for (const app of APPS) {
  for (const page of PAGES) {
    const to = join(dest, app, page);
    rmSync(to, { recursive: true, force: true }); // drop files an earlier sync left behind
    cpSync(join(src, app, page), to, { recursive: true });
    console.log(`synced ${app}/${page}/`);
  }
}
