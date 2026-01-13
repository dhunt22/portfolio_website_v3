// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/resume/layout.tsx
// SEO metadata layout for resume page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume | Devin Hunt - Water Resources Engineer',
  description: 'Professional resume of Devin Hunt, Water Resources Engineer II at Woodard & Curran. Expertise in IWFM groundwater modeling, ArcGIS Pro, Python automation, and California SGMA groundwater sustainability plans. BS in Watershed Science from Colorado State University.',
  keywords: [
    'water resources engineer resume',
    'hydrologist',
    'IWFM',
    'ArcGIS Pro',
    'QGIS',
    'Python',
    'groundwater modeling',
    'Woodard & Curran',
    'Colorado State University',
    'watershed science',
    'geospatial analyst',
    'California SGMA',
    'GSP development'
  ],
  openGraph: {
    title: 'Resume | Devin Hunt - Water Resources Engineer',
    description: 'Professional resume of Devin Hunt, Water Resources Engineer with expertise in IWFM groundwater modeling, geospatial analysis, and California SGMA groundwater sustainability plans.',
    url: 'https://devinhunt.com/resume',
    type: 'profile',
    siteName: 'Devin Hunt Portfolio',
  },
  twitter: {
    card: 'summary',
    title: 'Resume | Devin Hunt - Water Resources Engineer',
    description: 'Water Resources Engineer with expertise in IWFM groundwater modeling, geospatial analysis, and California SGMA groundwater sustainability plans.',
  },
  alternates: {
    canonical: 'https://devinhunt.com/resume',
  },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
