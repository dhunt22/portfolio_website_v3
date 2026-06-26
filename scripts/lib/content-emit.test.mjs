// scripts/lib/content-emit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emitPage } from './content-emit.mjs';

const sections = {
  hero: { id: 'hero', title: 'Hero', fields: { eyebrow: 'He said "hi"' }, body: ['A — B'], items: [], links: [], children: [] },
};

test('banner, import, export, satisfies', () => {
  const out = emitPage('home', 'home.md', sections);
  assert.match(out, /AUTO-GENERATED from content\/home\.md/);
  assert.match(out, /import type \{ PageContent \} from '\.\.\/_types';/);
  assert.match(out, /export const home = \{[\s\S]*\} satisfies PageContent;/);
});

test('escapes quotes and is deterministic', () => {
  const a = emitPage('home', 'home.md', sections);
  const b = emitPage('home', 'home.md', sections);
  assert.equal(a, b);
  assert.match(a, /He said \\"hi\\"/);
});
