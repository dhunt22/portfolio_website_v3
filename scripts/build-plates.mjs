/**
 * Backdrop engine v2 — build per-page fixed landscape contour plates.
 *
 * For each (page, sourceFile) this:
 *   1. Reads the raw 11x17 landscape median export, strips the XML prolog and
 *      the white background <rect>.
 *   2. Re-frames the viewBox to the clip box (12.7 12.7 406.4 254) so the plate
 *      is edge-to-edge; keeps the <clipPath id="mc">.
 *   3. Runs svgo --multipass -p 1 on a temp copy (NEVER -p 0: it breaks the
 *      geometry — verified).
 *   4. Parses every <path> + its native stroke colour (the hypsometric ramp —
 *      the thing to preserve) and builds two theme variants:
 *        light = native colours as-is
 *        dark  = per-colour lightness transform (hue/sat preserved) so the ramp
 *                still reads as a ramp on the #14130f night ground.
 *   5. Picks 14 glow routes spread across the elevation ramp, estimates each
 *      route's true length by flattening its cubic Béziers, and emits the comet
 *      ignition system EXACTLY like scripts/generate-overlays.mjs (the verified
 *      reference) — speeds scaled to THIS coordinate space, glow gradients
 *      derived from each route's native stroke colour.
 *   6. Assembles one output SVG per (page, theme) into
 *      public/images/plates/<page>_<theme>.svg.
 *
 * Usage: node scripts/build-plates.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Local svgo JS entry — invoked via the current node binary so there is no
// `.cmd`/shell spawn (npx.cmd EINVALs on Windows under spawnSync).
const SVGO_BIN = path.resolve(__dirname, '..', 'node_modules', 'svgo', 'bin', 'svgo.js');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SRC_DIR = 'C:/Users/devin/Desktop/Claude/minicontour_gis/exports/svg/11x17';
const OUT_DIR = path.join('public', 'images', 'plates');

// page key -> source landscape median file
const PAGES = {
  home: 'california_big-sur-landscape_median_11x17.svg',
  portfolio: 'national-parks_grand-canyon-landscape_median_11x17.svg',
  ej: 'national-parks_great-smoky-mountains-landscape_median_11x17.svg',
  resume: 'world_geiranger-fjord-landscape_median_11x17.svg',
  interests: 'usa_badlands-landscape_median_11x17.svg',
  notFound: 'world_santorini-landscape_median_11x17.svg',
};

// Clip box from the source <clipPath id="mc"> rect: x=12.7 y=12.7 w=406.4 h=254.
const VIEWBOX = '12.7 12.7 406.4 254';
const VIEW_W = 406.4; // used to scale the reference's 1080-wide tuning constants

// Plate group opacity — the single subtlety knob (R2 user asked "more subtle").
const PLATE_OPACITY = { light: 0.5, dark: 0.45 };

// Output hard cap; engage decimation (drop every 4th path) and retry if exceeded.
const MAX_BYTES = 2.5 * 1024 * 1024;

const N_ROUTES = 14;
// Cap printed comet-route polyline resolution (keeps the <style> block small;
// the length estimate still uses the full flatten).
const ROUTE_MAX_PTS = 140;

// Comet system — scaled from generate-overlays.mjs (1080-wide) to 406-wide.
// scale = VIEW_W / 1080 ≈ 0.376.
const SCALE = VIEW_W / 1080;
const COMET = {
  headR: 1.9, // ~ reference 5 * scale, nudged up for visibility
  tailRMax: 1.7, // followers taper 1.7 -> 0.75
  tailRMin: 0.75,
  tailN: 12,
  gapU: 3.5 * SCALE, // ≈ 1.32 units
  minSpeed: 70 * SCALE, // ≈ 26 u/s
  maxSpeed: 150 * SCALE, // ≈ 56 u/s
  fadePeriod: 8, // integer-locked exactly as the reference
};

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

// RGB (0-255) -> HSL (h:0-360, s:0-100, l:0-100)
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

// HSL (h:0-360, s:0-100, l:0-100) -> RGB (0-255)
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

function hexToHsl(hex) {
  return rgbToHsl(...hexToRgb(hex));
}
function hslToHex(h, s, l) {
  return rgbToHex(...hslToRgb(h, s, l));
}

// Dark-theme variant: preserve hue/saturation, invert + compress lightness so
// the ramp stays a ramp but reads on the #14130f night ground.
//   L' = min(88, 100 - L * 0.72)
function darkVariant(hex) {
  const [h, s, l] = hexToHsl(hex);
  const lp = Math.min(88, 100 - l * 0.72);
  return hslToHex(h, s, lp);
}

// Glow head/halo derivation per route.
//   light: head core = darken+saturate native (L*0.75, S+10), halo = native
//   dark:  head core = dark-variant extra-lightened (L+12, capped), halo = dark-variant
function glowColors(nativeHex, theme) {
  if (theme === 'light') {
    const [h, s, l] = hexToHsl(nativeHex);
    const headCore = hslToHex(h, Math.min(100, s + 10), l * 0.75);
    return { headCore, halo: nativeHex };
  }
  const darkHex = darkVariant(nativeHex);
  const [h, s, l] = hexToHsl(darkHex);
  const headCore = hslToHex(h, s, Math.min(95, l + 12));
  return { headCore, halo: darkHex };
}

// ---------------------------------------------------------------------------
// Path geometry helpers
// ---------------------------------------------------------------------------

// Parse a path `d` into a flat list of absolute points by tracking the pen and
// evaluating each command's endpoint (and sampling cubic segments). The source
// paths are absolute M / C cubics (verified), but we handle the common subset
// defensively. Returns { points: [[x,y],...], length }.
function flattenPath(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const points = [];
  let i = 0;
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  const num = () => parseFloat(tokens[i++]);
  const sampleCubic = (x0, y0, x1, y1, x2, y2, x3, y3) => {
    const N = 8;
    for (let k = 1; k <= N; k++) {
      const t = k / N;
      const mt = 1 - t;
      const a = mt * mt * mt;
      const b = 3 * mt * mt * t;
      const c = 3 * mt * t * t;
      const e = t * t * t;
      points.push([
        a * x0 + b * x1 + c * x2 + e * x3,
        a * y0 + b * y1 + c * y2 + e * y3,
      ]);
    }
  };

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) {
      cmd = tokens[i++];
    }
    switch (cmd) {
      case 'M':
        cx = num();
        cy = num();
        sx = cx;
        sy = cy;
        points.push([cx, cy]);
        cmd = 'L'; // implicit lineto for subsequent coordinate pairs
        break;
      case 'm':
        cx += num();
        cy += num();
        sx = cx;
        sy = cy;
        points.push([cx, cy]);
        cmd = 'l';
        break;
      case 'L':
        cx = num();
        cy = num();
        points.push([cx, cy]);
        break;
      case 'l':
        cx += num();
        cy += num();
        points.push([cx, cy]);
        break;
      case 'H':
        cx = num();
        points.push([cx, cy]);
        break;
      case 'h':
        cx += num();
        points.push([cx, cy]);
        break;
      case 'V':
        cy = num();
        points.push([cx, cy]);
        break;
      case 'v':
        cy += num();
        points.push([cx, cy]);
        break;
      case 'C': {
        const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
        sampleCubic(cx, cy, x1, y1, x2, y2, x3, y3);
        cx = x3;
        cy = y3;
        break;
      }
      case 'c': {
        const x1 = cx + num(), y1 = cy + num();
        const x2 = cx + num(), y2 = cy + num();
        const x3 = cx + num(), y3 = cy + num();
        sampleCubic(cx, cy, x1, y1, x2, y2, x3, y3);
        cx = x3;
        cy = y3;
        break;
      }
      case 'Z':
      case 'z':
        points.push([sx, sy]);
        cx = sx;
        cy = sy;
        break;
      default:
        // Unknown command token — consume one number to avoid an infinite loop.
        i++;
        break;
    }
  }

  let length = 0;
  for (let k = 1; k < points.length; k++) {
    length += Math.hypot(
      points[k][0] - points[k - 1][0],
      points[k][1] - points[k - 1][1],
    );
  }
  return { points, length };
}

// Evenly thin a point list to at most `max` points (keeps first + last).
function downsample(points, max) {
  if (points.length <= max) return points;
  const out = [];
  const step = (points.length - 1) / (max - 1);
  for (let k = 0; k < max; k++) {
    out.push(points[Math.round(k * step)]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Source preprocessing
// ---------------------------------------------------------------------------

function preprocessAndOptimize(srcPath) {
  let raw = fs.readFileSync(srcPath, 'utf8');

  // 1. Strip XML prolog.
  raw = raw.replace(/^\s*<\?xml[^>]*\?>\s*/i, '');

  // 2. Remove the white background <rect> (the first full-canvas rect, which
  //    sits before <defs> and is not inside the clipPath).
  raw = raw.replace(/<rect\b[^>]*fill="#ffffff"[^>]*\/>\s*/i, '');

  // 3. Re-frame the viewBox to the clip box so the plate is edge-to-edge.
  raw = raw
    .replace(/viewBox="[^"]*"/i, `viewBox="${VIEWBOX}"`)
    .replace(/\swidth="[^"]*"/i, '')
    .replace(/\sheight="[^"]*"/i, '');

  // 4. svgo on a temp copy (--multipass -p 1; NEVER -p 0).
  const tmp = path.join(os.tmpdir(), `plate_${process.pid}_${Date.now()}.svg`);
  fs.writeFileSync(tmp, raw);
  try {
    execFileSync(
      process.execPath,
      [SVGO_BIN, '--multipass', '-p', '1', tmp, '-o', tmp],
      { stdio: 'ignore', maxBuffer: 256 * 1024 * 1024 },
    );
    const optimized = fs.readFileSync(tmp, 'utf8');
    return optimized;
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

// Parse the stroked contour <path>s only: capture d + native stroke colour (the
// hypsometric ramp — the thing to preserve). svgo synthesizes a clipPath rect
// path and a couple of fill="#fff" border paths with NO stroke; those are
// skipped here so only true contours reach the plate body and route picker.
function parsePaths(svg) {
  const out = [];
  const pathRe = /<path\b[^>]*\/?>/gi;
  for (const m of svg.matchAll(pathRe)) {
    const tag = m[0];
    const dMatch = tag.match(/\bd="([^"]+)"/i);
    if (!dMatch) continue;
    const strokeMatch = tag.match(/\bstroke="(#[0-9a-fA-F]{3,6})"/i);
    if (!strokeMatch) continue; // not a contour (clip rect / white border)
    const widthMatch = tag.match(/\bstroke-width="([^"]+)"/i);
    const opacityMatch = tag.match(/\bopacity="([^"]+)"/i);
    out.push({
      d: dMatch[1],
      stroke: strokeMatch[1].toLowerCase(),
      width: widthMatch ? widthMatch[1] : '0.22',
      opacity: opacityMatch ? opacityMatch[1] : null,
    });
  }
  return out;
}

