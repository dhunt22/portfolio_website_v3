// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/LazyProjectMap.tsx
// Lazy loaded wrapper for ProjectMap to improve performance

'use client';

import React, { Suspense, lazy } from 'react';

// Lazy load the ProjectMap component
const ProjectMap = lazy(() => import('./ProjectMap'));

interface LazyProjectMapProps {
  projectId: string;
}

// Loading fallback component
const MapLoadingFallback: React.FC = () => (
  <div className="w-full h-full min-h-[300px] rounded-lg bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600 mb-2"></div>
      <p className="text-sm text-gray-600">Loading interactive map...</p>
    </div>
  </div>
);

// Error boundary for map loading errors
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-red-800 mb-1">Map Loading Error</h3>
            <p className="text-xs text-red-600">
              Unable to load the interactive map. Please refresh the page to try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const LazyProjectMap: React.FC<LazyProjectMapProps> = ({ projectId }) => {
  return (
    <MapErrorBoundary>
      <Suspense fallback={<MapLoadingFallback />}>
        <ProjectMap projectId={projectId} />
      </Suspense>
    </MapErrorBoundary>
  );
};

export default LazyProjectMap;