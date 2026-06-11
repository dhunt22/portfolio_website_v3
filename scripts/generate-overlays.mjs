/**
 * Generates theme-aware contour-route + comet-ignition overlay SVGs for each watershed.
 *
 * Outputs (committed to public/images/):
 *   american_river_overlay_light.svg
 *   american_river_overlay_dark.svg
 *   upper_folsom_overlay_light.svg
 *   upper_folsom_overlay_dark.svg
 *
 * Usage: node scripts/generate-overlays.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const WATERSHEDS = ['american_river', 'upper_folsom'];

const THEMES = {
  dark: {
    route: { stroke: '#cb9a59', opacity: 0.3 },                      // earth-400 = --border-contour dark
    comet: { headCore: '#d2dbe3', halo: '#91aabf', headPeak: 0.85 }, // river-200 / river-400
  },
  light: {
    route: { stroke: '#8f5732', opacity: 0.35 },                     // earth-700 ink on paper
    comet: { headCore: '#495f74', halo: '#738ea6', headPeak: 0.6 },  // river-700 / river-500
  },
};

const COMET = {
  headR: 5,
  tailRMax: 4.5,
  tailRMin: 2,
  tailN: 12,
  gapU: 3.5,
  minSpeed: 70,
  maxSpeed: 150,
  fadePeriod: 8,
};

// Parse every .pN rule: path data + pmove duration + begin delay.
const ruleRe =
  /\.p(\d+)\{offset-path:path\("([^"]*)"\);animation:pmove ([\d.]+)s linear ([\d.-]+)s infinite,pfade ([\d.]+)s ease-in-out ([\d.-]+)s infinite\}/g;

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

for (const watershed of WATERSHEDS) {
  const pulsesPath = path.join('public', 'images', `${watershed}_pulses.svg`);
  const raw = fs.readFileSync(pulsesPath, 'utf8');

  // Parse rules
  const parsed = [...raw.matchAll(ruleRe)].map((m) => ({
    i: Number(m[1]),
    d: m[2],
    dur: Number(m[3]),
    delay: Number(m[4]),
  }));

  if (parsed.length === 0) {
    // GUARD: show a sample of the style block for diagnosis
    const styleMatch = raw.match(/<style>([\s\S]{0,500})/);
    const sample = styleMatch ? styleMatch[1] : '(no <style> found)';
    throw new Error(
      `BLOCKED: No .pN rules found in ${pulsesPath}.\nStyle block sample:\n${sample}`
    );
  }

  // Parse routes (offset-path paths) for the route group
  const routes = [...raw.matchAll(/offset-path:path\("([^"]+)"\)/g)].map((m) => m[1]);

  if (parsed.length !== routes.length) {
    throw new Error(
      `Parsed ${parsed.length} rules but found ${routes.length} offset-path routes in ${pulsesPath}`
    );
  }

  // Clamp travel speed
  const tuned = parsed.map((r) => {
    const len = pathLength(r.d);
    const rawSpeed = len / r.dur;
    const speed = Math.min(COMET.maxSpeed, Math.max(COMET.minSpeed, rawSpeed));
    return { ...r, len, rawSpeed, speed, dur: len / speed };
  });

  const rawSpeedMin = Math.min(...tuned.map((r) => r.rawSpeed)).toFixed(0);
  const rawSpeedMax = Math.max(...tuned.map((r) => r.rawSpeed)).toFixed(0);
  const clampedMin = Math.min(...tuned.map((r) => r.speed)).toFixed(0);
  const clampedMax = Math.max(...tuned.map((r) => r.speed)).toFixed(0);

  for (const [themeName, theme] of Object.entries(THEMES)) {
    const { route: routeTheme, comet: cometTheme } = theme;

    // --- Style block ---
    const fadePeak = cometTheme.headPeak.toFixed(2);

    // Per-route pulse animation rules
    const perRouteRules = tuned
      .map((r) => {
        const fadeT = r.dur / Math.max(1, Math.round(r.dur / COMET.fadePeriod));
        const scatter = -(r.i * 3.83).toFixed(2);
        return `.p${r.i}{offset-path:path("${r.d}");animation:pmove ${r.dur.toFixed(2)}s linear ${scatter}s infinite,pfade ${fadeT.toFixed(4)}s ease-in-out ${scatter}s infinite}`;
      })
      .join('');

    const style =
      `@keyframes pmove{to{offset-distance:100%}}` +
      `@keyframes pfade{0%{opacity:0}14%{opacity:${fadePeak}}45%{opacity:${fadePeak}}62%{opacity:0}100%{opacity:0}}` +
      `@keyframes draft{to{stroke-dashoffset:0}}` +
      `.pulse{offset-rotate:0deg;offset-distance:0%;opacity:0;will-change:offset-distance,opacity}` +
      `.route{stroke:${routeTheme.stroke};stroke-opacity:${routeTheme.opacity};stroke-width:1.5;fill:none;stroke-dasharray:1;stroke-dashoffset:1;animation:draft 3s cubic-bezier(.25,.1,.25,1) forwards}` +
      perRouteRules;

    // --- Routes group ---
    const routesGroup = routes
      .map(
        (d, i) =>
          `  <path class="route" style="animation-delay:${(i * 0.18).toFixed(2)}s" pathLength="1" d="${d}"/>`
      )
      .join('\n');

    // --- Defs: radial gradients ---
    const defs =
      `<defs>` +
      `<radialGradient id="gh">` +
      `<stop offset="0" stop-color="${cometTheme.headCore}" stop-opacity="0.95"/>` +
      `<stop offset="0.35" stop-color="${cometTheme.halo}" stop-opacity="0.5"/>` +
      `<stop offset="1" stop-color="${cometTheme.halo}" stop-opacity="0"/>` +
      `</radialGradient>` +
      `<radialGradient id="gt">` +
      `<stop offset="0" stop-color="${cometTheme.halo}" stop-opacity="0.6"/>` +
      `<stop offset="1" stop-color="${cometTheme.halo}" stop-opacity="0"/>` +
      `</radialGradient>` +
      `</defs>`;

    // --- Comets group ---
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
        return `  ${head}${tail}`;
      })
      .join('\n');

    // --- Assemble SVG ---
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="100%" height="100%" preserveAspectRatio="xMidYMin meet">` +
      `<style>${style}</style>` +
      defs +
      `\n${routesGroup}\n` +
      `\n${cometSprites}\n` +
      `</svg>`;

    const outPath = path.join('public', 'images', `${watershed}_overlay_${themeName}.svg`);
    fs.writeFileSync(outPath, svg);

    const fileSizeKB = (Buffer.byteLength(svg, 'utf8') / 1024).toFixed(1);
    console.log(
      `[${watershed} / ${themeName}] routes: ${routes.length}, speed raw: ${rawSpeedMin}-${rawSpeedMax} u/s → clamped: ${clampedMin}-${clampedMax} u/s, size: ${fileSizeKB} KB → ${outPath}`
    );
  }
}

console.log('Done. 4 overlay SVGs written.');
