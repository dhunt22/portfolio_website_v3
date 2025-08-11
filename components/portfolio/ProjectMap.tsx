// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/ProjectMap.tsx
// Refactored map component with improved DRY practices and maintainability

'use client';

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
}

const ProjectMap: React.FC<ProjectMapProps> = ({ projectId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [showCategoryPanel, setShowCategoryPanel] = useState(true); // Default to open
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Use custom hooks for prison map functionality
  const {
    selectedAttribute,
    setSelectedAttribute,
    showAllPrisons,
    setShowAllPrisons,
    setAllPrisonData,
    updatePrisonColors
  } = usePrisonMap(map, projectId);

  // Use custom hook for popup management
  const { setupPopupHandlers } = useMapPopup(map, projectId, selectedAttribute);

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
            });
          } else if (projectId === 'cuyama-basin' || projectId === 'yuba-recharge') {
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
        if (e.dataType === 'source' && e.sourceId === 'prisons') {
          console.log('Prison source data loaded');
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
        updatePrisonColors();
        setupPopupHandlers();
      } catch (error) {
        console.error('Error updating prison colors:', error);
        setMapError(`Failed to update colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [selectedAttribute, projectId]); // Removed updatePrisonColors and setupPopupHandlers from deps to avoid cycles
  
  // Close panels when clicking outside (only for category panel when minimized)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.control-panel') && !showCategoryPanel) {
        // Only handle outside clicks when panel is minimized
        // When open, user must explicitly close it
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryPanel]);
  
  if (mapError) {
    return (
      <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-red-50 border border-red-200 flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-red-800 font-semibold mb-2">Map Error</h3>
          <p className="text-red-600 text-sm">{mapError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      <MapControls
        projectId={projectId}
        selectedAttribute={selectedAttribute}
        setSelectedAttribute={setSelectedAttribute}
        showAllPrisons={showAllPrisons}
        setShowAllPrisons={setShowAllPrisons}
        showCategoryPanel={showCategoryPanel}
        setShowCategoryPanel={setShowCategoryPanel}
      />
    </div>
  );
};

export default ProjectMap;
