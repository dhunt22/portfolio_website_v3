// scripts/lib/simplify-path.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flattenToSubpaths, dpSimplify, emitD, simplifyPathData } from './simplify-path.mjs';

test('flatten: relative polyline + close', () => {
  const sps = flattenToSubpaths('M10 10l5 0 0 5h-5zM30 30l1 1');
  assert.equal(sps.length, 2);
  assert.deepEqual(sps[0].points, [[10, 10], [15, 10], [15, 15], [10, 15]]);
  assert.equal(sps[0].closed, true);
  assert.equal(sps[1].closed, false);
});

test('flatten: cubic + smooth-cubic sampled to 8 segments each', () => {
  const sps = flattenToSubpaths('M0 0C1 2 3 2 4 0s3 -2 4 0');
  assert.equal(sps[0].points.length, 1 + 8 + 8);
  const [x, y] = sps[0].points.at(-1);
  assert.ok(Math.abs(x - 8) < 1e-9 && Math.abs(y - 0) < 1e-9);
});

test('flatten: quadratic + T reflection endpoint', () => {
  const sps = flattenToSubpaths('M0 0Q2 4 4 0t4 0');
  assert.equal(sps[0].points.length, 1 + 8 + 8);
  const [x] = sps[0].points.at(-1);
  assert.ok(Math.abs(x - 8) < 1e-9);
});

test('flatten: arc throws loudly', () => {
  assert.throws(() => flattenToSubpaths('M0 0A5 5 0 0 1 10 0'), /arc/i);
});

test('dp: removes within-tolerance jitter, keeps geometric features', () => {
  const pts = [[0, 0], [1, 0.01], [2, 0], [3, 2], [4, 0]];
  const out = dpSimplify(pts, 0.1);
  // [1,0.01] is within tolerance of the [0,0]→[2,0] sub-chord and is dropped.
  // [2,0] IS retained: once [3,2] splits the range, [2,0] deviates ~1.11 from
  // the [0,0]→[3,2] sub-chord — true DP re-evaluates against sub-chords, which
  // is what preserves contour shape (a single-pass endpoint-chord filter would
  // wrongly cut this corner).
  assert.deepEqual(out, [[0, 0], [2, 0], [3, 2], [4, 0]]);
});

test('dp: endpoints always survive', () => {
  const out = dpSimplify([[0, 0], [5, 0.001], [10, 0]], 1);
  assert.deepEqual(out, [[0, 0], [10, 0]]);
});

test('emitD: no error accumulation across rounded deltas, z on closed', () => {
  const d = emitD([{ points: [[0, 0], [1.004, 0], [2.008, 0]], closed: true }]);
  assert.equal(d, 'M0 0l1 0l1.01 0z');
});

test('simplifyPathData round-trip shrinks a dense wiggle', () => {
  let d = 'M0 0';
  for (let i = 1; i <= 100; i++) d += `l1 ${i % 2 ? 0.01 : -0.01}`;
  const out = simplifyPathData(d, 0.1);
  assert.ok(out.length < d.length / 5, `expected big shrink, got ${out.length} vs ${d.length}`);
  assert.match(out, /^M0 0l/);
});
