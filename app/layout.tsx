// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/layout.tsx
// The topographic map that guides all other components - hope it doesn't lead us off a cliff!

import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Metadata } from 'next';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

// Define the metadata for the application
export const metadata: Metadata = {
  title: {
    default: 'Devin Hunt - Water Resources Engineer & Explorer',
    template: '%s | Devin Hunt',
  },
  description: 'Portfolio of Devin Hunt, a Water Resources Engineer at Woodard & Curran specializing in California SGMA groundwater sustainability plans, IWFM modeling, and geospatial analysis. Passionate about solving hydrological challenges through data-driven approaches.',
  keywords: [
    'Devin Hunt',
    'water resources engineer',
    'hydrologist',
    'IWFM',
    'geospatial analysis',
    'groundwater modeling',
    'California SGMA',
    'ArcGIS Pro',
    'QGIS',
    'Python',
    'watershed science',
    'Woodard & Curran',
    'Sacramento',
    'exploration',
    'fishing',
    'mycology'
  ],
  authors: [{ name: 'Devin Hunt', url: 'https://devinhunt.com' }],
  creator: 'Devin Hunt',
  publisher: 'Devin Hunt',
  metadataBase: new URL('https://devinhunt.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devinhunt.com',
    title: 'Devin Hunt - Water Resources Engineer & Explorer',
    description: 'Water Resources Engineer specializing in California SGMA groundwater sustainability plans, IWFM modeling, and geospatial analysis.',
    siteName: 'Devin Hunt Portfolio',
    images: [
      {
        url: '/images/profile.jpg',
        width: 1200,
        height: 630,
        alt: 'Devin Hunt - Water Resources Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devin Hunt - Water Resources Engineer & Explorer',
    description: 'Water Resources Engineer specializing in California SGMA groundwater sustainability plans, IWFM modeling, and geospatial analysis.',
    creator: '@devinhunt',
    images: ['/images/profile.jpg'],
  },
  verification: {
    google: 'google-site-verification-placeholder',
  },
  category: 'technology',
};

/**
 * RootLayout component that wraps all pages with common layout elements
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {React.JSX.Element} The complete layout with header, main content, and footer
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        {/* Structured Data - JSON-LD for Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Devin Hunt',
              url: 'https://devinhunt.com',
              image: 'https://devinhunt.com/images/profile.jpg',
              jobTitle: 'Water Resources Engineer II',
              worksFor: {
                '@type': 'Organization',
                name: 'Woodard & Curran',
              },
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Colorado State University',
              },
              knowsAbout: [
                'Water Resources Engineering',
                'Groundwater Modeling',
                'IWFM',
                'Geospatial Analysis',
                'ArcGIS Pro',
                'QGIS',
                'Python',
                'California SGMA',
                'Groundwater Sustainability Plans',
              ],
              sameAs: [
                'https://github.com/dhunt22',
              ],
            }),
          }}
        />
        {/* Structured Data - JSON-LD for WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Devin Hunt Portfolio',
              url: 'https://devinhunt.com',
              description: 'Portfolio of Devin Hunt, a Water Resources Engineer specializing in groundwater modeling and geospatial analysis.',
              author: {
                '@type': 'Person',
                name: 'Devin Hunt',
              },
            }),
          }}
        />
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.netlify.com;
          style-src 'self' 'unsafe-inline' https://*.openstreetmap.org https://*.openfreemap.org;
          img-src 'self' data: blob: https://*.openstreetmap.org https://*.openfreemap.org;
          font-src 'self';
          connect-src 'self' https://app.netlify.com https://*.openstreetmap.org https://*.openfreemap.org;
          frame-src 'self' https://app.netlify.com;
          worker-src 'self' blob:;
          manifest-src 'self';
        " />
        <Script src="/netlify-config.js" strategy="beforeInteractive" />
        <Script src="/map-proxy.js" strategy="beforeInteractive" />
        <Script src="/map-library-helper.js" strategy="afterInteractive" />
      </head>
      <body className={`${inter.className} overflow-x-hidden bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow pt-16">
                {children}
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
