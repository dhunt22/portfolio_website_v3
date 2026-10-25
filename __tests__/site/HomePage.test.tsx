import { render, screen, within } from '@testing-library/react';
import Home from '@/app/(site)/page';
import { findCopyViolations } from '@/test-utils/stanscribe';

jest.mock('@/components/ui/ContourBackdrop', () => ({ ContourBackdrop: () => null }));

test('the hero says who and what, with two ways in', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { level: 1, name: 'Devin Hunt' })).toBeInTheDocument();
  expect(screen.getByText(/I model California’s groundwater and turn the slow, manual parts of that work into tested Python and AI tools\./)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See the work' })).toHaveAttribute('href', '/portfolio');
  expect(screen.getByRole('link', { name: 'Résumé' })).toHaveAttribute('href', '/resume');
});

test('selected work: the lead, then four highlights in order', () => {
  render(<Home />);
  const section = screen.getByRole('heading', { level: 2, name: 'Selected work' }).closest('section')!;
  expect(within(section).getByRole('heading', { level: 3, name: 'Environmental Justice For Prisons' })).toBeInTheDocument();
  expect(within(section).getByRole('link', { name: /Explore the map/ })).toHaveAttribute('href', '/portfolio/environmental-justice-prisons');
  const items = within(section).getAllByRole('listitem');
  expect(items.map((li) => li.querySelector('.entry-name')?.firstChild?.textContent)).toEqual([
    'Yuba Subbasins Recharge Analysis', 'AIIWFM', 'ZBudget Dashboards', 'Stan Scribe',
  ]);
  expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/portfolio#yuba-recharge');
  expect(within(items[1]).getByRole('link')).toHaveAttribute('href', '/portfolio#aiiwfm');
  expect(within(items[2]).queryByRole('link')).toBeNull();
  expect(items[2]).toHaveTextContent('Coming soon');
  expect(within(items[3]).getByRole('link')).toHaveAttribute('href', '/stanscribe');
  expect(findCopyViolations(items[3].textContent ?? '')).toEqual([]);
});

test('no map, no expertise columns, no photos', () => {
  const { container } = render(<Home />);
  expect(screen.queryByRole('heading', { name: 'Professional Expertise' })).toBeNull();
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('path.basin')).toBeNull();
});
