import { render, screen, within } from '@testing-library/react';
import Home from '@/app/page';
import { SHOTS } from '@/lib/stanscribe';

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
