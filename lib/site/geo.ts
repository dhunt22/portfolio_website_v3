// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/geo.ts
// Geometry shared by the project glyphs and the résumé map: one projection, point-in-polygon, fitting a
// shape into a box, and SVG path data.

export type LonLat = [number, number];
export type XY = [number, number];
export type Ring = LonLat[];
export type Polygon = Ring[];

export interface Geometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: unknown;
}

export interface Feature<P = Record<string, unknown>> {
  properties: P;
  geometry: Geometry;
}

/** Equirectangular, scaled for 37.5°N (mid-California). */
export const COS_LAT = Math.cos((37.5 * Math.PI) / 180);
export const project = ([lon, lat]: LonLat): XY => [lon * COS_LAT, -lat];
export const unproject = ([x, y]: XY): LonLat => [x / COS_LAT, -y];

export function polygonsOf(geometry: Geometry): Polygon[] {
  return (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) as Polygon[];
}

export function ringContains(ring: Ring, lon: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function featureAt<P>(features: Feature<P>[], lon: number, lat: number): Feature<P> | undefined {
  return features.find((f) =>
    polygonsOf(f.geometry).some(
      (poly) => ringContains(poly[0], lon, lat) && !poly.slice(1).some((hole) => ringContains(hole, lon, lat)),
    ),
  );
}

/** A transform fitting projected points into a w × h box with `pad` on every side, centred. */
export function fitTo(points: XY[], w: number, h: number, pad: number): (p: XY) => XY {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of points) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const s = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1));
  const ox = (w - (x1 - x0) * s) / 2;
  const oy = (h - (y1 - y0) * s) / 2;
  return ([x, y]) => [ox + (x - x0) * s, oy + (y - y0) * s];
}

/** SVG path data for polygons through `tx`, rounded to `digits`, with repeated points dropped. */
export function pathData(polygons: Polygon[], tx: (c: LonLat) => XY, digits = 1): string {
  const f = 10 ** digits;
  const r = (n: number) => Math.round(n * f) / f;
  return polygons
    .map((poly) =>
      poly
        .map((ring) => {
          const pts: string[] = [];
          for (const c of ring) {
            const [x, y] = tx(c);
            const s = `${r(x)},${r(y)}`;
            if (s !== pts[pts.length - 1]) pts.push(s);
          }
          return `M${pts.join('L')}Z`;
        })
        .join(''),
    )
    .join('');
}
