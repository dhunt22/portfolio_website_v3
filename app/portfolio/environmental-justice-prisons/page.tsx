'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHubIcon, ExternalLinkIcon } from '@/components/ui/icons/common-icons';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Environmental Justice For Prisons - Dedicated Project Page
 * A comprehensive overview of the NASA-funded research project
 */

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

// Map Instructions Popup Component
function MapInstructionsPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-50 max-w-sm">
      <Card className="bg-white dark:bg-[#404040] shadow-xl border-2 border-forest-500 dark:border-forest-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-forest-800 dark:text-forest-300">Map Instructions</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close instructions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-xs text-forest-600 dark:text-forest-400 space-y-2">
            <li className="flex items-start">
              <span className="text-forest-500 dark:text-forest-400 mr-2" aria-hidden={true}>•</span>
              <span>Select a tab to view indicators for that category</span>
            </li>
            <li className="flex items-start">
              <span className="text-forest-500 dark:text-forest-400 mr-2" aria-hidden={true}>•</span>
              <span>Click any indicator to view it on the map</span>
            </li>
            <li className="flex items-start">
              <span className="text-forest-500 dark:text-forest-400 mr-2" aria-hidden={true}>•</span>
              <span>Toggle between All Prisons and Top 10 highest risk</span>
            </li>
            <li className="flex items-start">
              <span className="text-forest-500 dark:text-forest-400 mr-2" aria-hidden={true}>•</span>
              <span>Hover over facilities for detailed information</span>
            </li>
            <li className="flex items-start">
              <span className="text-forest-500 dark:text-forest-400 mr-2" aria-hidden={true}>•</span>
              <span>Zoom and pan to explore specific regions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Histogram Component
