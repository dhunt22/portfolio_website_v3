import { render, screen, within } from '@testing-library/react';
import Home from '@/app/(site)/page';
import { SHOTS } from '@/lib/stanscribe';
import { findCopyViolations, pageText } from '@/test-utils/stanscribe';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

test('the homepage features Stan Scribe above Professional Expertise', () => {
  render(<Home />);
  const heading = screen.getByRole('heading', { level: 2, name: 'Stan Scribe' });
  const panel = heading.closest('section')!;
  expect(within(panel).getByRole('link', { name: /Meet Stan Scribe/ })).toHaveAttribute('href', '/stanscribe');
  expect(within(panel).getByAltText(SHOTS.bothApps.alt)).toBeInTheDocument();
  const expertise = screen.getByRole('heading', { level: 2, name: 'Professional Expertise' });
  expect(heading.compareDocumentPosition(expertise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('the homepage panel tells the story and links to how it was built', () => {
  render(<Home />);
  const panel = screen.getByRole('heading', { level: 2, name: 'Stan Scribe' }).closest('section')!;
  expect(panel.textContent).toMatch(/My grandpa Stan is hard of hearing/);
  expect(panel.textContent).toMatch(/So I used AI to build one/);
  expect(within(panel).getByRole('link', { name: /How I built it/ })).toHaveAttribute('href', '/stanscribe#story');
  expect(findCopyViolations(pageText(panel))).toEqual([]);
});
