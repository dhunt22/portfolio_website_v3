// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/site/metadata.ts
// A portfolio page's title, description and share cards. Next replaces a page's openGraph and twitter
// objects whole instead of merging them with the root layout's, so every page builds both here.

import type { Metadata } from 'next';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    openGraph: { type: 'website', locale: 'en_US', siteName: 'Devin Hunt Portfolio', url: `https://devinhunt.com${path}`, title, description },
    // No share image on the portfolio, so the small card.
    twitter: { card: 'summary', creator: '@devinhunt', title, description },
  };
}
