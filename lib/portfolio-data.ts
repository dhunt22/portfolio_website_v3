// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/portfolio-data.ts
// Portfolio project data separated for better maintainability

/** How a project or tool is drawn (DESIGN.md › Glyphs). */
export type GlyphSpec =
  | { kind: 'subbasin'; file: string } // DWR Bulletin 118 polygons in public/data
  | { kind: 'watershed' } // the HUC8 watershed under `location`
  | { kind: 'statewide' } // every California HUC8 watershed
  | { kind: 'prisons' } // the EEJ prison points
  | { kind: 'mesh'; variant: 'plain' | 'zoned' | 'subset' }
  | { kind: 'calibration' }
  | { kind: 'captions' }
  | { kind: 'boreholes' }
  | { kind: 'wells' }
  | { kind: 'households' };

/**
 * Interface for portfolio project data
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  categories: string[];
  content: string[];
  links?: {
    href: string;
    label: string;
    iconType?: 'github' | 'external' | 'document' | 'website';
  }[];
  featured?: boolean;
  year?: string;
  technologies?: string[];
  displayType?: 'map' | 'image' | 'none'; // Type of visual display (defaults to 'map')
  imagePath?: string; // Path to image file if displayType is 'image'
  imageAlt?: string; // Alt text for image accessibility
  imageCaption?: string; // Caption for the image (e.g., "NASA, 2001")
  imageSecondaryText?: string; // Secondary descriptive text for the image
  imageFit?: 'cover' | 'contain'; // desktop object-fit (default 'cover'); 'contain' preserves full image edges (e.g. logos)
  /** One line for lists. */
  summary: string;
  /** Where the work is, for the meta line; omitted when the place isn't stated. */
  place?: string;
  glyph: GlyphSpec;
  /** A point inside the project's area, for the readout and the résumé map. Approximate. */
  location?: { lat: number; lon: number };
  /** What the readout says for a project without a location. */
  readout?: { label: string; value: string };
}

/**
 * Project data array
 */
