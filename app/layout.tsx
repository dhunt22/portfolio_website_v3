// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/layout.tsx
// The topographic map that guides all other components - hope it doesn't lead us off a cliff!

import './globals.css';
import { newsreader, hanken, jetbrains } from './fonts';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Metadata } from 'next';
import Script from 'next/script';

// Define the metadata for the application
export const metadata: Metadata = {
  title: 'Devin Hunt - Water Resources Engineer & Explorer',
  description: 'Portfolio of Devin Hunt, a water resources engineer passionate about hydrological challenges and outdoor adventures.',
  keywords: ['hydrologist', 'water resources', 'engineer', 'IWFM', 'geospatial', 'exploration', 'fishing', 'mycology'],
  authors: [{ name: 'Devin Hunt', url: 'https://devinhunt.com' }],
  creator: 'Devin Hunt',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devinhunt.com',
    title: 'Devin Hunt - Water Resources Engineer & Explorer',
    description: 'Portfolio of Devin Hunt, a water resources engineer passionate about hydrological challenges and outdoor adventures.',
    siteName: 'Devin Hunt Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devin Hunt - Water Resources Engineer & Explorer',
    description: 'Portfolio of Devin Hunt, a water resources engineer passionate about hydrological challenges and outdoor adventures.',
    creator: '@devinhunt',
  },
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
      <body className={`${newsreader.variable} ${hanken.variable} ${jetbrains.variable} font-sans overflow-x-hidden bg-background text-foreground antialiased`}>
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
