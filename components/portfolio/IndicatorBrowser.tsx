// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/IndicatorBrowser.tsx
// Quiet client island: tab filters + indicator rail + map + detail panel for the EJ-prisons deep dive

'use client';

import { useState, useCallback } from 'react';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';

// Individual component types
type ComponentType = 'overall' | 'heat' | 'canopy' | 'wildfire' | 'flood' | 'ozone' | 'pm25' | 'pesticide' | 'traffic' | 'superfund' | 'rmp' | 'hazwaste';
type TabType = 'overall' | 'climate' | 'exposure' | 'effects';

interface ComponentConfig {
  id: ComponentType;
  name: string;
  description: string;
  column: string;
  color: string;
  category: TabType;
  detailedDescription?: string;
  methodology?: string;
  dataSourceLink?: string;
}

const COMPONENT_CONFIGS: ComponentConfig[] = [
  // Overall Risk
  {
    id: 'overall',
    name: 'Overall Risk Score',
    description: 'Combined environmental vulnerability index across all indicators',
    column: 'final_risk_score_pcntl',
    color: '#dc2626',
    category: 'overall',
    detailedDescription: 'The Overall Risk Score represents a comprehensive environmental vulnerability assessment that synthesizes data from all 11 environmental indicators into a single composite index. This score captures the cumulative burden of climate risks, environmental exposures, and proximity to hazardous facilities that incarcerated individuals face. Each indicator is weighted equally and combined to produce percentile rankings that identify which prison facilities experience the most severe environmental injustices.',
    methodology: 'The overall risk score is calculated by combining percentile values from three main components: climate risk (heat index, canopy cover, wildfire risk, flood hazard), environmental exposure (ozone, PM 2.5, pesticides, traffic volume), and environmental effects (proximity to Superfund sites, RMP facilities, and hazardous waste sites). Each indicator is standardized to a percentile scale (0-100) before aggregation.'
  },

  // Climate Risk Components
  {
    id: 'heat',
    name: 'Heat Index',
    description: 'Extreme temperature conditions creating dangerous indoor environments',
    column: 'lst_avg_pcntl',
    color: '#ea580c',
    category: 'climate',
    detailedDescription: 'The MODIS (Moderate Resolution Imaging Spectroradiometer) daily land surface temperature dataset (MYD11A1, version 061) provides thermal infrared measurements of Earth\'s surface temperature captured by NASA\'s Aqua satellite. This dataset offers global coverage with daily temporal resolution, making it suitable for long-term temperature trend analysis.',
    methodology: 'Mean daily land surface temperature (LST) values were calculated for summer months (June through August) spanning a 10-year period from 2012 to 2022, with values averaged within prison boundary polygons.',
    dataSourceLink: 'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MYD11A1#description'
  },
  {
    id: 'canopy',
    name: 'Canopy Cover',
    description: 'Natural cooling provided by tree coverage around facilities',
    column: 'percent_tree_cover_pcntl',
    color: '#16a34a',
    category: 'climate',
    detailedDescription: 'The USGS National Land Cover Database (NLCD) 2016 release provides comprehensive land cover classification and canopy cover data for the conterminous United States. The dataset includes percent tree canopy cover derived from Landsat imagery and other ancillary data sources.',
    methodology: 'Average percent canopy cover was calculated within prison boundaries plus a 1-kilometer buffer zone to capture surrounding vegetation conditions.',
    dataSourceLink: 'https://developers.google.com/earth-engine/datasets/catalog/USGS_NLCD_RELEASES_2016_REL'
  },
  {
    id: 'wildfire',
    name: 'Wildfire Risk',
    description: 'Proximity to wildfire-prone areas affecting air quality',
    column: 'wildfire_risk_pcntl',
    color: '#dc2626',
    category: 'climate',
    detailedDescription: 'The USDA Forest Service\'s Wildfire Hazard Potential dataset provides a nationwide assessment of wildfire likelihood and potential intensity across the United States. This product integrates wildland fuel characteristics, topography, and historical fire occurrence data to estimate relative wildfire risk.',
    methodology: 'Mean wildfire hazard potential values were extracted within prison boundaries plus a 1-kilometer buffer to account for surrounding landscape fire risk.',
    dataSourceLink: 'https://www.fs.usda.gov/rds/archive/catalog/RDS-2015-0047-3'
  },
  {
    id: 'flood',
    name: 'Flood Hazard',
    description: 'Flood risk considering limited mobility during emergencies',
    column: 'flood_risk_pcntl',
    color: '#2563eb',
    category: 'climate',
    detailedDescription: 'FEMA\'s National Flood Hazard Layer (NFHL) is the official digital flood map database for the United States, delineating Special Flood Hazard Areas and flood risk zones. The dataset incorporates detailed hydraulic and hydrologic modeling to identify areas with varying flood probabilities.',
    methodology: 'The percentage of each prison boundary plus 1-kilometer buffer that falls within high-risk flood zones (Zones A and V, representing areas with at least a 1% annual chance of flooding) was calculated.',
    dataSourceLink: 'https://www.fema.gov/flood-maps/national-flood-hazard-layer'
  },

  // Environmental Exposure Components
  {
    id: 'ozone',
    name: 'Ozone Levels',
    description: 'Ground-level ozone concentrations from satellite data',
    column: 'mean_ozone_pcntl',
    color: '#7c3aed',
    category: 'exposure',
    detailedDescription: 'The SEDAC (Socioeconomic Data and Applications Center) Annual O3 Concentrations dataset provides estimated ground-level ozone concentrations across the contiguous United States at 1-kilometer resolution. These estimates are derived from EPA monitoring data combined with satellite observations and atmospheric modeling.',
    methodology: 'Average annual ozone levels for 2015 and 2016 were calculated within prison boundaries plus a 1-kilometer buffer.',
    dataSourceLink: 'https://sedac.ciesin.columbia.edu/data/set/aqdh-o3-concentrations-contiguous-us-1-km-2000-2016'
  },
  {
    id: 'pm25',
    name: 'PM 2.5 Particulates',
    description: 'Fine particulate matter concentrations affecting respiratory health',
    column: 'avg_pm25_pcntl',
    color: '#6b7280',
    category: 'exposure',
    detailedDescription: 'The SEDAC Annual PM2.5 Concentrations dataset provides fine particulate matter (particles ≤2.5 micrometers in diameter) estimates for the contiguous United States at 1-kilometer resolution. The data combines ground monitoring stations with satellite-based aerosol optical depth measurements and chemical transport modeling.',
    methodology: 'Average annual PM2.5 levels for 2015 and 2016 were calculated within prison boundaries plus a 1-kilometer buffer.',
    dataSourceLink: 'https://sedac.ciesin.columbia.edu/data/set/aqdh-pm2-5-concentrations-contiguous-us-1-km-2000-2016'
  },
  {
    id: 'pesticide',
    name: 'Pesticide Use',
    description: 'Agricultural pesticide application intensity in surrounding areas',
    column: 'pesticides_pcntl',
    color: '#eab308',
    category: 'exposure',
    detailedDescription: 'The SEDAC Global Pesticide Grids dataset provides estimates of agricultural pesticide application rates worldwide at approximately 10-kilometer resolution (5 arc-minute). This dataset combines national pesticide use statistics with agricultural land use data to spatially allocate pesticide application.',
    methodology: 'Total pesticide application in kilograms per hectare per year from 2015 was averaged over prison boundaries plus a 1-kilometer buffer.',
    dataSourceLink: 'https://sedac.ciesin.columbia.edu/data/set/ferman-v1-pest-chemgrids-v1-01'
  },
  {
    id: 'traffic',
    name: 'Traffic Density',
    description: 'Vehicle traffic volume contributing to local air pollution',
    column: 'trafficProx_pcntl',
    color: '#374151',
    category: 'exposure',
    detailedDescription: 'The Federal Highway Administration\'s (FHWA) Annual Average Daily Traffic (AADT) dataset provides traffic count data from the Highway Performance Monitoring System (HPMS). This dataset includes vehicle counts on major roads and highways across the United States, collected through continuous count stations and periodic sampling.',
    methodology: 'The count of vehicles (AADT) on major roads within 500 meters of prison boundaries was divided by the distance in meters to create a proximity-weighted traffic exposure metric.',
    dataSourceLink: 'https://www.fhwa.dot.gov/policyinformation/hpms/shapefiles.cfm'
  },

  // Environmental Effects Components (Proximity-Based)
  {
    id: 'superfund',
    name: 'Superfund Sites',
    description: 'Distance to EPA Superfund sites with hazardous waste contamination',
    column: 'npl_prox_pcntl',
    color: '#dc2626',
    category: 'effects',
    detailedDescription: 'The EPA\'s National Priorities List (NPL) database identifies the most serious hazardous waste sites in the United States eligible for long-term remedial action under the Superfund program. The database includes site locations, contamination status, and cleanup progress information.',
    methodology: 'The count of proposed and listed NPL facilities within 5 kilometers (or the nearest facility beyond 5 kilometers if none exist within that radius) was calculated, with each facility count divided by its distance in kilometers to create a proximity-weighted exposure metric.',
    dataSourceLink: 'https://cumulis.epa.gov/supercpad/CurSites/srchsites.cfm'
  },
  {
    id: 'rmp',
    name: 'Risk Management Plan Facilities',
    description: 'Proximity to industrial facilities handling hazardous chemicals',
    column: 'rmp_prox_pcntl',
    color: '#ea580c',
    category: 'effects',
    detailedDescription: 'The HIFLD (Homeland Infrastructure Foundation-Level Data) EPA Emergency Response Risk Management Plan Facilities dataset identifies facilities that handle extremely hazardous substances in quantities that could pose chemical accident risks to surrounding communities. Facilities submit RMPs detailing potential accident scenarios and emergency response procedures.',
    methodology: 'The count of RMP facilities within 5 kilometers (or the nearest facility beyond 5 kilometers) was calculated, with each count divided by distance in kilometers, following EPA\'s EJScreen methodology for proximity-based environmental indicators.',
    dataSourceLink: 'https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::epa-emergency-response-er-risk-management-plan-rmp-facilities/explore?location=29.842034%2C-113.806709%2C3.92'
  },
  {
    id: 'hazwaste',
    name: 'Hazardous Waste Sites',
    description: 'Distance to facilities treating or storing hazardous waste',
    column: 'haz_prox_pcntl',
    color: '#92400e',
    category: 'effects',
    detailedDescription: 'The EPA Facility Registry Service (FRS) geospatial database provides comprehensive location and identifying information for facilities subject to environmental regulation across multiple EPA program systems. The database includes facilities managing hazardous waste under RCRA (Resource Conservation and Recovery Act) and other environmental statutes.',
    methodology: 'The count of hazardous waste facilities within 5 kilometers of prison boundaries (or the nearest facility beyond 5 kilometers) was calculated, with each count divided by distance in kilometers.',
    dataSourceLink: 'https://www.epa.gov/frs/geospatial-data-download-service'
  }
];

