import { render, screen, within } from '@testing-library/react';
import StanScribePage, { metadata } from '@/app/stanscribe/page';
import { APPS } from '@/lib/stanscribe';
import { findCopyViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

// The backdrop fetches SVG and GSAP needs matchMedia; neither matters to the page's content.
jest.mock('@/lib/stanscribe', () => ({ ...jest.requireActual('@/lib/stanscribe'), RELEASED: false }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderPage = () => render(<StanScribePage />).container;

test('support email and both apps’ legal links (App Store Connect Support URL)', () => {
  const page = renderPage();
  expect(screen.getByRole('link', { name: 'stanscribe@devinhunt.com' })).toHaveAttribute('href', 'mailto:stanscribe@devinhunt.com');
  for (const { href } of [...APPS.scribe.legal, ...APPS.light.legal]) {
    expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
  }
});

test('the accuracy and consent lines are visible, not tucked away', () => {
  renderPage();
  const accuracy = screen.getByText(/they can be wrong/i);
  const consent = screen.getByRole('heading', { name: 'Ask before you caption people.' });
  expect(accuracy.closest('details')).toBeNull();
  expect(consent.closest('details')).toBeNull();
});

test('presents both apps, with Light at #light', () => {
  const page = renderPage();
  const light = page.querySelector<HTMLElement>('#light');
  expect(light).not.toBeNull();
  expect(within(light!).getByRole('heading', { level: 2, name: 'Stan Scribe Light' })).toBeInTheDocument();
  expect(within(light!).getByRole('table')).toBeInTheDocument();
  expect(screen.getAllByText('Coming soon to the App Store').length).toBeGreaterThanOrEqual(3);
  expect(screen.getByRole('link', { name: /public beta/i })).toHaveAttribute('href', APPS.scribe.betaUrl);
});

test('images have alt text and headings are in order', () => {
  const page = renderPage();
  const images = Array.from(page.querySelectorAll('img'));
  expect(images.length).toBeGreaterThanOrEqual(8);
  for (const img of Array.from(page.querySelectorAll('img:not([alt=""])'))) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  for (const img of Array.from(page.querySelectorAll('img[alt=""]'))) expect(img.closest('a[aria-label]')).not.toBeNull();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('words follow the brief, metadata included', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.title).toBe('Stan Scribe: live captions for every voice');
  expect(metadata.alternates?.canonical).toBe('https://devinhunt.com/stanscribe/');
});
