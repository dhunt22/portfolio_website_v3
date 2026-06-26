// AUTO-GENERATED from content/portfolio.md — do not edit by hand.
// Regenerate with: npm run content:sync

import type { PageContent } from '../_types';

export const portfolio = {
  "intro": {
    "id": "intro",
    "title": "Intro",
    "fields": {},
    "body": [
      "A collection of water resources and geospatial projects showcasing data-driven solutions for sustainable water management across California."
    ],
    "items": [],
    "links": [],
    "children": []
  },
  "projects": {
    "id": "projects",
    "title": "Projects",
    "fields": {},
    "body": [],
    "items": [],
    "links": [],
    "children": [
      {
        "id": "environmental-justice-for-prisons",
        "title": "Environmental Justice For Prisons",
        "fields": {
          "id": "prison-ej",
          "description": "Geospatial Analysis, NASA Grant Project"
        },
        "body": [
          "At the Geospatial Centroid, I worked alongside Caitlin Mothes to choose and process open source datasets and calculate percentile scores in three separate categories: climate, exposure, and proximity-based effects.",
          "Each prison was then assigned a vulnerability score which combined all risk factors. This project taught me about managing a repository and working with large data."
        ],
        "items": [],
        "links": [
          {
            "label": "GitHub Repository",
            "href": "https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1"
          },
          {
            "label": "Detailed Project Page",
            "href": "/portfolio/environmental-justice-prisons"
          }
        ],
        "children": []
      },
      {
        "id": "cuyama-valley-groundwater-basin",
        "title": "Cuyama Valley Groundwater Basin",
        "fields": {
          "id": "cuyama-basin",
          "description": "Groundwater Sustainability, Cartography",
          "image-note": "SRTM Perspective View with Landsat Overlay: Caliente Range and Cuyama Valley, California"
        },
        "body": [
          "Served as the geospatial technician, water resource model support, and project data manager for all tasks for the reports.",
          "Geospatial: developed layout template, basemap, and new figures for the Cuyama 2024 Annual Report (AR), 2025 Groundwater Sustainability Plan (GSP), and Groundwater Conditions reports using ArcGIS Pro and QGIS. To see my work, open the 2025 GSP document and look in the lower left corner of figures for \"dhunt\".",
          "Modeling: Utilized python and QGIS to incorporate yearly land use, ET, and other water usage parameters to the IWFM model, CBWRM."
        ],
        "items": [],
        "links": [
          {
            "label": "2025 GSP",
            "href": "https://sgma.water.ca.gov/portal/gsppe/update/29F7AB43D49C0C73E06350C29E0AC15F"
          }
        ],
        "image": {
          "alt": "SRTM Perspective View with Landsat Overlay: Caliente Range and Cuyama Valley, California",
          "src": "/images/cuyama_valley_nasa_srtm.jpg",
          "caption": "NASA, 2001"
        },
        "children": []
      },
      {
        "id": "yuba-subbasins-recharge-analysis",
        "title": "Yuba Subbasins Recharge Analysis",
        "fields": {
          "id": "yuba-recharge",
          "description": "Groundwater Management, Spatial Analysis"
        },
        "body": [
          "Computed Recharge Suitability Index (RSI) scores using open-source geospatial data for the Yuba Subbasins. This analysis identified optimal locations for groundwater recharge projects.",
          "By combining soil permeability data, slope analysis, land use classifications, and proximity to water sources, I created a comprehensive index score and suite of figures that guides decision-making for water management authorities.",
          "Yuba Water. (2023b, December). Recharge Suitability Index: Development and Results."
        ],
        "items": [],
        "links": [
          {
            "label": "Download Document",
            "href": "https://sgma.water.ca.gov/portal/service/gspdocument/download/10541"
          },
          {
            "label": "SGMA Portal Source",
            "href": "https://sgma.water.ca.gov/portal/gsp/periodiceval/preview/25"
          }
        ],
        "image": {
          "alt": "Yuba Subbasins Recharge Analysis visualization",
          "src": "/images/yuba_recharge_suitability_index_preview.webp"
        },
        "children": []
      },
      {
        "id": "urban-water-use-objective-reporting",
        "title": "Urban Water Use Objective Reporting",
        "fields": {
          "id": "seasonal-population",
          "description": "Groundwater Management, Large-data Analysis"
        },
        "body": [
          "Programmed a script to calculate Seasonal populations from Advanced Metering Infrastructure (AMI) data. This analysis helped clients comply with California requirements for Urban Water Use Objectives (UWUO).",
          "R-language script wrangled, cleaned, and processed >8 million records from 21,000 households. Algorithms within script adhered to Methods for Estimating Seasonal Populations with Water and Energy Data (DWR, 2022)."
        ],
        "items": [],
        "links": [],
        "image": {
          "alt": "Urban Water Use Objective Reporting visualization",
          "src": "/images/sacramento_water_purveyors.png"
        },
        "children": []
      },
      {
        "id": "harvest-water-program",
        "title": "Harvest Water Program",
        "fields": {
          "id": "harvest-water",
          "description": "Geospatial Management, Contract Support"
        },
        "body": [
          "Updated project figures and managed geospatial data for the Sacramento Sewer District's Harvest Water Program.",
          "Created advanced plots for legal OFCA supply contracts, supporting implementation of Title 22 water delivery to local farmers within the study area."
        ],
        "items": [],
        "links": [],
        "children": []
      },
      {
        "id": "infiltration-feasibility-study",
        "title": "Infiltration Feasibility Study",
        "fields": {
          "id": "modesto-infiltration",
          "description": "Soil Analysis, Field Testing"
        },
        "body": [
          "Conducted initial identification of existing drainage basins for percolation field tests, including spatial analysis of soil profiles and infiltration scores using SAGBI and SSURGO data.",
          "Oversaw borehole drilling and percolation tests, documenting soil characteristics at 5-foot intervals across three boreholes to identify layers preventing deep percolation."
        ],
        "items": [],
        "links": [],
        "image": {
          "alt": "Infiltration Feasibility Study visualization",
          "src": "/images/modesto_infiltration_snyderWest.webp"
        },
        "children": []
      },
      {
        "id": "antelope-valley-well-resilience-study",
        "title": "Antelope Valley Well Resilience Study",
        "fields": {
          "id": "antelope-wells",
          "description": "Suitability Analysis, Water Infrastructure",
          "image-note": "This is the westernmost portion of District 40, spanning Palmdale and Lancaster."
        },
        "body": [
          "Led geospatial analysis to create suitability scores for new well sites in Antelope Valley, combining land use, water quality, hydrogeologic, and infrastructure data.",
          "Systematically weighted and binned over ten separate datasets to produce composite parcel-level scores. Created figure templates and documented data sources and analytical reasoning in technical memorandum supporting final site recommendations."
        ],
        "items": [],
        "links": [
          {
            "label": "LA County District Overview",
            "href": "https://pw.lacounty.gov/core-service-areas/water-resources/waterworks-districts/district-overview/"
          }
        ],
        "image": {
          "alt": "Antelope Valley Well Resilience Study visualization",
          "src": "/images/antelope_valley_LACPW_district40.webp"
        },
        "children": []
      },
      {
        "id": "watershed-hub-dashboard",
        "title": "Watershed Hub Dashboard",
        "fields": {
          "id": "watershed-hub",
          "description": "Data Processing, Dashboard Development"
        },
        "body": [
          "Performed exploratory analyses on multiple metrics for the California Department of Resources Watershed Hub dashboard project.",
          "Fetched data from available APIs, then cleaned and processed results for upload to ArcGIS Online. Enhanced metric processing scripts with AI-assisted loggers, error-tracking, and summary reporting features."
        ],
        "items": [],
        "links": [],
        "children": []
      },
      {
        "id": "quarterly-groundwater-conditions-reports",
        "title": "Quarterly Groundwater Conditions Reports",
        "fields": {
          "id": "sanitary-district",
          "description": "Water Quality Monitoring, Regulatory Compliance"
        },
        "body": [
          "Produce quarterly National Pollutant Discharge Elimination System (NPDES) groundwater conditions reports from client-collected monitoring data across six wells.",
          "Analyze depth to water measurements to estimate groundwater elevation and horizontal gradient. Use data interpolation and visualization techniques to provide comprehensive descriptions of water characteristics and constituent distributions."
        ],
        "items": [],
        "links": [],
        "image": {
          "alt": "NPDES \"Protecting Water Quality\" logo",
          "src": "/images/npdes_logo_up.jpg"
        },
        "children": []
      }
    ]
  }
} satisfies PageContent;
