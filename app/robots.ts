// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/robots.ts
// Robots.txt configuration for SEO

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/data/*.json'],
      },
    ],
    sitemap: 'https://devinhunt.com/sitemap.xml',
    host: 'https://devinhunt.com',
  };
}