const TAB_LABELS: Record<TabType, string> = {
  overall: 'Overall',
  climate: 'Climate Risk',
  exposure: 'Exposure',
  effects: 'Proximity',
};

const TAB_PANEL_LABELS: Record<TabType, string> = {
  overall: 'Overall Risk',
  climate: 'Climate Risk Indicators',
  exposure: 'Exposure Indicators',
  effects: 'Proximity-Based Indicators',
};

const tabs: { value: TabType; label: string }[] = [
  { value: 'climate', label: 'Climate Risk' },
  { value: 'exposure', label: 'Exposure' },
  { value: 'effects', label: 'Proximity' },
  { value: 'overall', label: 'Overall' },
];

// ── Indicator button component ──────────────────────────────────────────────
interface IndicatorButtonProps {
  component: ComponentConfig;
  isActive: boolean;
  onClick: (id: ComponentType) => void;
}

function IndicatorButton({ component, isActive, onClick }: IndicatorButtonProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(component.id)}
        aria-label={`View ${component.name} on map`}
        aria-pressed={isActive}
        style={isActive ? { borderLeftColor: component.color } : undefined}
        className={[
          // Full-width row, left color rule (3px) when active
          'group relative block w-full text-left',
          'py-3 pl-4 pr-3',
          'border-l-[3px] transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          isActive
            ? 'bg-card'
            : 'border-l-transparent hover:bg-card/60',
        ].join(' ')}
      >
        <span className={[
          'block font-sans font-medium text-sm leading-snug',
          isActive ? 'text-ink-strong' : 'text-ink-body group-hover:text-ink-strong',
        ].join(' ')}>
          {component.name}
        </span>
        <span className="mt-0.5 block font-sans text-xs leading-relaxed text-ink-muted">
          {component.description}
        </span>
      </button>
    </li>
  );
}

