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
 *      ignition system from the original verified two-layer reference — speeds
 *      scaled to THIS coordinate space, glow gradients derived from each route's
 *      native stroke colour.
 *   6. Assembles TWO output SVGs per (page, theme) into public/images/plates/:
 *        <page>_<theme>_plate.svg — contours ONLY (static; consumed as a CSS
 *          background-image, so no <style>/keyframes/sprites/gradients).
 *        <page>_<theme>_glow.svg  — the comet system ONLY (keyframes + route
 *          classes + per-route gradients + sprites) on a transparent canvas
 *          with the SAME viewBox/preserveAspectRatio so it registers 1:1.
 *      Splitting static from animated restores the proven two-layer v1 model:
 *      the giant static plate is never re-rasterized per animation frame, which
 *      eliminates the scroll re-raster stalls that the merged single-SVG output
 *      caused (same failure class that killed the original SMIL approach).
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

// Comet system — scaled from the original 1080-wide reference to 406-wide.
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
// defensively. svgo's mergePaths fuses disconnected contours into one `d` with
// multiple M/m subpath starts; `starts` records the index in `points` where each
// new subpath begins so callers can avoid sampling across a contour gap.
// Returns { points: [[x,y],...], starts: [0,...], length }.
function flattenPath(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const points = [];
  const starts = [];
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
        starts.push(points.length); // new subpath begins here
        points.push([cx, cy]);
        cmd = 'L'; // implicit lineto for subsequent coordinate pairs
        break;
      case 'm':
        cx += num();
        cy += num();
        sx = cx;
        sy = cy;
        starts.push(points.length); // new subpath begins here
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
  return { points, starts, length };
}

