// scripts/check-content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runCheck, discoverRoutes } from './check-content.mjs';

const SITE_MD = `# Site

## Footer
Water resources engineer.

![A test image](/images/x.png)

[Resume](/resume)
[External](https://example.com/)

## SEO
**title:** T
**description:** D
`;

function scaffold({ withImage = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'content-check-'));
  mkdirSync(join(dir, 'content'));
  writeFileSync(join(dir, 'content', 'site.md'), SITE_MD);
  mkdirSync(join(dir, 'public', 'images'), { recursive: true });
  if (withImage) writeFileSync(join(dir, 'public', 'images', 'x.png'), 'png');
  mkdirSync(join(dir, 'app', 'resume'), { recursive: true });
  writeFileSync(join(dir, 'app', 'resume', 'page.tsx'), 'export default function P(){}');
  writeFileSync(join(dir, 'app', 'page.tsx'), 'export default function H(){}');
  return {
    dir,
    opts: {
      contentDir: join(dir, 'content'),
      outDir: join(dir, 'content', 'generated'),
      configPath: join(dir, 'nope.json'),
      publicDir: join(dir, 'public'),
      appDir: join(dir, 'app'),
    },
  };
}

test('discoverRoutes maps app dirs to routes', () => {
  const { dir, opts } = scaffold();
  assert.deepEqual(discoverRoutes(opts.appDir).sort(), ['/', '/resume']);
  rmSync(dir, { recursive: true, force: true });
});

test('valid content + assets → ok', () => {
  const { dir, opts } = scaffold();
  const res = runCheck(opts);
  assert.equal(res.ok, true);
  rmSync(dir, { recursive: true, force: true });
});

test('missing image → integrity failure naming the path', () => {
  const { dir, opts } = scaffold({ withImage: false });
  const res = runCheck(opts);
  assert.equal(res.ok, false);
  assert.equal(res.stage, 'integrity');
  assert.ok(res.errors.some((e) => /image not found in public\/: \/images\/x\.png/.test(e)));
  rmSync(dir, { recursive: true, force: true });
});

test('structural failure short-circuits before integrity', () => {
  const { dir, opts } = scaffold();
  writeFileSync(join(opts.contentDir, 'site.md'), `# Site\n\n## Footer\nHi.\n\n## SEO\n**title:** only\n`);
  const res = runCheck(opts);
  assert.equal(res.ok, false);
  assert.equal(res.stage, 'sync');
  assert.ok(res.errors.some((e) => /missing field "description"/.test(e)));
  rmSync(dir, { recursive: true, force: true });
});
