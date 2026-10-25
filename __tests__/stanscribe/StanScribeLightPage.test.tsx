import { render, screen } from '@testing-library/react';
import StanScribeLightPage, { metadata } from '@/app/stanscribe-light/page';
import { APPS } from '@/lib/stanscribe';
import { findCopyViolations, findTypeViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribeLightPage />).container;

test('Light’s Support URL: email and Light’s legal links', () => {
  const page = renderPage();
  expect(screen.getByRole('heading', { level: 1, name: 'Stan Scribe Light' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of APPS.light.legal) expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
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
  expect(metadata.alternates?.canonical).toBe('https://devinhunt.com/stanscribe-light/');
});
