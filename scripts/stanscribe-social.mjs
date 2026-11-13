#!/usr/bin/env node
// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// scripts/stanscribe-social.mjs
// Draws Stan Scribe's link-preview card (1200 x 630): fills scripts/stanscribe-social/card.html, photographs it
// in a headless Chromium browser over the DevTools protocol, and writes public/images/stanscribe/stan-scribe-social.jpg.
// Run it after `npm run build` (it reads the page's fonts from out/) and again whenever the hero image or
// card.html changes, then raise the ?v= number on SOCIAL_IMAGE.url in lib/stanscribe.ts:
//   npm run build:stanscribe-social
// Set CHROME_PATH if no Chromium browser is found. The JPEG is committed; the Netlify build does not run this.

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/images/stanscribe/stan-scribe-social.jpg');
const [WIDTH, HEIGHT] = [1200, 630];

const BROWSERS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const dataUri = (file, mime) => `data:${mime};base64,${readFileSync(file).toString('base64')}`;

/** The latin woff2 the last build wrote for a font family, read from the build's own @font-face rules. */
function builtFont(family) {
  const chunks = join(ROOT, 'out/_next/static/chunks');
  if (!existsSync(chunks)) throw new Error('out/ is missing. Run `npm run build` first.');
  for (const file of readdirSync(chunks).filter((name) => name.endsWith('.css'))) {
    const css = readFileSync(join(chunks, file), 'utf8');
    for (const [, rule] of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      // next/font writes one rule per subset; the latin one's range starts at U+0000-00FF, minified to U+??.
      if (!rule.includes(`font-family:${family}`) || !/unicode-range:U\+(\?\?|0000-00FF)/i.test(rule)) continue;
      const url = rule.match(/url\(([^)]+\.woff2)\)/)?.[1];
      if (url) return dataUri(join(chunks, url), 'font/woff2');
    }
  }
  throw new Error(`No built latin font for "${family}" in out/. Run \`npm run build\` first.`);
}

const browser = BROWSERS.find((candidate) => candidate && existsSync(candidate));
if (!browser) throw new Error('No Chromium browser found. Set CHROME_PATH to one.');

const fill = {
  NEWSREADER: builtFont('Newsreader'),
  HANKEN: builtFont('Hanken Grotesk'),
  ICON: dataUri(join(ROOT, 'public/images/stanscribe/app-icon.png'), 'image/png'),
  PHONES: dataUri(join(ROOT, 'public/images/stanscribe/hero-stan-scribe.webp'), 'image/webp'),
  PLATE: dataUri(join(ROOT, 'public/images/plates/interests_dark_plate.svg'), 'image/svg+xml'),
};
const template = readFileSync(join(ROOT, 'scripts/stanscribe-social/card.html'), 'utf8');
const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in fill)) throw new Error(`card.html asks for {{${key}}}, which this script does not fill.`);
  return fill[key];
});

const work = mkdtempSync(join(tmpdir(), 'stanscribe-social-'));
const page = join(work, 'card.html');
const profile = join(work, 'profile');
writeFileSync(page, html);

// Brave's headless mode does not exit after a command-line --screenshot, so the page is photographed over
// the DevTools protocol and the browser is closed here. Port 0 lets the browser pick a free port, which it
// writes to DevToolsActivePort in its own profile, so the script never talks to another browser.
const chrome = spawn(browser, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank',
], { stdio: 'ignore' });
const exited = once(chrome, 'exit');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** How long the browser has to answer a command or send an event. */
const TIMEOUT_MS = 30_000;

/** The port this browser chose, once it has written it: the file's first line. */
function activePort() {
  try {
    const port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
    return Number.isInteger(port) && port > 0 ? port : undefined;
  } catch {
    return undefined;
  }
}

let png;
let ws;
try {
  let socketUrl;
  for (let attempt = 0; attempt < 50 && !socketUrl; attempt++) {
    const port = activePort();
    if (port) {
      try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        socketUrl = targets.find((target) => target.type === 'page')?.webSocketDebuggerUrl;
      } catch {
        // The browser has a port but is not answering on it yet.
      }
    }
    if (!socketUrl) await sleep(200);
  }
  if (!socketUrl) throw new Error(`${browser} did not start.`);
  ws = new WebSocket(socketUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  // A message is a command's answer, keyed by the command's id, or an event, keyed by its name.
  const waiting = new Map();
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    const key = msg.id ?? msg.method;
    const settle = waiting.get(key);
    if (!settle) return;
    waiting.delete(key);
    settle(msg);
  });
  /** The message `key` names, or an error once TIMEOUT_MS passes without it. */
  const message = (key, what) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        waiting.delete(key);
        reject(new Error(`${browser} sent no ${what} in ${TIMEOUT_MS / 1000} s.`));
      }, TIMEOUT_MS);
      waiting.set(key, (msg) => {
        clearTimeout(timer);
        if (msg.error) reject(new Error(`${what}: ${JSON.stringify(msg.error)}`));
        else resolve(msg.result ?? msg.params);
      });
    });
  let nextId = 0;
  const send = (method, params = {}) => {
    const id = ++nextId;
    const answer = message(id, `answer to ${method}`);
    ws.send(JSON.stringify({ id, method, params }));
    return answer;
  };

  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  const [, navigation] = await Promise.all([message('Page.loadEventFired', 'load event'), send('Page.navigate', { url: pathToFileURL(page).href })]);
  if (navigation.errorText) throw new Error(`${browser} could not open the card: ${navigation.errorText}.`);
  // The fonts and the pictures are data URIs; wait until the page has decoded them.
  await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => new Promise((done) => setTimeout(done, 500)))', awaitPromise: true });
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } });
  png = Buffer.from(data, 'base64');
} finally {
  ws?.close();
  if (chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill();
    await exited;
  }
  rmSync(work, { recursive: true, force: true });
}

await sharp(png).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' }).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
const meta = await sharp(OUT).metadata();
if (meta.width !== WIDTH || meta.height !== HEIGHT) throw new Error(`The card is ${meta.width} x ${meta.height}, not ${WIDTH} x ${HEIGHT}.`);
console.log(`${OUT} (${WIDTH} x ${HEIGHT})`);
