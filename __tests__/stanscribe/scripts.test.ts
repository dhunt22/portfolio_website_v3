/** @jest-environment node */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const APPS = ['stanscribe', 'stanscribe-light'];
const PAGES = ['privacy', 'terms', 'acknowledgements'];

const tempDirs: string[] = [];
const tempDir = (prefix: string) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
};
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

const run = (script: string, args: string[]) =>
  spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], { encoding: 'utf8' });

const git = (cwd: string, ...args: string[]) => {
  const result = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
};

/** A generated page, as Scripts/legal.py frames it. */
const generated = (words: string) =>
  `<!doctype html>\n<html><head><style>body {}</style></head><body><main><nav><a href="https://devinhunt.com/stanscribe/">Stan Scribe</a></nav>\n${words}\n</main></body></html>\n`;

const writePage = (site: string, app: string, page: string, words: string) => {
  mkdirSync(join(site, app, page), { recursive: true });
  writeFileSync(join(site, app, page, 'index.html'), generated(words));
};

/** The app repo on GitHub and the local checkout of it, optionally with one "<app>/<page>" never committed. */
function makeAppRepo(skip?: string) {
  const origin = tempDir('legal-origin-');
  git(origin, 'init', '-q', '-b', 'main');
  for (const app of APPS) {
    for (const page of PAGES) {
      if (`${app}/${page}` !== skip) writePage(join(origin, 'site'), app, page, `<h1>${app} ${page}</h1>`);
    }
  }
  git(origin, 'add', '.');
  git(origin, 'commit', '-q', '-m', 'legal');
  const checkout = tempDir('legal-checkout-');
  git(checkout, 'clone', '-q', origin, '.');
  return { origin, checkout };
}

const commitPage = (origin: string, app: string, page: string, words: string) => {
  writePage(join(origin, 'site'), app, page, words);
  git(origin, 'commit', '-qam', 'legal: new words');
};

const sync = (checkout: string, dest: string, ...flags: string[]) =>
  run('sync-stanscribe-legal.mjs', ['--repo', checkout, '--dest', dest, ...flags]);

describe('sync-stanscribe-legal', () => {
  test('keeps each page\'s words and drops the generated frame around them', () => {
    const { checkout } = makeAppRepo();
    const dest = tempDir('legal-dest-');
    expect(sync(checkout, dest).status).toBe(0);
    for (const app of APPS) {
      expect(existsSync(join(dest, app, 'index.html'))).toBe(false);
      for (const page of PAGES) {
        expect(readFileSync(join(dest, app, `${page}.html`), 'utf8')).toBe(`<h1>${app} ${page}</h1>\n`);
      }
    }
  });

  test('pulls what was committed since the last sync, and names only what changed', () => {
    const { origin, checkout } = makeAppRepo();
    const dest = tempDir('legal-dest-');
    sync(checkout, dest);
    commitPage(origin, 'stanscribe', 'privacy', '<h1>Privacy</h1><p>Effective October 30</p>');
    const result = sync(checkout, dest);
    expect(result.status).toBe(0);
    expect(readFileSync(join(dest, 'stanscribe', 'privacy.html'), 'utf8')).toContain('Effective October 30');
    expect(result.stdout).toMatch(/stanscribe\/privacy/);
    expect(result.stdout).not.toMatch(/stanscribe\/terms/);
  });

  test('an uncommitted edit in the checkout never reaches the site', () => {
    const { checkout } = makeAppRepo();
    const dest = tempDir('legal-dest-');
    writePage(join(checkout, 'site'), 'stanscribe', 'terms', '<h1>half-finished</h1>');
    sync(checkout, dest);
    expect(readFileSync(join(dest, 'stanscribe', 'terms.html'), 'utf8')).toBe('<h1>stanscribe terms</h1>\n');
    expect(readFileSync(join(checkout, 'site', 'stanscribe', 'terms', 'index.html'), 'utf8')).toContain('half-finished');
  });

  test('--check reports stale pages and writes nothing', () => {
    const { origin, checkout } = makeAppRepo();
    const dest = tempDir('legal-dest-');
    sync(checkout, dest);
    expect(sync(checkout, dest, '--check').status).toBe(0);
    commitPage(origin, 'stanscribe-light', 'terms', '<h1>New terms</h1>');
    const result = sync(checkout, dest, '--check');
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/stanscribe-light\/terms/);
    expect(readFileSync(join(dest, 'stanscribe-light', 'terms.html'), 'utf8')).toBe('<h1>stanscribe-light terms</h1>\n');
  });

  test('writes nothing when a page is missing from the app repo', () => {
    const { checkout } = makeAppRepo('stanscribe-light/terms');
    const dest = tempDir('legal-dest-');
    const result = sync(checkout, dest);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stanscribe-light\/terms/);
    expect(existsSync(join(dest, 'stanscribe'))).toBe(false);
  });

  test('writes nothing when a page is not framed the way the generator frames it', () => {
    const { origin, checkout } = makeAppRepo();
    writeFileSync(join(origin, 'site', 'stanscribe', 'terms', 'index.html'), '<html><body><p>a new layout</p></body></html>');
    git(origin, 'commit', '-qam', 'legal: new generator');
    const dest = tempDir('legal-dest-');
    const result = sync(checkout, dest);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stanscribe\/terms/);
    expect(existsSync(join(dest, 'stanscribe'))).toBe(false);
  });

  test('fails rather than keeping old words silently when the app repo cannot be reached', () => {
    const { checkout } = makeAppRepo();
    git(checkout, 'remote', 'set-url', 'origin', join(tempDir('legal-gone-'), 'nothing-here'));
    const result = sync(checkout, tempDir('legal-dest-'));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/fetch/i);
  });
});

