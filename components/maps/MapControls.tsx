// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/maps/MapControls.tsx
// Extracted control panel for map interactions

'use client';

import React from 'react';

// Define types locally to avoid import issues (using new geojson column names)
type RiskAttribute = 'final_risk_score_pcntl' | 'climate_score' | 'effects_score' | 'exposure_score';

const RISK_ATTRIBUTES: Record<RiskAttribute, string> = {
  "final_risk_score_pcntl": "Overall Risk Score",
  "climate_score": "Climate Risk",
  "effects_score": "Effects Risk",
  "exposure_score": "Exposure Risk"
};

interface MapControlsProps {
  projectId: string;
  selectedAttribute: RiskAttribute;
  setSelectedAttribute: (attr: RiskAttribute) => void;
  showAllPrisons: boolean;
  setShowAllPrisons: (show: boolean) => void;
  showCategoryPanel: boolean;
  setShowCategoryPanel: (show: boolean) => void;
  hideRiskSelector?: boolean; // New prop to hide risk category selector
  componentName?: string; // Component name for legend
  componentColor?: string; // Component color for gradient legend
}

const MapControls: React.FC<MapControlsProps> = ({
  projectId,
  selectedAttribute,
  setSelectedAttribute,
  showAllPrisons,
  setShowAllPrisons,
  showCategoryPanel,
  setShowCategoryPanel,
  hideRiskSelector = false,
  componentName,
  componentColor
}) => {
  if (projectId !== 'prison-ej') return null;

  return (
    <div className="absolute top-4 right-16 z-40 flex flex-col gap-2 control-panel">
      {/* Legend Panel - Always show simplified gradient */}
      {showCategoryPanel && (
        <div className="relative">
          {hideRiskSelector && componentName && componentColor ? (
            // Component-specific legend (simplified)
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-48">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-forest-700">
                  {componentName}
                </label>
                <button
                  onClick={() => setShowCategoryPanel(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Minimize legend"
                  aria-label="Minimize component legend"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-forest-600 mb-1">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
              <div 
                className="h-3 w-full rounded" 
                style={{ 
                  background: `linear-gradient(to right, #ffffff, ${componentColor}40, ${componentColor}80, ${componentColor}cc, ${componentColor})` 
                }} 
              />
            </div>
          ) : (
            // Overall risk legend (simplified - no dropdown selector)
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-48">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-forest-700">
                  Overall Risk Score
                </label>
                <button
                  onClick={() => setShowCategoryPanel(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Minimize legend"
                  aria-label="Minimize risk legend"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-forest-600 mb-1">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
              <div className="h-3 w-full rounded bg-gradient-to-r from-[#2ecc71] via-[#f1c40f] to-[#e74c3c]" />
            </div>
          )}
        </div>
      )}
      
      {/* Show category button when panel is minimized */}
      {!showCategoryPanel && (
        <button
          onClick={() => setShowCategoryPanel(true)}
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500"
          title="Show risk category panel"
          aria-label="Show risk category panel"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      )}
      
      {/* Filter Toggle Button - Always show for prison maps */}
      <button
        onClick={() => setShowAllPrisons(!showAllPrisons)}
        className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-3 py-2 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 min-w-[48px] flex items-center justify-center"
        title={showAllPrisons ? 'Show top 10 highest risk' : 'Show all prisons'}
        aria-label={showAllPrisons ? 'Filter to top 10 highest risk prisons' : 'Show all prisons'}
      >
        <span className="text-sm font-medium text-black">
          {showAllPrisons ? 'All' : '10'}
        </span>
      </button>
    </div>
  );
};

export default MapControls;
