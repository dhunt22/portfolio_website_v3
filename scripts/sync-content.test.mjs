// scripts/sync-content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runSync } from './sync-content.mjs';

function tmp() { return mkdtempSync(join(tmpdir(), 'content-sync-')); }

test('valid site.md → writes generated file', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'site.md'),
    `# Site\n## Footer\nWater resources engineer.\n## SEO\n**title:** Devin Hunt\n**description:** Portfolio.\n- hydrologist\n`);
  const out = join(dir, 'generated');
  const res = runSync({ contentDir: dir, outDir: out, configPath: join(dir, 'nope.json') });
  assert.equal(res.ok, true);
  assert.ok(existsSync(join(out, 'site.ts')));
  assert.match(readFileSync(join(out, 'site.ts'), 'utf8'), /export const site = \{/);
  rmSync(dir, { recursive: true, force: true });
});

test('invalid content → no write, errors returned', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'site.md'), `# Site\n## Footer\nHi.\n## SEO\n**title:** only title\n`); // missing description
  const out = join(dir, 'generated');
  const res = runSync({ contentDir: dir, outDir: out, configPath: join(dir, 'nope.json') });
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => /missing field "description"/.test(e)));
  assert.equal(existsSync(join(out, 'site.ts')), false);
  rmSync(dir, { recursive: true, force: true });
});
