// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/ProjectMap.tsx
// Refactored map component with improved DRY practices and maintainability

'use client';

import './project-map.css';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getMapConfig } from '@/lib/maps/mapConfigurations';
import { GRAY_STYLE, DARK_STYLE } from '@/lib/maps/mapConfigurations';
import { setupPrisonLayers, setupSubbasinLayers, addMapControls } from '@/lib/maps/layerSetup';
import { usePrisonMap } from '@/hooks/usePrisonMap';
import { useMapPopup } from '@/hooks/useMapPopup';
import MapControls from '@/components/maps/MapControls';
import { createEnhancedColorScale, applyFilterToLayers } from '@/lib/maps/mapUtils';
import { resolveActiveColumn, buildCombinedFilter } from '@/hooks/usePrisonMap';

interface ProjectMapProps {
  projectId: string;
  selectedComponent?: string;
  componentColor?: string;
}

// Helper function to get component display name
const getCurrentComponentName = (componentId: string): string => {
  const componentNames: Record<string, string> = {
    'heat': 'Heat Index',
    'canopy': 'Canopy Cover',
    'wildfire': 'Wildfire Risk',
    'flood': 'Flood Hazard',
    'ozone': 'Ozone Levels',
    'pm25': 'PM 2.5 Particulates',
    'pesticide': 'Pesticide Use',
    'traffic': 'Traffic Density',
    'superfund': 'Superfund Sites',
    'rmp': 'Risk Management Plan Facilities',
    'hazwaste': 'Hazardous Waste Sites'
  };
  return componentNames[componentId] || componentId;
};

const US_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-167.276413, 15.875834],
  [-52.233040, 72.553967]
];