function PercentileHistogram({ color, indicatorName }: { color: string; indicatorName: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample data - replace with actual prison data distribution
  // This represents the count of prisons in each percentile bin
  const sampleData = [120, 135, 150, 165, 185, 195, 180, 170, 145, 120];

  const data = {
    labels: ['', '', '', '', '', '', '', '', '', ''],
    datasets: [
      {
        label: 'Number of Prisons',
        data: sampleData,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 0,
        barThickness: 'flex' as const,
      },
    ],
  };

  const maxValue = Math.max(...sampleData);
  const roundedMax = Math.ceil(maxValue / 10) * 10;

  // Determine theme colors dynamically
  const isDark = mounted && resolvedTheme === 'dark';
  const axisColor = isDark ? '#ffffff' : '#000000';
  const yAxisColor = isDark ? '#d1d5db' : '#6b7280';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const ranges = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
            return `Percentile ${ranges[index]}`;
          },
          label: (context: any) => {
            return `Prisons: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
          drawBorder: true,
          borderColor: axisColor,
          borderWidth: 2,
        },
        ticks: {
          display: true,
          callback: function(value: any, index: number) {
            if (index === 0) return '0';
            if (index === 9) return '100';
            return '';
          },
          color: axisColor,
          font: {
            size: 11,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        max: roundedMax,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: true,
          stepSize: Math.ceil(roundedMax / 4 / 10) * 10,
          color: yAxisColor,
          font: {
            size: 10,
          },
          callback: function(value: any) {
            return Math.round(value / 10) * 10;
          },
        },
        position: 'left' as const,
      },
    },
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="h-28 w-full px-4 pb-2" />;
  }

  return (
    <div className="h-28 w-full px-4 pb-2">
      <Bar key={`${indicatorName}-${resolvedTheme}`} data={data} options={options} />
    </div>
  );
}

export default function EnvironmentalJusticePrisonsPage(): JSX.Element {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('overall');
  const [activeTab, setActiveTab] = useState<TabType>('overall');
  const [showInstructions, setShowInstructions] = useState(true);

  // Get the current component configuration
  const currentComponent: ComponentConfig = COMPONENT_CONFIGS.find(c => c.id === selectedComponent) || COMPONENT_CONFIGS[0];

  // Get indicators for the active tab
  const tabIndicators = useMemo(() => {
    return COMPONENT_CONFIGS.filter(c => c.category === activeTab);
  }, [activeTab]);

  // Handler for component selection
  const handleComponentClick = useCallback((componentId: ComponentType) => {
    setSelectedComponent(componentId);
  }, []);

  // Handler for tab change - only changes the visible tab, doesn't change map
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabType);
    // Don't auto-select indicator - let user keep viewing current selection
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-river-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="bg-forest-900 text-white py-16" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
              Environmental Justice For Prisons
            </h1>
            <h2 className="text-xl md:text-2xl text-white mb-8">
              Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View GitHub repository for NASA Prison Environmental Justice project"
              >
                <Button
                  variant="outline"
                  className="border-forest-200 dark:border-forest-600 bg-white dark:bg-[#404040] text-forest-700 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-800 hover:border-forest-300 dark:hover:border-forest-500"
                >
                  <GitHubIcon className="w-4 h-4" aria-hidden={true} />
                  View Repository
                  <ExternalLinkIcon className="w-3 h-3 ml-1" aria-hidden={true} />
                </Button>
              </a>
              <a
                href="https://ui.adsabs.harvard.edu/abs/2023AGUFMINV31C0.1M/abstract"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit NASA Applied Sciences project page"
              >
                <Button
                  variant="outline"
                  className="border-forest-200 dark:border-forest-600 bg-white dark:bg-[#404040] text-forest-700 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-800 hover:border-forest-300 dark:hover:border-forest-500"
                >
                  <ExternalLinkIcon className="w-4 h-4" aria-hidden={true} />
                  Publication
                  <ExternalLinkIcon className="w-3 h-3 ml-1" aria-hidden={true} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="py-16 bg-white dark:bg-[#383838]/90" aria-labelledby="overview-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 dark:bg-[#383838]/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle id="overview-heading" className="text-3xl text-forest-800 dark:text-forest-200">Project Overview</CardTitle>
                <CardDescription className="text-lg text-forest-600 dark:text-forest-300">
                  A groundbreaking research initiative funded by NASA's $100,000 Equity and Environmental Justice Grant
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-forest-800 dark:text-forest-300 leading-relaxed mb-6">
                  Despite documented environmental injustices in U.S. prisons, this area remains understudied. Prisons are EJ communities by definition—overrepresented by people of color, indigenous persons, and low-income individuals who cannot escape environmental health threats.
                </p>

                <p className="text-forest-800 dark:text-forest-300 leading-relaxed mb-6">
                  This research leverages NASA's Earth science data—including satellite, land cover, climate, and air quality datasets—to characterize environmental harms faced by incarcerated people across all U.S. state and federal prisons.
                </p>

                <div className="bg-river-50 dark:bg-river-900/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-river-800 dark:text-river-300 mb-4">Key Project Objectives</h3>
                  <ul className="space-y-2 text-forest-800 dark:text-forest-300">
                    <li className="flex items-start">
                      <span className="text-river-600 dark:text-river-400 mr-2">•</span>
                      <span>Quantify environmental conditions at all 1,865 state and federal prisons in the U.S.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-river-600 dark:text-river-400 mr-2">•</span>
                      <span>Calculate a standardized vulnerability index for each prison</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-river-600 dark:text-river-400 mr-2">•</span>
                      <span>Create an open-access geospatial dataset and reproducible code base</span>
                    </li>
                  </ul>
                </div>

                <p className="text-forest-800 dark:text-forest-300 leading-relaxed">
                  The method incorporates 11 environmental indicators grouped into three components, namely climate risk (heat index, canopy cover, wildfire risk and flood hazard), environmental exposures (Ozone, PM 2.5, pesticide use, and traffic density) and environmental effects (proximity to superfund sites, risk management plan facilities and hazardous waste sites).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Map Visualization Section */}
      <section className="py-16 bg-gray-50 dark:bg-[#383838]/90" aria-labelledby="map-visualization-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 id="map-visualization-heading" className="text-3xl font-bold text-forest-800 dark:text-forest-200 mb-8 text-center">
              Environmental Risk Indicators
            </h2>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-0 bg-transparent p-0 gap-1 relative" style={{ marginBottom: '-1px' }}>
                <TabsTrigger
                  value="overall"
                  className="relative border border-gray-100 dark:border-forest-700 border-b-0 bg-red-50/60 dark:bg-red-900/20 text-red-900 dark:text-red-200 rounded-t-lg rounded-b-none hover:bg-red-50/80 dark:hover:bg-red-900/40 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600 data-[state=active]:border-b-white data-[state=active]:z-10 transition-all"
                >
                  Overall
                  {currentComponent.category === 'overall' && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="climate"
                  className="relative border border-gray-100 dark:border-forest-700 border-b-0 bg-forest-50/60 dark:bg-forest-900/20 text-forest-900 dark:text-forest-200 rounded-t-lg rounded-b-none hover:bg-forest-50/80 dark:hover:bg-forest-900/40 data-[state=active]:bg-forest-600 data-[state=active]:text-white data-[state=active]:border-forest-600 data-[state=active]:border-b-white data-[state=active]:z-10 transition-all"
                >
                  Climate Risk
                  {currentComponent.category === 'climate' && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="exposure"
                  className="relative border border-gray-100 dark:border-forest-700 border-b-0 bg-purple-50/60 dark:bg-purple-900/20 text-purple-900 dark:text-purple-200 rounded-t-lg rounded-b-none hover:bg-purple-50/80 dark:hover:bg-purple-900/40 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-600 data-[state=active]:border-b-white data-[state=active]:z-10 transition-all"
                >
                  Exposure
                  {currentComponent.category === 'exposure' && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="effects"
                  className="relative border border-gray-100 dark:border-forest-700 border-b-0 bg-orange-50/60 dark:bg-orange-900/20 text-orange-900 dark:text-orange-200 rounded-t-lg rounded-b-none hover:bg-orange-50/80 dark:hover:bg-orange-900/40 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-600 data-[state=active]:border-b-white data-[state=active]:z-10 transition-all"
                >
                  Proximity
                  {currentComponent.category === 'effects' && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Combined Card - Single card containing both indicators and map */}
            <Card className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm shadow-lg border-t border-gray-200 dark:border-forest-700">
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-0">
                {/* Left Side - Indicators List (30%) */}
                <div className="lg:col-span-3 flex flex-col border-r border-gray-200 dark:border-forest-700" style={{ height: '635px' }}>
                  <CardHeader className="pb-4 flex-shrink-0">
                    <CardTitle className="text-xl text-forest-700 dark:text-forest-300">
                      {activeTab === 'overall' && 'Overall Risk'}
                      {activeTab === 'climate' && 'Climate Risk Indicators'}
                      {activeTab === 'exposure' && 'Exposure Indicators'}
                      {activeTab === 'effects' && 'Proximity-Based Indicators'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto">
                    <div className="space-y-3" role="list" aria-label={`${activeTab} indicators`}>
                      {tabIndicators.map((component) => (
                        <div
                          key={component.id}
                          role="button"
                          tabIndex={0}
                          className={`border-l-4 border border-gray-200 dark:border-forest-700 pl-3 pr-2 py-3 cursor-pointer transition-all duration-200 rounded-lg ${
                            selectedComponent === component.id
                              ? 'bg-blue-50 dark:bg-gray-800 shadow-md border-blue-200 dark:border-forest-600'
                              : 'hover:bg-gray-50 dark:bg-[#353535]/90 dark:hover:bg-forest-800 hover:border-gray-300 dark:hover:border-forest-600'
                          }`}
                          style={{ borderLeftColor: component.color }}
                          onClick={() => handleComponentClick(component.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleComponentClick(component.id);
                            }
                          }}
                          aria-label={`View ${component.name} on map`}
                          aria-pressed={selectedComponent === component.id}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`font-semibold text-sm ${
                              selectedComponent === component.id
                                ? 'text-forest-800 dark:text-white'
                                : 'text-forest-800 dark:text-forest-200'
                            }`}>{component.name}</h4>
                            {selectedComponent === component.id && (
                              <span className="text-xs bg-blue-100 dark:bg-forest-600 text-blue-800 dark:text-white px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                Active
                              </span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed ${
                            selectedComponent === component.id
                              ? 'text-forest-600 dark:text-forest-100'
                              : 'text-forest-600 dark:text-forest-300'
                          }`}>
                            {component.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  {/* Histogram at bottom */}
                  <div className="flex-shrink-0 border-t border-gray-200 dark:border-forest-700">
                    <PercentileHistogram
                      color={currentComponent.color}
                      indicatorName={currentComponent.name}
                    />
                  </div>
                </div>

                {/* Right Side - Map (70%) - Stays mounted */}
                <div className="lg:col-span-7">
                  <CardContent className="p-4">
                    <div className="relative">
                      {/* Map Container with responsive height */}
                      <div
                        className="h-[323px] md:h-[600px] rounded-lg overflow-hidden"
                        role="application"
                        aria-label="Interactive prison environmental justice map"
                      >
                        <LazyProjectMap
                          projectId="prison-ej"
                          selectedComponent={selectedComponent}
                          componentColor={currentComponent.color}
                        />

                        {/* Info Button */}
                        <button
                          onClick={() => setShowInstructions(!showInstructions)}
                          className="absolute bottom-4 left-4 z-40 bg-white dark:bg-[#404040] border border-gray-300 dark:border-forest-600 rounded-full w-8 h-8 shadow-md opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-forest-500 flex items-center justify-center"
                          aria-label="Toggle map instructions"
                        >
                          <span className="text-forest-700 dark:text-forest-300 font-bold text-lg">?</span>
                        </button>

                        {/* Instructions Popup */}
                        <MapInstructionsPopup
                          isOpen={showInstructions}
                          onClose={() => setShowInstructions(false)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Indicator Details Section */}
            <Card className="mt-8 bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-forest-800 dark:text-forest-200">
                  {currentComponent.name}
                </CardTitle>
                <CardDescription className="text-base text-forest-600 dark:text-forest-400">
                  {currentComponent.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {currentComponent.detailedDescription && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-forest-800 dark:text-forest-300 mb-2">Data Source Description</h4>
                      <p className="text-forest-800 dark:text-forest-300 leading-relaxed">
                        {currentComponent.detailedDescription}
                      </p>
                    </div>
                  )}

                  {currentComponent.methodology && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-forest-800 dark:text-forest-300 mb-2">Processing & Methodology</h4>
                      <p className="text-forest-800 dark:text-forest-300 leading-relaxed">
                        {currentComponent.methodology}
                      </p>
                    </div>
                  )}

                  {currentComponent.dataSourceLink && (
                    <div className="bg-forest-50 dark:bg-forest-900/30 p-4 rounded-lg border border-forest-200 dark:border-forest-700">
                      <h4 className="text-sm font-semibold text-forest-800 dark:text-forest-300 mb-2">Data Source Link</h4>
                      <a
                        href={currentComponent.dataSourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-forest-600 dark:text-forest-400 hover:text-forest-800 dark:hover:text-forest-200 underline break-all"
                      >
                        {currentComponent.dataSourceLink}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Project Team & Summary */}
      <section className="py-16 bg-forest-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Project Team & My Contribution
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-sm border-forest-700 dark:border-forest-700">
                <CardHeader>
                  <CardTitle className="text-forest-900 dark:text-white">Research Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-forest-800 dark:text-forest-100">
                    <div>
                      <p className="font-semibold">Dr. Caitlin Mothes</p>
                      <p className="text-sm">Principal Investigator, Research and Program Coordinator</p>
                      <p className="text-sm">Geospatial Centroid, Colorado State University</p>
                    </div>
                    <div>
                      <p className="font-semibold">Dan Carver</p>
                      <p className="text-sm">Geospatial Technical Manager</p>
                      <p className="text-sm">Geospatial Centroid, Colorado State University</p>
                    </div>
                    <div>
                      <p className="font-semibold">Dr. Carrie Chennault</p>
                      <p className="text-sm">Assistant Professor of Geography</p>
                      <p className="text-sm">Prison Agriculture Lab, Colorado State University</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-sm border-forest-700 dark:border-forest-700">
                <CardHeader>
                  <CardTitle className="text-forest-900 dark:text-white">My Role & Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-forest-800 dark:text-forest-100">
                    <p className="text-sm leading-relaxed">
                      As a Geospatial Analyst and Programmer at the Geospatial Centroid, I worked closely with
                      Caitlin Mothes to develop R-spatial scripts for data processing and analysis.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-river-300 mr-2">•</span>
                        <span className="text-sm">Processed open-source datasets for environmental indicators</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-river-300 mr-2">•</span>
                        <span className="text-sm">Calculated percentile scores for climate, exposure, and effects categories</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-river-300 mr-2">•</span>
                        <span className="text-sm">Developed vulnerability scoring algorithms combining all risk factors</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-river-300 mr-2">•</span>
                        <span className="text-sm">Contributed to repository management and large dataset processing workflows</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-sm border-forest-700 dark:border-forest-700">
              <CardHeader>
                <CardTitle className="text-forest-900 dark:text-white text-center">Project Impact & Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-forest-800 dark:text-forest-100 leading-relaxed mb-6">
                    The main deliverables of our project are 1) an open-access geospatial dataset with calculated values for each environmental indicator and a final environmental vulnerability index for 1,865 U.S. prisons and 2) an open-access, reproducible code base for every step of our analysis to promote the application of these assessments to other institutions and make our data and methods transparent.
                  </p>

                  <p className="text-forest-800 dark:text-forest-100 leading-relaxed mb-8">
                    This research has provided critical data for activists, researchers, policy makers,
                    and government agencies to understand and address environmental injustices in the prison system.
                    The work represents a significant contribution to both environmental justice and geospatial science.
                  </p>

                  <div className="text-center">
                    <p className="text-forest-700 dark:text-forest-200 italic">
                      "This project taught me about managing a repository and working with large data, and using multiple datasets to contribute to
                       environmental justice research that highlights the intersection of incarceration and environmental harm."
                    </p>
                    <p className="text-forest-600 dark:text-forest-300 text-sm mt-2">— Devin Hunt, Project Contributor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-white text-sm">
                Special thanks to the Geospatial Centroid at Colorado State University and NASA's Equity and Environmental Justice Grant program
                for making this critical research possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-white dark:bg-[#404040]/90">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-forest-800 dark:text-forest-200 mb-4">
            Explore the Research
          </h3>
          <p className="text-forest-600 dark:text-forest-400 mb-6 max-w-2xl mx-auto">
            Access the open-source code, data, and methodology of this environmental justice research.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-forest-600 hover:bg-forest-700 dark:bg-forest-700 dark:hover:bg-forest-600">
                <GitHubIcon className="w-4 h-4 mr-2" />
                Access Repository
              </Button>
            </a>
            <a href="/portfolio">
              <Button variant="outline" className="border-forest-600 dark:border-forest-400 text-forest-600 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-800">
                Back to Portfolio
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
