// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/sync-stanscribe-legal.mjs
// Pulls the words of Stan Scribe's legal pages into content/stanscribe-legal/, where this site's own routes
// render them. The app repo keeps writing them, since the apps bundle the same text: it generates site/ from
// legal/ with Scripts/legal.py. This fetches its main branch from GitHub, so only committed, pushed words reach
// the site, and the checkout's working tree is never touched. Each page's generated frame (its styles and nav)
// is dropped here, and the words are kept exactly as they are. Commit what it changes.
//
// Usage: npm run sync:stanscribe-legal [-- --check] [-- --repo ../transcript_stan] [-- --dest content/stanscribe-legal]
//   --check   exit 1 if a page is stale, and write nothing

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const APPS = ['stanscribe', 'stanscribe-light'];
const PAGES = ['privacy', 'terms', 'acknowledgements'];
const FRAME = /<main><nav>[\s\S]*?<\/nav>\s*([\s\S]*?)\s*<\/main>/;

// Defaults resolve against this file, so the script works from any directory. Explicit arguments
// resolve against the cwd.
const { values } = parseArgs({
  options: { repo: { type: 'string' }, dest: { type: 'string' }, check: { type: 'boolean', default: false } },
});
const repo = values.repo ? resolve(values.repo) : fileURLToPath(new URL('../../transcript_stan', import.meta.url));
const dest = values.dest ? resolve(values.dest) : fileURLToPath(new URL('../content/stanscribe-legal', import.meta.url));

function fail(lines) {
  console.error(`sync-stanscribe-legal: ${lines.join('\n  ')}`);
  process.exit(1);
}

const git = (...args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const fetched = git('fetch', '--quiet', 'origin', 'main');
if (fetched.status !== 0) fail([`could not fetch ${repo}:`, (fetched.stderr ?? fetched.error?.message ?? '').trim()]);
const commit = git('rev-parse', '--short', 'FETCH_HEAD').stdout.trim();

// Read everything first, so a half-generated site never lands half-copied.
const pages = APPS.flatMap((app) => PAGES.map((page) => ({ app, page })));
const problems = [];
for (const entry of pages) {
  const { app, page } = entry;
  const shown = git('show', `FETCH_HEAD:site/${app}/${page}/index.html`);
  const words = shown.status === 0 ? shown.stdout.match(FRAME)?.[1] : undefined;
  if (words) entry.words = `${words}\n`;
  else problems.push(`${app}/${page}: ${shown.status === 0 ? 'not framed as Scripts/legal.py frames it' : 'missing'}`);
}
if (problems.length > 0) fail([`nothing written. At ${commit} in ${repo}:`, ...problems]);

const stale = pages.filter(({ app, page, words }) => {
  const file = join(dest, app, `${page}.html`);
  return !existsSync(file) || readFileSync(file, 'utf8') !== words;
});

for (const { app, page, words } of stale) {
  console.log(`${values.check ? 'stale' : 'updated'}: ${app}/${page}`);
  if (values.check) continue;
  const file = join(dest, app, `${page}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, words);
}
if (stale.length === 0) console.log(`Legal pages match transcript_stan at ${commit}.`);
else if (values.check) process.exit(1);
else console.log(`Pulled from transcript_stan at ${commit}. Review and commit content/stanscribe-legal/.`);
