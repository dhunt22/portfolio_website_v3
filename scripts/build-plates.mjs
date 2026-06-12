/**
 * Backdrop engine v3 — build per-page fixed landscape contour plates.
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
 *   5. Picks GLOW_LINES paths from the N longest paths, keeping every other one
 *      for spatial spread. Emits the reverse-glow overlay from the EXACT SAME
 *      post-svgo path data the plate writes (bit-identical geometry; comet routes
 *      and MotionPath are GONE).
 *   6. Assembles TWO output SVGs per (page, theme) into public/images/plates/:
 *        <page>_<theme>_plate.svg — contours ONLY (static; consumed as a CSS
 *          background-image, so no <style>/keyframes/sprites/gradients).
 *        <page>_<theme>_glow.svg  — the reverse-glow overlay only: same viewBox
 *          + slice, a SUBSET of the plate's path elements copied verbatim (exact
 *          `d` and stroke-width/linecap as emitted in the final plate), each with
 *          stroke = theme page-bg color (#f7f4ec light / #1a1814 dark), opacity=0,
 *          and data-line/data-cycle/data-delay attributes for GSAP. Zero comet
 *          geometry, no gradients, no sprite circles.
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
const SRC_DIR_PORTRAIT = 'C:/Users/devin/Desktop/Claude/minicontour_gis/exports/svg/8.5x11';
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

// Pages with a portrait (mobile) variant: page key -> source portrait file.
// Pick the iqr3 (sparsest) portrait variant; prefer the non-landscape name.
// big-sur portrait: 215.9 x 279.4 mm → inner box 12.7 12.7 190.5 254.
const PAGES_MOBILE = {
  home: 'california_big-sur_iqr3_8.5x11.svg',
};

// Clip box from the source <clipPath id="mc"> rect: x=12.7 y=12.7 w=406.4 h=254.
const VIEWBOX = '12.7 12.7 406.4 254';

// Landscape margin: 12.7mm on all sides (derived from standard GIS export).
const MARGIN = 12.7;

// Plate group opacity — single subtlety knobs; quieter contours (was 0.5/0.45).
const PLATE_OPACITY = { light: 0.35, dark: 0.30 };

// Output hard cap; engage decimation (drop every 4th path) and retry if exceeded.
const MAX_BYTES = 2.5 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Reverse-glow knobs (v3)
// ---------------------------------------------------------------------------

// Number of glow lines to emit per glow file. Derived from top-N longest paths,
// then keep every other one for spatial spread → ~GLOW_LINES/2 ... GLOW_LINES
// lines depending on N pool.
const GLOW_LINES = 14;

// Theme page-background colours (--surface-page CSS custom property values).
// The overlay strokes use these EXACT colours so animating opacity 0→1 fully
// erases a contour line into the page background. Full-strength (no plate
// group opacity applied) is required: a plate line at opacity 0.35 covered by
// an overlay stroke at α is line×(1−α); reaching zero at α=1.
const GLOW_BG = {
  light: '#f7f4ec',
  dark: '#1a1814',
};

// Per-line cycle period: uniform 35s. A fixed cycle is required to keep worst-
// case concurrent fades ≤ 3. Analysis: with delay spacing = 2.5s and cycle = 35s,
// at any instant at most ceil(7/2.5) = 3 lines can be mid-fade simultaneously
// (verified by exhaustive 2000s simulation at 0.01s resolution). Mixed cycle
// lengths cause lines to drift into resonance and cluster — uniform cycle prevents
// this. 35s gives a gentle, unhurried breathing cadence.
const cyclePeriod = (_idx) => 35;

// Per-line scatter delay (seconds): idx * 2.5.
// 14 lines * 2.5s = 35s total span = exactly one cycle → lines are evenly
// distributed through the cycle on load. Spacing > fw/3 (= 7/3 ≈ 2.33s) ensures
// worst-case concurrent fades = 3, not 4.
const lineDelay = (idx) => idx * 2.5;

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

// ---------------------------------------------------------------------------
// Path geometry helpers (used only for selecting the longest paths)
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

// ---------------------------------------------------------------------------
// Source preprocessing
// ---------------------------------------------------------------------------

// Derive the clip-box viewBox from source SVG dimensions + margin.
// Source width/height are in mm (e.g. "215.9mm" or a bare number). Returns a
// viewBox string "MARGIN MARGIN (W-2M) (H-2M)" where M = MARGIN.
function deriveViewBox(srcPath) {
  const raw = fs.readFileSync(srcPath, 'utf8');
  const wMatch = raw.match(/\swidth="([0-9.]+)(?:mm)?"/i);
  const hMatch = raw.match(/\sheight="([0-9.]+)(?:mm)?"/i);
  // Fall back to parsing the root viewBox if width/height attrs are absent.
  if (!wMatch || !hMatch) {
    const vbMatch = raw.match(/viewBox="[0-9.\s-]* ([0-9.]+) ([0-9.]+)"/i);
    if (!vbMatch) throw new Error(`Cannot derive dimensions from ${srcPath}`);
    const w = parseFloat(vbMatch[1]);
    const h = parseFloat(vbMatch[2]);
    return {
      viewBox: `${MARGIN} ${MARGIN} ${+(w - 2 * MARGIN).toFixed(4)} ${+(h - 2 * MARGIN).toFixed(4)}`,
      w, h,
    };
  }
  const w = parseFloat(wMatch[1]);
  const h = parseFloat(hMatch[1]);
  return {
    viewBox: `${MARGIN} ${MARGIN} ${+(w - 2 * MARGIN).toFixed(4)} ${+(h - 2 * MARGIN).toFixed(4)}`,
    w, h,
  };
}

function preprocessAndOptimize(srcPath, viewBoxOverride) {
  let raw = fs.readFileSync(srcPath, 'utf8');

  const vb = viewBoxOverride ?? VIEWBOX;

  // 1. Strip XML prolog.
  raw = raw.replace(/^\s*<\?xml[^>]*\?>\s*/i, '');

  // 2. Remove the white background <rect> (the first full-canvas rect, which
  //    sits before <defs> and is not inside the clipPath).
  raw = raw.replace(/<rect\b[^>]*fill="#ffffff"[^>]*\/>\s*/i, '');

  // 3. Re-frame the viewBox to the clip box so the plate is edge-to-edge.
  raw = raw
    .replace(/viewBox="[^"]*"/i, `viewBox="${vb}"`)
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
// skipped here so only true contours reach the plate body and glow picker.
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
// Glow line selection (v3 — reverse-glow overlay)
// ---------------------------------------------------------------------------

