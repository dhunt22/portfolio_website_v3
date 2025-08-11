// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/maps/MapControls.tsx
// Extracted control panel for map interactions

'use client';

import React from 'react';

// Define types locally to avoid import issues
type RiskAttribute = 'fnl_rs_' | 'clmt_sc' | 'effcts_' | 'expsr_s';

const RISK_ATTRIBUTES: Record<RiskAttribute, string> = {
  "fnl_rs_": "Overall Risk Score",
  "clmt_sc": "Climate Risk", 
  "effcts_": "Effects Risk",
  "expsr_s": "Exposure Risk"
};

interface MapControlsProps {
  projectId: string;
  selectedAttribute: RiskAttribute;
  setSelectedAttribute: (attr: RiskAttribute) => void;
  showAllPrisons: boolean;
  setShowAllPrisons: (show: boolean) => void;
  showCategoryPanel: boolean;
  setShowCategoryPanel: (show: boolean) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  projectId,
  selectedAttribute,
  setSelectedAttribute,
  showAllPrisons,
  setShowAllPrisons,
  showCategoryPanel,
  setShowCategoryPanel
}) => {
  if (projectId !== 'prison-ej') return null;

  return (
    <div className="absolute top-4 right-16 z-[1000] flex flex-col gap-2 control-panel">
      {/* Category Panel - Visible by default, can be minimized */}
      {showCategoryPanel && (
        <div className="relative">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-56">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-forest-700">
                Risk Category
              </label>
              <button
                onClick={() => setShowCategoryPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                title="Minimize panel"
                aria-label="Minimize risk category panel"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <select
              className="w-full rounded border border-forest-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value as RiskAttribute)}
              aria-label="Select risk category"
            >
              {Object.entries(RISK_ATTRIBUTES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-forest-600">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
              <div className="h-2 w-full rounded bg-gradient-to-r from-[#2ecc71] via-[#f1c40f] to-[#e74c3c]" />
            </div>
          </div>
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
      
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowAllPrisons(!showAllPrisons)}
        className={`bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 ${
          !showAllPrisons ? 'bg-forest-100 border-forest-400 ring-1 ring-forest-200' : ''
        }`}
        title={showAllPrisons ? 'Show top 10 highest risk' : 'Show all prisons'}
        aria-label={showAllPrisons ? 'Filter to top 10 highest risk prisons' : 'Show all prisons'}
      >
        {showAllPrisons ? (
          // All prisons icon - grid/list view
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ) : (
          // Top 10 icon - filter with number badge
          <div className="relative">
            <svg className="w-4 h-4 text-forest-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-forest-600 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold leading-none">
              10
            </span>
          </div>
        )}
      </button>
      
      {/* Status indicator */}
      <div className="bg-white rounded-md px-2 py-1 shadow-sm border border-gray-200">
        <span className="text-xs text-forest-600 font-medium">
          {showAllPrisons ? 'All Prisons' : 'Top 10'}
        </span>
      </div>
    </div>
  );
};

export default MapControls;
