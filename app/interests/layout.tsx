// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/interests/layout.tsx
// SEO metadata layout for interests page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Interests | Devin Hunt - Explorer & Naturalist',
  description: 'Discover Devin Hunt\'s personal interests including overland exploration, fly fishing in Colorado and California, bicycle mechanics, mycology foraging, nature photography with Sony a6300, and GIS data visualization projects in Sacramento.',
  keywords: [
    'exploration',
    'overland travel',
    'fly fishing',
    'trout fishing Colorado',
    'bicycle mechanics',
    'Bike Kitchen Sacramento',
    'mycology',
    'mushroom foraging',
    'nature photography',
    'Sony a6300',
    'GIS visualization',
    'Sacramento community',
    'outdoor adventures'
  ],
  openGraph: {
    title: 'Personal Interests | Devin Hunt - Explorer & Naturalist',
    description: 'Discover personal interests including overland exploration, fly fishing, bicycle mechanics, mycology, nature photography, and GIS visualization.',
    url: 'https://devinhunt.com/interests',
    type: 'website',
    siteName: 'Devin Hunt Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Interests | Devin Hunt - Explorer & Naturalist',
    description: 'Discover personal interests including overland exploration, fly fishing, bicycle mechanics, mycology, nature photography, and GIS visualization.',
  },
  alternates: {
    canonical: 'https://devinhunt.com/interests',
  },
};

export default function InterestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
