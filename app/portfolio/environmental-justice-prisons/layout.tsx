// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/environmental-justice-prisons/layout.tsx
// SEO metadata layout for Environmental Justice for Prisons project page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Environmental Justice for Prisons | NASA Research Project | Devin Hunt',
  description: 'Explore the NASA Equity and Environmental Justice Grant project mapping environmental vulnerabilities across 1,865 U.S. state and federal prisons using MODIS satellite data, climate risk indicators, air quality measurements, and proximity to hazardous sites.',
  keywords: [
    'environmental justice prisons',
    'NASA EJ grant',
    'prison environmental justice',
    'geospatial analysis',
    'climate risk assessment',
    'air quality prisons',
    'hazardous waste proximity',
    'incarceration environmental health',
    'Colorado State University',
    'Geospatial Centroid',
    'MODIS satellite data',
    'R spatial analysis',
    'vulnerability index',
    'environmental racism'
  ],
  openGraph: {
    title: 'Environmental Justice for Prisons | NASA Research Project',
    description: 'NASA-funded research mapping environmental vulnerabilities across 1,865 U.S. prisons using satellite data, climate indicators, and proximity to hazardous sites.',
    url: 'https://devinhunt.com/portfolio/environmental-justice-prisons',
    type: 'article',
    siteName: 'Devin Hunt Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Environmental Justice for Prisons | NASA Research Project',
    description: 'NASA-funded research mapping environmental vulnerabilities across 1,865 U.S. prisons using satellite data, climate indicators, and proximity to hazardous sites.',
  },
  alternates: {
    canonical: 'https://devinhunt.com/portfolio/environmental-justice-prisons',
  },
  other: {
    'article:author': 'Devin Hunt',
    'article:published_time': '2023-01-01',
  },
};

export default function EnvironmentalJusticePrisonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
