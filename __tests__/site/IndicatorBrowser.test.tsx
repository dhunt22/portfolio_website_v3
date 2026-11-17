// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// __tests__/site/IndicatorBrowser.test.tsx
// The EEJ indicator browser keeps its behaviour in the site's type roles: no tracked capitals, outlines or
// legacy faces inside .site (DESIGN.md › Typography, Shapes).

import { fireEvent, render, screen, within } from '@testing-library/react';
import { IndicatorBrowser } from '@/components/portfolio/IndicatorBrowser';

jest.mock('@/components/portfolio/LazyProjectMap', () => ({
  __esModule: true,
  default: ({ selectedComponent }: { selectedComponent: string }) => <div data-testid="map" data-selected={selectedComponent} />,
}));

const LEGACY = '.eyebrow, .link-quiet, .panel, .uppercase, .font-mono, .font-display, .font-sans, .rounded, .border, .border-t, .border-l-\\[3px\\], [class*="tracking-"], [class*="text-xs"], [class*="text-sm"]';

test('the browser uses the site type roles, with no tracked capitals or outlined boxes', () => {
  const { container } = render(<IndicatorBrowser />);
  expect(container.querySelector(LEGACY)).toBeNull();
  expect(container.querySelector('[class*="text-site-"]')).not.toBeNull();
});

const categories = () => screen.getByRole('navigation', { name: 'Environmental risk indicator categories' });
const phoneList = () => screen.getByRole('group', { name: 'Select an indicator' });
const names = (list: HTMLElement) => within(list).getAllByRole('button').map((button) => button.textContent);

test('a category selects its first indicator, and the rail picks one within it', () => {
  render(<IndicatorBrowser />);
  fireEvent.click(within(categories()).getByRole('button', { name: 'Exposure' }));
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'ozone');
  expect(within(categories()).getByRole('button', { name: 'Exposure' })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(within(screen.getByRole('list')).getByRole('button', { name: 'View Traffic Density on map' }));
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'traffic');
  expect(within(categories()).getByRole('button', { name: 'Exposure' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('heading', { level: 3, name: 'Traffic Density' })).toBeInTheDocument();
});

test('the categories are one row of tabs at every width, which wraps to a second row before it runs off a phone', () => {
  render(<IndicatorBrowser />);
  const tabs = within(categories()).getAllByRole('button');
  expect(tabs.map((tab) => tab.textContent)).toEqual(['Climate Risk', 'Exposure', 'Proximity', 'Overall']);
  expect(categories()).toHaveClass('flex', 'flex-wrap');
  expect(categories().className).not.toMatch(/\bhidden\b/);
  // A thumb-sized target on phones and tablets.
  for (const tab of tabs) expect(tab).toHaveClass('min-h-11');
});

test('on a phone a tab shows its own indicators and no other category’s', () => {
  render(<IndicatorBrowser />);
  // The list for phones and tablets gives way to the rail at lg.
  expect(phoneList()).toHaveClass('lg:hidden');
  expect(phoneList()).toHaveClass('flex-wrap');
  expect(names(phoneList())).toEqual(['Heat Index', 'Canopy Cover', 'Wildfire Risk', 'Flood Hazard']);
  expect(screen.getByRole('heading', { level: 3, name: 'Climate Risk Indicators' })).toBeInTheDocument();

  fireEvent.click(within(categories()).getByRole('button', { name: 'Proximity' }));
  expect(names(phoneList())).toEqual(['Superfund Sites', 'Risk Management Plan Facilities', 'Hazardous Waste Sites']);
  expect(screen.getByRole('heading', { level: 3, name: 'Proximity-Based Indicators' })).toBeInTheDocument();
  expect(within(phoneList()).getByRole('button', { name: 'View Superfund Sites on map' })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(within(phoneList()).getByRole('button', { name: 'View Hazardous Waste Sites on map' }));
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'hazwaste');
  expect(within(categories()).getByRole('button', { name: 'Proximity' })).toHaveAttribute('aria-pressed', 'true');
  for (const chip of within(phoneList()).getAllByRole('button')) expect(chip).toHaveClass('min-h-11');
});

test('the phone list never repeats a category’s name as a label among the indicators', () => {
  render(<IndicatorBrowser />);
  expect(within(phoneList()).queryByText('Climate Risk')).toBeNull();
  expect(phoneList().querySelectorAll('span')).toHaveLength(0);
});

test('the map frame is its own stacking context, so its controls never ride over the readout strip', () => {
  render(<IndicatorBrowser />);
  expect(screen.getByTestId('map').parentElement).toHaveClass('isolate');
});

test('above the map the selected indicator is named once, by its pressed button, not by a second title', () => {
  render(<IndicatorBrowser />);
  expect(screen.getByTestId('map').parentElement?.previousElementSibling).toBeNull();
});
