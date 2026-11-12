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
jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));

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

  test('Help sits on a white band, where its fine print reads best', () => {
    // globals.css gives the even bands the lighter tone.
    const position = sectionsOf(renderPage()).findIndex((section) => section.id === 'help') + 1;
    expect(position).toBeGreaterThan(0);
    expect(position % 2).toBe(0);
  });

  test('ends on a white band, the tone the footer blends from', () => {
    expect(sectionsOf(renderPage()).length % 2).toBe(0);
  });
});

test('a legal page is one band, with no boxed sheet', async () => {
  const page = render(await ScribeLegal({ params: Promise.resolve({ page: 'privacy' }) })).container;
  expect(page.querySelector('.panel')).toBeNull();
  const sections = sectionsOf(page);
  expect(sections).toHaveLength(1);
  expect(sections[0].parentElement?.className).toMatch(/\bbands\b/);
  expect(sections[0].className).toMatch(/\bband-only\b/);
  // The band fills the window on a short page, so no contours show between it and the footer.
  expect(sections[0].className).toMatch(/\bmin-h-svh\b/);
  expect(sections[0].querySelector('h1')).not.toBeNull();
});

test('the footer closes the page on a band, so the contours do not come back under it', () => {
  const frame = render(<StanScribeLayout><p>content</p></StanScribeLayout>).container;
  expect(frame.querySelector('footer')?.className).toMatch(/\bband-foot\b/);
});

describe('the band rules in globals.css', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8');

  test('two tones take turns: the sheet’s colour and the page’s, which the palette test holds to 7:1', () => {
    expect(css).toMatch(/--band-a:\s*var\(--surface-card\)/);
    expect(css).toMatch(/--band-b:\s*var\(--surface-page\)/);
  });

  test('every band, the hero included, is solid behind the words and fades out toward the window’s edges', () => {
    expect(css).toMatch(/--band-solid:\s*72rem/);
    expect(css).toMatch(/--band-fade:\s*12rem/);
    expect(css).toMatch(/\.bands > section::before, \.band-foot::before \{[^}]*mask-image: linear-gradient\(to right, transparent/);
    expect(css).not.toMatch(/\.bands > section:first-of-type \{ background: none/);
  });

  test('each break is an 80px blend, the height the owner chose', () => {
    expect(css).toMatch(/--band-blend:\s*80px/);
  });
});
