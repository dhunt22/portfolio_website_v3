// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/map.ts
// The résumé header map (DESIGN.md › Watershed map): California's HUC8 watersheds as SVG paths, the
// watersheds where the located projects sit, and their pins. Server only.

import { PROJECTS } from '@/lib/portfolio-data';
import { featureAt, pathData, polygonsOf, project, type XY } from '@/lib/site/geo';
import { huc8Features } from '@/lib/site/geodata';
import { HOME, HOME_BASE, type Reading } from '@/lib/site/reading';
import { formatYears, projectEntries } from '@/lib/site/work';

export interface MapBasin { huc: string; name: string; d: string; worked: boolean }

export type LabelSide = 'right' | 'left' | 'below';

export interface MapPin {
  id: string;
  name: string;
  label: string;
  place: string;
  years: string;
  x: number;
  y: number;
  labelSide: LabelSide;
  home?: boolean;
  huc?: string;
  reading: Reading;
}

/** Labels that would run into a neighbour or off the map go the other way. */
const LABEL_SIDE: Record<string, LabelSide> = { 'antelope-wells': 'left', 'harvest-water': 'below' };

export function resumeMap() {
  const features = huc8Features();
  const entries = projectEntries();
  const located = PROJECTS.filter((p) => p.location && p.place);
  const pins: MapPin[] = located.map((p) => {
    const { lat, lon } = p.location!;
    const [x, y] = project([lon, lat]);
    return {
      id: p.id,
      name: p.title,
      label: p.place!,
      place: p.place!,
      years: formatYears(p.year),
      x,
      y,
      labelSide: LABEL_SIDE[p.id] ?? 'right',
      huc: featureAt(features, lon, lat)?.properties.HUC8,
      reading: entries.find((e) => e.id === p.id)!.reading,
    };
  });
  const [hx, hy] = project([HOME.lon, HOME.lat]);
  pins.push({ id: 'home', name: 'Sacramento', label: 'Sacramento', place: 'Sacramento', years: '', x: hx, y: hy, labelSide: 'right', home: true, reading: HOME_BASE });

  const worked = new Set(pins.map((p) => p.huc).filter(Boolean));
  const basins: MapBasin[] = features.map((f) => ({
    huc: f.properties.HUC8,
    name: f.properties.Name,
    d: pathData(polygonsOf(f.geometry), project, 2),
    worked: worked.has(f.properties.HUC8),
  }));
  const [x0, y0]: XY = project([-124.6, 42.15]);
  const [x1, y1]: XY = project([-113.9, 32.4]);
  return { basins, pins, viewBox: [x0, y0, x1 - x0, y1 - y0] as [number, number, number, number] };
}
