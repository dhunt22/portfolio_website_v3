'use client';

// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/site/WatershedMap.tsx
// The résumé header map (DESIGN.md › Watershed map). Pointing reports the coordinates and watershed in the
// readout; pins are buttons (Enter or Space selects) and the caption names the selected project. Pins and
// labels keep a fixed screen size at any map scale.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useReadout } from '@/components/site/Readout';
import { SITE_TYPE } from '@/components/site/type';
import { unproject } from '@/lib/site/geo';
import type { MapBasin, MapPin } from '@/lib/site/map';
import { formatLat, formatLon } from '@/lib/site/reading';
import { cn } from '@/lib/utils';

const LABEL = { right: [10, 5, 'start'], left: [-10, 5, 'end'], below: [8, 22, 'start'] } as const;

/**
 * The simplified basins leave hairline slivers between neighbours. A point in one is still in California,
 * so it takes the basin it borders: when basins lie `reach` px away on both sides (left and right, or above
 * and below), the first of them. Off the coast or past the state line one side is open, and it stays outside.
 */
export function basinAcross(x: number, y: number, hucAt: (x: number, y: number) => string | null, reach = 4): string | null {
  const [left, right, up, down] = [[-reach, 0], [reach, 0], [0, -reach], [0, reach]].map(([dx, dy]) => hucAt(x + dx, y + dy));
  if (left && right) return left;
  if (up && down) return up;
  return null;
}

export function WatershedMap({ basins, pins, viewBox }: { basins: MapBasin[]; pins: MapPin[]; viewBox: [number, number, number, number] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, clear } = useReadout();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Map units per screen pixel; jsdom has no layout, so it keeps a sane default there.
  const [unit, setUnit] = useState(0.016);
  const selected = pins.find((p) => p.id === selectedId);

  useEffect(() => {
    const svg = svgRef.current;
    const measure = () => {
      const m = typeof svg?.getScreenCTM === 'function' ? svg.getScreenCTM() : null;
      if (m && m.a) setUnit(1 / m.a);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const select = (pin: MapPin) => {
    setSelectedId(pin.id);
    show(pin.reading);
  };

  const onLeave = () => (selected ? show(selected.reading) : clear());

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const pinEl = (e.target as Element).closest?.('[data-pin]');
    const pin = pinEl && pins.find((p) => p.id === pinEl.getAttribute('data-pin'));
    if (pin) {
      show(pin.reading);
      return;
    }
    const m = svgRef.current?.getScreenCTM?.();
    if (!m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const [lon, lat] = unproject([pt.x, pt.y]);
    let huc = (e.target as Element).getAttribute?.('data-huc') ?? null;
    if (!huc && typeof document.elementFromPoint === 'function') {
      huc = basinAcross(e.clientX, e.clientY, (px, py) => document.elementFromPoint(px, py)?.getAttribute('data-huc') ?? null);
    }
    const basin = huc ? basins.find((b) => b.huc === huc) : undefined;
    show({
      fields: [
        { label: 'Lat', value: formatLat(lat) },
        { label: 'Lon', value: formatLon(lon) },
        { label: 'Watershed', value: basin ? basin.name : 'Outside California' },
        { label: 'HUC8', value: basin ? basin.huc : '—', wide: true },
      ],
      note: 'California watersheds · USGS HUC8',
    });
  };


  return (
    <figure className="m-0 print:hidden">
      <svg
        ref={svgRef}
        viewBox={viewBox.join(' ')}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Map of California's watersheds with the places Devin has worked"
        className="block aspect-[0.86] h-auto w-full min-[861px]:aspect-auto min-[861px]:h-[min(72svh,680px)]"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <g>
          {basins.map((b) => (
            <path key={b.huc} data-huc={b.huc} d={b.d} className={cn('basin', b.worked && 'basin-worked', selected?.huc === b.huc && 'basin-selected')} />
          ))}
        </g>
        <g>
          {pins.map((p) => {
            const [dx, dy, anchor] = LABEL[p.labelSide];
            const interactive = !p.home;
            return (
              <g
                key={p.id}
                data-pin={p.id}
                className={cn('pin', p.home && 'pin-home', selectedId === p.id && 'pin-selected')}
                {...(interactive && {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': `${p.name}, ${p.place}`,
                  'aria-pressed': selectedId === p.id,
                  onClick: () => select(p),
                  onFocus: () => show(p.reading),
                  onBlur: onLeave,
                  onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      select(p);
                    }
                  },
                })}
              >
                <circle cx={p.x} cy={p.y} r={5 * unit} />
                {/* The focus ring: 2px at 3px beyond the dot's 6px edge (DESIGN.md › Buttons and links). */}
                {interactive && <circle className="pin-ring" cx={p.x} cy={p.y} r={10 * unit} />}
                <text x={p.x + dx * unit} y={p.y + dy * unit} fontSize={15 * unit} textAnchor={anchor} style={{ strokeWidth: 4 * unit }}>
                  {p.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption aria-live="polite" className={cn(SITE_TYPE.label, 'mt-2 min-h-[3em]')}>
        {selected ? (
          <>
            <b className="font-semibold text-ink-strong">{selected.name}</b> · {selected.years} · {selected.place}
          </>
        ) : (
          'Choose a place to see the project there.'
        )}
      </figcaption>
    </figure>
  );
}
