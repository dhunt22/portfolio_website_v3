'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GitHubIcon, ExternalLinkIcon } from '@/components/ui/icons/common-icons';
import LazyProjectMap from '@/components/portfolio/LazyProjectMap';

/**
 * Environmental Justice For Prisons - Dedicated Project Page
 * A comprehensive overview of the NASA-funded research project
 */
export default function EnvironmentalJusticePrisonsPage() {
  const [mapFilter, setMapFilter] = useState(10); // Default to top 10 prisons

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-river-50">
      {/* Hero Section */}
      <section className="bg-forest-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Environmental Justice For Prisons
            </h1>
            <h2 className="text-xl md:text-2xl text-forest-100 mb-8">
              Leveraging NASA Earth Science Data to Map Environmental Injustices in U.S. Prisons
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1" target="_blank">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-forest-900">
                  <GitHubIcon className="w-4 h-4 mr-2" />
                  View Repository
                </Button>
              </Link>
              <Link href="https://appliedsciences.nasa.gov/what-we-do/projects/leveraging-earth-science-data-heighten-awareness-environmental-injustices" target="_blank">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-forest-900">
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  NASA Project Page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl text-forest-800">Project Overview</CardTitle>
                <CardDescription className="text-lg text-forest-600">
                  A groundbreaking research initiative funded by NASA's $100,000 Equity and Environmental Justice Grant
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <p className="text-forest-800 leading-relaxed mb-6">
                  Despite the numerous cases of environmental injustices documented in U.S. prisons by researchers, activists, journalists, and federal government, the examination of prisons as sites of environmental injustice is still understudied. However, prisons are by definition EJ communities, as they are highly overrepresented by people of color, indigenous persons, and low-income individuals, and have no choice but to endure any adverse environmental health threats.
                </p>
                
                <p className="text-forest-800 leading-relaxed mb-6">
                  This research addresses this vital environmental justice research gap by leveraging NASA's Earth science data—including satellite, land cover, climate, and air quality datasets—in a novel way to characterize the environmental harms faced by incarcerated people across the U.S. in all state- and federally-operated prisons.
                </p>

                <div className="bg-river-50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-river-800 mb-4">Key Project Objectives</h3>
                  <ul className="space-y-2 text-forest-800">
                    <li className="flex items-start">
                      <span className="text-river-600 mr-2">•</span>
                      <span>Quantify environmental conditions at all 1,865 state and federal prisons in the U.S.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-river-600 mr-2">•</span>
                      <span>Calculate a standardized vulnerability index for each prison</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-river-600 mr-2">•</span>
                      <span>Create an open-access geospatial dataset and reproducible code base</span>
                    </li>
                  </ul>
                </div>

                <p className="text-forest-800 leading-relaxed">
                  The method incorporates 11 environmental indicators grouped into three components, namely climate risk (heat index, canopy cover, wildfire risk and flood hazard), environmental exposures (Ozone, PM 2.5, pesticide use, and traffic density) and environmental effects (proximity to superfund sites, risk management plan facilities and hazardous waste sites).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Overall Risk Score Map Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-forest-800 mb-8 text-center">
              Overall Environmental Risk Score
            </h2>
            
            {/* Large Map Window */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="h-[500px] rounded-lg overflow-hidden mb-4">
                  <LazyProjectMap projectId="prison-ej" />
                </div>
                
                {/* Map Description */}
                <div className="mt-4 p-4 bg-forest-50 rounded-lg">
                  <p className="text-sm text-forest-700 mb-2">
                    <strong>Interactive Map Instructions:</strong>
                  </p>
                  <ul className="text-sm text-forest-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-forest-500 mr-2">•</span>
                      <span>Use the <strong>Risk Category</strong> dropdown to switch between risk types</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-forest-500 mr-2">•</span>
                      <span>Filter to show <strong>All Prisons</strong> or just the <strong>Top 10 highest risk</strong> facilities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-forest-500 mr-2">•</span>
                      <span>Hover over any prison facility to see detailed information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-forest-500 mr-2">•</span>
                      <span>Zoom in to see individual prison boundaries and locations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-forest-500 mr-2">•</span>
                      <span>Green = Lower Risk, Yellow = Medium Risk, Red = Higher Risk</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Description Text */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-forest-800 leading-relaxed">
                  The overall environmental vulnerability index combines all 11 environmental indicators into a comprehensive 
                  risk assessment for each prison facility. In some of these prisons, summer heat waves can create indoor heat indexes of more than 150 degrees. Others experience poor air quality due to nearby wildfires, and potential contamination due to environmental risks like nearby landfills. This 
                  standardized metric enables direct comparison of environmental risks across all 1,865 facilities, 
                  revealing stark disparities in the environmental conditions faced by incarcerated populations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Climate Risk Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-forest-800 mb-8 text-center">
              Climate Risk Assessment
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-forest-700">Climate Risk Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-forest-800">Heat Index</h4>
                        <p className="text-sm text-forest-600">
                          Measures extreme temperature conditions that can create dangerous indoor environments, 
                          with some facilities experiencing heat indexes exceeding 150°F.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-forest-800">Canopy Cover</h4>
                        <p className="text-sm text-forest-600">
                          Assesses natural cooling provided by tree coverage around prison facilities, 
                          which can significantly impact local temperature regulation.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-forest-800">Wildfire Risk</h4>
                        <p className="text-sm text-forest-600">
                          Evaluates proximity to wildfire-prone areas and historical fire activity, 
                          affecting air quality and evacuation capabilities.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-forest-800">Flood Hazard</h4>
                        <p className="text-sm text-forest-600">
                          Analyzes flood risk from FEMA data, considering the limited mobility 
                          of incarcerated populations during emergency events.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-forest-700">Climate Risk Visualization</CardTitle>
                    <CardDescription className="text-sm text-forest-600">
                      Interactive map showing climate-related environmental risks at prison facilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      <LazyProjectMap projectId="prison-ej" />
                    </div>
                    <div className="mt-3 p-3 bg-orange-50 rounded text-sm">
                      <p className="text-orange-800">
                        <strong>Tip:</strong> Use the "Climate Risk" category and filter to "Top 10" 
                        to focus on the most climate-vulnerable prison facilities.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Exposures Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-forest-800 mb-8 text-center">
              Environmental Exposures
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-forest-700">Environmental Exposures Map</CardTitle>
                    <CardDescription className="text-sm text-forest-600">
                      Air quality and pollution exposure analysis across U.S. prison facilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      <LazyProjectMap projectId="prison-ej" />
                    </div>
                    <div className="mt-3 p-3 bg-purple-50 rounded text-sm">
                      <p className="text-purple-800">
                        <strong>Explore:</strong> Select "Exposure Risk" and filter to "Top 10" to identify 
                        the prisons with the worst air quality and pollution exposure.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-forest-700">Exposure Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-forest-800">Ozone Levels</h4>
                        <p className="text-sm text-forest-600">
                          Ground-level ozone concentrations from NASA satellite data, 
                          which can exacerbate respiratory conditions in confined populations.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-gray-500 pl-4">
                        <h4 className="font-semibold text-forest-800">PM 2.5 Particulates</h4>
                        <p className="text-sm text-forest-600">
                          Fine particulate matter concentrations that penetrate deep into lungs, 
                          particularly dangerous for vulnerable incarcerated populations.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-semibold text-forest-800">Pesticide Use</h4>
                        <p className="text-sm text-forest-600">
                          Agricultural pesticide application intensity in surrounding areas, 
                          affecting air and water quality around prison facilities.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-gray-700 pl-4">
                        <h4 className="font-semibold text-forest-800">Traffic Density</h4>
                        <p className="text-sm text-forest-600">
                          Vehicle traffic volume contributing to local air pollution, 
                          including diesel emissions from transport vehicles.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Effects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-forest-800 mb-8 text-center">
              Environmental Effects
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-forest-700">Proximity-Based Risk Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-600 pl-4">
                        <h4 className="font-semibold text-forest-800">Superfund Sites</h4>
                        <p className="text-sm text-forest-600">
                          Distance to EPA Superfund sites containing hazardous waste requiring 
                          long-term cleanup, with potential for groundwater and air contamination.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-orange-600 pl-4">
                        <h4 className="font-semibold text-forest-800">Risk Management Plan Facilities</h4>
                        <p className="text-sm text-forest-600">
                          Proximity to industrial facilities with Risk Management Plans for 
                          handling hazardous chemicals that pose catastrophic risk.
                        </p>
                      </div>
                      
                      <div className="border-l-4 border-brown-600 pl-4">
                        <h4 className="font-semibold text-forest-800">Hazardous Waste Sites</h4>
                        <p className="text-sm text-forest-600">
                          Distance to facilities that treat, store, or dispose of hazardous waste, 
                          including active and historical contamination sources.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-forest-700">Environmental Effects Visualization</CardTitle>
                    <CardDescription className="text-sm text-forest-600">
                      Hazardous site proximity and environmental contamination risk analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      <LazyProjectMap projectId="prison-ej" />
                    </div>
                    <div className="mt-3 p-3 bg-red-50 rounded text-sm">
                      <p className="text-red-800">
                        <strong>Analysis:</strong> Choose "Effects Risk" and filter to "Top 10" to see the 
                        prisons closest to Superfund sites and hazardous waste facilities.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              <Card className="bg-white/10 backdrop-blur-sm border-forest-700">
                <CardHeader>
                  <CardTitle className="text-white">Research Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-forest-100">
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

              <Card className="bg-white/10 backdrop-blur-sm border-forest-700">
                <CardHeader>
                  <CardTitle className="text-white">My Role & Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-forest-100">
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

            <Card className="bg-white/10 backdrop-blur-sm border-forest-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Project Impact & Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-forest-100 leading-relaxed mb-6">
                    The main deliverables of our project are 1) an open-access geospatial dataset with calculated values for each environmental indicator and a final environmental vulnerability index for 1,865 U.S. prisons and 2) an open-access, reproducible code base for every step of our analysis to promote the application of these assessments to other institutions and make our data and methods transparent.
                  </p>
                  
                  <p className="text-forest-100 leading-relaxed mb-8">
                    This groundbreaking research has provided critical data for activists, researchers, policy makers, 
                    and government agencies to understand and address environmental injustices in the prison system. 
                    The work represents a significant contribution to both environmental justice and geospatial science.
                  </p>

                  <div className="text-center">
                    <p className="text-forest-200 italic">
                      "This project taught me about managing a repository and working with large data, while contributing 
                      to vital environmental justice research that highlights the intersection of incarceration and environmental harm."
                    </p>
                    <p className="text-forest-300 text-sm mt-2">— Devin Hunt, Project Contributor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-forest-200 text-sm">
                Special thanks to the Geospatial Centroid at Colorado State University and NASA's Equity and Environmental Justice Grant program 
                for making this critical research possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-forest-800 mb-4">
            Explore the Research
          </h3>
          <p className="text-forest-600 mb-6 max-w-2xl mx-auto">
            Access the open-source code, data, and methodology that powers this environmental justice research.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="https://github.com/GeospatialCentroid/NASA-prison-EJ/releases/tag/v2023-1" target="_blank">
              <Button className="bg-forest-600 hover:bg-forest-700">
                <GitHubIcon className="w-4 h-4 mr-2" />
                Access Repository
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="outline" className="border-forest-600 text-forest-600 hover:bg-forest-50">
                Back to Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
