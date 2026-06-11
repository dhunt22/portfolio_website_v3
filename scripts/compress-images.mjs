// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// scripts/compress-images.mjs
//
// Compress the heavy portfolio photos to WebP. Each source is resized to a
// max width of 1600px (never enlarged), encoded as WebP at quality 82, written
// alongside the original, and the original is deleted. If a result exceeds the
// 300KB budget it is re-encoded at quality 75. The string literals that
// reference the originals are updated by hand (extension changes only).
//
// Usage: node scripts/compress-images.mjs

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const MAX_WIDTH = 1600;
const QUALITY = 82;
const FALLBACK_QUALITY = 75;
const BUDGET_BYTES = 300 * 1024;

const SOURCES = [
  'antelope_valley_LACPW_district40.png',
  'yuba_recharge_suitability_index_preview.png',
  'modesto_infiltration_snyderWest.jpg',
  'photography.jpg',
  'bicycle_kitchen.jpg',
];

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(1)}KB`;

async function encode(srcPath, outPath, quality) {
  await sharp(srcPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);
  return fs.statSync(outPath).size;
}

async function run() {
  for (const name of SOURCES) {
    const srcPath = path.join(IMAGES_DIR, name);
    if (!fs.existsSync(srcPath)) {
      console.warn(`SKIP (missing): ${name}`);
      continue;
    }

    const before = fs.statSync(srcPath).size;
    const outName = `${path.parse(name).name}.webp`;
    const outPath = path.join(IMAGES_DIR, outName);

    let quality = QUALITY;
    let after = await encode(srcPath, outPath, quality);

    if (after > BUDGET_BYTES) {
      quality = FALLBACK_QUALITY;
      after = await encode(srcPath, outPath, quality);
    }

    fs.unlinkSync(srcPath);

    const note = after > BUDGET_BYTES ? ' (OVER BUDGET)' : '';
    console.log(
      `${name} -> ${outName}  ${fmtKB(before)} -> ${fmtKB(after)}  q=${quality}${note}`
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