// Decimate: drop every 4th path evenly. Returns a new array.
function decimate(paths) {
  return paths.filter((_, idx) => (idx + 1) % 4 !== 0);
}

// ---------------------------------------------------------------------------
// Route selection + comet emission
// ---------------------------------------------------------------------------

function pickRoutes(paths) {
  const colored = paths.filter((p) => p.stroke);
  if (colored.length === 0) {
    throw new Error('BLOCKED: no stroked paths found — ramp lost after svgo.');
  }
  // Sort by stroke lightness so we can take evenly spaced elevation bands.
  const withL = colored.map((p) => ({ ...p, L: hexToHsl(p.stroke)[2] }));
  withL.sort((a, b) => a.L - b.L);

  const n = Math.min(N_ROUTES, withL.length);
  const routes = [];
  for (let r = 0; r < n; r++) {
    // Band [lo, hi) across the sorted list; prefer the longest `d` within it
    // (crude length proxy: d.length).
    const lo = Math.floor((r * withL.length) / n);
    const hi = Math.max(lo + 1, Math.floor(((r + 1) * withL.length) / n));
    let best = withL[lo];
    for (let k = lo; k < hi; k++) {
      if (withL[k].d.length > best.d.length) best = withL[k];
    }
    routes.push(best);
  }
  return routes;
}

