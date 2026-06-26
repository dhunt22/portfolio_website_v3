// scripts/sync-content.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePage, slugify, camelCase } from './lib/content-parse.mjs';
import { emitPage } from './lib/content-emit.mjs';
import { validatePage } from './lib/content-validate.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function runSync({
  contentDir = join(ROOT, 'content'),
  outDir = join(ROOT, 'content', 'generated'),
  configPath = join(ROOT, 'lib', 'page-config.json'),
} = {}) {
  if (!existsSync(contentDir)) return { ok: true, errors: [], written: [], note: 'no content dir' };
  const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.md')).sort();
  if (files.length === 0) return { ok: true, errors: [], written: [], note: 'no content files' };

  const parsed = [];
  const errors = [];
  for (const file of files) {
    const name = camelCase(slugify(basename(file, '.md')));
    const page = parsePage(readFileSync(join(contentDir, file), 'utf8'));
    parsed.push({ name, file, page });
    errors.push(...validatePage(name, page, config));
  }
  if (errors.length) return { ok: false, errors, written: [] };

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const { name, file, page } of parsed) {
    const dest = join(outDir, `${name}.ts`);
    writeFileSync(dest, emitPage(name, file, page.sections));
    written.push(dest);
  }
  return { ok: true, errors: [], written };
}

const invokedDirectly = process.argv[1] && basename(process.argv[1]) === 'sync-content.mjs';
if (invokedDirectly) {
  const res = runSync();
  if (!res.ok) {
    console.error('✖ content sync failed:\n' + res.errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  if (res.note) { console.log(`ℹ content sync: ${res.note}`); }
  else {
    console.log(`✓ content synced — ${res.written.length} file(s):`);
    for (const w of res.written) console.log('  ' + w.slice(ROOT.length + 1));
  }
}
