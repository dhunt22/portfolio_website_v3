#!/usr/bin/env node
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/scroll-trace.mjs
// Scrolls a page with real wheel input in a headed Chromium browser and reads the trace for what the
// compositor did: frames presented, frames dropped, blank tiles. It sees work on the GPU side as well as on
// the main thread, which a requestAnimationFrame timer does not.
//
//   node scripts/scroll-trace.mjs <url> <rounds> <variant,variant,...> [--big] [--light]
//
// Variants are CSS injected into the live page, so one page load compares several states, interleaved:
//   shipped   the page as served
//   noGlow    the animated glow hidden
//   noVeil    the page-coloured veil over the contours hidden
//   noPlate   no contours at all
// --big emulates a 2560 x 1440 window at 2x. --light asks for the day theme.
// Run at least five rounds a side before calling two states different, and report the range.
// Set CHROME_PATH if no Chromium browser is found. The browser uses a temporary profile and is closed at the end.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, roundsArg, variantsArg, ...flags] = process.argv.slice(2);
if (!url || !roundsArg || !variantsArg) {
  console.error('usage: node scripts/scroll-trace.mjs <url> <rounds> <variant,variant,...> [--big] [--light]');
  process.exit(2);
}
const rounds = Number(roundsArg);
const PORT = 9337;

const VARIANTS = {
  shipped: '',
  noGlow: '[data-contour-plate] svg { display: none !important; }',
  noVeil: '.bg-background.fixed { display: none !important; }',
  noPlate: '[data-contour-plate] { display: none !important; } .bg-background.fixed { display: none !important; }',
};
const variants = variantsArg.split(',');
for (const variant of variants) if (!(variant in VARIANTS)) throw new Error(`unknown variant "${variant}". Known: ${Object.keys(VARIANTS).join(', ')}`);

const BROWSERS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];
const browser = BROWSERS.find((candidate) => candidate && existsSync(candidate));
if (!browser) throw new Error('No Chromium browser found. Set CHROME_PATH to one.');

const profile = mkdtempSync(join(tmpdir(), 'scroll-trace-'));
const chrome = spawn(browser, [
  `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=1728,960', '--window-position=0,0', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
  'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pageSocket() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = targets.find((target) => target.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // The browser is still starting.
    }
    await sleep(200);
  }
  throw new Error('The browser did not start.');
}

const ws = new WebSocket(await pageSocket());
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
let onEvent = () => {};
ws.addEventListener('message', (message) => {
  const msg = JSON.parse(message.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  } else onEvent(msg);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pending.set(++nextId, { resolve, reject });
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

const CATEGORIES = ['benchmark', 'cc', 'gpu', 'viz', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'devtools.timeline'];

function analyze(events) {
  // One PipelineReporter per frame the compositor meant to produce; its state says whether it reached the screen.
  const frames = events.filter((event) => event.name === 'PipelineReporter' && event.ph === 'b').map((event) => event.args?.frame_reporter ?? {});
  const state = (name) => frames.filter((frame) => frame.state === name).length;
  const sumMs = (name) => Math.round(events.filter((event) => event.name === name && event.ph === 'X').reduce((total, event) => total + (event.dur ?? 0), 0) / 1000);
  return {
    presented: events.filter((event) => event.name === 'DrawFrame').length,
    droppedEvents: events.filter((event) => event.name === 'DroppedFrame').length,
    reporterDropped: state('STATE_DROPPED'),
    notNeeded: state('STATE_NO_UPDATE_DESIRED'),
    blankTiles: frames.filter((frame) => frame.has_missing_content || frame.checkerboarded_needs_raster || frame.checkerboarded_needs_record).length,
    rasterMs: sumMs('RasterTask'),
    gpuTaskMs: sumMs('GPUTask'),
  };
}

try {
  await send('Page.enable');
  if (flags.includes('--big')) await send('Emulation.setDeviceMetricsOverride', { width: 2560, height: 1440, deviceScaleFactor: 2, mobile: false });
  if (flags.includes('--light')) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await send('Page.navigate', { url });
  await sleep(9000); // load, the plate's fade-in, and the glow's 2 s delay plus its fetch
  const env = JSON.parse(await evaluate(`JSON.stringify({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, pageH: document.documentElement.scrollHeight, dark: document.documentElement.classList.contains('dark'), glow: !!document.querySelector('[data-contour-plate] svg'), visible: document.visibilityState })`));
  console.log('env', JSON.stringify(env));
  await evaluate(`(() => { const style = document.createElement('style'); style.id = 'scroll-trace'; document.head.appendChild(style); })()`);

  for (let round = 0; round < rounds; round++) {
    for (const variant of variants) {
      await evaluate(`document.getElementById('scroll-trace').textContent = ${JSON.stringify(VARIANTS[variant])}; window.scrollTo(0, 0); 1`);
      await sleep(1500);
      const events = [];
      const complete = new Promise((resolve) => {
        onEvent = (msg) => {
          if (msg.method === 'Tracing.dataCollected') events.push(...msg.params.value);
          if (msg.method === 'Tracing.tracingComplete') resolve();
        };
      });
      await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: CATEGORIES } });
      const distance = env.pageH - env.h - 40;
      const started = Date.now();
      await send('Input.synthesizeScrollGesture', { x: 800, y: 500, yDistance: -distance, speed: 1500, gestureSourceType: 'mouse' });
      const scrollMs = Date.now() - started;
      await send('Tracing.end');
      await complete;
      const scrolled = await evaluate('Math.round(scrollY)');
      console.log(JSON.stringify({ variant, round, scrollMs, distance, scrolled, ...analyze(events) }));
    }
  }
} finally {
  ws.close();
  chrome.kill();
}
