// scripts/lib/content-check.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkIntegrity, collectAnchors, EXTRA_ANCHORS } from './content-check.mjs';

const blk = (over = {}) => ({ id: 'x', title: 'X', fields: {}, body: [], items: [], links: [], children: [], ...over });
const pageOf = (sections) => ({ title: '', order: Object.keys(sections), sections });

function fixture() {
  return [
    { name: 'home', file: 'home.md', page: pageOf({
      hero: blk({ id: 'hero',
        image: { alt: 'a', src: '/images/me.webp' },
        links: [
          { label: 'p', href: '/portfolio' },
          { label: 'i', href: '/interests#exploration' },
          { label: 'pdf', href: '/data/resume.pdf' },
          { label: 'x', href: 'https://example.com/' },
        ] }),
    }) },
    { name: 'interests', file: 'interests.md', page: pageOf({
      interests: blk({ id: 'interests', children: [blk({ id: 'exploration' })] }),
    }) },
  ];
}

function envFor(pages, over = {}) {
  return {
    publicFiles: new Set(['/images/me.webp', '/data/resume.pdf']),
    routes: new Set(['/', '/portfolio', '/interests', '/resume']),
    anchorsByRoute: collectAnchors(pages, EXTRA_ANCHORS),
    ...over,
  };
}

test('valid fixture → no errors (cross-page anchor + file link + https all resolve)', () => {
  const pages = fixture();
  assert.deepEqual(checkIntegrity(pages, envFor(pages)), []);
});

test('missing image errors with path and file', () => {
  const pages = fixture();
  const errs = checkIntegrity(pages, envFor(pages, { publicFiles: new Set(['/data/resume.pdf']) }));
  assert.ok(errs.some((e) => /home\.md: image not found in public\/: \/images\/me\.webp/.test(e)));
});

test('dead internal route errors', () => {
  const pages = fixture();
  pages[0].page.sections.hero.links.push({ label: 'bad', href: '/nope' });
  const errs = checkIntegrity(pages, envFor(pages));
  assert.ok(errs.some((e) => /internal link target not found.*\/nope/.test(e)));
});

test('unknown fragment errors and names the anchor', () => {
  const pages = fixture();
  pages[0].page.sections.hero.links.push({ label: 'bad', href: '/interests#nope' });
  const errs = checkIntegrity(pages, envFor(pages));
  assert.ok(errs.some((e) => /unknown anchor "#nope" on \/interests/.test(e)));
});

test('malformed external link errors', () => {
  const pages = fixture();
  pages[0].page.sections.hero.links.push({ label: 'bad', href: 'example.com/foo' });
  const errs = checkIntegrity(pages, envFor(pages));
  assert.ok(errs.some((e) => /malformed external link: example\.com\/foo/.test(e)));
});

test('collectAnchors merges content ids + EXTRA_ANCHORS', () => {
  const anchors = collectAnchors(fixture(), EXTRA_ANCHORS);
  const interests = anchors.get('/interests');
  assert.ok(interests.has('exploration')); // card id from content
  assert.ok(interests.has('interests'));   // section id from content
  assert.ok(interests.has('main'));        // '*' JSX extra
  assert.equal(anchors.has(null), false);  // site (routeless) pages contribute no route
});

test('content ids do NOT create anchors on non-rendering routes', () => {
  const pages = fixture();
  pages.push({ name: 'portfolio', file: 'portfolio.md', page: pageOf({
    projects: blk({ id: 'projects', children: [blk({ id: 'cuyama-basin' })] }),
  }) });
  pages[0].page.sections.hero.links.push({ label: 'bad', href: '/portfolio#cuyama-basin' });
  const errs = checkIntegrity(pages, envFor(pages));
  assert.ok(errs.some((e) => /unknown anchor "#cuyama-basin" on \/portfolio/.test(e)));
});

test('mailto/tel links pass; fragment on a public file passes', () => {
  const pages = fixture();
  pages[0].page.sections.hero.links.push(
    { label: 'm', href: 'mailto:contact@devinhunt.com' },
    { label: 't', href: 'tel:+15555555555' },
    { label: 'pdf2', href: '/data/resume.pdf#page=2' },
  );
  assert.deepEqual(checkIntegrity(pages, envFor(pages)), []);
});

test('same-page #fragment validated against own route anchors', () => {
  const pages = fixture();
  pages[1].page.sections.interests.links = [
    { label: 'ok', href: '#exploration' },
    { label: 'bad', href: '#nope2' },
  ];
  const errs = checkIntegrity(pages, envFor(pages));
  assert.equal(errs.some((e) => /unknown same-page anchor #exploration/.test(e)), false);
  assert.ok(errs.some((e) => /unknown same-page anchor #nope2/.test(e)));
});

test('multi-# fragment, protocol-relative, and unknown page name all error', () => {
  const pages = fixture();
  pages[0].page.sections.hero.links.push(
    { label: 'mh', href: '/interests#exploration#x' },
    { label: 'pr', href: '//example.com/x' },
  );
  pages.push({ name: 'blog', file: 'blog.md', page: pageOf({ b: blk({ id: 'b' }) }) });
  const errs = checkIntegrity(pages, envFor(pages));
  assert.ok(errs.some((e) => /unknown anchor "#exploration#x"/.test(e)));
  assert.ok(errs.some((e) => /protocol-relative link/.test(e)));
  assert.ok(errs.some((e) => /page "blog" is not in ROUTE_BY_PAGE/.test(e)));
});
