// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/maps/mapConfigurations.ts
// Centralized map configurations to reduce duplication

import maplibregl from 'maplibre-gl';

export interface MapLayerConfig {
  id: string;
  type: 'fill' | 'line' | 'circle' | 'symbol';
  color: string;
  outlineColor?: string;
  opacity: number;
  strokeWidth?: number;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  style: string;
  maxBounds?: maplibregl.LngLatBoundsLike;
  initialBounds?: maplibregl.LngLatBoundsLike;
  geojsonPath?: string;
  pointsPath?: string;
  dataLayer?: MapLayerConfig;
}

// Base configurations that can be extended
export const BASE_CONFIGS = {
  US_NATIONAL: {
    center: [-95.5795, 39.8283] as [number, number],
    zoom: 2.7,
    maxBounds: [
      [-167.276413, 15.875834],
      [-52.233040, 72.553967]
    ] as maplibregl.LngLatBoundsLike,
  },
};

// Standard layer configurations
export const LAYER_CONFIGS: Record<string, MapLayerConfig> = {
  WATERSHED: {
    id: 'watershed-hub',
    type: 'fill',
    color: '#3fbffb',
    outlineColor: '#000000',
    opacity: 0.3,
    strokeWidth: 0.5
  }
};

// Styles URL
export const DEFAULT_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
export const GRAY_STYLE = 'https://tiles.openfreemap.org/styles/positron';
export const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

// Project-specific configurations
export const PROJECT_CONFIGS: Record<string, MapConfig> = {
  'prison-ej': {
    ...BASE_CONFIGS.US_NATIONAL,
    style: GRAY_STYLE,
    geojsonPath: '/data/nasa_eej_prisons_poly_pctl_simple.geojson',
    pointsPath: '/data/nasa_eej_prisons_pts_pctl_simple.geojson',
  },
  'watershed-hub': {
    center: [-119.956, 37.424] as [number, number],
    zoom: 5.5,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/HUC8_CA_simple.geojson',
    dataLayer: LAYER_CONFIGS.WATERSHED,
    initialBounds: [
      [-126.363547557, 32.235563893],   // Southwest corner [EPSG:4326]
      [-113.548955642, 42.611619160]    // Northeast corner [EPSG:4326]
    ] as maplibregl.LngLatBoundsLike
  }
};

export function getMapConfig(projectId: string): MapConfig {
  return PROJECT_CONFIGS[projectId] || PROJECT_CONFIGS['prison-ej'];
}
