// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/reading.ts
// What the readout strip says (DESIGN.md › Readout strip): label/value fields, an optional note on the
// right, and builders for the page plates, places and plain labels.

export interface ReadingField {
  label: string;
  value: string;
  /** Hidden on phones (≤860px). */
  wide?: boolean;
}

export interface Reading {
  fields: ReadingField[];
  note?: string;
}

export const formatLat = (v: number) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'N' : 'S'}`;
export const formatLon = (v: number) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'E' : 'W'}`;

export interface Place {
  lat: number;
  lon: number;
  kind: 'subbasin' | 'watershed';
  name: string;
  code: string;
}

export function placeReading(p: Place): Reading {
  const subbasin = p.kind === 'subbasin';
  return {
    fields: [
      { label: 'Lat', value: formatLat(p.lat) },
      { label: 'Lon', value: formatLon(p.lon) },
      { label: subbasin ? 'Subbasin' : 'Watershed', value: p.name },
      { label: subbasin ? 'B118' : 'HUC8', value: p.code, wide: true },
    ],
    note: subbasin ? 'DWR Bulletin 118 groundwater subbasins' : 'California watersheds · USGS HUC8',
  };
}

export const labelReading = (label: string, value: string): Reading => ({ fields: [{ label, value }] });

/** The terrain each page's contour plate shows (scripts/build-plates.mjs). Coordinates are approximate. */
export const PLATES = {
  home: { place: 'Big Sur, California', lat: 36.27, lon: -121.81 },
  portfolio: { place: 'Grand Canyon, Arizona', lat: 36.06, lon: -112.14 },
  ej: { place: 'Great Smoky Mountains, Tennessee', lat: 35.61, lon: -83.49 },
  interests: { place: 'Badlands, South Dakota', lat: 43.86, lon: -102.34 },
  notFound: { place: 'Santorini, Greece', lat: 36.39, lon: 25.46 },
} as const;

export function plateReading(page: keyof typeof PLATES): Reading {
  const p = PLATES[page];
  return {
    fields: [
      { label: 'Plate', value: p.place },
      { label: 'Lat', value: formatLat(p.lat), wide: true },
      { label: 'Lon', value: formatLon(p.lon), wide: true },
    ],
    note: 'Contours drawn by Devin Hunt',
  };
}

/** Approximate centre of Sacramento. */
export const HOME = { lat: 38.58, lon: -121.49 };

/** The résumé's resting reading. */
export const HOME_BASE: Reading = {
  fields: [
    { label: 'Home base', value: 'Sacramento, California' },
    { label: 'Lat', value: formatLat(HOME.lat), wide: true },
    { label: 'Lon', value: formatLon(HOME.lon), wide: true },
  ],
  note: 'California watersheds · USGS HUC8',
};
