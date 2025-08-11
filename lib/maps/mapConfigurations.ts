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
  CALIFORNIA_CENTRAL: {
    center: [-121.520, 39.120] as [number, number],
    zoom: 8,
  },
  SOUTHERN_CALIFORNIA: {
    center: [-117.5525, 33.7596] as [number, number],
    zoom: 8,
  },
  CUYAMA_VALLEY: {
    center: [-119.630, 34.9220] as [number, number],
    zoom: 8,
  },
  CV_FOOTHILL_SA: {
    center: [-120.7414, 38.1044] as [number, number],
    zoom: 12,
  },
};

// Standard layer configurations
export const LAYER_CONFIGS: Record<string, MapLayerConfig> = {
  GROUNDWATER_BASIN: {
    id: 'groundwater-basins',
    type: 'fill',
    color: '#7a8082',
    outlineColor: '#000000',
    opacity: 0.4
  },
  RECHARGE_SUITABILITY: {
    id: 'recharge-suitability',
    type: 'fill',
    color: '#7a8082',
    outlineColor: '#000000',
    opacity: 0.4
  },
  WATERSHED: {
    id: 'watershed-hub',
    type: 'fill',
    color: '#3fbffb',
    outlineColor: '#000000',
    opacity: 0.3
  }
};

// Styles URL
export const DEFAULT_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
export const GRAY_STYLE = 'https://tiles.openfreemap.org/styles/positron';

// Project-specific configurations
export const PROJECT_CONFIGS: Record<string, MapConfig> = {
  'prison-ej': {
    ...BASE_CONFIGS.US_NATIONAL,
    style: GRAY_STYLE,
    geojsonPath: '/data/final_df_2023-08-31.geojson',
    pointsPath: '/data/centroids_2023-08-31.geojson',
  },
  'cuyama-basin': {
    ...BASE_CONFIGS.CUYAMA_VALLEY,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/cuyama_subbasin.geojson',
    dataLayer: LAYER_CONFIGS.GROUNDWATER_BASIN
  },
  'yuba-recharge': {
    ...BASE_CONFIGS.CALIFORNIA_CENTRAL,
    zoom: 8.5,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/yuba_subbasins.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  },
  'yuba-gsp': {
    ...BASE_CONFIGS.CALIFORNIA_CENTRAL,
    zoom: 8.5,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/yuba_subbasins.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  },
  'seasonal-population': {
    ...BASE_CONFIGS.SOUTHERN_CALIFORNIA,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/i03_WaterDistricts_seasonality.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  },
  'harvest-water': {
    ...BASE_CONFIGS.CALIFORNIA_CENTRAL,
    zoom: 5,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/yuba_subbasins.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  },
  'modesto-infiltration': {
    ...BASE_CONFIGS.CALIFORNIA_CENTRAL,
    zoom: 7,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/yuba_subbasins.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  },
  'antelope-wells': {
    ...BASE_CONFIGS.CALIFORNIA_CENTRAL,
    zoom: 6,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/yuba_subbasins.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  },
  'watershed-hub': {
    ...BASE_CONFIGS.CALIFORNIA_CENTRAL,
    zoom: 3,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/HUC8_CA_simple.geojson',
    dataLayer: LAYER_CONFIGS.WATERSHED
  },
  'sanitary-district': {
    ...BASE_CONFIGS.CV_FOOTHILL_SA,
    zoom: 8.5,
    style: DEFAULT_STYLE,
    geojsonPath: '/data/yuba_subbasins.geojson',
    dataLayer: LAYER_CONFIGS.RECHARGE_SUITABILITY
  }
};

export function getMapConfig(projectId: string): MapConfig {
  return PROJECT_CONFIGS[projectId] || PROJECT_CONFIGS['prison-ej'];
}