// ── Mobile chip component ───────────────────────────────────────────────────
interface MobileChipProps {
  component: ComponentConfig;
  isActive: boolean;
  onClick: (id: ComponentType) => void;
}

function MobileChip({ component, isActive, onClick }: MobileChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(component.id)}
      aria-pressed={isActive}
      aria-label={`View ${component.name} on map`}
      style={isActive ? { borderColor: component.color, color: component.color } : undefined}
      className={[
        'flex-none inline-flex items-center',
        'h-11 px-3 rounded',
        'font-sans font-medium text-xs whitespace-nowrap',
        'border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-card'
          : 'border-border text-ink-muted bg-card/40 hover:text-ink-body hover:bg-card',
      ].join(' ')}
    >
      {component.name}
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function IndicatorBrowser(): JSX.Element {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('heat');
  const [activeTab, setActiveTab] = useState<TabType>('climate');

  const currentComponent: ComponentConfig = COMPONENT_CONFIGS.find(c => c.id === selectedComponent) || COMPONENT_CONFIGS[0];

  const handleComponentClick = useCallback((componentId: ComponentType) => {
    setSelectedComponent(componentId);
    // Sync tab to match the category of the selected indicator
    const config = COMPONENT_CONFIGS.find(c => c.id === componentId);
    if (config) setActiveTab(config.category);
  }, []);

  const handleTabChange = useCallback((value: TabType) => {
    setActiveTab(value);
    const firstIndicator = COMPONENT_CONFIGS.find(c => c.category === value);
    if (firstIndicator) {
      setSelectedComponent(firstIndicator.id);
    }
  }, []);

  return (
    <div>
      {/* ── Desktop tab row (hidden on mobile — mobile uses chip scroll rail) ── */}
      <nav
        aria-label="Environmental risk indicator categories"
        className="hidden lg:flex gap-8 mb-8"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              aria-pressed={isActive}
              className={[
                'eyebrow whitespace-nowrap px-0 py-1 transition-colors hover:text-ink-strong',
                isActive
                  ? 'text-ink-strong underline decoration-accent decoration-2 underline-offset-8'
                  : '',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Mobile chip scroll rail: single row, all indicators + category labels ── */}
      {/* Hidden on lg+ where the side rail handles selection */}
      <div className="lg:hidden mb-4 -mx-4 px-4">
        <div
          className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
          role="group"
          aria-label="Select an indicator"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => (
            <div key={tab.value} className="flex items-center gap-2 flex-none">
              {/* Category label chip */}
              <span className="flex-none inline-flex items-center h-11 px-2 font-sans font-medium text-xs uppercase tracking-caps text-ink-faint whitespace-nowrap">
                {TAB_LABELS[tab.value]}
              </span>
              {/* Indicator chips for this category */}
              {COMPONENT_CONFIGS.filter(c => c.category === tab.value).map((component) => (
                <MobileChip
                  key={component.id}
                  component={component}
                  isActive={selectedComponent === component.id}
                  onClick={handleComponentClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column body at lg ── */}
      <div className="lg:grid lg:grid-cols-[minmax(0,22rem)_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:items-start">

        {/* LEFT, row 1: indicator rail — shown only on desktop (mobile uses chips above) */}
        <div className="hidden lg:block lg:col-start-1 lg:row-start-1">
          {/* Category panel label */}
          <h3 className="mb-3 font-display text-xl text-ink-strong">{TAB_PANEL_LABELS[activeTab]}</h3>

          {/* Indicator list for active tab (category switching lives in the
              single top tab row — a second in-rail nav duplicated it) */}
          <ul className="border-t border-border">
            {COMPONENT_CONFIGS.filter(c => c.category === activeTab).map((component) => (
              <IndicatorButton
                key={component.id}
                component={component}
                isActive={selectedComponent === component.id}
                onClick={handleComponentClick}
              />
            ))}
          </ul>
        </div>

        {/* RIGHT: map — spans both left rows */}
        <div className="mt-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:flex lg:h-full lg:flex-col lg:self-stretch">
          {/* Mobile indicator title */}
          <p className="eyebrow mb-3 lg:hidden">{currentComponent.name}</p>

          <div className="h-[60svh] min-h-[320px] border border-border md:h-[500px] lg:h-full lg:min-h-[70vh]">
            <LazyProjectMap
              projectId="prison-ej"
              selectedComponent={selectedComponent}
              componentColor={currentComponent.color}
            />
          </div>
        </div>

        {/* Indicator detail panel: LEFT column, row 2, below indicator rail on desktop */}
        <div className="mt-12 max-w-[40rem] lg:col-start-1 lg:row-start-2 lg:mt-8">
          <h3 className="font-display text-xl text-ink-strong">{currentComponent.name}</h3>
          <p className="mt-2 leading-relaxed text-ink-body">{currentComponent.description}</p>

          {currentComponent.detailedDescription && (
            <div className="mt-6">
              <h4 className="eyebrow mb-2">Data Source Description</h4>
              <p className="leading-relaxed text-ink-body">{currentComponent.detailedDescription}</p>
            </div>
          )}

          {currentComponent.methodology && (
            <div className="mt-6">
              <h4 className="eyebrow mb-2">Processing &amp; Methodology</h4>
              <p className="leading-relaxed text-ink-body">{currentComponent.methodology}</p>
            </div>
          )}

          {currentComponent.dataSourceLink && (
            <div className="mt-6">
              <a
                href={currentComponent.dataSourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet"
              >
                Data Source Link
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndicatorBrowser;
