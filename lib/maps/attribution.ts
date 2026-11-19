// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/maps/attribution.ts
import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * On a map 640px wide or less, MapLibre folds its credit line behind a button, then opens it the moment the
 * control turns compact. Here the credit starts closed, and the button opens it. A wide map keeps the plain
 * one-line credit. Call this after the attribution control is added.
 */
export const startCompactAttributionClosed = (map: Pick<MapLibreMap, 'getContainer' | 'on'>) => {
  const credit = map.getContainer().querySelector('.maplibregl-ctrl-attrib');
  if (!credit) return;
  let wasCompact = false;
  const closeIfNewlyCompact = () => {
    const compact = credit.classList.contains('maplibregl-compact');
    if (compact && !wasCompact) credit.classList.remove('maplibregl-compact-show');
    wasCompact = compact;
  };
  closeIfNewlyCompact();
  // Registered after the control's own resize listener, so it runs after MapLibre has set the classes.
  map.on('resize', closeIfNewlyCompact);
};
