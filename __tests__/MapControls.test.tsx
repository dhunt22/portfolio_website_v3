// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// __tests__/MapControls.test.tsx
//
// Covers the mobile collapsing percentile disclosure added to MapControls.
// Imports ONLY the presentational component (no maplibre-gl) — usePrisonMap is
// pulled in as a type-only import there, so nothing bootstraps WebGL in jsdom.
//
// jsdom applies no CSS, so the `hidden sm:flex` / `sm:hidden` responsive split
// does not actually hide nodes: BOTH the desktop inline segment and the mobile
// disclosure render. Tests therefore disambiguate by role — the mobile stack is
// the only role="group" named "Percentile threshold"; the desktop segment is a
// plain aria-labelled div. The trigger is the only button whose name matches
// /currently/.

import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import MapControls from '@/components/maps/MapControls';

function renderControls(overrides: Record<string, unknown> = {}) {
  const props = {
    projectId: 'prison-ej',
    selectedAttribute: 'final_risk_score_pcntl',
    setSelectedAttribute: jest.fn(),
    showCategoryPanel: false,
    setShowCategoryPanel: jest.fn(),
    percentileThreshold: 0,
    setPercentileThreshold: jest.fn(),
    facilityTypes: ['STATE', 'FEDERAL'],
    setFacilityTypes: jest.fn(),
    onResetView: jest.fn(),
    ...overrides,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const view = render(<MapControls {...(props as any)} />);
  return { ...view, props };
}

const trigger = () => screen.getByRole('button', { name: /percentile threshold, currently/i });
const queryStack = () => screen.queryByRole('group', { name: /percentile threshold/i });

test('renders nothing for a non-prison-ej project', () => {
  const { container } = renderControls({ projectId: 'other' });
  expect(container).toBeEmptyDOMElement();
});

test('mobile trigger is collapsed initially and opens the vertical stack', () => {
  renderControls();
  const t = trigger();
  expect(t).toHaveAttribute('aria-expanded', 'false');
  expect(queryStack()).not.toBeInTheDocument();

  act(() => {
    fireEvent.click(t);
  });

  expect(t).toHaveAttribute('aria-expanded', 'true');
  const stack = queryStack();
  expect(stack).toBeInTheDocument();
  const options = within(stack as HTMLElement).getAllByRole('button');
  expect(options.map((b) => b.textContent)).toEqual(['All', '≥50th', '≥75th', '≥95th']);
});

test('trigger label reflects the current selection', () => {
  renderControls({ percentileThreshold: 75 });
  expect(trigger()).toHaveAccessibleName(/currently ≥75th/i);
});

test('selecting an option drives the filter and collapses the menu', () => {
  const setPercentileThreshold = jest.fn();
  renderControls({ setPercentileThreshold });
  act(() => {
    fireEvent.click(trigger());
  });
  const stack = queryStack() as HTMLElement;
  act(() => {
    fireEvent.click(within(stack).getByRole('button', { name: '≥95th' }));
  });
  expect(setPercentileThreshold).toHaveBeenCalledWith(95);
  expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  expect(queryStack()).not.toBeInTheDocument();
});

test('the selected option carries aria-pressed in the stack', () => {
  renderControls({ percentileThreshold: 50 });
  act(() => {
    fireEvent.click(trigger());
  });
  const stack = queryStack() as HTMLElement;
  expect(within(stack).getByRole('button', { name: '≥50th' })).toHaveAttribute('aria-pressed', 'true');
  expect(within(stack).getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
});

test('an outside pointerdown collapses the menu', () => {
  renderControls();
  act(() => {
    fireEvent.click(trigger());
  });
  expect(queryStack()).toBeInTheDocument();
  act(() => {
    fireEvent.pointerDown(document.body);
  });
  expect(queryStack()).not.toBeInTheDocument();
  expect(trigger()).toHaveAttribute('aria-expanded', 'false');
});

test('a pointerdown inside the menu does NOT collapse it', () => {
  renderControls();
  act(() => {
    fireEvent.click(trigger());
  });
  const stack = queryStack() as HTMLElement;
  act(() => {
    fireEvent.pointerDown(within(stack).getByRole('button', { name: '≥75th' }));
  });
  expect(queryStack()).toBeInTheDocument();
});

test('Escape closes the menu and returns focus to the trigger', () => {
  renderControls();
  const t = trigger();
  act(() => {
    fireEvent.click(t);
  });
  expect(queryStack()).toBeInTheDocument();
  act(() => {
    fireEvent.keyDown(t, { key: 'Escape' });
  });
  expect(queryStack()).not.toBeInTheDocument();
  expect(document.activeElement).toBe(t);
});

test('desktop inline segment still renders and drives the filter (no regression)', () => {
  const setPercentileThreshold = jest.fn();
  renderControls({ setPercentileThreshold });
  // Menu closed → the only percentile option buttons present are the inline
  // segment's four (the stack is unmounted). Clicking ≥75th drives the filter.
  fireEvent.click(screen.getByRole('button', { name: '≥75th' }));
  expect(setPercentileThreshold).toHaveBeenCalledWith(75);
});

test('reset and facility toggles still render and fire their callbacks', () => {
  const onResetView = jest.fn();
  const setFacilityTypes = jest.fn();
  renderControls({ onResetView, setFacilityTypes });

  fireEvent.click(screen.getByRole('button', { name: /reset map view/i }));
  expect(onResetView).toHaveBeenCalled();

  // STATE is active by default; toggling it off should drop it from the set.
  fireEvent.click(screen.getByRole('button', { name: 'State' }));
  expect(setFacilityTypes).toHaveBeenCalledWith(['FEDERAL']);
});
