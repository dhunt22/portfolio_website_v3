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
 *   5. Emits a FULL-TWIN glow per page: every plate path verbatim (bit-identical
 *      post-svgo geometry), grouped into GLOW_BANDS elevation bands by stroke-
 *      colour luminance, strokes = var(--surface-page). The runtime sweeps a
 *      wave of erasure through the bands (comet routes and MotionPath are GONE).
 *   6. Assembles TWO output SVGs per page into public/images/plates/:
 *        <page>_<theme>_plate.svg  — contours ONLY (static; consumed as a CSS
 *          background-image, so no <style>/keyframes/sprites/gradients).
 *        {page}_glow.svg / home_glow_mobile.svg — the reverse-glow overlay only:
 *          same viewBox + slice, SUBSET of plate paths copied verbatim (exact `d`
 *          and stroke-width/linecap). Overlay paths carry
 *          style="stroke:var(--surface-page)" instead of a hard-coded hex — the
 *          CSS custom property resolves from the page's html.dark class, so a
 *          SINGLE themeless file handles both light and dark. opacity=0, and
 *          data-line/data-cycle/data-delay attributes for GSAP. Zero comet
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
// Reverse-glow knobs (v4 — full-twin elevation-band wave)
// ---------------------------------------------------------------------------

// The glow file is a FULL TWIN of the plate (user spec: "render the SVG twice
// on top of itself") — every contour path, verbatim geometry, stroke =
// var(--surface-page). Paths are grouped into GLOW_BANDS elevation bands by
// stroke-colour luminance (contours are level sets; the hypsometric ramp IS
// the elevation key). The runtime sweeps a wave of erasure through the bands:
// each band fades toward the page background and back, in elevation order —
// the terrain visibly "breathes" while registration stays pixel-perfect.
// Timing constants (step/fade/hold/peak) live in AnimatedContourBackground.tsx
// so they can be tuned without regenerating assets.
const GLOW_BANDS = 9;

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
// Elevation banding (v4 — full-twin wave)
// ---------------------------------------------------------------------------
// Contour stroke colours encode elevation (hypsometric ramp). Rank the unique
// colours by relative luminance and bucket them into GLOW_BANDS bands, so each
// band is a contiguous range of elevations. Deterministic: same input → same
// banding (no randomness, no time dependence).
function assignBands(paths) {
  const lum = (hex) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const colors = [...new Set(paths.map((p) => p.stroke))].sort((a, b) => lum(a) - lum(b));
  const bandOf = new Map(colors.map((c, rank) => [c, Math.min(GLOW_BANDS - 1, Math.floor((rank / colors.length) * GLOW_BANDS))]));
  const bands = Array.from({ length: GLOW_BANDS }, () => []);
  for (const p of paths) bands[bandOf.get(p.stroke)].push(p);
  return bands.filter((b) => b.length > 0);
}

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
// path strings). Overlay paths carry style="stroke:var(--surface-page)" so
// the CSS custom property resolves from the page's html.dark class — a SINGLE
// themeless file handles both light (#f7f4ec) and dark (#1a1814). Presentation
// attributes can't hold var(); the style attribute can. The plate group's
// 0.35/0.30 wrapper opacity does NOT apply here (full-strength bg stroke is
// required to fully erase a line: line×(1−α) → 0 at α=1).
//
// Each path carries: data-line, data-cycle (period in seconds), data-delay
// (initial phase scatter in seconds). All animation is driven by GSAP at
// runtime via AnimatedContourBackground. Re-theming is instant — var() resolves
// live; no refetch required on theme toggle.

