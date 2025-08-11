// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/maps/index.ts
// Centralized exports for map functionality

export * from './mapConfigurations';
export * from './mapUtils';
export * from './layerSetup';

// Re-export commonly used types and constants
export type { MapConfig, MapLayerConfig } from './mapConfigurations';
export type { 
  PrisonFeature, 
  PrisonFeatureProperties, 
  RiskAttribute 
} from './mapUtils';
export { 
  RISK_ATTRIBUTES,
  ZOOM_OPACITY_CONFIG,
  determineIdField
} from './mapUtils';
