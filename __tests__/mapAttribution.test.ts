// The map's credit line. On a narrow map MapLibre folds it behind a button, then opens it the moment the
// control turns compact (AttributionControl._updateCompact). Here it starts closed.
// Jest cannot load maplibre-gl (it ships ES modules only), so a stand-in reproduces the control's classes.

import type { Map as MapLibreMap } from 'maplibre-gl';
import { startCompactAttributionClosed } from '@/lib/maps/attribution';

const standInMap = (width: number) => {
  const container = document.createElement('div');
  container.innerHTML =
    '<details class="maplibregl-ctrl maplibregl-ctrl-attrib"><summary class="maplibregl-ctrl-attrib-button"></summary><div class="maplibregl-ctrl-attrib-inner">Map data © OpenStreetMap contributors</div></details>';
  const credit = container.querySelector<HTMLElement>('.maplibregl-ctrl-attrib')!;
  // What MapLibre does when the control is added and on every resize.
  const updateCompact = (canvasWidth: number) => {
    credit.setAttribute('open', '');
    if (canvasWidth <= 640) {
      if (!credit.classList.contains('maplibregl-compact')) credit.classList.add('maplibregl-compact', 'maplibregl-compact-show');
    } else credit.classList.remove('maplibregl-compact', 'maplibregl-compact-show');
  };
  updateCompact(width);
  const listeners: (() => void)[] = [() => updateCompact(width)];
  const map = { getContainer: () => container, on: (_type: 'resize', listener: () => void) => void listeners.push(listener) };
  return {
    map: map as unknown as MapLibreMap,
    credit,
    resizeTo: (next: number) => {
      width = next;
      for (const listener of listeners) listener();
    },
  };
};

const isOpen = (credit: HTMLElement) => credit.classList.contains('maplibregl-compact-show');

test('the stand-in opens the credit on a narrow map, as MapLibre does', () => {
  expect(isOpen(standInMap(390).credit)).toBe(true);
});

test('on a narrow map the credit starts closed, behind its button, and still names OpenStreetMap', () => {
  const { map, credit } = standInMap(390);
  startCompactAttributionClosed(map);
  expect(credit.classList.contains('maplibregl-compact')).toBe(true);
  expect(isOpen(credit)).toBe(false);
  expect(credit.querySelector('summary')).not.toBeNull();
  expect(credit.textContent).toMatch(/OpenStreetMap contributors/);
});

test('a reader who opens the credit keeps it open when the map resizes', () => {
  const { map, credit, resizeTo } = standInMap(390);
  startCompactAttributionClosed(map);
  credit.classList.add('maplibregl-compact-show');
  resizeTo(402);
  expect(isOpen(credit)).toBe(true);
});

test('on a wide map the credit stays the plain line, and it closes if the map turns narrow', () => {
  const { map, credit, resizeTo } = standInMap(1200);
  startCompactAttributionClosed(map);
  expect(credit.classList.contains('maplibregl-compact')).toBe(false);
  expect(credit.hasAttribute('open')).toBe(true);
  resizeTo(390);
  expect(credit.classList.contains('maplibregl-compact')).toBe(true);
  expect(isOpen(credit)).toBe(false);
});

test('a map with no credit control is left alone', () => {
  const container = document.createElement('div');
  const on = jest.fn();
  startCompactAttributionClosed({ getContainer: () => container, on } as unknown as MapLibreMap);
  expect(on).not.toHaveBeenCalled();
});