const ProjectMap: React.FC<ProjectMapProps> = ({ projectId, selectedComponent, componentColor }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const isStyleChanging = useRef(false);
  // If a style swap is already in-flight, store the desired next theme here;
  // the style.load completion loop will apply it when the current swap finishes.
  const queuedTheme = useRef<string | null>(null);

  // Generate unique ID for this map instance to avoid conflicts
  const mapInstanceId = useRef<string>(`map-${Math.random().toString(36).substring(2, 11)}`);
  const instanceId = mapInstanceId.current;

  const { resolvedTheme } = useTheme();
  const prevTheme = useRef<string | undefined>(undefined);

  // Use custom hooks for prison map functionality
  const {
    selectedAttribute,
    setSelectedAttribute,
    percentileThreshold,
    setPercentileThreshold,
    facilityTypes,
    setFacilityTypes,
    setAllPrisonData,
    updatePrisonColors,
    // State refs for style.load re-apply
    percentileThresholdRef,
    facilityTypesRef,
    selectedAttributeRef,
    selectedComponentRef,
    componentColorRef,
    PRISON_LAYERS,
  } = usePrisonMap(map, projectId, selectedComponent, componentColor, instanceId);

  // Use custom hook for popup management
  const { setupPopupHandlers } = useMapPopup(map, projectId, selectedAttribute, selectedComponent, instanceId);

  // Reset view to US extent
  const handleResetView = () => {
    if (!map.current) return;
    map.current.fitBounds(US_BOUNDS, { padding: 20, duration: 600 });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    console.log(`Initializing map for project: ${projectId}`);
    const mapConfig = getMapConfig(projectId);

    // Pick style based on current theme at init time
    const initStyle = projectId === 'prison-ej'
      ? (resolvedTheme === 'dark' ? DARK_STYLE : GRAY_STYLE)
      : mapConfig.style;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: initStyle,
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        attributionControl: false,
        maxBounds: mapConfig.maxBounds || undefined
      });

      // If initialBounds is provided, fit to those bounds after map loads
      if (mapConfig.initialBounds) {
        map.current.once('load', () => {
          if (map.current && mapConfig.initialBounds) {
            map.current.fitBounds(mapConfig.initialBounds, { padding: 20 });
          }
        });
      }

      addMapControls(map.current);

      // Setup map layers based on project type
      const setupMapLayers = () => {
        if (!map.current) return;

        try {
          if (projectId === 'prison-ej') {
            // Idempotent: if a theme swap happened while the initial style was
            // still loading, its finalize path already (re)added the layers —
            // adding sources twice throws "source already exists".
            if (map.current.getLayer(`prison-${instanceId}-polygons`)) {
              console.log('Prison layers already present — skipping init setup');
              setupPopupHandlers();
              return;
            }
            console.log('Setting up prison layers...');
            setupPrisonLayers(map.current, mapConfig, selectedAttribute, (data) => {
              console.log('Prison data loaded for filtering:', data.length, 'features');
              setAllPrisonData(data);
            }, selectedComponent, componentColor, instanceId);
          } else if (projectId === 'watershed-hub') {
            console.log('Setting up subbasin layers...');
            setupSubbasinLayers(map.current, mapConfig);
          }

          setupPopupHandlers();
          setMapError(null);
        } catch (error) {
          console.error('Error setting up map layers:', error);
          setMapError(`Failed to setup map layers: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      if (map.current.isStyleLoaded()) {
        setupMapLayers();
      } else {
        map.current.on("load", setupMapLayers);
      }

      // Enhanced error handling
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError(`Map error: ${e.error?.message || 'Unknown map error'}`);
      });

      map.current.on('data', (e) => {
        if (e.dataType === 'source') {
          const sourceId = (e as any).sourceId;
          console.log(`Source data loaded: ${sourceId}`);

          if (sourceId === 'prisons' || sourceId === 'subbasin-source') {
            setTimeout(() => {
              setupPopupHandlers();
            }, 100);
          }
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ── Dark/light basemap theme sync ──────────────────────────────────────────
  useEffect(() => {
    if (projectId !== 'prison-ej') return;
    if (!map.current) return;
    if (!resolvedTheme) return;
    // Skip on first render (map init already picked the right style)
    if (prevTheme.current === undefined) {
      prevTheme.current = resolvedTheme;
      return;
    }
    if (prevTheme.current === resolvedTheme) return;
    prevTheme.current = resolvedTheme;

    // If a swap is already in-flight, queue the new target and let the
    // in-flight style.load loop pick it up — avoids double setStyle + double
    // once('style.load') which could cause "source already exists" errors.
    if (isStyleChanging.current) {
      queuedTheme.current = resolvedTheme;
      return;
    }

    const applyThemeSwap = (targetTheme: string) => {
      if (!map.current) return;
      const newStyle = targetTheme === 'dark' ? DARK_STYLE : GRAY_STYLE;
      console.log(`Theme changed to ${targetTheme} — swapping basemap to ${newStyle}`);

      isStyleChanging.current = true;
      queuedTheme.current = null;

      // Snapshot current state from refs (state may lag behind)
      const snapshotThreshold = percentileThresholdRef.current;
      const snapshotTypes = facilityTypesRef.current;
      const snapshotAttribute = selectedAttributeRef.current;
      const snapshotComponent = selectedComponentRef.current;
      const snapshotColor = componentColorRef.current;

      const mapConfig = getMapConfig(projectId);
      const lp = instanceId ? `prison-${instanceId}` : 'prison';

      const reAddLayers = () => {
        if (!map.current) return;
        // Idempotent: skip if this swap (or the init 'load' path) already added them.
        if (map.current.getLayer(`${lp}-polygons`)) return;
        console.log('Re-adding prison layers after basemap swap');

        try {
          const colorScale = createEnhancedColorScale(snapshotComponent, snapshotColor);

          // Re-add sources and layers (setupPrisonLayers fetches data again)
          setupPrisonLayers(
            map.current,
            mapConfig,
            snapshotAttribute,
            (data) => {
              // Re-apply saved filter state once data is available (event-driven, no setTimeout)
              const activeColumn = resolveActiveColumn(snapshotComponent, snapshotAttribute);
              const filterExpr = buildCombinedFilter(snapshotThreshold, snapshotTypes, activeColumn);
              console.log('Re-applying filter after style swap:', JSON.stringify(filterExpr));
              applyFilterToLayers(map.current!, PRISON_LAYERS, filterExpr);

              // Re-apply paint colors now that layers exist and data is ready
              const paintUpdates = [
                { layerId: `${lp}-polygons`, property: 'fill-color', value: colorScale },
                { layerId: `${lp}-polygons-highlight`, property: 'fill-color', value: colorScale },
                { layerId: `${lp}-centroids`, property: 'circle-color', value: colorScale },
              ];
              paintUpdates.forEach(({ layerId, property, value }) => {
                if (map.current?.getLayer(layerId)) {
                  map.current.setPaintProperty(layerId, property, value);
                }
              });
              map.current?.triggerRepaint();

              setAllPrisonData(data);
            },
            snapshotComponent,
            snapshotColor,
            instanceId
          );

          setupPopupHandlers();
          setMapError(null);
        } catch (error) {
          console.error('Error re-adding layers after style swap:', error);
        }
      };

      // Finalize is attached to BOTH 'style.load' and 'idle' and runs exactly
      // once — whichever fires first. Rationale (root cause of the stuck-map
      // bug): a single once('style.load') can be swallowed — maplibre's
      // default setStyle DIFFS between styles and skips the full style load,
      // and a swap initiated while the initial style is still loading also
      // never emits a discrete style.load. When that happened,
      // isStyleChanging stayed true FOREVER and every later toggle was
      // queued into the void: the map froze on the old basemap. 'idle' is
      // guaranteed once the map settles, so the flag always clears.
      let finalized = false;
      const finalize = () => {
        if (finalized || !map.current) return;
        finalized = true;
        map.current.off('style.load', finalize);
        map.current.off('idle', finalize);

        reAddLayers();
        isStyleChanging.current = false;

        // If another theme change arrived while this swap was in-flight, apply it now
        if (queuedTheme.current) {
          const next = queuedTheme.current;
          applyThemeSwap(next);
        }
      };

      // diff: false forces a FULL style reload — deterministic wipe + a
      // guaranteed 'style.load'. The default diff mode keeps the swap
      // partial and skips the event, leaving our custom layers half-gone.
      map.current.setStyle(newStyle, { diff: false });
      map.current.once('style.load', finalize);
      map.current.once('idle', finalize);
    };

    applyThemeSwap(resolvedTheme);
  // resolvedTheme is the only trigger; refs track the rest
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Re-bind popup handlers when the active indicator changes so popups show the
  // right values. Colors + filters are applied by usePrisonMap's own effect
  // (which queues on 'idle' if the map is busy) — the old pair of effects here
  // gated on isStyleLoaded() and silently DROPPED clicks made while tiles were
  // still loading. Popup rebinding is idempotent (useMapPopup offs before ons).
  useEffect(() => {
    if (projectId !== 'prison-ej' || !map.current) return;
    const m = map.current;
    const rebind = () => {
      try {
        setupPopupHandlers();
      } catch (error) {
        console.error('Error rebinding popup handlers:', error);
      }
    };
    if (m.getLayer(`prison-${instanceId}-polygons`)) {
      rebind();
      return;
    }
    m.once('idle', rebind);
    return () => {
      m.off('idle', rebind);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttribute, selectedComponent, componentColor, projectId]);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Element;
      if (showCategoryPanel && !target.closest('.control-panel')) {
        setShowCategoryPanel(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [showCategoryPanel]);

  if (mapError) {
    return (
      <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-red-50 border border-red-200 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-600 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-red-800 font-semibold mb-2">Map Loading Error</h3>
          <p className="text-red-600 text-sm mb-4">{mapError}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setMapError(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
            <button
              onClick={() => setMapError(null)}
              className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-100 transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden" style={{ pointerEvents: 'auto' }}>
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ pointerEvents: 'auto' }}
        role="application"
        aria-label={`Interactive map for ${projectId} project`}
        aria-describedby={`${projectId}-map-description`}
        tabIndex={0}
      />
      <div id={`${projectId}-map-description`} className="sr-only">
        Interactive geospatial map showing data for the {projectId} project. Use the controls below to filter and explore the data. Map supports zooming and panning with mouse or keyboard.
      </div>

      <MapControls
        projectId={projectId}
        selectedAttribute={selectedAttribute}
        setSelectedAttribute={setSelectedAttribute}
        showCategoryPanel={showCategoryPanel}
        setShowCategoryPanel={setShowCategoryPanel}
        hideRiskSelector={!!selectedComponent && selectedComponent !== 'overall'}
        componentName={selectedComponent && selectedComponent !== 'overall' ? getCurrentComponentName(selectedComponent) : undefined}
        componentColor={selectedComponent && selectedComponent !== 'overall' ? componentColor : undefined}
        percentileThreshold={percentileThreshold}
        setPercentileThreshold={setPercentileThreshold}
        facilityTypes={facilityTypes}
        setFacilityTypes={setFacilityTypes}
        onResetView={handleResetView}
      />
    </div>
  );
};

export default ProjectMap;
