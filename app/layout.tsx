// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/layout.tsx
// The topographic map that guides all other components - hope it doesn't lead us off a cliff!

import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { pageMetadata } from '@/lib/site/metadata';
import { Metadata, Viewport } from 'next';

// Viewport export — Next takes it separately from metadata.
// interactiveWidget: 'resizes-visual' tells mobile browsers that the on-screen
// keyboard resizes only the visual viewport, not the layout viewport, preventing
// layout reflows when the keyboard appears or dismisses. NOTE: this setting does
// NOT prevent the URL-bar from resizing fixed elements or viewport units (lvh).
// iOS WebKit re-resolves lvh frame-by-frame as the address bar retracts (bugs
// 255708 / 261185), and Chrome Android's interactive-widget only governs the
// virtual keyboard — the URL bar still causes height changes. The backdrop
// component handles this separately via a px-pinned inline height on mobile.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-visual',
};

// The home page's metadata, and the fallback for every page that sets none of its own.
export const metadata: Metadata = {
  ...pageMetadata(
    'Devin Hunt · Water resources engineering and AI tools',
    'Devin Hunt models California’s groundwater and builds the Python and AI tools around that work.',
    '',
  ),
  keywords: ['hydrologist', 'water resources', 'engineer', 'IWFM', 'geospatial', 'exploration', 'fishing', 'mycology'],
  authors: [{ name: 'Devin Hunt', url: 'https://devinhunt.com' }],
  creator: 'Devin Hunt',
};

/**
 * RootLayout component that wraps all pages with common layout elements
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {React.JSX.Element} The complete layout with the theme provider and error boundary; each route group supplies its own frame and fonts
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-paint bootstrap, runs synchronously before first paint:
            1. `js` class — HeroLoadIn's CSS selector `html.js [data-hero-loadin] > *`
               hides children before GSAP runs (no FOUC, no-JS users keep content).
            2. `--backdrop-h` — px-pins the contour backdrop height on touch-primary
               devices BEFORE the first paint, so the plate's cover scale never
               changes afterwards (useEffect pinning was post-paint and caused a
               one-time rescale that read as a first-scroll glitch on iOS, where
               lvh resolves small until the URL bar first collapses). screen.* are
               CSS px; min/max normalizes iOS (orientation-fixed) vs Android. */}
        <script dangerouslySetInnerHTML={{ __html: "(function(){var d=document.documentElement;d.classList.add('js');try{var w=innerWidth,c=matchMedia('(pointer: coarse)').matches;if(w<768||c){var p=innerHeight>=w?Math.max(screen.height,screen.width):Math.min(screen.height,screen.width);d.style.setProperty('--backdrop-h',p+'px');}}catch(e){}})()" }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="font-sans overflow-x-hidden bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="min-h-svh flex flex-col">
              {/* Each route group's frame (and app/not-found.tsx) renders the skip link and the <main id="main"> it targets. */}
              {children}
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