export const PROJECTS: Project[] = [
  {
    id: 'prison-ej',
    summary: 'Climate, exposure and proximity percentile scores for U.S. prisons, combined into one vulnerability score each, for a NASA grant.', place: 'United States', glyph: { kind: 'prisons' }, readout: { label: 'Prisons', value: '1,865 across the United States' },
    title: 'Environmental Justice For Prisons',
    description: 'Geospatial Analysis, NASA Grant Project',
    categories: ['all', 'geospatial', 'research'],
    year: '2022-2023',
    featured: true,
    technologies: ['R', 'GIS', 'Data Analysis'],
    content: [
      'At the Geospatial Centroid, I worked alongside Caitlin Mothes to choose and process open source datasets and calculate percentile scores in three separate categories: climate, exposure, and proximity-based effects.',
      'Each prison was then assigned a vulnerability score which combined all risk factors. This project taught me about managing a repository and working with large data.'
    ],
    links: [
      {
        href: 'https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1',
        label: 'GitHub Repository',
        iconType: 'github'
      },
      {
        href: '/portfolio/environmental-justice-prisons',
        label: 'Detailed Project Page',
        iconType: 'external'
      }
    ]
  },
  {
    id: 'cuyama-basin',
    summary: 'Figures for the 2025 Groundwater Sustainability Plan, and yearly land use and ET updates to the basin’s IWFM model.', place: 'Cuyama Valley', glyph: { kind: 'subbasin', file: 'cuyama_subbasin.geojson' }, location: { lat: 34.95, lon: -119.7 },
    title: 'Cuyama Valley Groundwater Basin',
    description: 'Groundwater Sustainability, Cartography',
    categories: ['all', 'water'],
    year: '2023-Present',
    featured: true,
    technologies: ['ArcGIS Pro', 'QGIS', 'IWFM', 'Python'],
    displayType: 'image',
    imagePath: '/images/cuyama_valley_nasa_srtm.jpg',
    imageAlt: 'SRTM Perspective View with Landsat Overlay: Caliente Range and Cuyama Valley, California',
    imageCaption: 'NASA, 2001',
    imageSecondaryText: 'SRTM Perspective View with Landsat Overlay: Caliente Range and Cuyama Valley, California',
    content: [
      'Served as the geospatial technician, water resource model support, and project data manager for all tasks for the reports.',
      'Geospatial: developed layout template, basemap, and new figures for the Cuyama 2024 Annual Report (AR), 2025 Groundwater Sustainability Plan (GSP), and Groundwater Conditions reports using ArcGIS Pro and QGIS. To see my work, open the 2025 GSP document and look in the lower left corner of figures for "dhunt".',
      'Modeling: Utilized python and QGIS to incorporate yearly land use, ET, and other water usage parameters to the IWFM model, CBWRM.'
    ],
    links: [
      {
        href: 'https://sgma.water.ca.gov/portal/gsppe/update/29F7AB43D49C0C73E06350C29E0AC15F',
        label: '2025 GSP',
        iconType: 'document'
      }
    ]
  },
  {
    id: 'yuba-recharge',
    summary: 'A Recharge Suitability Index showing where recharge projects would work best.', place: 'Yuba County', glyph: { kind: 'subbasin', file: 'yuba_subbasins.geojson' }, location: { lat: 39.13, lon: -121.49 },
    title: 'Yuba Subbasins Recharge Analysis',
    description: 'Groundwater Management, Spatial Analysis',
    categories: ['all', 'water', 'geospatial'],
    year: '2023',
    technologies: ['GIS', 'Spatial Analysis', 'Hydrology'],
    displayType: 'image',
    imagePath: '/images/yuba_recharge_suitability_index_preview.webp',
    imageAlt: 'Yuba Subbasins Recharge Analysis visualization',
    content: [
      'Computed Recharge Suitability Index (RSI) scores using open-source geospatial data for the Yuba Subbasins. This analysis identified optimal locations for groundwater recharge projects.',
      'By combining soil permeability data, slope analysis, land use classifications, and proximity to water sources, I created a comprehensive index score and suite of figures that guides decision-making for water management authorities.',
      'Yuba Water. (2023b, December). Recharge Suitability Index: Development and Results.'
    ],
    links: [
      {
        href: 'https://sgma.water.ca.gov/portal/service/gspdocument/download/10541',
        label: 'Download Document',
        iconType: 'document'
      },
      {
        href: 'https://sgma.water.ca.gov/portal/gsp/periodiceval/preview/25',
        label: 'SGMA Portal Source',
        iconType: 'external'
      }
    ]
  },
  {
    id: 'seasonal-population',
    summary: 'An R script that estimated seasonal populations from over 8 million metering records across 21,000 households.', glyph: { kind: 'households' }, readout: { label: 'Records', value: 'Over 8 million, from 21,000 households' },
    title: 'Urban Water Use Objective Reporting',
    description: 'Groundwater Management, Large-data Analysis',
    categories: ['all', 'water'],
    year: '2024',
    technologies: ['R', 'Data Processing', 'Statistical Analysis'],
    displayType: 'image',
    imagePath: '/images/sacramento_water_purveyors.png',
    imageAlt: 'Urban Water Use Objective Reporting visualization',
    content: [
      'Programmed a script to calculate Seasonal populations from Advanced Metering Infrastructure (AMI) data. This analysis helped clients comply with California requirements for Urban Water Use Objectives (UWUO).',
      'R-language script wrangled, cleaned, and processed >8 million records from 21,000 households. Algorithms within script adhered to Methods for Estimating Seasonal Populations with Water and Energy Data (DWR, 2022).'
    ]
  },
  {
    id: 'harvest-water',
    summary: 'Project figures and geospatial data for Title 22 water delivery to local farmers.', place: 'Sacramento County', glyph: { kind: 'watershed' }, location: { lat: 38.33, lon: -121.3 }, // approximate: a point in the program area until the South American subbasin, B118 5-021.65, is added
    title: 'Harvest Water Program',
    description: 'Geospatial Management, Contract Support',
    categories: ['all', 'water', 'geospatial'],
    year: '2024',
    technologies: ['GIS', 'Contract Management', 'Water Law'],
    displayType: 'none',
    content: [
      'Updated project figures and managed geospatial data for the Sacramento Sewer District\'s Harvest Water Program.',
      'Created advanced plots for legal OFCA supply contracts, supporting implementation of Title 22 water delivery to local farmers within the study area.'
    ]
  },
  {
    id: 'modesto-infiltration',
    summary: 'Drainage basins screened with SAGBI and SSURGO soil data, then three boreholes logged to find the layers that stop deep percolation.', glyph: { kind: 'boreholes' }, readout: { label: 'Boreholes', value: 'Three, logged at 5-foot intervals' },
    title: 'Infiltration Feasibility Study',
    description: 'Soil Analysis, Field Testing',
    categories: ['all', 'water', 'geospatial'],
    year: '2024',
    technologies: ['Field Testing', 'Soil Analysis', 'GIS'],
    displayType: 'image',
    imagePath: '/images/modesto_infiltration_snyderWest.webp',
    imageAlt: 'Infiltration Feasibility Study visualization',
    content: [
      'Conducted initial identification of existing drainage basins for percolation field tests, including spatial analysis of soil profiles and infiltration scores using SAGBI and SSURGO data.',
      'Oversaw borehole drilling and percolation tests, documenting soil characteristics at 5-foot intervals across three boreholes to identify layers preventing deep percolation.'
    ]
  },
  {
    id: 'antelope-wells',
    summary: 'Parcel-level suitability scores for new well sites, from over ten weighted datasets.', place: 'Palmdale and Lancaster', glyph: { kind: 'watershed' }, location: { lat: 34.65, lon: -118.15 }, // approximate until Antelope Valley, B118 6-044, is added
    title: 'Antelope Valley Well Resilience Study',
    description: 'Suitability Analysis, Water Infrastructure',
    categories: ['all', 'water', 'geospatial'],
    year: '2024-Present',
    technologies: ['GIS', 'Suitability Analysis', 'Water Infrastructure'],
    displayType: 'image',
    imagePath: '/images/antelope_valley_LACPW_district40.webp',
    imageAlt: 'Antelope Valley Well Resilience Study visualization',
    imageSecondaryText: 'This is the westernmost portion of District 40, spanning Palmdale and Lancaster.',
    content: [
      'Led geospatial analysis to create suitability scores for new well sites in Antelope Valley, combining land use, water quality, hydrogeologic, and infrastructure data.',
      'Systematically weighted and binned over ten separate datasets to produce composite parcel-level scores. Created figure templates and documented data sources and analytical reasoning in technical memorandum supporting final site recommendations.'
    ],
    links: [
      {
        href: 'https://pw.lacounty.gov/core-service-areas/water-resources/waterworks-districts/district-overview/',
        label: 'LA County District Overview',
        iconType: 'external'
      }
    ]
  },
  {
    id: 'watershed-hub',
    summary: 'Watershed metrics fetched from public APIs, cleaned and processed for upload to ArcGIS Online.', place: 'California', glyph: { kind: 'statewide' }, readout: { label: 'Extent', value: 'California, 140 HUC8 watersheds' },
    title: 'Watershed Hub Dashboard',
    description: 'Data Processing, Dashboard Development',
    categories: ['all', 'water', 'geospatial'],
    year: '2024-Present',
    technologies: ['APIs', 'Data Processing', 'Dashboard Development', 'ArcGIS Online'],
    content: [
      'Performed exploratory analyses on multiple metrics for the California Department of Resources Watershed Hub dashboard project.',
      'Fetched data from available APIs, then cleaned and processed results for upload to ArcGIS Online. Enhanced metric processing scripts with AI-assisted loggers, error-tracking, and summary reporting features.'
    ]
  },
  {
    id: 'sanitary-district',
    summary: 'NPDES groundwater conditions reports from monitoring data at six wells: groundwater elevation and horizontal gradient.', glyph: { kind: 'wells' }, readout: { label: 'Monitoring', value: 'Six wells, every quarter' },
    title: 'Quarterly Groundwater Conditions Reports',
    description: 'Water Quality Monitoring, Regulatory Compliance',
    categories: ['all', 'water'],
    year: '2024-Present',
    technologies: ['Water Quality Analysis', 'Regulatory Compliance', 'Data Visualization'],
    displayType: 'image',
    imagePath: '/images/npdes_logo_up.jpg',
    imageAlt: 'NPDES "Protecting Water Quality" logo',
    imageFit: 'contain',
    content: [
      'Produce quarterly National Pollutant Discharge Elimination System (NPDES) groundwater conditions reports from client-collected monitoring data across six wells.',
      'Analyze depth to water measurements to estimate groundwater elevation and horizontal gradient. Use data interpolation and visualization techniques to provide comprehensive descriptions of water characteristics and constituent distributions.'
    ]
  }
];

