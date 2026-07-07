// scripts/lib/simplify-path.mjs
// Pure SVG path vertex decimation for the contour plates: flatten (M/L/H/V/
// C/S/Q/T + Z; curves sampled) → per-subpath Douglas-Peucker → compact
// relative re-emit. No fs, no deps. Root cause + tolerance evidence:
// docs/superpowers/plans/2026-07-06-plate-simplification.md.

const CURVE_SAMPLES = 8;

export function flattenToSubpaths(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const subpaths = [];
  let pts = null;
  let i = 0, cmd = '';
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let pqx = null, pqy = null; // previous quadratic control (for T)
  let pcx = null, pcy = null; // previous cubic control (for S)
  const num = () => parseFloat(tokens[i++]);
  const open = () => { pts = { points: [[cx, cy]], closed: false }; subpaths.push(pts); };
  const push = (x, y) => { pts.points.push([x, y]); cx = x; cy = y; };
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    const x0 = cx, y0 = cy;
    for (let k = 1; k <= CURVE_SAMPLES; k++) {
      const t = k / CURVE_SAMPLES, mt = 1 - t;
      pts.points.push([
        mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3,
        mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3,
      ]);
    }
    cx = x3; cy = y3; pcx = x2; pcy = y2; pqx = pqy = null;
  };
  const quad = (x1, y1, x2, y2) => {
    const x0 = cx, y0 = cy;
    for (let k = 1; k <= CURVE_SAMPLES; k++) {
      const t = k / CURVE_SAMPLES, mt = 1 - t;
      pts.points.push([
        mt * mt * x0 + 2 * mt * t * x1 + t * t * x2,
        mt * mt * y0 + 2 * mt * t * y1 + t * t * y2,
      ]);
    }
    cx = x2; cy = y2; pqx = x1; pqy = y1; pcx = pcy = null;
  };
  const lineish = () => { pqx = pqy = pcx = pcy = null; };

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case 'M': cx = num(); cy = num(); sx = cx; sy = cy; open(); lineish(); cmd = 'L'; break;
      case 'm': cx += num(); cy += num(); sx = cx; sy = cy; open(); lineish(); cmd = 'l'; break;
      case 'L': push(num(), num()); lineish(); break;
      case 'l': push(cx + num(), cy + num()); lineish(); break;
      case 'H': push(num(), cy); lineish(); break;
      case 'h': push(cx + num(), cy); lineish(); break;
      case 'V': push(cx, num()); lineish(); break;
      case 'v': push(cx, cy + num()); lineish(); break;
      case 'C': cubic(num(), num(), num(), num(), num(), num()); break;
      case 'c': cubic(cx + num(), cy + num(), cx + num(), cy + num(), cx + num(), cy + num()); break;
      case 'S': { const x2 = num(), y2 = num(), x3 = num(), y3 = num();
        cubic(pcx != null ? 2 * cx - pcx : cx, pcy != null ? 2 * cy - pcy : cy, x2, y2, x3, y3); break; }
      case 's': { const x2 = cx + num(), y2 = cy + num(), x3 = cx + num(), y3 = cy + num();
        cubic(pcx != null ? 2 * cx - pcx : cx, pcy != null ? 2 * cy - pcy : cy, x2, y2, x3, y3); break; }
      case 'Q': quad(num(), num(), num(), num()); break;
      case 'q': quad(cx + num(), cy + num(), cx + num(), cy + num()); break;
      case 'T': { const x2 = num(), y2 = num();
        quad(pqx != null ? 2 * cx - pqx : cx, pqy != null ? 2 * cy - pqy : cy, x2, y2); break; }
      case 't': { const x2 = cx + num(), y2 = cy + num();
        quad(pqx != null ? 2 * cx - pqx : cx, pqy != null ? 2 * cy - pqy : cy, x2, y2); break; }
      case 'Z': case 'z':
        if (pts) pts.closed = true;
        cx = sx; cy = sy; lineish();
        break;
      case 'A': case 'a':
        throw new Error('simplify-path: arc command not supported — extend the flattener');
      default: i++; break;
    }
  }
  return subpaths;
}

// Iterative Douglas-Peucker; endpoints always survive.
export function dpSimplify(points, tol) {
  const n = points.length;
  if (n <= 2 || tol <= 0) return points;
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  const tol2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let maxD = -1, maxI = -1;
    for (let k = a + 1; k < b; k++) {
      const [px, py] = points[k];
      let d2;
      if (len2 === 0) { const ex = px - ax, ey = py - ay; d2 = ex * ex + ey * ey; }
      else { const cross = dx * (ay - py) - dy * (ax - px); d2 = (cross * cross) / len2; }
      if (d2 > maxD) { maxD = d2; maxI = k; }
    }
    if (maxD > tol2) { keep[maxI] = 1; stack.push([a, maxI], [maxI, b]); }
  }
  const out = [];
  for (let k = 0; k < n; k++) if (keep[k]) out.push(points[k]);
  return out;
}

const fmt = (v) => String(Math.round(v * 100) / 100).replace(/^0\./, '.').replace(/^-0\./, '-.');

// Absolute M + relative l deltas from the previously EMITTED (rounded)
// position, so rounding error never accumulates along a contour.
export function emitD(subpaths) {
  let d = '';
  for (const sp of subpaths) {
    const p = sp.points;
    if (p.length < 2) continue;
    d += `M${fmt(p[0][0])} ${fmt(p[0][1])}`;
    let lx = Math.round(p[0][0] * 100) / 100, ly = Math.round(p[0][1] * 100) / 100;
    for (let k = 1; k < p.length; k++) {
      const tx = Math.round(p[k][0] * 100) / 100, ty = Math.round(p[k][1] * 100) / 100;
      const dx = tx - lx, dy = ty - ly;
      if (dx === 0 && dy === 0) continue;
      d += `l${fmt(dx)} ${fmt(dy)}`;
      lx = tx; ly = ty;
    }
    if (sp.closed) d += 'z';
  }
  return d;
}

export function simplifyPathData(d, tolerance) {
  const subpaths = flattenToSubpaths(d);
  return emitD(subpaths.map((sp) => ({ ...sp, points: dpSimplify(sp.points, tolerance) })));
}
