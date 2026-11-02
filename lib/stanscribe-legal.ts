// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe-legal.ts
// Server only: reads a legal page's words at build time. scripts/sync-stanscribe-legal.mjs writes them.

import fs from 'node:fs';
import path from 'node:path';
import { APPS, type AppKey, type LegalSlug } from '@/lib/stanscribe';

export function legalWords(app: AppKey, slug: LegalSlug): string {
  return fs.readFileSync(path.join(process.cwd(), 'content/stanscribe-legal', APPS[app].route, `${slug}.html`), 'utf8');
}