// From a flattened path with subpath break indices, return the LONGEST
// contiguous subpath (its own points + true length). Comet routes ride a single
// offset-path; sampling across an M/m gap would draw a straight chord between
// two disconnected contour fragments. Restricting the route to one subpath keeps
// the comet on a real, connected contour.
function longestSubpath(points, starts) {
  if (points.length === 0) return { points: [], length: 0 };
  // Subpath span boundaries: each start index .. next start (or end).
  const bounds = starts.length ? starts : [0];
  let best = { points: [], length: -1 };
  for (let s = 0; s < bounds.length; s++) {
    const from = bounds[s];
    const to = s + 1 < bounds.length ? bounds[s + 1] : points.length;
    const seg = points.slice(from, to);
    let len = 0;
    for (let k = 1; k < seg.length; k++) {
      len += Math.hypot(seg[k][0] - seg[k - 1][0], seg[k][1] - seg[k - 1][1]);
    }
    if (len > best.length) best = { points: seg, length: len };
  }
  return best;
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
      // Pipe stderr (inherited) so an svgo failure surfaces its diagnostics
      // instead of a bare non-zero-exit error.
      { stdio: ['ignore', 'ignore', 'inherit'], maxBuffer: 256 * 1024 * 1024 },
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

function buildCometSystem(routes, theme, page) {
  // Estimate each route's true length and tune duration to a scaled speed band.
  const tuned = routes.map((route, i) => {
    const flat = flattenPath(route.d);
    // svgo's mergePaths fuses disconnected contours into a single `d`. The comet
    // rides ONE offset-path joined entirely with 'L', so sampling across an M/m
    // boundary would draw a straight chord between separate contour fragments.
    // Restrict the route to the LONGEST contiguous subpath — its points, its
    // length, and therefore its duration all come from that subpath alone, so a
    // route never crosses a subpath boundary.
    const { points, length } = longestSubpath(flat.points, flat.starts);
    // The full flatten of a long contour can still be 100k+ points (the longest
    // source paths are ~190KB of `d`), which would bloat the old <style> block past
    // the 2.5MB cap. Downsample to a bounded point count — a contour at
    // ~ROUTE_MAX_PTS samples is plenty smooth for a sprite to traverse. Length is
    // computed from the FULL subpath flatten, so speed/duration stay accurate.
    const sampled = downsample(points, ROUTE_MAX_PTS);
    const polyD =
      'M' + sampled.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join('L');
    const len = Math.max(length, 1);
    const speed = Math.min(COMET.maxSpeed, Math.max(COMET.minSpeed, len / 8));
    const dur = len / speed;
    // Start point of the sampled route — used for cx/cy defaults so a
    // non-animated render is not a pile of circles at (0,0).
    const startX = sampled[0] ? sampled[0][0].toFixed(2) : '0';
    const startY = sampled[0] ? sampled[0][1].toFixed(2) : '0';
    return { i, d: polyD, len, speed, dur, stroke: route.stroke, startX, startY };
  });

  const rawSpeedMin = Math.min(...tuned.map((r) => r.speed)).toFixed(1);
  const rawSpeedMax = Math.max(...tuned.map((r) => r.speed)).toFixed(1);

  // Per-page scope token. Inlined glows share one document scope, so every
  // gradient id is namespaced with the page key.
  const ghId = (i) => `${page}-gh${i}`;
  const gtId = (i) => `${page}-gt${i}`;

  // Fade-peak opacity by theme (same as the reference).
  const fadePeakByTheme = theme === 'light' ? 0.6 : 0.85;

  // Per-route <path> defs — these carry the route geometry as GSAP MotionPath
  // targets. fill+stroke none so they are invisible; GSAP references them by id.
  // NOTE: the glow SVG is NOT passed through svgo, so data-* attrs and invisible
  // defs paths are preserved as-is.
  const routePaths = tuned
    .map((r) => {
      const printedDur = Number(r.dur.toFixed(2));
      const n = Math.max(1, Math.round(printedDur / COMET.fadePeriod));
      const fadeT = (printedDur / n).toFixed(9);
      return `<path id="${page}-route${r.i}" d="${r.d}" fill="none" stroke="none" data-dur="${printedDur}" data-fade="${fadeT}"/>`;
    })
    .join('');

  // Per-route radial gradients (gh = head, gt = tail), derived from native colour.
  const defs = tuned
    .map((r) => {
      const { headCore, halo } = glowColors(r.stroke, theme);
      return (
        `<radialGradient id="${ghId(r.i)}">` +
        `<stop offset="0" stop-color="${headCore}" stop-opacity="0.95"/>` +
        `<stop offset="0.35" stop-color="${halo}" stop-opacity="0.5"/>` +
        `<stop offset="1" stop-color="${halo}" stop-opacity="0"/>` +
        `</radialGradient>` +
        `<radialGradient id="${gtId(r.i)}">` +
        `<stop offset="0" stop-color="${halo}" stop-opacity="0.6"/>` +
        `<stop offset="1" stop-color="${halo}" stop-opacity="0"/>` +
        `</radialGradient>`
      );
    })
    .join('');

  // Comet sprites: 1 head (data-k=0) + 12 tapering followers (data-k=1..12) per
  // route. cx/cy set to the route start so non-animated render is not a pile at
  // (0,0). No animation classes or inline style animation — GSAP drives these.
  //
  // data-lag on each circle = seconds the sprite trails the head (lag=0 for head;
  // lag = k * dt for follower k, matching the old CSS animation-delay math:
  //   old delay[head]      = scatter               → timeAdvanced = |scatter|
  //   old delay[tail k]    = scatter + k*dt        → timeAdvanced = |scatter| - k*dt
  //   relative lag of tail k vs head               = k*dt
  // GSAP phase seeding: totalTime = ((|scatter| - lag) % dur + dur) % dur
  const cometGroups = tuned
    .map((r) => {
      const printedDur = Number(r.dur.toFixed(2));
      const n = Math.max(1, Math.round(printedDur / COMET.fadePeriod));
      const fadeT = (printedDur / n).toFixed(9);
      const scatterAbs = (r.i * 3.83).toFixed(4);
      const dt = COMET.gapU / r.speed; // seconds per gapU gap
      const head =
        `<circle` +
        ` data-k="0"` +
        ` data-lag="0"` +
        ` r="${COMET.headR}"` +
        ` cx="${r.startX}" cy="${r.startY}"` +
        ` fill="url(#${ghId(r.i)})"` +
        `/>`;
      const tail = Array.from({ length: COMET.tailN }, (_, k) => {
        // k is 0-indexed here → circle data-k = k+1 (1..tailN)
        const lagK = ((k + 1) * dt).toFixed(6);
        const taper = (k + 1) / COMET.tailN;
        const radius = (COMET.tailRMax - (COMET.tailRMax - COMET.tailRMin) * taper).toFixed(2);
        const fadeOp = (0.7 * Math.pow(1 - (k + 1) / (COMET.tailN + 1), 1.25)).toFixed(2);
        return (
          `<circle` +
          ` data-k="${k + 1}"` +
          ` data-lag="${lagK}"` +
          ` r="${radius}"` +
          ` cx="${r.startX}" cy="${r.startY}"` +
          ` fill="url(#${gtId(r.i)})"` +
          ` fill-opacity="${fadeOp}"` +
          `/>`
        );
      }).join('');
      return (
        `<g` +
        ` class="${page}-comet"` +
        ` data-route="${r.i}"` +
        ` data-dur="${printedDur}"` +
        ` data-fade="${fadeT}"` +
        ` data-scatter="${scatterAbs}"` +
        ` data-fade-peak="${fadePeakByTheme}"` +
        ` opacity="0"` +
        `>${head}${tail}</g>`
      );
    })
    .join('');

  return { routePaths, defs, cometGroups, rawSpeedMin, rawSpeedMax };
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

// --- Static plate file: contours ONLY ------------------------------------
// Consumed as a CSS background-image, so it must be fully static: the plate
// group with its opacity knob BAKED into the group (no <style>), clipPath,
// same viewBox/preserveAspectRatio. No keyframes, no sprites, no gradients.
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

  const plateOpacity = PLATE_OPACITY[theme];
  const defsBlock =
    `<defs><clipPath id="mc"><rect x="12.7" y="12.7" width="406.4" height="254"/></clipPath></defs>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice">` +
    defsBlock +
    `<g clip-path="url(#mc)" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${plateOpacity}">${plateBody}</g>` +
    `</svg>`;

  return svg;
}

// --- Animated glow file: comet system ONLY (GSAP-driven, no CSS keyframes) ---
// Inlined on top of the static plate by the component, on a transparent canvas
// with the SAME viewBox + preserveAspectRatio so it registers 1:1 over the
// plate. Carries per-route <path> defs (GSAP MotionPath targets), per-route
// gradient defs, and sprite circles with data-* attributes. Zero @keyframes
// and zero animation: declarations — all animation is driven by GSAP at
// runtime via AnimatedContourBackground.
function buildGlowSvg(paths, theme, page) {
  const routes = pickRoutes(paths);
  const { routePaths, defs, cometGroups } = buildCometSystem(routes, theme, page);

  // Scope the clip id per page: glows are inlined into a shared document, so
  // `url(#mc)` and route path ids must not collide across pages.
  const clipId = `${page}-mc`;
  // Route paths go in <defs> alongside gradients: invisible (fill+stroke none),
  // referenced by GSAP MotionPathPlugin via id.
  const defsBlock =
    `<defs>` +
    `<clipPath id="${clipId}"><rect x="12.7" y="12.7" width="406.4" height="254"/></clipPath>` +
    routePaths +
    defs +
    `</defs>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice">` +
    defsBlock +
    `<g class="${page}-comets" clip-path="url(#${clipId})">${cometGroups}</g>` +
    `</svg>`;

  return { svg, routeCount: routes.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Delete the old merged outputs (<page>_<theme>.svg) and any stale split
  // files so the directory only ever holds the current 24-file output set.
  for (const stale of fs.readdirSync(OUT_DIR)) {
    if (stale.endsWith('.svg')) {
      fs.unlinkSync(path.join(OUT_DIR, stale));
    }
  }

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
      // --- Static plate: contours only. Decimate (drop every 4th path) and
      //     retry if the file exceeds the hard cap. The glow file is tiny and
      //     is built from the SAME (possibly decimated) working set so the
      //     route picker stays in sync with what the plate actually draws.
      let decimations = 0;
      let working = paths;
      let plateSvg = buildPlateSvg(working, theme);
      let plateBytes = Buffer.byteLength(plateSvg, 'utf8');

      while (plateBytes > MAX_BYTES) {
        decimations++;
        if (decimations > 6) {
          throw new Error(
            `BLOCKED: ${page}_${theme}_plate still ${(plateBytes / 1024 / 1024).toFixed(2)}MB after ${decimations} decimations.`,
          );
        }
        working = decimate(working);
        plateSvg = buildPlateSvg(working, theme);
        plateBytes = Buffer.byteLength(plateSvg, 'utf8');
      }

      // --- Animated glow: comet system only (transparent canvas, same frame).
      const glow = buildGlowSvg(working, theme, page);
      const glowBytes = Buffer.byteLength(glow.svg, 'utf8');

      const platePath = path.join(OUT_DIR, `${page}_${theme}_plate.svg`);
      const glowPath = path.join(OUT_DIR, `${page}_${theme}_glow.svg`);
      fs.writeFileSync(platePath, plateSvg);
      fs.writeFileSync(glowPath, glow.svg);

      const plateKB = (plateBytes / 1024).toFixed(1);
      const glowKB = (glowBytes / 1024).toFixed(1);
      sizeTable.push({
        page,
        theme,
        paths: working.length,
        routes: glow.routeCount,
        rawMB: rawSizeMB,
        plateKB,
        glowKB,
        decimations,
      });
      console.log(
        `[${page}/${theme}] paths: ${working.length}, routes: ${glow.routeCount}, raw: ${rawSizeMB}MB, plate: ${plateKB}KB, glow: ${glowKB}KB${decimations ? ` (decimated x${decimations})` : ''}\n    -> ${platePath}\n    -> ${glowPath}`,
      );
    }
  }

  console.log('\nDone. 24 SVGs (12 plate + 12 glow) written to', OUT_DIR);
  console.table(sizeTable);
}

main();
