/** @jest-environment node */
import { APPS, PORTFOLIO_HREF, locate, pageHref, pageUrl } from '@/lib/stanscribe';

type Lib = typeof import('@/lib/stanscribe');

/** lib/stanscribe as the production build sees it: netlify.toml sets the switch for that build only. */
const productionLib = (): Lib => {
  let lib: Lib | undefined;
  process.env.NEXT_PUBLIC_STANSCRIBE_SUBDOMAIN = 'true';
  jest.isolateModules(() => {
    lib = jest.requireActual<Lib>('@/lib/stanscribe');
  });
  delete process.env.NEXT_PUBLIC_STANSCRIBE_SUBDOMAIN;
  if (!lib) throw new Error('lib/stanscribe did not load');
  return lib;
};

describe('canonical URLs are on stanscribe.devinhunt.com', () => {
  test.each([
    ['scribe', undefined, 'https://stanscribe.devinhunt.com/'],
    ['scribe', 'privacy', 'https://stanscribe.devinhunt.com/privacy/'],
    ['light', undefined, 'https://stanscribe.devinhunt.com/light/'],
    ['light', 'terms', 'https://stanscribe.devinhunt.com/light/terms/'],
  ] as const)('%s %s', (app, legal, url) => {
    expect(pageUrl(app, legal)).toBe(url);
  });
});

describe('links outside the production build', () => {
  test('lead to the pages where this repo serves them, so localhost and deploy previews click through', () => {
    expect(pageHref('scribe')).toBe('/stanscribe');
    expect(pageHref('light')).toBe('/stanscribe-light');
    expect(pageHref('light', 'terms')).toBe('/stanscribe-light/terms/');
    expect(APPS.scribe.legal.map((l) => l.href)).toEqual(['/stanscribe/privacy/', '/stanscribe/terms/', '/stanscribe/acknowledgements/']);
    expect(PORTFOLIO_HREF).toBe('/');
  });
});

describe('links in the production build', () => {
  const lib = productionLib();

  test('lead to the subdomain, and the way to the portfolio leaves it', () => {
    expect(lib.pageHref('scribe')).toBe('https://stanscribe.devinhunt.com/');
    expect(lib.pageHref('light')).toBe('https://stanscribe.devinhunt.com/light/');
    expect(lib.APPS.light.legal.map((l) => l.href)).toEqual([
      'https://stanscribe.devinhunt.com/light/privacy/',
      'https://stanscribe.devinhunt.com/light/terms/',
      'https://stanscribe.devinhunt.com/light/acknowledgements/',
    ]);
    expect(lib.PORTFOLIO_HREF).toBe('https://devinhunt.com/');
  });
});

describe('locate reads a path in this repo and the same page on the subdomain alike', () => {
  test.each([
    ['/stanscribe', '/', 'scribe', true],
    ['/stanscribe/', '', 'scribe', true],
    ['/stanscribe/privacy', '/privacy', 'scribe', false],
    ['/stanscribe/privacy/', '/privacy/', 'scribe', false],
    ['/stanscribe-light', '/light', 'light', true],
    ['/stanscribe-light/', '/light/', 'light', true],
    ['/stanscribe-light/terms', '/light/terms', 'light', false],
  ] as const)('%s and %s', (inRepo, onSubdomain, app, main) => {
    expect(locate(inRepo)).toEqual({ app, main });
    expect(locate(onSubdomain)).toEqual({ app, main });
  });
});