/** Software Devin builds around the models, and one app outside them. Copy from the résumé and PRODUCT.md. */
export interface Tool {
  id: string;
  title: string;
  meta: string;
  summary: string;
  content: string[];
  glyph: GlyphSpec;
  readout: { label: string; value: string };
  href?: string;
  soon?: boolean;
}

export const TOOLS: Tool[] = [
  {
    id: 'aiiwfm',
    title: 'AIIWFM',
    meta: 'Woodard & Curran · 2023 to present',
    summary: 'An internal AI application that grounds language models in the IWFM user manual and modeling theory, to answer groundwater modeling questions accurately.',
    content: ['Develop and maintain AIIWFM, an internal AI application that grounds language models in the IWFM user manual and modeling theory to answer groundwater modeling questions accurately.'],
    glyph: { kind: 'mesh', variant: 'plain' },
    readout: { label: 'Tool', value: 'AIIWFM, grounded in the IWFM manual and modeling theory' },
  },
  {
    id: 'zbudget-dashboards',
    title: 'ZBudget Dashboards',
    meta: '',
    summary: 'A fast, powerful IWFM model diagnostic and results viewing dashboard with interactive map and charts. Streamlining model review and report generation.',
    content: [],
    glyph: { kind: 'mesh', variant: 'zoned' },
    readout: { label: 'Tool', value: 'ZBudget Dashboards, coming soon' },
    soon: true,
  },
  {
    id: 'iwfm-workflows',
    title: 'IWFM workflow suite',
    meta: 'Woodard & Curran',
    summary: 'Python tools that subset a model domain and run automated file linting, QA/QC and water-budget reporting.',
    content: [
      'Build a Python suite of tools that automates common IWFM model workflows, including sub-setting a model domain and running automated file linting, QA/QC, and water-budget reporting.',
      'Automate post-processing of IWFM groundwater models, replacing slow manual steps with tested, reusable tools.',
    ],
    glyph: { kind: 'mesh', variant: 'subset' },
    readout: { label: 'Tool', value: 'IWFM workflow suite, sub-setting a model domain' },
  },
  {
    id: 'pypest',
    title: 'PyPEST',
    meta: 'Woodard & Curran',
    summary: 'A Python port of DWR’s IWFM PEST calibration suite, validated against the original Fortran tools.',
    content: ['Develop PyPEST, a Python port of the DWR IWFM PEST calibration suite, validated against the original Fortran tools to support automated model calibration.'],
    glyph: { kind: 'calibration' },
    readout: { label: 'Tool', value: 'PyPEST, validated against the Fortran tools' },
  },
  {
    id: 'stan-scribe',
    title: 'Stan Scribe',
    meta: 'iPhone and iPad',
    summary: 'Live captions in color, built for my grandpa, who is hard of hearing, and for anyone who needs them.',
    content: ['My grandpa Stan is hard of hearing. Live captions changed the conversations my family could have with him, but the apps we found all charged a monthly fee. So I used AI to build one that reaches as many people as possible: live captions in color, a free edition, and no subscription.'],
    glyph: { kind: 'captions' },
    readout: { label: 'App', value: 'Stan Scribe, on its own site' },
    href: '/stanscribe',
  },
];

/** The home page's Selected work, in order (owner, 2026-10-25). */
export const HIGHLIGHTS = ['prison-ej', 'yuba-recharge', 'aiiwfm', 'zbudget-dashboards', 'stan-scribe'] as const;