function buildGlowSvg(paths, page, viewBox) {
  const vb = viewBox ?? VIEWBOX;
  const [vbX, vbY, vbW, vbH] = vb.split(' ').map(Number);

  const bands = assignBands(paths);

  // Scope the clip id per page: glows are inlined into a shared document, so
  // `url(#mc)` must not collide across pages.
  const clipId = `${page}-mc`;
  const defsBlock =
    `<defs><clipPath id="${clipId}"><rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}"/></clipPath></defs>`;

  // One <g data-band> per elevation band, opacity 0 at rest. Paths inside are
  // verbatim plate geometry (exact d + stroke-width — the overlay must cover
  // exactly the pixels the plate line occupies). stroke comes from the CSS
  // custom property so one themeless file serves both themes and re-themes
  // live with zero refetch. NOTE: no plate-style 0.35/0.30 group opacity here —
  // a band at animated opacity α erases its lines by factor α (full-strength
  // background-colour cover is what makes the erase reach the page colour).
  const bandBody = bands
    .map((bandPaths, b) => {
      const body = bandPaths
        .map((p) => `<path d="${p.d}" stroke-width="${p.width}"/>`)
        .join('');
      return `<g data-band="${b}" opacity="0">${body}</g>`;
    })
    .join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">` +
    defsBlock +
    `<g clip-path="url(#${clipId})" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--surface-page)">${bandBody}</g>` +
    `</svg>`;

  return { svg, bandCount: bands.length, pathCount: paths.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Build both theme plates for one (page, orientation) into OUT_DIR.
// Also builds ONE shared themeless glow file (only on the FIRST call for this
// page+suffix combo — caller controls this via emitGlow flag).
// Returns size-table rows (one per theme plate + one glow row).
function buildPageOrientation(page, srcPath, viewBox, suffix, rawSizeMB, emitGlow) {
  const optimized = preprocessAndOptimize(srcPath, viewBox);
  let paths = parsePaths(optimized);
  if (paths.length === 0) {
    throw new Error(
      `BLOCKED: no stroked contour <path> parsed for ${page}${suffix} — ramp lost after svgo.`,
    );
  }

  // Build both theme plates from the same parsed paths.
  const rows = [];
  let sharedWorking = null;

  for (const theme of ['light', 'dark']) {
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

    const platePath = path.join(OUT_DIR, `${page}_${theme}_plate${suffix}.svg`);
    fs.writeFileSync(platePath, plateSvg);
    const plateKB = (plateBytes / 1024).toFixed(1);
    console.log(
      `[${page}${suffix}/${theme}] paths: ${working.length}, raw: ${rawSizeMB}MB, plate: ${plateKB}KB${decimations ? ` (decimated x${decimations})` : ''}\n    -> ${platePath}`,
    );
    rows.push({
      page: page + suffix,
      theme,
      paths: working.length,
      rawMB: rawSizeMB,
      plateKB,
      decimations,
    });

    // Use the light-theme working set for glow path selection (the d strings are
    // identical between themes — only stroke colours differ in the plate).
    if (theme === 'light') sharedWorking = working;
  }

  // Emit ONE themeless glow file (uses the light working paths — geometry is
  // identical for both themes; only the stroke colour differed, which is now
  // var(--surface-page) resolved by CSS at runtime).
  if (emitGlow && sharedWorking) {
    const glowSuffix = suffix ? suffix : '';
    const glowName = suffix
      ? `${page}_glow${glowSuffix}.svg`
      : `${page}_glow.svg`;
    const glow = buildGlowSvg(sharedWorking, page, viewBox);
    const glowBytes = Buffer.byteLength(glow.svg, 'utf8');
    const glowPath = path.join(OUT_DIR, glowName);
    fs.writeFileSync(glowPath, glow.svg);
    const glowKB = (glowBytes / 1024).toFixed(1);
    console.log(
      `[${page}${suffix}/glow] bands: ${glow.bandCount}, paths: ${glow.pathCount}, glow: ${glowKB}KB (themeless full twin)\n    -> ${glowPath}`,
    );
    rows.push({
      page: page + suffix,
      theme: '(glow)',
      paths: sharedWorking.length,
      rawMB: rawSizeMB,
      plateKB: '-',
      glowKB,
      decimations: 0,
    });
  }

  return rows;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Delete all stale SVGs from the output directory so only the current output
  // set remains. (Old {page}_{light|dark}_glow*.svg files are removed here.)
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

    // Landscape (desktop) — both theme plates + ONE shared glow.
    const rows = buildPageOrientation(page, srcPath, VIEWBOX, '', rawSizeMB, true);
    sizeTable.push(...rows);

    // Portrait (mobile) variant — only for pages listed in PAGES_MOBILE.
    if (PAGES_MOBILE[page]) {
      const mSrcPath = path.join(SRC_DIR_PORTRAIT, PAGES_MOBILE[page]);
      if (!fs.existsSync(mSrcPath)) {
        throw new Error(`BLOCKED: missing mobile source asset ${mSrcPath}`);
      }
      const { viewBox: mViewBox } = deriveViewBox(mSrcPath);
      const mRawSizeMB = (fs.statSync(mSrcPath).size / 1024 / 1024).toFixed(1);
      const mRows = buildPageOrientation(page, mSrcPath, mViewBox, '_mobile', mRawSizeMB, true);
      sizeTable.push(...mRows);
    }
  }

  // Wave concurrency: window 5.6s / step 2s -> at most 3 bands mid-transition
  // (timing lives in AnimatedContourBackground.tsx; assets carry no timing).

  const plateFiles = sizeTable.filter((r) => r.theme !== '(glow)').length;
  const glowFiles = sizeTable.filter((r) => r.theme === '(glow)').length;
  console.log(`\nDone. ${plateFiles + glowFiles} SVGs (${plateFiles} plate + ${glowFiles} glow) written to`, OUT_DIR);
  console.table(sizeTable);
}

main();
