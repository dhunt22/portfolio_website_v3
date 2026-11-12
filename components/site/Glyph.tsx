// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/Glyph.tsx
// Draws a GlyphShape. Decorative: the entry beside it carries the meaning.

import type { GlyphShape, Part } from '@/lib/site/glyphs';
import { cn } from '@/lib/utils';

function draw(p: Part, key: number) {
  const className = `g-${p.tone}`;
  if (p.t === 'path') return <path key={key} className={className} d={p.d} />;
  if (p.t === 'circle') {
    return <circle key={key} className={className} cx={p.cx} cy={p.cy} r={p.r} style={p.color ? { fill: p.color } : undefined} />;
  }
  return <rect key={key} className={className} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} />;
}

export function Glyph({ shape, className }: { shape: GlyphShape; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${shape.w} ${shape.h}`}
      className={cn('glyph', shape.dense && 'glyph-dense', className)}
      aria-hidden="true"
      focusable="false"
    >
      {shape.parts.map(draw)}
    </svg>
  );
}