describe('stanscribe-index', () => {
  /** An export folder with both products' pages and their legal pages. */
  const exported = (skip?: string) => {
    const out = tempDir('out-');
    writeFileSync(join(out, 'stanscribe.html'), 'scribe page');
    writeFileSync(join(out, 'stanscribe-light.html'), 'light page');
    for (const app of APPS) {
      mkdirSync(join(out, app));
      for (const page of PAGES) {
        if (`${app}/${page}` !== skip) writeFileSync(join(out, app, `${page}.html`), `${app} ${page}`);
      }
    }
    return out;
  };

  test('gives each page a real index.html', () => {
    const out = exported();
    expect(run('stanscribe-index.mjs', ['--out', out]).status).toBe(0);
    expect(readFileSync(join(out, 'stanscribe', 'index.html'), 'utf8')).toBe('scribe page');
    expect(readFileSync(join(out, 'stanscribe-light', 'index.html'), 'utf8')).toBe('light page');
  });

  test('moves each legal page to <page>/index.html, so Netlify answers its slash URL with no redirect', () => {
    const out = exported();
    expect(run('stanscribe-index.mjs', ['--out', out]).status).toBe(0);
    for (const app of APPS) {
      for (const page of PAGES) {
        expect(readFileSync(join(out, app, page, 'index.html'), 'utf8')).toBe(`${app} ${page}`);
        // Left beside the folder, name.html would make Netlify's pretty URLs 301 the slash URL.
        expect(existsSync(join(out, app, `${page}.html`))).toBe(false);
      }
    }
  });

  test('fails the build when a legal page was not exported', () => {
    const result = run('stanscribe-index.mjs', ['--out', exported('stanscribe-light/terms')]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stanscribe-light\/terms\.html/);
  });

  test('fails the build when a page was not exported, and moves nothing', () => {
    const out = exported();
    rmSync(join(out, 'stanscribe-light.html'));
    const result = run('stanscribe-index.mjs', ['--out', out]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/stanscribe-light\.html/);
    expect(existsSync(join(out, 'stanscribe', 'privacy.html'))).toBe(true);
  });

  test('fails the build when the page links the App Store badge but the file is missing', () => {
    const out = exported();
    writeFileSync(join(out, 'stanscribe.html'), '<img src="/images/stanscribe/app-store-badge.svg">');
    const missing = run('stanscribe-index.mjs', ['--out', out]);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/app-store-badge\.svg/);
    mkdirSync(join(out, 'images', 'stanscribe'), { recursive: true });
    writeFileSync(join(out, 'images', 'stanscribe', 'app-store-badge.svg'), '<svg/>');
    expect(run('stanscribe-index.mjs', ['--out', out]).status).toBe(0);
  });
});

describe('Netlify routing', () => {
  const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');

  test('no catch-all rewrite sends a mistyped URL to the homepage instead of the 404', () => {
    expect(existsSync(join(ROOT, 'public', '_redirects'))).toBe(false);
    expect(toml).not.toMatch(/from = "\/\*"/);
  });

  test.each(APPS)('/%s/ answers 200 from its copied index.html instead of a pretty-URL 301', (app) => {
    expect(toml).toContain(`from = "/${app}/"\n  to = "/${app}/index.html"\n  status = 200\n  force = true`);
  });
});