// Pick GLOW_LINES overlay paths from the N longest paths, keeping every other
// one for spatial spread. Selection is deterministic (sort by path length
// desc, keep every other one up to GLOW_LINES). The path objects returned
// have the EXACT `d`, `stroke`, `width` as they appear in `paths` — these are
// the SAME strings the plate emits, guaranteeing bit-identical geometry.
function pickGlowLines(paths) {
  if (paths.length === 0) return [];

  // Estimate length from d-string length as a fast proxy (no full flatten).
  // This is fine for selection — we only need a relative ordering.
  // Sort descending by d.length (longer d string ≈ longer/more-complex path).
  const sorted = [...paths].sort((a, b) => b.d.length - a.d.length);

  // Keep every other one from the sorted list for spatial spread, up to GLOW_LINES.
  const spread = [];
  for (let i = 0; i < sorted.length && spread.length < GLOW_LINES * 2; i += 2) {
    spread.push(sorted[i]);
  }

  return spread.slice(0, GLOW_LINES);
}

// ---------------------------------------------------------------------------
// Concurrent-fade analysis (verification)
// ---------------------------------------------------------------------------
// Fade window: 7s total (2.5s fade-in + 2s hold + 2.5s fade-out).
// Samples at t in [0, SAMPLE_DURATION] at fine granularity.
// Returns max simultaneous fades observed.
function computeMaxConcurrentFades(n) {
  const FADE_WINDOW = 7; // 2.5s in + 2s hold + 2.5s out
  const SAMPLE_STEP = 0.01; // fine resolution
  const SAMPLE_DURATION = 2000; // sample over 2000s to capture all resonance patterns

  let maxSimultaneous = 0;
  for (let t = 0; t <= SAMPLE_DURATION; t += SAMPLE_STEP) {
    let active = 0;
    for (let idx = 0; idx < n; idx++) {
      const cycle = cyclePeriod(idx);
      const delay = lineDelay(idx);
      // Phase at time t: the line's position within its cycle (accounting for delay)
      const phase = ((t - delay) % cycle + cycle) % cycle;
      if (phase < FADE_WINDOW) active++;
    }
    if (active > maxSimultaneous) maxSimultaneous = active;
  }
  return maxSimultaneous;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

// --- Static plate file: contours ONLY ------------------------------------
// Consumed as a CSS background-image, so it must be fully static: the plate
// group with its opacity knob BAKED into the group (no <style>), clipPath,
// same viewBox/preserveAspectRatio. No keyframes, no sprites, no gradients.
function buildPlateSvg(paths, theme, viewBox) {
  const vb = viewBox ?? VIEWBOX;
  // Parse inner rect dimensions from viewBox "x y w h".
  const [vbX, vbY, vbW, vbH] = vb.split(' ').map(Number);

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
    `<defs><clipPath id="mc"><rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}"/></clipPath></defs>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">` +
    defsBlock +
    `<g clip-path="url(#mc)" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${plateOpacity}">${plateBody}</g>` +
    `</svg>`;

  return svg;
}

// --- Animated glow file: reverse-glow overlay ONLY (GSAP-driven, no CSS) ---
// Inlined on top of the static plate by the component, on a transparent canvas
// with the SAME viewBox + preserveAspectRatio so it registers 1:1 over the
// plate (pixel-perfect at any scale — no resampling drift).
//
// Contains a SUBSET of the plate's path elements copied VERBATIM (exact `d`
// and stroke-width attrs as emitted in the final plate — post-svgo optimized
// path strings). Overlay strokes use the THEME PAGE BG colour so animating a
// line's opacity 0→1 fully ERASES it into the background. The plate group's
// 0.35/0.30 wrapper opacity does NOT apply here (full-strength bg stroke is
// required to fully erase a line: line×(1−α) → 0 at α=1).
//
// Each path carries: data-line, data-cycle (period in seconds), data-delay
// (initial phase scatter in seconds). All animation is driven by GSAP at
// runtime via AnimatedContourBackground.
function buildGlowSvg(paths, theme, page, viewBox) {
  const vb = viewBox ?? VIEWBOX;
  const [vbX, vbY, vbW, vbH] = vb.split(' ').map(Number);

  const bgColor = GLOW_BG[theme];
  const glowLines = pickGlowLines(paths);

  // Scope the clip id per page: glows are inlined into a shared document, so
  // `url(#mc)` must not collide across pages.
  const clipId = `${page}-mc`;
  const defsBlock =
    `<defs><clipPath id="${clipId}"><rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}"/></clipPath></defs>`;

  // Each glow path: verbatim d and stroke-width from the plate, but stroke =
  // theme bg color, fill none, opacity 0 at rest, and data-* for GSAP.
  // We use the plate's stroke-width (not the native stroke colour) for thickness —
  // the overlay must cover exactly the same pixels the plate line occupies.
  const glowBody = glowLines
    .map((p, idx) => {
      const cycle = cyclePeriod(idx).toFixed(2);
      const delay = lineDelay(idx).toFixed(2);
      return (
        `<path` +
        ` d="${p.d}"` +
        ` stroke="${bgColor}"` +
        ` stroke-width="${p.width}"` +
        ` fill="none"` +
        ` stroke-linecap="round"` +
        ` stroke-linejoin="round"` +
        ` opacity="0"` +
        ` data-line="${idx}"` +
        ` data-cycle="${cycle}"` +
        ` data-delay="${delay}"` +
        `/>`
      );
    })
    .join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">` +
    defsBlock +
    `<g clip-path="url(#${clipId})" fill="none">${glowBody}</g>` +
    `</svg>`;

  return { svg, lineCount: glowLines.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Build one landscape or portrait (page, theme) pair into OUT_DIR.
// Returns size-table row.
function buildPageTheme(page, theme, srcPath, viewBox, suffix, rawSizeMB) {
  const optimized = preprocessAndOptimize(srcPath, viewBox);
  let paths = parsePaths(optimized);
  if (paths.length === 0) {
    throw new Error(
      `BLOCKED: no stroked contour <path> parsed for ${page}${suffix}/${theme} — ramp lost after svgo.`,
    );
  }

  let decimations = 0;
  let working = paths;
  let plateSvg = buildPlateSvg(working, theme, viewBox);
  let plateBytes = Buffer.byteLength(plateSvg, 'utf8');

  while (plateBytes > MAX_BYTES) {
    decimations++;
    if (decimations > 6) {
      throw new Error(
        `BLOCKED: ${page}${suffix}_${theme}_plate still ${(plateBytes / 1024 / 1024).toFixed(2)}MB after ${decimations} decimations.`,
      );
    }
    working = decimate(working);
    plateSvg = buildPlateSvg(working, theme, viewBox);
    plateBytes = Buffer.byteLength(plateSvg, 'utf8');
  }

  // Glow uses the SAME `working` paths array the plate was assembled from —
  // pickGlowLines selects from this set and copies the exact same `d` strings.
  const glow = buildGlowSvg(working, theme, page, viewBox);
  const glowBytes = Buffer.byteLength(glow.svg, 'utf8');

  const platePath = path.join(OUT_DIR, `${page}_${theme}_plate${suffix}.svg`);
  const glowPath = path.join(OUT_DIR, `${page}_${theme}_glow${suffix}.svg`);
  fs.writeFileSync(platePath, plateSvg);
  fs.writeFileSync(glowPath, glow.svg);

  const plateKB = (plateBytes / 1024).toFixed(1);
  const glowKB = (glowBytes / 1024).toFixed(1);
  console.log(
    `[${page}${suffix}/${theme}] paths: ${working.length}, glow lines: ${glow.lineCount}, raw: ${rawSizeMB}MB, plate: ${plateKB}KB, glow: ${glowKB}KB${decimations ? ` (decimated x${decimations})` : ''}\n    -> ${platePath}\n    -> ${glowPath}`,
  );
  return {
    page: page + suffix,
    theme,
    paths: working.length,
    glowLines: glow.lineCount,
    rawMB: rawSizeMB,
    plateKB,
    glowKB,
    decimations,
  };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Delete the old merged outputs (<page>_<theme>.svg) and any stale split
  // files so the directory only ever holds the current output set.
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

    // Landscape (desktop) — two themes.
    for (const theme of ['light', 'dark']) {
      const row = buildPageTheme(page, theme, srcPath, VIEWBOX, '', rawSizeMB);
      sizeTable.push(row);
    }

    // Portrait (mobile) variant — only for pages listed in PAGES_MOBILE.
    if (PAGES_MOBILE[page]) {
      const mSrcPath = path.join(SRC_DIR_PORTRAIT, PAGES_MOBILE[page]);
      if (!fs.existsSync(mSrcPath)) {
        throw new Error(`BLOCKED: missing mobile source asset ${mSrcPath}`);
      }
      const { viewBox: mViewBox } = deriveViewBox(mSrcPath);
      const mRawSizeMB = (fs.statSync(mSrcPath).size / 1024 / 1024).toFixed(1);
      for (const theme of ['light', 'dark']) {
        const row = buildPageTheme(page, theme, mSrcPath, mViewBox, '_mobile', mRawSizeMB);
        sizeTable.push(row);
      }
    }
  }

  // Concurrent-fade analysis: compute worst-case overlapping fade windows.
  const maxConcurrent = computeMaxConcurrentFades(GLOW_LINES);
  console.log(`\nConcurrent-fade analysis (GLOW_LINES=${GLOW_LINES}):`);
  console.log(`  Fade window per line: 7s (2.5s in + 2s hold + 2.5s out)`);
  console.log(`  Cycle periods: ${Array.from({length: GLOW_LINES}, (_, i) => cyclePeriod(i).toFixed(1)).join(', ')}s`);
  console.log(`  Delays: ${Array.from({length: GLOW_LINES}, (_, i) => lineDelay(i).toFixed(2)).join(', ')}s`);
  console.log(`  Worst-case simultaneous fades: ${maxConcurrent}`);
  if (maxConcurrent > 3) {
    console.warn(`  WARNING: max concurrent fades (${maxConcurrent}) exceeds budget of 3!`);
  } else {
    console.log(`  OK: within the ≤3 simultaneous budget.`);
  }

  const totalFiles = sizeTable.reduce((acc) => acc + 2, 0);
  console.log(`\nDone. ${totalFiles} SVGs (${totalFiles / 2} plate + ${totalFiles / 2} glow) written to`, OUT_DIR);
  console.table(sizeTable);
}

main();