function buildCometSystem(routes, theme) {
  // Estimate each route's true length and tune duration to a scaled speed band.
  const tuned = routes.map((route, i) => {
    const { points, length } = flattenPath(route.d);
    // The comet rides offset-path:path(polyline). The full flatten of a long
    // contour can be 100k+ points (the longest source paths are ~190KB of `d`),
    // which would bloat the <style> block past the 2.5MB cap. Downsample to a
    // bounded point count — a contour at ~ROUTE_MAX_PTS samples is plenty smooth
    // for a sprite to traverse. Length is still computed from the FULL flatten,
    // so speed/duration stay accurate.
    const sampled = downsample(points, ROUTE_MAX_PTS);
    const polyD =
      'M' + sampled.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join('L');
    const len = Math.max(length, 1);
    const speed = Math.min(COMET.maxSpeed, Math.max(COMET.minSpeed, len / 8));
    const dur = len / speed;
    return { i, d: polyD, len, speed, dur, stroke: route.stroke };
  });

  const rawSpeedMin = Math.min(...tuned.map((r) => r.speed)).toFixed(1);
  const rawSpeedMax = Math.max(...tuned.map((r) => r.speed)).toFixed(1);

  // Per-route pulse rules (fade-lock derived from the printed move duration,
  // exactly as the reference does).
  const fadePeakByTheme = theme === 'light' ? 0.6 : 0.85;
  const perRouteRules = tuned
    .map((r) => {
      const printedDur = Number(r.dur.toFixed(2));
      const n = Math.max(1, Math.round(printedDur / COMET.fadePeriod));
      const fadeT = (printedDur / n).toFixed(9);
      const scatter = -(r.i * 3.83).toFixed(2);
      return `.p${r.i}{offset-path:path("${r.d}");animation:pmove ${printedDur}s linear ${scatter}s infinite,pfade ${fadeT}s ease-in-out ${scatter}s infinite}`;
    })
    .join('');

  const keyframes =
    `@keyframes pmove{to{offset-distance:100%}}` +
    `@keyframes pfade{0%{opacity:0}14%{opacity:${fadePeakByTheme}}45%{opacity:${fadePeakByTheme}}62%{opacity:0}100%{opacity:0}}` +
    `.pulse{offset-rotate:0deg;offset-distance:0%;opacity:0;will-change:offset-distance,opacity}` +
    perRouteRules;

  // Per-route radial gradients (gh = head, gt = tail), derived from native colour.
  const defs = tuned
    .map((r) => {
      const { headCore, halo } = glowColors(r.stroke, theme);
      return (
        `<radialGradient id="gh${r.i}">` +
        `<stop offset="0" stop-color="${headCore}" stop-opacity="0.95"/>` +
        `<stop offset="0.35" stop-color="${halo}" stop-opacity="0.5"/>` +
        `<stop offset="1" stop-color="${halo}" stop-opacity="0"/>` +
        `</radialGradient>` +
        `<radialGradient id="gt${r.i}">` +
        `<stop offset="0" stop-color="${halo}" stop-opacity="0.6"/>` +
        `<stop offset="1" stop-color="${halo}" stop-opacity="0"/>` +
        `</radialGradient>`
      );
    })
    .join('');

  // Comet sprites: 1 head + 12 tapering followers per route.
  const cometGroups = tuned
    .map((r) => {
      const dt = COMET.gapU / r.speed; // seconds per gapU of travel
      const scatter = -(r.i * 3.83);
      const head = `<circle class="pulse p${r.i}" r="${COMET.headR}" fill="url(#gh${r.i})"/>`;
      const tail = Array.from({ length: COMET.tailN }, (_, k) => {
        const t = (k + 1) / COMET.tailN;
        const radius = (COMET.tailRMax - (COMET.tailRMax - COMET.tailRMin) * t).toFixed(2);
        const delay = (scatter + (k + 1) * dt).toFixed(3);
        const fade = (0.7 * Math.pow(1 - (k + 1) / (COMET.tailN + 1), 1.25)).toFixed(2);
        return `<circle class="pulse p${r.i}" r="${radius}" fill="url(#gt${r.i})" fill-opacity="${fade}" style="animation-delay:${delay}s"/>`;
      }).join('');
      return `<g class="comet">${head}${tail}</g>`;
    })
    .join('');

  return { keyframes, defs, cometGroups, rawSpeedMin, rawSpeedMax };
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function buildPlateSvg(paths, theme) {
  // Plate paths (theme-variant colours). Shared attrs (fill/linecap/linejoin)
  // hoisted to the group to keep the file small.
  const plateBody = paths
    .map((p) => {
      const stroke = theme === 'dark' ? darkVariant(p.stroke) : p.stroke;
      const op = p.opacity != null ? ` opacity="${p.opacity}"` : '';
      return `<path d="${p.d}" stroke="${stroke}" stroke-width="${p.width}"${op}/>`;
    })
    .join('');

  const routes = pickRoutes(paths);
  const { keyframes, defs, cometGroups } = buildCometSystem(routes, theme);

  const plateOpacity = PLATE_OPACITY[theme];

  const style =
    `<style>${keyframes}.plate{opacity:${plateOpacity}}</style>`;
  const defsBlock =
    `<defs><clipPath id="mc"><rect x="12.7" y="12.7" width="406.4" height="254"/></clipPath>${defs}</defs>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">` +
    style +
    defsBlock +
    `<g class="plate" clip-path="url(#mc)" fill="none" stroke-linecap="round" stroke-linejoin="round">${plateBody}</g>` +
    `<g class="comets" clip-path="url(#mc)">${cometGroups}</g>` +
    `</svg>`;

  return { svg, routeCount: routes.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const sizeTable = [];

  for (const [page, file] of Object.entries(PAGES)) {
    const srcPath = path.join(SRC_DIR, file);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`BLOCKED: missing source asset ${srcPath}`);
    }
    const rawSizeMB = (fs.statSync(srcPath).size / 1024 / 1024).toFixed(1);

    const optimized = preprocessAndOptimize(srcPath);
    const paths = parsePaths(optimized);
    if (paths.length === 0) {
      throw new Error(
        `BLOCKED: no stroked contour <path> parsed for ${page} (${file}) — ramp lost after svgo.`,
      );
    }

    for (const theme of ['light', 'dark']) {
      let decimations = 0;
      let working = paths;
      let result = buildPlateSvg(working, theme);
      let bytes = Buffer.byteLength(result.svg, 'utf8');

      // FAIL-safe: if over cap, drop every 4th path evenly and retry.
      while (bytes > MAX_BYTES) {
        decimations++;
        if (decimations > 6) {
          throw new Error(
            `BLOCKED: ${page}_${theme} still ${(bytes / 1024 / 1024).toFixed(2)}MB after ${decimations} decimations.`,
          );
        }
        working = decimate(working);
        result = buildPlateSvg(working, theme);
        bytes = Buffer.byteLength(result.svg, 'utf8');
      }

      const outPath = path.join(OUT_DIR, `${page}_${theme}.svg`);
      fs.writeFileSync(outPath, result.svg);

      const kb = (bytes / 1024).toFixed(1);
      sizeTable.push({
        file: `${page}_${theme}.svg`,
        paths: working.length,
        routes: result.routeCount,
        rawMB: rawSizeMB,
        outKB: kb,
        decimations,
      });
      console.log(
        `[${page}/${theme}] paths: ${working.length}, routes: ${result.routeCount}, raw: ${rawSizeMB}MB, out: ${kb}KB${decimations ? ` (decimated x${decimations})` : ''} -> ${outPath}`,
      );
    }
  }

  console.log('\nDone. 12 plate SVGs written to', OUT_DIR);
  console.table(sizeTable);
}

main();
