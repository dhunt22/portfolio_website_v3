import { render, screen, within } from '@testing-library/react';
import Home from '@/app/(site)/page';
import { LeadProject } from '@/components/site/Highlights';
import { prisonsFigure, highlightEntries } from '@/lib/site/work';
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

test('the lead names the project, then its meta: no label above the heading', () => {
  render(<Home />);
  const name = screen.getByRole('heading', { level: 3, name: 'Environmental Justice For Prisons' });
  expect(name.previousElementSibling).toBeNull();
  expect(name.nextElementSibling).toHaveTextContent('United States · 2022 to 2023');
});

test('a lead without meta renders no empty line', () => {
  const [lead] = highlightEntries();
  const { container } = render(<LeadProject entry={{ ...lead, meta: '' }} figure={prisonsFigure()} description="Each dot is a prison." />);
  expect([...container.querySelectorAll('p')].filter((p) => !p.textContent?.trim())).toHaveLength(0);
});

test('standalone links set the body size, not the browser default', () => {
  render(<Home />);
  expect(screen.getByRole('link', { name: /Explore the map/ })).toHaveClass('text-site-body');
});

test('the hero is set left in the frame, its actions too', () => {
  render(<Home />);
  const hero = screen.getByRole('heading', { level: 1, name: 'Devin Hunt' }).closest('section')!;
  expect(hero).toHaveClass('text-left', 'justify-items-start', 'px-frame');
  expect(hero.querySelector('.justify-center')).toBeNull();
});

test('the four highlights draw their glyphs half again the portfolio size', () => {
  const { container } = render(<Home />);
  const glyphs = container.querySelectorAll('.glyph-host svg');
  expect(glyphs).toHaveLength(4);
  for (const g of Array.from(glyphs)) expect(g).toHaveClass('h-[78px]', 'w-[78px]', 'min-[861px]:h-[108px]', 'min-[861px]:w-[108px]');
});
