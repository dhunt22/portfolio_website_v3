// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/portfolio/layout.tsx
// SEO metadata layout for portfolio section

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Water Resources & Geospatial Portfolio | Devin Hunt',
  description: 'Explore professional water resources and geospatial analysis projects by Devin Hunt, including groundwater sustainability plans, recharge suitability analysis, IWFM modeling, and NASA environmental justice research across California.',
  keywords: [
    'water resources portfolio',
    'geospatial analysis projects',
    'groundwater sustainability',
    'California SGMA',
    'IWFM modeling',
    'GIS projects',
    'Cuyama Valley',
    'Yuba Subbasins',
    'recharge suitability index',
    'environmental justice',
    'hydrologist portfolio'
  ],
  openGraph: {
    title: 'Water Resources & Geospatial Portfolio | Devin Hunt',
    description: 'Explore professional water resources and geospatial analysis projects including groundwater sustainability plans, IWFM modeling, and NASA environmental justice research.',
    url: 'https://devinhunt.com/portfolio',
    type: 'website',
    siteName: 'Devin Hunt Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Water Resources & Geospatial Portfolio | Devin Hunt',
    description: 'Explore professional water resources and geospatial analysis projects including groundwater sustainability plans, IWFM modeling, and NASA environmental justice research.',
  },
  alternates: {
    canonical: 'https://devinhunt.com/portfolio',
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
