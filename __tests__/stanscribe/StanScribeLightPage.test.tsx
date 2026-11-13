import { render, screen, within } from '@testing-library/react';
import StanScribeLightPage, { metadata } from '@/app/(stanscribe)/stanscribe-light/page';
import { legalLinks } from '@/lib/stanscribe';
import { findCopyViolations, findTypeViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribeLightPage />).container;

test('Light’s Support URL: email and Light’s legal links', () => {
  const page = renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Stan Scribe Light' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of legalLinks('light')) expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
});

test('Help comes right after the hero, before the comparison', () => {
  const page = renderPage();
  const help = page.querySelector('#help')!;
  const compare = page.querySelector('#compare')!;
  expect(help.compareDocumentPosition(compare) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('links back to Stan Scribe; alt text and heading order', () => {
  const page = renderPage();
  expect(page.querySelector('a[href="/stanscribe"]')).not.toBeNull();
  expect(screen.getByRole('link', { name: /Why I built Stan Scribe/ })).toHaveAttribute('href', '/stanscribe#story');
  for (const img of Array.from(page.querySelectorAll('img:not([alt=""])'))) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  for (const img of Array.from(page.querySelectorAll('img[alt=""]'))) expect(img.closest('a[aria-label]')).not.toBeNull();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('one type scale: no mono, tracked caps or italics', () => {
  expect(findTypeViolations(renderPage())).toEqual([]);
});

test('words follow the brief, metadata included', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.alternates?.canonical).toBe('https://stanscribe.devinhunt.com/light/');
});

test('the hero says the name and offer once: the download line adds only the status', () => {
  renderPage();
  expect(screen.getAllByText('Stan Scribe Light', { selector: 'h1, p' })).toHaveLength(1);
  expect(screen.queryByText('Free. The simple edition.')).toBeNull();
  expect(screen.getByText('Coming soon to the App Store')).toBeInTheDocument();
});

test('the hero is the listing’s header: Light’s icon, its name, the tagline and one line', () => {
  const page = renderPage();
  const hero = page.querySelector('section')!;
  expect(hero.querySelector('span[aria-hidden="true"][style*="app-icon-light.png"]')).not.toBeNull();
  expect(within(hero).getByText('The simple edition. Free.')).toBeInTheDocument();
  expect(
    within(hero).getByText('The same live captions and speaker colors as Stan Scribe, made simpler: one speech model, a black or a white page, and a smaller download.'),
  ).toBeInTheDocument();
  expect(hero.querySelectorAll('p')).toHaveLength(3);
  expect(hero.className).toMatch(/\brelative\b/);
  expect(hero.className).toMatch(/\bz-10\b/);
});

test('the hang length is set once, on the card, and the picture and Help under it both read it', () => {
  const bands = renderPage().querySelector<HTMLElement>('.bands')!;
  expect(bands.style.getPropertyValue('--hang')).not.toBe('');
  const [hero, next] = Array.from(bands.querySelectorAll(':scope > section'));
  expect(hero.querySelector('img')!.getAttribute('style')).toMatch(/margin-bottom:\s*calc\(-1 \* var\(--hang\)\)/);
  expect(next.id).toBe('help');
  expect(next.className).toContain('pt-[calc(var(--hang)_+_3rem)]');
});

test('the comparison: one line, the table, and where to go if unsure', () => {
  const page = renderPage();
  const compare = page.querySelector<HTMLElement>('#compare')!;
  expect(compare.textContent).toMatch(/Both caption offline, with speaker colors and names, in 25 languages\. Neither has in-app purchases\./);
  expect(within(compare).getByRole('table')).toBeInTheDocument();
  expect(compare.textContent).toMatch(/Not sure\? Start with Light\./);
});

test('link previews name the site Stan Scribe', () => {
  expect(metadata.openGraph).toMatchObject({ siteName: 'Stan Scribe' });
});
