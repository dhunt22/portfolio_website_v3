// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/portfolio/IndicatorBrowser.tsx
// Quiet client island: tab filters + indicator rail + map + detail panel for the EJ-prisons deep dive

'use client';

import { useState, useCallback, type JSX } from 'react';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';
import { SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { cn } from '@/lib/utils';

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

// A pressed control reads like the portfolio's filters: ink, semibold, underlined 2px. The indicator's own
// map colour carries the underline, so the selection points at the ramp it draws (DESIGN.md › Data colours).
const PRESSED = 'aria-pressed:font-semibold aria-pressed:text-ink-strong aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-[0.35em]';

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
        className="group grid w-full gap-0.5 py-3 text-left"
      >
        <span
          style={isActive ? { textDecorationColor: component.color } : undefined}
          className={cn(SITE_TYPE.body, 'font-medium group-hover:text-ink-strong group-aria-pressed:font-semibold group-aria-pressed:text-ink-strong group-aria-pressed:underline group-aria-pressed:decoration-2 group-aria-pressed:underline-offset-[0.25em]')}
        >
          {component.name}
        </span>
        <span className={SITE_TYPE.label}>{component.description}</span>
      </button>
    </li>
  );
}

// ── Mobile indicator button ─────────────────────────────────────────────────
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
      style={isActive ? { textDecorationColor: component.color } : undefined}
      className={cn(SITE_TYPE.label, 'whitespace-nowrap py-1.5 hover:text-ink-strong', PRESSED)}
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
    <div className="max-w-[76rem]">
      {/* ── Desktop category row (phones and tablets use the grouped list below) ── */}
      <nav
        aria-label="Environmental risk indicator categories"
        className="mb-6 hidden gap-x-7 lg:flex"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            aria-pressed={activeTab === tab.value}
            className={cn(SITE_TYPE.label, 'whitespace-nowrap py-1.5 hover:text-ink-strong', PRESSED)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Phones and tablets: every indicator, grouped by category, wrapping (nothing hides past the edge) ── */}
      <div className="mb-6 grid gap-2 lg:hidden" role="group" aria-label="Select an indicator">
        {tabs.map((tab) => (
          <div key={tab.value} className="flex flex-wrap items-baseline gap-x-5">
            <span className={cn(SITE_TYPE.label, 'font-semibold text-ink-strong')}>{TAB_LABELS[tab.value]}</span>
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

      {/* ── Two-column dashboard at lg — FIXED height so the map never resizes
            when the explanatory text below changes length. The rail scrolls
            internally if a category has more indicators than fit. ── */}
      <div className="lg:grid lg:h-[40rem] lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-x-10">

        {/* LEFT: indicator rail — shown only on desktop (the grouped list above serves smaller screens) */}
        <div className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <h3 className={cn(SITE_TYPE.body, 'mb-1 font-semibold text-ink-strong')}>{TAB_PANEL_LABELS[activeTab]}</h3>

          {/* Indicator list for the active category (category switching lives in the row above) */}
          <ul className="min-h-0 overflow-y-auto">
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

        {/* RIGHT: map — fills the fixed dashboard height */}
        <div className="lg:flex lg:h-full lg:flex-col">
          {/* Phone and tablet indicator title */}
          <p className={cn(SITE_TYPE.body, 'mb-3 font-semibold text-ink-strong lg:hidden')}>{currentComponent.name}</p>

          {/* isolate: the map's floating controls stack inside this frame, never over the sticky strip */}
          <div className="isolate h-[60svh] min-h-[320px] md:h-[500px] lg:h-full">
            <LazyProjectMap
              projectId="prison-ej"
              selectedComponent={selectedComponent}
              componentColor={currentComponent.color}
            />
          </div>
        </div>
      </div>

      {/* Indicator detail: BELOW the dashboard, set apart by space, so the controls above read as
          controls and this reads as explanation. Its length can change freely without touching the map. */}
      <div className="mt-12 max-w-[40rem]">
          <h3 className={SITE_TYPE.title}>{currentComponent.name}</h3>
          <p className={cn(SITE_TYPE.body, 'mt-2')}>{currentComponent.description}</p>

          {currentComponent.detailedDescription && (
            <div className="mt-6">
              <h4 className={cn(SITE_TYPE.body, 'mb-1 font-semibold text-ink-strong')}>Data Source Description</h4>
              <p className={SITE_TYPE.body}>{currentComponent.detailedDescription}</p>
            </div>
          )}

          {currentComponent.methodology && (
            <div className="mt-6">
              <h4 className={cn(SITE_TYPE.body, 'mb-1 font-semibold text-ink-strong')}>Processing &amp; Methodology</h4>
              <p className={SITE_TYPE.body}>{currentComponent.methodology}</p>
            </div>
          )}

          {currentComponent.dataSourceLink && (
            <div className="mt-6">
              <a
                href={currentComponent.dataSourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(SITE_LINK, 'font-site text-site-body')}
              >
                Data Source Link
              </a>
            </div>
          )}
      </div>
    </div>
  );
}

export default IndicatorBrowser;
