import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import StanScribeLayout from '@/app/(stanscribe)/layout';
import ScribeLegal from '@/app/(stanscribe)/stanscribe/[page]/page';
import StanScribeLightPage from '@/app/(stanscribe)/stanscribe-light/page';
import StanScribePage from '@/app/(stanscribe)/stanscribe/page';

jest.mock('next/navigation', () => ({ usePathname: () => '/stanscribe' }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const sectionsOf = (page: HTMLElement) => Array.from(page.querySelectorAll('section'));

describe.each([
  ['Stan Scribe', StanScribePage],
  ['Stan Scribe Light', StanScribeLightPage],
] as const)('%s', (_name, Page) => {
  const renderPage = () => render(<Page />).container;

  test('has no boxed sheet: every section is a band, edge to edge', () => {
    const page = renderPage();
    expect(page.querySelector('.panel')).toBeNull();
    const bands = page.querySelector('.bands')!;
    for (const section of sectionsOf(page)) expect(section.parentElement).toBe(bands);
    // A gutter on the page's wrapper would bring the contour margin back.
    for (let el = bands.parentElement; el && el !== page; el = el.parentElement) expect(el.className).not.toMatch(/\bpx-|\bmx-auto\b|\bmax-w-/);
  });

  test('opens on the hero, over the contours, and keeps each band’s words in one centred column', () => {
    const sections = sectionsOf(renderPage());
    expect(sections[0].querySelector('h1')).not.toBeNull();
    for (const section of sections) {
      expect(section.children).toHaveLength(1);
      expect(section.firstElementChild?.className).toMatch(/\bmx-auto\b/);
      expect(section.firstElementChild?.className).toMatch(/\bmax-w-5xl\b/);
    }
  });
});

test('a legal page is a title on the contours, then the card, as the portfolio and the app pages are', async () => {
  const page = render(await ScribeLegal({ params: Promise.resolve({ page: 'privacy' }) })).container;
  expect(page.querySelector('.panel')).toBeNull();
  const [hero, card, ...rest] = sectionsOf(page);
  expect(rest).toHaveLength(0);
  expect(hero.parentElement?.className).toMatch(/\bbands\b/);
  expect(card.parentElement).toBe(hero.parentElement);
  // The first section of .bands has no fill: the title and the line under it sit on the contours.
  expect(hero.querySelector('h1')?.textContent).toBe('Privacy Policy');
  expect(hero.textContent).toMatch(/^Privacy Policy\s*Effective /);
  expect(hero.querySelectorAll('p')).toHaveLength(1);
  // The second section is the card. It fills the window on a short page, so no contours show between it and
  // the footer.
  expect(card.className).toMatch(/\bmin-h-svh\b/);
  expect(card.querySelector('h1')).toBeNull();
  expect(card.textContent).toMatch(/The short version/);
  expect(page.querySelector('.band-only')).toBeNull();
  for (const section of [hero, card]) {
    expect(section.children).toHaveLength(1);
    expect(section.firstElementChild?.className).toMatch(/\bmax-w-5xl\b/);
  }
});

test('the footer closes the page on a band, so the contours do not come back under it', () => {
  const frame = render(<StanScribeLayout><p>content</p></StanScribeLayout>).container;
  expect(frame.querySelector('footer')?.className).toMatch(/\bband-foot\b/);
});

describe('the band rules in globals.css', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  // Every rule whose selector names .bands or .band-foot (the portfolio's .site .band is not one).
  const bandRules = (css.match(/[^{}]*\.band(?:s|-foot)[^{}]*\{[^}]*\}/g) ?? []).join('\n');

  test('one tone: the page ground, slightly see-through, at the portfolio band’s strengths', () => {
    expect(bandRules).toMatch(/\.bands, \.band-foot \{ --band: color-mix\(in srgb, var\(--surface-page\) 92%, transparent\); \}/);
    expect(bandRules).toMatch(/\.dark \.bands, \.dark \.band-foot \{ --band: color-mix\(in srgb, var\(--surface-page\) 90%, transparent\); \}/);
    expect(bandRules).not.toMatch(/surface-card/);
  });

  test('each band is one flat fill: no gradient, no mask, no pseudo-element layer, no stacking context', () => {
    expect(bandRules).toMatch(/\.bands > section, \.band-foot \{ background: var\(--band\); \}/);
    expect(bandRules).not.toMatch(/gradient/);
    expect(bandRules).not.toMatch(/mask-image/);
    expect(bandRules).not.toMatch(/::before/);
    expect(bandRules).not.toMatch(/isolation/);
    expect(bandRules).not.toMatch(/--band-/);
  });

  test('the hero has no fill, so the card under it starts at a hard edge, as the portfolio’s band does', () => {
    expect(bandRules).toMatch(/\.bands > section:first-of-type \{ background: none; \}/);
    expect(bandRules).not.toMatch(/nth-of-type/);
  });

  test('no page is a single band any more: the legal pages have a hero too', () => {
    expect(css).not.toMatch(/band-only/);
  });
});
