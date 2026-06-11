// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/ProjectMap.tsx
// Refactored map component with improved DRY practices and maintainability

'use client';

import './project-map.css';
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getMapConfig } from '@/lib/maps/mapConfigurations';
import { setupPrisonLayers, setupSubbasinLayers, addMapControls } from '@/lib/maps/layerSetup';
import { usePrisonMap } from '@/hooks/usePrisonMap';
import { useMapPopup } from '@/hooks/useMapPopup';
import MapControls from '@/components/maps/MapControls';

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

const ProjectMap: React.FC<ProjectMapProps> = ({ projectId, selectedComponent, componentColor }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(true); // Default to open
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Generate unique ID for this map instance to avoid conflicts
  const mapInstanceId = useRef<string>(`map-${Math.random().toString(36).substring(2, 11)}`);
  const instanceId = mapInstanceId.current;
  
  // Use custom hooks for prison map functionality
  const {
    selectedAttribute,
    setSelectedAttribute,
    showAllPrisons,
    setShowAllPrisons,
    setAllPrisonData,
    updatePrisonColors
  } = usePrisonMap(map, projectId, selectedComponent, componentColor, instanceId);

  // Use custom hook for popup management
  const { setupPopupHandlers } = useMapPopup(map, projectId, selectedAttribute, selectedComponent, instanceId);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    console.log(`Initializing map for project: ${projectId}`);
    const mapConfig = getMapConfig(projectId);
    
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapConfig.style,
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

          // Re-setup popup handlers when source data is loaded to ensure layers exist
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
  }, [projectId]);
  
  // Update prison map colors when selectedAttribute changes - with immediate effect
  useEffect(() => {
    if (projectId === 'prison-ej' && map.current?.isStyleLoaded()) {
      console.log(`Updating colors for attribute change: ${selectedAttribute}`);
      try {
        updatePrisonColors(selectedComponent, componentColor);
        setupPopupHandlers();
      } catch (error) {
        console.error('Error updating prison colors:', error);
        setMapError(`Failed to update colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [selectedAttribute, selectedComponent, componentColor, projectId]); // Removed updatePrisonColors and setupPopupHandlers from deps to avoid cycles
  
  // Handle immediate component selection changes
  useEffect(() => {
    if (projectId === 'prison-ej' && map.current?.isStyleLoaded() && selectedComponent && componentColor) {
      console.log(`Updating colors for component selection change: ${selectedComponent}`);
      try {
        updatePrisonColors(selectedComponent, componentColor);
        setupPopupHandlers();
      } catch (error) {
        console.error('Error updating colors for component selection:', error);
        setMapError(`Failed to update colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [selectedComponent, componentColor, projectId]);
  
  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Element;

      // Close panel when clicking outside of it (only when panel is open)
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
        showAllPrisons={showAllPrisons}
        setShowAllPrisons={setShowAllPrisons}
        showCategoryPanel={showCategoryPanel}
        setShowCategoryPanel={setShowCategoryPanel}
        hideRiskSelector={!!selectedComponent && selectedComponent !== 'overall'}
        componentName={selectedComponent && selectedComponent !== 'overall' ? getCurrentComponentName(selectedComponent) : undefined}
        componentColor={selectedComponent && selectedComponent !== 'overall' ? componentColor : undefined}
      />
    </div>
  );
};

export default ProjectMap;
