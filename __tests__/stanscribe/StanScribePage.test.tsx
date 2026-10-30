import { render, screen, within } from '@testing-library/react';
import StanScribePage, { metadata } from '@/app/(stanscribe)/stanscribe/page';
import { APPS, LANGUAGES } from '@/lib/stanscribe';
import { findCopyViolations, findTypeViolations, headingLevels, pageText } from '@/test-utils/stanscribe';

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

test('seven sections, each said once, in order', () => {
  renderPage();
  expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
    'Built for my grandpa Stan',
    'How it works',
    'Made to be read across the table',
    'Private by design',
    'Which one is for you?',
    'Questions',
    'Help',
  ]);
});

test('presents both apps, with the comparison at #light', () => {
  const page = renderPage();
  const light = page.querySelector<HTMLElement>('#light')!;
  expect(within(light).getByRole('heading', { level: 2, name: 'Which one is for you?' })).toBeInTheDocument();
  expect(within(light).getByRole('table')).toBeInTheDocument();
  expect(light.textContent).toMatch(/Stan Scribe Light is the simple edition, and it’s free/);
  expect(screen.getAllByText('Coming soon to the App Store')).toHaveLength(2);
  expect(screen.getByRole('link', { name: /public beta/i })).toHaveAttribute('href', APPS.scribe.betaUrl);
});

test('images have alt text and headings are in order', () => {
  const page = renderPage();
  expect(page.querySelectorAll('img').length).toBeGreaterThanOrEqual(4);
  for (const img of Array.from(page.querySelectorAll('img:not([alt=""])'))) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
  for (const img of Array.from(page.querySelectorAll('img[alt=""]'))) expect(img.closest('a[aria-label]')).not.toBeNull();
  const levels = headingLevels(page);
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  levels.forEach((level, i) => {
    if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test('the story is told once: hard of hearing, a monthly fee, built with AI, AI for good', () => {
  const page = renderPage();
  const story = page.querySelector<HTMLElement>('#story')!;
  const text = story.textContent ?? '';
  expect(text).toMatch(/My grandpa Stan is hard of hearing/);
  expect(text).toMatch(/live captions app with my grandparents/);
  expect(text).toMatch(/charged a monthly fee/);
  expect(text).toMatch(/I used AI to help me build my own/);
  expect(text).toMatch(/Stan Scribe Light is free, and the full Stan Scribe is a one-time purchase with no subscription/);
  expect(text).toMatch(/keep using AI for good/);
  expect(page.querySelector('#behind-the-app')).toBeNull();
});

test('six features, the themes one saying why', () => {
  const page = renderPage();
  const features = page.querySelector<HTMLElement>('#features')!;
  expect(within(features).getAllByRole('heading', { level: 3 })).toHaveLength(6);
  expect(features.textContent).toMatch(/a pleasure to look at/);
});

test('four questions, one naming every caption language', () => {
  const page = renderPage();
  const questions = page.querySelector<HTMLElement>('#questions')!;
  expect(within(questions).getAllByRole('heading', { level: 3 })).toHaveLength(4);
  for (const language of LANGUAGES) expect(questions.textContent).toContain(language);
});

test('one type scale: no mono, tracked caps or italics', () => {
  expect(findTypeViolations(renderPage())).toEqual([]);
});

test('every in-page link has a target', () => {
  const page = renderPage();
  const anchors = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  expect(anchors.map((a) => a.getAttribute('href'))).toContain('#help');
  for (const a of anchors) expect(page.querySelector(a.getAttribute('href')!)).not.toBeNull();
});

test('words follow the brief, metadata included', () => {
  const page = renderPage();
  expect(findCopyViolations(`${pageText(page)} ${JSON.stringify(metadata)}`)).toEqual([]);
  expect(metadata.title).toBe('Stan Scribe: live captions for every voice');
  expect(metadata.alternates?.canonical).toBe('https://devinhunt.com/stanscribe/');
});
