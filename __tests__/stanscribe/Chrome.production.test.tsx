import '@/test-utils/stanscribe-production';
import { render, screen, within } from '@testing-library/react';
import StanScribeLayout from '@/app/(stanscribe)/layout';
import StanScribeLightPage from '@/app/(stanscribe)/stanscribe-light/page';
import { TOOLS } from '@/lib/portfolio-data';

let pathname = '/';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));
jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/ui/HeroLoadIn', () => ({ HeroLoadIn: ({ children }: { children: unknown }) => children }));

const renderFrame = (at: string) => {
  pathname = at;
  render(<StanScribeLayout><p>content</p></StanScribeLayout>);
  return screen.getByRole('banner');
};

test('the header links to the subdomain, and to the portfolio on its own domain', () => {
  const header = renderFrame('/');
  expect(within(header).getByRole('link', { name: 'Stan Scribe' })).toHaveAttribute('href', 'https://stanscribe.devinhunt.com/');
  expect(within(header).getByRole('link', { name: 'Stan Scribe' })).toHaveAttribute('aria-current', 'page');
  const nav = within(header).getByRole('navigation', { name: 'Stan Scribe' });
  expect(within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
    ['Stan Scribe Light', 'https://stanscribe.devinhunt.com/light/'],
    ['Help', '#help'],
    ['Devin Hunt', 'https://devinhunt.com/'],
  ]);
});

test('on a Light legal page Help leads to Light’s Help section on the subdomain', () => {
  const header = renderFrame('/light/terms/');
  expect(within(header).getByRole('link', { name: 'Help' })).toHaveAttribute('href', 'https://stanscribe.devinhunt.com/light/#help');
  expect(header.querySelector('[aria-current]')).toBeNull();
});

test('the footer credits the maker on his own domain', () => {
  renderFrame('/');
  expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Devin Hunt' })).toHaveAttribute('href', 'https://devinhunt.com/');
});

test('the Light page links back to Stan Scribe and its story on the subdomain', () => {
  render(<StanScribeLightPage />);
  expect(screen.getByRole('link', { name: /See everything in Stan Scribe/ })).toHaveAttribute('href', 'https://stanscribe.devinhunt.com/');
  expect(screen.getByRole('link', { name: /Why I built Stan Scribe/ })).toHaveAttribute('href', 'https://stanscribe.devinhunt.com/#story');
});

test('the portfolio’s Stan Scribe entry leads to the subdomain', () => {
  expect(TOOLS.find((tool) => tool.id === 'stan-scribe')?.href).toBe('https://stanscribe.devinhunt.com/');
});
