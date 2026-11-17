// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// __tests__/ContourBackdrop.test.tsx
// The fixed contour plate and the veil over it must reach the bottom of the window on every phone.

import { render } from '@testing-library/react';
import { ContourBackdrop } from '@/components/ui/ContourBackdrop';

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({ matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn() }));
  global.fetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<svg><g/></svg>') } as unknown as Response);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// The phone pin (--backdrop-h) comes from screen.height. Should a browser report a screen shorter than the
// window, the large viewport height is the floor, so the contours never stop above the bottom edge. On iOS
// 100lvh never exceeds the pin, so the pin still holds the plate steady.
const HEIGHT = 'height: max(var(--backdrop-h, 0px), 100lvh)';

test('the plate is at least as tall as the window, whatever height the phone pin holds', () => {
  const { container } = render(<ContourBackdrop page="interests" />);
  expect(container.querySelector('[data-contour-plate]')?.getAttribute('style')).toContain(HEIGHT);
});

test('the quiet veil is the plate’s height, so no contour shows unveiled below it', () => {
  const { container } = render(<ContourBackdrop page="interests" quiet />);
  const veil = container.querySelector('.bg-background.fixed');
  expect(veil).not.toBeNull();
  expect(veil?.getAttribute('style')).toContain(HEIGHT);
});
