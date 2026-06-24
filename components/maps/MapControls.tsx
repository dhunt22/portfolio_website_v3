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
  // Mobile-only collapsing percentile disclosure. The inline 4-button segment
  // overflows a narrow mobile map pane, so below `sm` it is replaced by one
  // trigger that opens an upward vertical stack. These hooks precede the
  // projectId guard below to satisfy the rules of hooks.
  const [percentileMenuOpen, setPercentileMenuOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close on outside tap — mirrors the proven pointerdown idiom in ProjectMap's
  // legend click-away, scoped to this menu's own marker class. `pointerdown`
  // (not click) so taps never fall through to the maplibre canvas; the early
  // return keeps no document listener attached while the menu is closed.
  React.useEffect(() => {
    if (!percentileMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest('.percentile-menu')) setPercentileMenuOpen(false);
    };
    // Escape closes and returns focus to the trigger (a disclosure norm the
    // legend lacks). A document listener catches it from anywhere in the menu.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPercentileMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [percentileMenuOpen]);

  if (projectId !== 'prison-ej') return null;

  const currentPercentileLabel = (
    PERCENTILE_OPTIONS.find((o) => o.value === percentileThreshold) ?? PERCENTILE_OPTIONS[0]
  ).label;

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
      {/* color-mix gives a real translucent fill: bg-card/80 is dead on a hex token
          (--surface-card has no <alpha-value> slot), so the bar would otherwise be
          fill-less and the controls would float, unreadable, over the bare basemap. */}
      <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-30 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 py-1.5 rounded border border-border bg-[color-mix(in_srgb,var(--surface-card)_88%,transparent)] backdrop-blur-sm">
        {/* Percentile segmented control (desktop+) — plain buttons with aria-pressed.
            Hidden below `sm`, where the collapsing disclosure below takes over. */}
        <div
          aria-label="Percentile threshold"
          className="hidden sm:flex items-center rounded border border-border overflow-hidden"
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

        {/* Percentile collapsing disclosure (mobile) — one trigger showing the
            current selection; tapping opens an upward vertical stack of options.
            Selecting one, tapping away, or pressing Escape collapses it. */}
        <div className="relative sm:hidden percentile-menu">
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={percentileMenuOpen}
            // aria-controls only while the stack is rendered — else it's a dangling IDREF.
            {...(percentileMenuOpen ? { 'aria-controls': 'percentile-menu-stack' } : {})}
            aria-label={`Percentile threshold, currently ${currentPercentileLabel}`}
            onClick={() => setPercentileMenuOpen((open) => !open)}
            // Transparent over the filled toolbar bar (matches the sibling toggles); the bar's
            // color-mix surface gives the trigger's state text its contrast floor over the map.
            className="flex items-center gap-1.5 min-h-[44px] px-2.5 py-1 text-xs font-sans font-medium rounded border border-border text-ink-muted hover:text-ink-strong hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-ink-muted">Percentile:</span>
            <span className="text-ink-strong">{currentPercentileLabel}</span>
            <svg
              className={['w-3 h-3 transition-transform', percentileMenuOpen ? 'rotate-180' : ''].join(' ')}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {percentileMenuOpen && (
            <div
              id="percentile-menu-stack"
              role="group"
              aria-label="Percentile threshold"
              // Solid bg-card (not bg-card/95): --surface-card is a hex, so Tailwind's
              // /opacity modifier compiles to an invalid color → a transparent panel the
              // busy map bleeds through. The legend's .panel uses the same solid fill; the
              // border defines the edge and the shadow adds a light lift over the map.
              className="absolute bottom-full left-0 mb-1 z-30 flex flex-col w-36 rounded border border-border bg-card shadow-xl overflow-hidden animate-rise"
            >
              {PERCENTILE_OPTIONS.map((opt) => {
                const isSelected = percentileThreshold === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      handlePercentileChange(opt.value);
                      setPercentileMenuOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={[
                      'w-full min-h-[44px] px-3 py-2.5 text-sm font-sans font-medium text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
          )}
        </div>

        {/* Divider */}
        <span className="hidden sm:inline-block h-4 w-px bg-border" aria-hidden />

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
                    : 'text-ink-muted border-border hover:text-ink-strong hover:bg-card',
                ].join(' ')}
              >
                {ft.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="hidden sm:inline-block h-4 w-px bg-border" aria-hidden />

        {/* Reset view button */}
        {onResetView && (
          <button
            type="button"
            onClick={onResetView}
            title="Reset map view to US extent"
            aria-label="Reset map view"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium text-ink-muted rounded border border-border hover:text-ink-strong hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
