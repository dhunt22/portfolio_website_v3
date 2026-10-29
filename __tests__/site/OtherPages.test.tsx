import { render, screen, within } from '@testing-library/react';
import InterestsPage from '@/app/(site)/interests/page';
import EejPage from '@/app/(site)/portfolio/environmental-justice-prisons/page';
import NotFound from '@/app/not-found';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));
jest.mock('@/components/portfolio/IndicatorBrowser', () => ({ IndicatorBrowser: () => <div data-testid="indicators" /> }));
jest.mock('next/navigation', () => ({ usePathname: () => '/missing' }));

test('Outdoors keeps every interest and photo', () => {
  const { container } = render(<InterestsPage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Outdoors' })).toBeInTheDocument();
  for (const id of ['exploration', 'fishing', 'bicycles', 'community', 'mycology', 'photography', 'gis']) {
    expect(container.querySelector(`#${id} h2`)).not.toBeNull();
  }
  expect(screen.getByAltText('A calm alpine lake at dusk near Winter Park, Colorado')).toBeInTheDocument();
  expect(container.querySelector('.panel, .italic, .eyebrow')).toBeNull();
  // Photos crop to 4:3; the Vacancy Fee screenshot shows whole, so its words are not cut.
  expect(screen.getByAltText('A calm alpine lake at dusk near Winter Park, Colorado')).toHaveClass('aspect-4/3');
  expect(screen.getByAltText('Vacancy Fee organization logo')).not.toHaveClass('aspect-4/3');
});

test('the EEJ page keeps its map and links', () => {
  render(<EejPage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Environmental Justice For Prisons' })).toBeInTheDocument();
  expect(screen.getByText('Geospatial analysis · NASA grant project · 2022 to 2023')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /GitHub repository/ })).toHaveAttribute('href', 'https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1');
  expect(screen.getByTestId('indicators')).toBeInTheDocument();
  // Bands keep the site's content width; nothing runs the full 1440px.
  for (const name of ['Project Overview', 'Project Team & My Contribution']) {
    expect(screen.getByRole('heading', { level: 2, name }).nextElementSibling).toHaveClass('max-w-304');
  }
});

test('the 404 sits in the site frame with ways back', () => {
  const { container } = render(<NotFound />);
  expect(container.querySelector('.site header')).not.toBeNull();
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  for (const [name, href] of [['Home', '/'], ['Portfolio', '/portfolio'], ['Résumé', '/resume'], ['Outdoors', '/interests']]) {
    expect(within(main).getByRole('link', { name })).toHaveAttribute('href', href);
  }
});
