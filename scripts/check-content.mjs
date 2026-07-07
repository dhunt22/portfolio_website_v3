// scripts/check-content.mjs
// THE pre-publish content gate: structural sync + asset/link integrity.
// Run via `npm run content:check`; build/export/netlify-build run it automatically.
import { readdirSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSync } from './sync-content.mjs';
import { checkIntegrity, collectAnchors, EXTRA_ANCHORS } from './lib/content-check.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Recursive listing of a directory as web paths ('/images/x.webp'), forward slashes on Windows.
function listPublicFiles(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) listPublicFiles(full, base, out);
    else out.push('/' + relative(base, full).split(sep).join('/'));
  }
  return out;
}

// app/page.tsx → '/', app/interests/page.tsx → '/interests', etc.
export function discoverRoutes(appDir) {
  const routes = [];
  const visit = (dir, segments) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) visit(join(dir, entry.name), [...segments, entry.name]);
      else if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) routes.push('/' + segments.join('/'));
    }
  };
  visit(appDir, []);
  return routes;
}

export function runCheck(opts = {}) {
  const { publicDir = join(ROOT, 'public'), appDir = join(ROOT, 'app'), ...syncOpts } = opts;
  const sync = runSync(syncOpts);
  if (!sync.ok) return { ok: false, stage: 'sync', errors: sync.errors };

  const publicFiles = new Set(existsSync(publicDir) ? listPublicFiles(publicDir) : []);
  const routes = new Set(existsSync(appDir) ? discoverRoutes(appDir) : []);
  const anchorsByRoute = collectAnchors(sync.pages, EXTRA_ANCHORS);

  const errors = checkIntegrity(sync.pages, { publicFiles, routes, anchorsByRoute });
  if (errors.length) return { ok: false, stage: 'integrity', errors };
  return { ok: true, errors: [], written: sync.written, note: sync.note };
}

const invokedDirectly = process.argv[1] && basename(process.argv[1]) === 'check-content.mjs';
if (invokedDirectly) {
  const res = runCheck();
  if (!res.ok) {
    console.error(`✖ content check failed (${res.stage}):\n` + res.errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log(`✓ content check passed — structure + asset/link integrity (${(res.written || []).length} generated file(s))`);
}
