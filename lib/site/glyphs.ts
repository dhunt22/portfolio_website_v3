// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/glyphs.ts
// Project glyphs (DESIGN.md › Glyphs): each project drawn in a 72 × 72 box from its own geometry, its own
// data, or a drawing of the thing it measured. Pure: the geometry is passed in.

import { fitTo, pathData, polygonsOf, project, type Feature, type LonLat, type XY } from '@/lib/site/geo';

export type Tone = 'fill' | 'zone' | 'strong' | 'line' | 'thin' | 'dot' | 'accent' | 'ghost';

export type Part =
  | { t: 'path'; d: string; tone: Tone }
  | { t: 'circle'; cx: number; cy: number; r: number; tone: Tone; color?: string }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number; tone: Tone };

export interface GlyphShape {
  w: number;
  h: number;
  parts: Part[];
  /** Many small outlines (the statewide glyph): drawn with thinner strokes. */
  dense?: boolean;
}

const BOX = 72;
const PAD = 6;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Outlines, fitted together: Bulletin 118 subbasins, a watershed, or every watershed in the state. */
export function outlineGlyph(features: Feature[], { dense = false } = {}): GlyphShape {
  const all: XY[] = features.flatMap((f) => polygonsOf(f.geometry).flatMap((poly) => poly[0].map(project)));
  const fit = fitTo(all, BOX, BOX, PAD);
  return {
    w: BOX,
    h: BOX,
    dense,
    parts: features.map((f) => ({ t: 'path' as const, d: pathData(polygonsOf(f.geometry), (c) => fit(project(c))), tone: 'fill' as const })),
  };
}

/** Points from a project's own data, one dot each. */
export function pointsGlyph(points: LonLat[], { w = BOX, h = BOX, r = 0.9, pad = 4 } = {}): GlyphShape {
  const xy = points.map(project);
  const fit = fitTo(xy, w, h, pad);
  return {
    w,
    h,
    parts: xy.map((p) => {
      const [cx, cy] = fit(p);
      return { t: 'circle' as const, cx: r1(cx), cy: r1(cy), r, tone: 'dot' as const };
    }),
  };
}

interface Cell { i: number; j: number; d: string }

/** IWFM's finite-element grid, drawn as an organic domain of quads. */
function meshCells(): Cell[] {
  const node = (i: number, j: number): XY => [
    10 + i * 10.4 + 2.6 * Math.sin(j * 0.9 + 1),
    10 + j * 10.4 + 2.6 * Math.sin(i * 0.8 + 0.5),
  ];
  const skip = new Set(['0,0', '4,0', '0,4', '4,4', '3,4', '4,3']);
  const cells: Cell[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (skip.has(`${i},${j}`)) continue;
      const q = [node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)];
      cells.push({ i, j, d: `M${q.map(([x, y]) => `${r1(x)},${r1(y)}`).join('L')}Z` });
    }
  }
  return cells;
}

export type MeshVariant = 'plain' | 'zoned' | 'subset';

/** The model family: the mesh (AIIWFM), in zones (ZBudget Dashboards), or with one region cut out for its own run (IWFM workflow suite). */
export function meshGlyph(variant: MeshVariant): GlyphShape {
  const tone = (c: Cell): Tone => {
    if (variant === 'zoned') return c.i < 2 ? 'fill' : c.j < 2 ? 'zone' : 'strong';
    if (variant === 'subset') return c.i >= 2 && c.j >= 1 && c.j <= 3 ? 'strong' : 'ghost';
    return 'fill';
  };
  return { w: BOX, h: BOX, parts: meshCells().map((c) => ({ t: 'path' as const, d: c.d, tone: tone(c) })) };
}

/** Calibration (PyPEST): simulated against observed, around the 1:1 line. */
export function calibrationGlyph(): GlyphShape {
  const pts: XY[] = [[14, 58], [19, 51], [24, 49], [27, 43], [31, 45], [33, 40], [37, 33], [41, 34], [44, 31], [46, 27], [50, 24], [55, 18], [58, 15]];
  return {
    w: BOX,
    h: BOX,
    parts: [
      { t: 'path', d: 'M8,8V64H64', tone: 'thin' },
      { t: 'path', d: 'M8,64L64,8', tone: 'line' },
      ...pts.map(([cx, cy]) => ({ t: 'circle' as const, cx, cy, r: 2.2, tone: 'dot' as const })),
    ],
  };
}

/** Stan Scribe's own speaker colours. */
export const SPEAKER_COLOURS = ['#2f7ed8', '#d9822b', '#2e9a68'] as const;

/** Live captions (Stan Scribe): three caption lines, each with its speaker's colour. */
export function captionsGlyph(): GlyphShape {
  const rows: [number, number][] = [[18, 44], [34, 32], [50, 40]];
  return {
    w: BOX,
    h: BOX,
    parts: rows.flatMap(([y, len], i) => [
      { t: 'circle' as const, cx: 13, cy: y, r: 4, tone: 'dot' as const, color: SPEAKER_COLOURS[i] },
      { t: 'rect' as const, x: 22, y: y - 4, w: len, h: 8, rx: 4, tone: 'fill' as const },
    ]),
  };
}

/** Infiltration: three boreholes, the layer that stops deep percolation marked in each. */
export function boreholesGlyph(): GlyphShape {
  const holes: [number, number][] = [[14, 30], [31, 36], [48, 33]];
  return {
    w: BOX,
    h: BOX,
    parts: [
      { t: 'path', d: 'M6,12H66', tone: 'line' },
      ...holes.flatMap(([x, band]) => [
        { t: 'rect' as const, x, y: 12, w: 10, h: 52, tone: 'fill' as const },
        { t: 'rect' as const, x, y: band, w: 10, h: 8, tone: 'strong' as const },
      ]),
    ],
  };
}

/** Groundwater conditions: six wells across groundwater contours, with the horizontal gradient. */
export function wellsGlyph(): GlyphShape {
  const wells: XY[] = [[16, 22], [40, 14], [58, 26], [22, 46], [46, 40], [36, 60]];
  return {
    w: BOX,
    h: BOX,
    parts: [
      { t: 'path', d: 'M6,30C24,22 44,24 66,14M6,46C26,38 46,40 66,30M6,62C28,54 48,56 66,46', tone: 'thin' },
      { t: 'path', d: 'M24,30L46,56M46,56L45,49M46,56L39,54', tone: 'line' },
      ...wells.map(([cx, cy]) => ({ t: 'circle' as const, cx, cy, r: 3.2, tone: 'accent' as const })),
    ],
  };
}

/** Seasonal population: households on a grid, the seasonal ones filled. */
export function householdsGlyph(): GlyphShape {
  const parts: Part[] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const seasonal = (i * 3 + j * 5) % 7 < 2;
      parts.push({ t: 'circle', cx: 12 + i * 8, cy: 12 + j * 8, r: seasonal ? 2.6 : 1.4, tone: seasonal ? 'accent' : 'dot' });
    }
  }
  return { w: BOX, h: BOX, parts };
}
