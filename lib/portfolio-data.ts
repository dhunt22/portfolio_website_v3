// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/portfolio-data.ts
// Portfolio project data separated for better maintainability

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
  displayType?: 'map' | 'image'; // Type of visual display (defaults to 'map')
  imagePath?: string; // Path to image file if displayType is 'image'
  imageAlt?: string; // Alt text for image accessibility
  imageCaption?: string; // Caption for the image (e.g., "NASA, 2001")
  imageSecondaryText?: string; // Secondary descriptive text for the image
}

/**
 * Project data array
 */
export const PROJECTS: Project[] = [
  {
    id: 'prison-ej',
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
        label: 'Published Dataset',
        iconType: 'external'
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
    title: 'Yuba Subbasins Recharge Analysis',
    description: 'Groundwater Management, Spatial Analysis',
    categories: ['all', 'water', 'geospatial'],
    year: '2023',
    technologies: ['GIS', 'Spatial Analysis', 'Hydrology'],
    displayType: 'image',
    imagePath: '/images/yuba_recharge_suitability_index_preview.png',
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
    title: 'Harvest Water Program',
    description: 'Geospatial Management, Contract Support',
    categories: ['all', 'water', 'geospatial'],
    year: '2024',
    technologies: ['GIS', 'Contract Management', 'Water Law'],
    content: [
      'Updated project figures and managed geospatial data for the Sacramento Sewer District\'s Harvest Water Program.',
      'Created advanced plots for legal OFCA supply contracts, supporting implementation of Title 22 water delivery to local farmers within the study area.'
    ]
  },
  {
    id: 'modesto-infiltration',
    title: 'Infiltration Feasibility Study',
    description: 'Soil Analysis, Field Testing',
    categories: ['all', 'water', 'geospatial'],
    year: '2024',
    technologies: ['Field Testing', 'Soil Analysis', 'GIS'],
    displayType: 'image',
    imagePath: '/images/modesto_infiltration_snyderWest.jpg',
    imageAlt: 'Infiltration Feasibility Study visualization',
    content: [
      'Conducted initial identification of existing drainage basins for percolation field tests, including spatial analysis of soil profiles and infiltration scores using SAGBI and SSURGO data.',
      'Oversaw borehole drilling and percolation tests, documenting soil characteristics at 5-foot intervals across three boreholes to identify layers preventing deep percolation.'
    ]
  },
  {
    id: 'antelope-wells',
    title: 'Antelope Valley Well Resilience Study',
    description: 'Suitability Analysis, Water Infrastructure',
    categories: ['all', 'water', 'geospatial'],
    year: '2024-Present',
    technologies: ['GIS', 'Suitability Analysis', 'Water Infrastructure'],
    displayType: 'image',
    imagePath: '/images/antelope_valley_LACPW_district40.png',
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
    title: 'Quarterly Groundwater Conditions Reports',
    description: 'Water Quality Monitoring, Regulatory Compliance',
    categories: ['all', 'water'],
    year: '2024-Present',
    technologies: ['Water Quality Analysis', 'Regulatory Compliance', 'Data Visualization'],
    displayType: 'image',
    imagePath: '/images/npdes_logo_up.jpg',
    imageAlt: 'Quarterly Groundwater Conditions Reports visualization',
    content: [
      'Produce quarterly National Pollutant Discharge Elimination System (NPDES) groundwater conditions reports from client-collected monitoring data across six wells.',
      'Analyze depth to water measurements to estimate groundwater elevation and horizontal gradient. Use data interpolation and visualization techniques to provide comprehensive descriptions of water characteristics and constituent distributions.'
    ]
  }
];

/**
 * Get projects filtered by category
 * @param category - Category to filter by
 * @returns Filtered projects array
 */
export function getProjectsByCategory(category: string): Project[] {
  return PROJECTS.filter(project => project.categories.includes(category));
}

/**
 * Get featured projects
 * @returns Array of featured projects
 */
export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter(project => project.featured);
}

/**
 * Get project by ID
 * @param id - Project ID
 * @returns Project or undefined
 */
export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find(project => project.id === id);
}
