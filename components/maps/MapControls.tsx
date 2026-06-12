// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/maps/MapControls.tsx
// DS-restyled legend + percentile/type/view toolbar overlaid on the map edge

'use client';

import React from 'react';
import type { PercentileThreshold, FacilityType } from '@/hooks/usePrisonMap';

// Define types locally to avoid circular imports
type RiskAttribute = 'final_risk_score_pcntl' | 'climate_score' | 'effects_score' | 'exposure_score';

interface MapControlsProps {
  projectId: string;
  selectedAttribute: RiskAttribute;
  setSelectedAttribute: (attr: RiskAttribute) => void;
  showCategoryPanel: boolean;
  setShowCategoryPanel: (show: boolean) => void;
  hideRiskSelector?: boolean;
  componentName?: string;
  componentColor?: string;
  percentileThreshold?: PercentileThreshold;
  setPercentileThreshold?: (t: PercentileThreshold) => void;
  facilityTypes?: FacilityType[];
  setFacilityTypes?: (types: FacilityType[]) => void;
  onResetView?: () => void;
}

// Segmented control option
const PERCENTILE_OPTIONS: { label: string; value: PercentileThreshold }[] = [
  { label: 'All', value: 0 },
  { label: '≥50th', value: 50 },
  { label: '≥75th', value: 75 },
  { label: '≥95th', value: 95 },
];

const FACILITY_TYPES: { label: string; value: FacilityType }[] = [
  { label: 'State', value: 'STATE' },
  { label: 'Federal', value: 'FEDERAL' },
];

const MapControls: React.FC<MapControlsProps> = ({
  projectId,
  selectedAttribute,
  setSelectedAttribute,
  showCategoryPanel,
  setShowCategoryPanel,
  hideRiskSelector = false,
  componentName,
  componentColor,
  percentileThreshold = 0,
  setPercentileThreshold,
  facilityTypes = ['STATE', 'FEDERAL'],
  setFacilityTypes,
  onResetView,
}) => {
  if (projectId !== 'prison-ej') return null;

  const handleTypeToggle = (type: FacilityType) => {
    if (!setFacilityTypes) return;
    const isActive = facilityTypes.includes(type);
    // No-op if it would deactivate the last type
    if (isActive && facilityTypes.length === 1) return;
    const next = isActive
      ? facilityTypes.filter(t => t !== type)
      : [...facilityTypes, type];
    setFacilityTypes(next);
  };

  const handlePercentileChange = (value: PercentileThreshold) => {
    if (setPercentileThreshold) {
      setPercentileThreshold(value);
    }
  };

  return (
    <>
      {/* ── Toolbar row: compact control group at the bottom-left of the map ── */}
      <div className="absolute bottom-2 left-2 z-30 flex items-center gap-3 px-3 py-1.5 rounded border border-border bg-card/80 backdrop-blur-sm">
        {/* Percentile segmented control — plain buttons with aria-pressed */}
        <div
          aria-label="Percentile threshold"
          className="flex items-center rounded border border-white/20 overflow-hidden"
        >
          {PERCENTILE_OPTIONS.map((opt) => {
            const isSelected = percentileThreshold === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handlePercentileChange(opt.value)}
                className={[
                  'px-2.5 py-1 text-xs font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'bg-ink-strong text-card'
                    : 'text-ink-muted hover:text-ink-strong hover:bg-card',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="h-4 w-px bg-white/20" aria-hidden />

        {/* Facility type toggles */}
        <div className="flex items-center gap-1.5" aria-label="Facility type filter">
          {FACILITY_TYPES.map((ft) => {
            const isActive = facilityTypes.includes(ft.value);
            return (
              <button
                key={ft.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleTypeToggle(ft.value)}
                className={[
                  'px-2.5 py-1 text-xs font-sans font-medium rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-ink-strong text-card border-ink-strong'
                    : 'text-ink-muted border-white/20 bg-card/80 backdrop-blur-sm hover:text-ink-strong hover:bg-card',
                ].join(' ')}
              >
                {ft.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="h-4 w-px bg-white/20" aria-hidden />

        {/* Reset view button */}
        {onResetView && (
          <button
            type="button"
            onClick={onResetView}
            title="Reset map view to US extent"
            aria-label="Reset map view"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium text-ink-muted rounded border border-white/20 bg-card/80 backdrop-blur-sm hover:text-ink-strong hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Home/reset icon */}
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M1.5 6.5L8 1.5L14.5 6.5V14H10V10H6V14H1.5V6.5Z" />
            </svg>
            <span>Reset view</span>
          </button>
        )}
      </div>

      {/* ── Legend: overlaid top-right, collapsible ── */}
      <div className="absolute top-2 right-14 z-40 flex flex-col items-end gap-1 control-panel">
        {showCategoryPanel ? (
          <div className="panel p-3 w-44">
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow">
                {hideRiskSelector && componentName ? componentName : 'Risk Score'}
              </span>
              <button
                onClick={() => setShowCategoryPanel(false)}
                className="text-ink-faint hover:text-ink-muted transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Collapse legend"
                aria-label="Collapse legend"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-ink-faint">Low</span>
              <span className="font-mono text-xs text-ink-faint">High</span>
            </div>
            {hideRiskSelector && componentName && componentColor ? (
              <div
                className="h-2.5 w-full rounded-sm"
                style={{
                  background: `linear-gradient(to right, #ffffff, ${componentColor}40, ${componentColor}80, ${componentColor}cc, ${componentColor})`
                }}
              />
            ) : (
              <div className="h-2.5 w-full rounded-sm bg-gradient-to-r from-[#2ecc71] via-[#f1c40f] to-[#e74c3c]" />
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowCategoryPanel(true)}
            className="p-1.5 text-ink-muted hover:text-ink-strong border border-border rounded bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Show legend"
            aria-label="Show legend"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <circle cx="3.5" cy="4" r="1" fill="currentColor" stroke="none" />
              <line x1="7" y1="4" x2="14" y2="4" strokeLinecap="round" />
              <circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" />
              <line x1="7" y1="8" x2="14" y2="8" strokeLinecap="round" />
              <circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none" />
              <line x1="7" y1="12" x2="14" y2="12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};

export default MapControls;
