// Phase 0 style-exploration build: splices the production pulse-overlay SVG
// into the treatment templates. Templates stay editable; *.html are generated.
//
//   node style-explorations/build.js
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const pulsesPath = path.join(dir, '..', 'public', 'images', 'american_river_pulses.svg');

// Same prep the production component does: strip XML prolog, scale to width.
const raw = fs
  .readFileSync(pulsesPath, 'utf8')
  .replace(/^\s*<\?xml[^>]*\?>\s*/i, '')
  .replace(/<svg\b/i, '<svg style="width:100%;height:auto;display:block"');

// Treatment A: production pulses verbatim (forest-600 glow).
const pulseA = raw;

// Treatment B: glow recolored to river-400, slightly brighter for dark ground.
const pulseB = raw
  .replace(/#3d733f/g, '#38bdf8')
  .replace(/stop-opacity="0.55"/g, 'stop-opacity="0.65"')
  .replace(/stop-opacity="0.30"/g, 'stop-opacity="0.35"');

// Treatment C: reuse the 16 pulse routes as stroked index contours that
// draft themselves in (pathLength=1 normalizes dash animation per path).
const routes = [...raw.matchAll(/offset-path:path\("([^"]+)"\)/g)].map((m) => m[1]);
if (routes.length === 0) throw new Error('No offset-path routes found in pulses SVG');
const routesSvg =
  '<svg style="width:100%;height:auto;display:block" viewBox="0 0 1080 1920" aria-hidden="true">\n' +
  routes
    .map(
      (d, i) =>
        `  <path class="route" style="animation-delay:${(i * 0.18).toFixed(2)}s" pathLength="1" d="${d}"/>`
    )
    .join('\n') +
  '\n</svg>';

// ---- Treatment D: comet pulses ----
// Small bright head + fading tail. The tail is N follower sprites on the SAME
// offset-path, each delayed by the time the head takes to travel GAP_U map
// units — so the whole comet stays offset-distance + opacity (GPU-composited,
// no per-frame rasterization), same budget class as the production overlay.
const COMET = {
  headCore: '#d2dbe3', // river-200 — bright center of the head
  halo: '#91aabf',     // river-400 — DS dark --brand-data; head halo + tail
  headR: 5,            // head sprite radius, map units (bright core ~2-3u ≈ 1.5-2x line width)
  tailRMax: 4.5,       // follower radius at the head end of the tail
  tailRMin: 2,         // follower radius at the tip of the tail
  tailN: 12,           // followers per route
  gapU: 3.5,           // spacing between followers, map units (must overlap sprite cores)
  minSpeed: 70,        // map units / second — slow comets expose the follower beads
  maxSpeed: 150,
  fadePeriod: 8,       // target seconds per ignition cycle (Vercel-style appear/vanish)
};

// Parse every .pN rule: path data + pmove duration + begin delay.
const ruleRe =
  /\.p(\d+)\{offset-path:path\("([^"]*)"\);animation:pmove ([\d.]+)s linear ([\d.-]+)s infinite,pfade ([\d.]+)s ease-in-out ([\d.-]+)s infinite\}/g;
const parsed = [...raw.matchAll(ruleRe)].map((m) => ({
  i: Number(m[1]),
  d: m[2],
  dur: Number(m[3]),
  delay: Number(m[4]),
}));
if (parsed.length !== routes.length)
  throw new Error(`Parsed ${parsed.length} rules but found ${routes.length} routes`);

// Polyline path length (route data is all M/L segments).
function pathLength(d) {
  const pts = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
  let len = 0;
  for (let k = 1; k < pts.length; k++)
    len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  return len;
}

// Clamp travel speed: keep per-route variety, but re-derive durations from
// path length so no comet crawls (beading) or streaks.
const tuned = parsed.map((r) => {
  const len = pathLength(r.d);
  const rawSpeed = len / r.dur;
  const speed = Math.min(COMET.maxSpeed, Math.max(COMET.minSpeed, rawSpeed));
  return { ...r, len, rawSpeed, speed, dur: len / speed };
});
console.log(
  `comet speeds: raw ${Math.min(...tuned.map((r) => r.rawSpeed)).toFixed(0)}-${Math.max(...tuned.map((r) => r.rawSpeed)).toFixed(0)} u/s -> clamped ${Math.min(...tuned.map((r) => r.speed)).toFixed(0)}-${Math.max(...tuned.map((r) => r.speed)).toFixed(0)} u/s`
);

// Vercel-style ignition: the comet travels its route continuously but is only
// visible in short windows — fade in, run a stretch, fade out, dark gap. The
// fade period is locked to an exact integer divisor of the travel duration so
// the offset-distance wrap (100% -> 0%) always lands in a dark phase (no
// visible teleport). Per-route negative delays scatter ignition times; the
// SAME delay drives both animations so the lock holds.
const cometStyle =
  '@keyframes pmove{to{offset-distance:100%}}' +
  '@keyframes pfade{0%{opacity:0}14%{opacity:.85}45%{opacity:.85}62%{opacity:0}100%{opacity:0}}' +
  '.pulse{offset-rotate:0deg;offset-distance:0%;opacity:0;will-change:offset-distance,opacity}' +
  tuned
    .map((r) => {
      const fadeT = r.dur / Math.max(1, Math.round(r.dur / COMET.fadePeriod));
      const scatter = -(r.i * 3.83).toFixed(2);
      return `.p${r.i}{offset-path:path("${r.d}");animation:pmove ${r.dur.toFixed(2)}s linear ${scatter}s infinite,pfade ${fadeT.toFixed(4)}s ease-in-out ${scatter}s infinite}`;
    })
    .join('');

const cometSprites = tuned
  .map((r) => {
    const dt = COMET.gapU / r.speed; // seconds per gapU of travel
    const scatter = -(r.i * 3.83);
    const head = `<circle class="pulse p${r.i}" r="${COMET.headR}" fill="url(#gh)"/>`;
    const tail = Array.from({ length: COMET.tailN }, (_, k) => {
      const t = (k + 1) / COMET.tailN;
      const radius = (COMET.tailRMax - (COMET.tailRMax - COMET.tailRMin) * t).toFixed(2);
      const delay = (scatter + (k + 1) * dt).toFixed(3);
      const fade = (0.7 * Math.pow(1 - (k + 1) / (COMET.tailN + 1), 1.25)).toFixed(2);
      return `<circle class="pulse p${r.i}" r="${radius}" fill="url(#gt)" fill-opacity="${fade}" style="animation-delay:${delay}s"/>`;
    }).join('');
    return head + tail;
  })
  .join('\n  ');

const cometsSvg = `<svg style="width:100%;height:auto;display:block" viewBox="0 0 1080 1920" aria-hidden="true">
  <defs>
    <radialGradient id="gh"><stop offset="0" stop-color="${COMET.headCore}" stop-opacity="0.95"/><stop offset="0.35" stop-color="${COMET.halo}" stop-opacity="0.5"/><stop offset="1" stop-color="${COMET.halo}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gt"><stop offset="0" stop-color="${COMET.halo}" stop-opacity="0.6"/><stop offset="1" stop-color="${COMET.halo}" stop-opacity="0"/></radialGradient>
  </defs>
  <style>${cometStyle}</style>
  ${cometSprites}
</svg>`;

const jobs = [
  ['a-quad-sheet', { PULSE: pulseA }],
  ['b-night-hydrology', { PULSE: pulseB }],
  ['c-drafting-plate', { ROUTES: routesSvg }],
  ['d-night-drafting', { ROUTES: routesSvg, COMETS: cometsSvg }],
  ['e-color-contrast', { ROUTES: routesSvg }], // marker repeats once per scheme section
];

for (const [name, replacements] of jobs) {
  let html = fs.readFileSync(path.join(dir, `${name}.template.html`), 'utf8');
  for (const [token, content] of Object.entries(replacements)) {
    const marker = `<!--${token}-->`;
    if (!html.includes(marker)) throw new Error(`Marker ${marker} missing in ${name}`);
    html = html.split(marker).join(content);
  }
  fs.writeFileSync(path.join(dir, `${name}.html`), html);
  console.log(`built ${name}.html`);
}
