/** @jest-environment node */
import { legalLinks, locate, pageHref, pageUrl, portfolioHref } from '@/lib/stanscribe';

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
    expect(legalLinks('scribe').map((l) => l.href)).toEqual(['/stanscribe/privacy/', '/stanscribe/terms/', '/stanscribe/acknowledgements/']);
    expect(portfolioHref()).toBe('/');
  });
});

describe('links in the production build', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_STANSCRIBE_SUBDOMAIN = 'true';
  });
  afterAll(() => {
    delete process.env.NEXT_PUBLIC_STANSCRIBE_SUBDOMAIN;
  });

  test('lead to the subdomain, and the way to the portfolio leaves it', () => {
    expect(pageHref('scribe')).toBe('https://stanscribe.devinhunt.com/');
    expect(pageHref('light')).toBe('https://stanscribe.devinhunt.com/light/');
    expect(legalLinks('light').map((l) => l.href)).toEqual([
      'https://stanscribe.devinhunt.com/light/privacy/',
      'https://stanscribe.devinhunt.com/light/terms/',
      'https://stanscribe.devinhunt.com/light/acknowledgements/',
    ]);
    expect(portfolioHref()).toBe('https://devinhunt.com/');
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
