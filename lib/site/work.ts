// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/work.ts
// Projects and tools as entries for the portfolio, the home highlights and the résumé map: each with its
// glyph and its readout. Server only: must not be imported from a client component (reads geometry through lib/site/geodata).

import { HIGHLIGHTS, PROJECTS, TOOLS, type GlyphSpec, type Project, type Tool } from '@/lib/portfolio-data';
import { featureAt } from '@/lib/site/geo';
import { b118Features, contiguousPrisonPoints, huc8Features } from '@/lib/site/geodata';
import {
  boreholesGlyph, calibrationGlyph, captionsGlyph, householdsGlyph, meshGlyph, outlineGlyph, pointsGlyph, wellsGlyph,
  type GlyphShape,
} from '@/lib/site/glyphs';
import { labelReading, placeReading, type Reading } from '@/lib/site/reading';

export interface WorkEntry {
  id: string;
  name: string;
  meta: string;
  summary: string;
  glyph: GlyphShape;
  reading: Reading;
  categories: string[];
  content: string[];
  links: { href: string; label: string }[];
  image?: { src: string; alt: string; caption?: string };
  href?: string;
  soon?: boolean;
}

export function formatYears(year?: string): string {
  if (!year) return '';
  return year.replace(/-present$/i, ' to present').replace(/^(\d{4})-(\d{4})$/, '$1 to $2');
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
/** "SACRAMENTO VALLEY - NORTH YUBA" → "North Yuba". */
const subbasinName = (name: string) => titleCase(name.includes(' - ') ? name.split(' - ').pop()! : name);

function watershedAt(location: { lat: number; lon: number }) {
  const f = featureAt(huc8Features(), location.lon, location.lat);
  if (!f) throw new Error(`No HUC8 watershed at ${location.lat}, ${location.lon}`);
  return f;
}

export function glyphFor(spec: GlyphSpec, location?: { lat: number; lon: number }): GlyphShape {
  switch (spec.kind) {
    case 'subbasin': return outlineGlyph(b118Features(spec.file));
    case 'watershed':
      if (!location) throw new Error('A watershed glyph needs a location');
      return outlineGlyph([watershedAt(location)]);
    case 'statewide': return outlineGlyph(huc8Features(), { dense: true });
    case 'prisons': return pointsGlyph(contiguousPrisonPoints());
    case 'mesh': return meshGlyph(spec.variant);
    case 'calibration': return calibrationGlyph();
    case 'captions': return captionsGlyph();
    case 'boreholes': return boreholesGlyph();
    case 'wells': return wellsGlyph();
    case 'households': return householdsGlyph();
  }
}

function projectReading(p: Project): Reading {
  if (p.glyph.kind === 'subbasin' && p.location) {
    const subbasins = b118Features(p.glyph.file);
    return placeReading({
      ...p.location,
      kind: 'subbasin',
      name: subbasins.map((f) => subbasinName(f.properties.Basin_Subbasin_Name)).join(' and '),
      code: subbasins.map((f) => f.properties.Basin_Subbasin_Number).join(', '),
    });
  }
  if (p.location) {
    const f = watershedAt(p.location);
    return placeReading({ ...p.location, kind: 'watershed', name: f.properties.Name, code: f.properties.HUC8 });
  }
  return labelReading(p.readout?.label ?? 'Project', p.readout?.value ?? p.title);
}

function projectEntry(p: Project): WorkEntry {
  const internal = p.links?.find((l) => l.href.startsWith('/'));
  return {
    id: p.id,
    name: p.title,
    meta: [p.place, formatYears(p.year)].filter(Boolean).join(' · '),
    summary: p.summary,
    glyph: glyphFor(p.glyph, p.location),
    reading: projectReading(p),
    categories: p.categories.filter((c) => c !== 'all'),
    content: p.content,
    links: (p.links ?? []).filter((l) => !l.href.startsWith('/')).map(({ href, label }) => ({ href, label })),
    image: p.displayType === 'image' && p.imagePath ? { src: p.imagePath, alt: p.imageAlt ?? '', caption: p.imageCaption } : undefined,
    href: internal?.href,
  };
}

function toolEntry(t: Tool): WorkEntry {
  return {
    id: t.id,
    name: t.title,
    meta: t.meta,
    summary: t.summary,
    glyph: glyphFor(t.glyph),
    reading: labelReading(t.readout.label, t.readout.value),
    categories: [],
    content: t.content,
    links: [],
    href: t.href,
    soon: t.soon,
  };
}

export const projectEntries = (): WorkEntry[] => PROJECTS.map(projectEntry);
export const toolEntries = (): WorkEntry[] => TOOLS.map(toolEntry);

/** The home page's Selected work. Entries without their own page open on the portfolio. */
export function highlightEntries(): WorkEntry[] {
  const all = [...projectEntries(), ...toolEntries()];
  return HIGHLIGHTS.map((id) => {
    const entry = all.find((e) => e.id === id);
    if (!entry) throw new Error(`Unknown highlight: ${id}`);
    return { ...entry, href: entry.soon ? undefined : entry.href ?? `/portfolio#${entry.id}` };
  });
}

/** The prisons drawn large for the home page's lead. */
export const prisonsFigure = (): GlyphShape => pointsGlyph(contiguousPrisonPoints(), { w: 640, h: 380, r: 1.5, pad: 6 });
