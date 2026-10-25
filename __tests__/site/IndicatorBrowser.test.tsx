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

test('a category selects its first indicator, and an indicator selects its category', () => {
  render(<IndicatorBrowser />);
  const categories = screen.getByRole('navigation', { name: 'Environmental risk indicator categories' });
  fireEvent.click(within(categories).getByRole('button', { name: 'Exposure' }));
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'ozone');
  expect(within(categories).getByRole('button', { name: 'Exposure' })).toHaveAttribute('aria-pressed', 'true');

  // Every indicator is reachable without scrolling sideways: the phone list holds all twelve.
  const list = screen.getByRole('group', { name: 'Select an indicator' });
  expect(within(list).getAllByRole('button')).toHaveLength(12);
  fireEvent.click(within(list).getByRole('button', { name: 'View Superfund Sites on map' }));
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'superfund');
  expect(within(categories).getByRole('button', { name: 'Proximity' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('heading', { level: 3, name: 'Superfund Sites' })).toBeInTheDocument();
});
