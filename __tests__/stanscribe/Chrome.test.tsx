import { render, screen, within } from '@testing-library/react';
import StanScribeLayout from '@/app/(stanscribe)/layout';
import { findCopyViolations, findTypeViolations, pageText } from '@/test-utils/stanscribe';

let pathname = '/stanscribe';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));

const renderFrame = () => render(<StanScribeLayout><p>content</p></StanScribeLayout>).container;

test('its own header: the name, the other edition, Help and the way to Devin Hunt, with no portfolio links', () => {
  pathname = '/stanscribe';
  renderFrame();
  const header = screen.getByRole('banner');
  expect(within(header).getByRole('link', { name: 'Stan Scribe' })).toHaveAttribute('href', '/stanscribe');
  expect(within(header).getByRole('link', { name: 'Stan Scribe' })).toHaveAttribute('aria-current', 'page');
  const nav = within(header).getByRole('navigation', { name: 'Stan Scribe' });
  expect(within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
    ['Stan Scribe Light', '/stanscribe-light'],
    ['Help', '#help'],
    ['Devin Hunt', '/'],
  ]);
  for (const href of ['/portfolio', '/resume', '/interests']) expect(header.querySelector(`a[href="${href}"]`)).toBeNull();
});

test('on the Light page, Light is the current page', () => {
  pathname = '/stanscribe-light';
  renderFrame();
  const header = screen.getByRole('banner');
  expect(within(header).getByRole('link', { name: 'Stan Scribe Light' })).toHaveAttribute('aria-current', 'page');
  expect(within(header).getByRole('link', { name: 'Stan Scribe' })).not.toHaveAttribute('aria-current');
});

test('the footer credits the maker, and the skip link leads to main', () => {
  const frame = renderFrame();
  expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Devin Hunt' })).toHaveAttribute('href', '/');
  expect(frame.querySelector('a')).toHaveAttribute('href', '#main');
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
});

test('the frame follows the type scale and the word rules', () => {
  const frame = renderFrame();
  expect(findTypeViolations(frame)).toEqual([]);
  expect(findCopyViolations(pageText(frame))).toEqual([]);
});
