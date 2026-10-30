import { render } from '@testing-library/react';
import { Glyph } from '@/components/site/Glyph';
import { b118Features, contiguousPrisonPoints, huc8Features } from '@/lib/site/geodata';
import {
  boreholesGlyph, calibrationGlyph, captionsGlyph, householdsGlyph, meshGlyph, outlineGlyph, pointsGlyph,
  SPEAKER_COLOURS, wellsGlyph, type GlyphShape,
} from '@/lib/site/glyphs';

const absoluteNumbers = (s: GlyphShape) =>
  s.parts.flatMap((p) => (p.t === 'path' ? (p.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number) : p.t === 'circle' ? [p.cx, p.cy] : [p.x, p.y]));
const inside = (s: GlyphShape) => absoluteNumbers(s).every((n) => n >= 0 && n <= Math.max(s.w, s.h));

test('Cuyama Valley is one B118 outline inside the box', () => {
  const g = outlineGlyph(b118Features('cuyama_subbasin.geojson'));
  expect(g.parts).toHaveLength(1);
  expect(inside(g)).toBe(true);
});

test('Yuba draws North and South Yuba together', () => {
  expect(outlineGlyph(b118Features('yuba_subbasins.geojson')).parts).toHaveLength(2);
});

test('the statewide glyph draws every California watershed, thinly', () => {
  const g = outlineGlyph(huc8Features(), { dense: true });
  expect(g.parts).toHaveLength(140);
  expect(g.dense).toBe(true);
});

test('one dot per prison in the contiguous United States', () => {
  const pts = contiguousPrisonPoints();
  expect(pts).toHaveLength(1838);
  const g = pointsGlyph(pts);
  expect(g.parts).toHaveLength(1838);
  expect(inside(g)).toBe(true);
});

test('the model mesh and its variants', () => {
  const plain = meshGlyph('plain');
  expect(plain.parts).toHaveLength(19);
  expect(new Set(plain.parts.map((p) => p.tone))).toEqual(new Set(['fill']));
  expect(new Set(meshGlyph('zoned').parts.map((p) => p.tone))).toEqual(new Set(['fill', 'zone', 'strong']));
  expect(new Set(meshGlyph('subset').parts.map((p) => p.tone))).toEqual(new Set(['strong', 'ghost']));
  expect(inside(plain)).toBe(true);
});

test('drawn subjects stay inside the box', () => {
  for (const g of [calibrationGlyph(), boreholesGlyph(), householdsGlyph(), captionsGlyph()]) expect(inside(g)).toBe(true);
  expect(wellsGlyph().parts.filter((p) => p.t === 'circle')).toHaveLength(6);
});

test('captions use the speaker colours', () => {
  const colours = captionsGlyph().parts.flatMap((p) => (p.t === 'circle' && p.color ? [p.color] : []));
  expect(colours).toEqual([...SPEAKER_COLOURS]);
});

test('<Glyph> draws one element per part, hidden from assistive tech', () => {
  const { container } = render(<Glyph shape={meshGlyph('zoned')} />);
  const svg = container.querySelector('svg')!;
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).toHaveClass('glyph');
  expect(svg.querySelectorAll('path')).toHaveLength(19);
  expect(svg.querySelector('.g-zone')).not.toBeNull();
});
