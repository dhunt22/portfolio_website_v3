// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/geodata.ts
// Reads the geometry in public/data. Server only: the pages are statically exported, so this runs at
// build time and the browser receives drawn glyphs, not GeoJSON.

import fs from 'node:fs';
import path from 'node:path';
import type { Feature, LonLat } from '@/lib/site/geo';

const cache = new Map<string, unknown>();

function read<T>(file: string): T {
  if (!cache.has(file)) {
    cache.set(file, JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', file), 'utf8')));
  }
  return cache.get(file) as T;
}

export type Huc8Props = { Name: string; HUC8: string };
export type B118Props = { Basin_Subbasin_Number: string; Basin_Subbasin_Name: string };

export const huc8Features = () => read<{ features: Feature<Huc8Props>[] }>('HUC8_CA_simple.geojson').features;

/** DWR Bulletin 118 subbasins, ordered by subbasin number. */
export const b118Features = (file: string) =>
  [...read<{ features: Feature<B118Props>[] }>(file).features].sort((a, b) =>
    a.properties.Basin_Subbasin_Number.localeCompare(b.properties.Basin_Subbasin_Number),
  );

/** The study's prisons in the contiguous United States (1,838 of the 1,865), for drawing. */
export function contiguousPrisonPoints(): LonLat[] {
  const { features } = read<{ features: { geometry: { type: string; coordinates: number[] } | null }[] }>(
    'nasa_eej_prisons_pts_pctl_simple.geojson',
  );
  return features
    .flatMap((f) => (f.geometry?.type === 'Point' ? [[f.geometry.coordinates[0], f.geometry.coordinates[1]] as LonLat] : []))
    .filter(([lon, lat]) => lon > -125 && lon < -66 && lat > 24 && lat < 50);
}
