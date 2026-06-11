// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/page.tsx
// The home page - where the watershed of information begins

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon, FishIcon } from '@/components/ui/icons/common-icons';
import { useAmericanRiverBackground } from '@/hooks/useThemeBackground';
import { AnimatedContourBackground } from '@/components/ui/AnimatedContourBackground';

/**
 * Home page component displaying introduction and highlights
 * @returns {React.JSX.Element} The rendered home page
 */
export default function Home() {
  const { isMobile, backgroundImage, isDark, mounted, animatedLightSrc } = useAmericanRiverBackground();

  return (
    <div className="relative min-h-screen">
      {/* Background SVG */}
      <AnimatedContourBackground
        backgroundImage={backgroundImage}
        isMobile={isMobile}
        isDark={isDark}
        mounted={mounted}
        animatedSrc={animatedLightSrc}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-forest-800 dark:text-forest-200 mb-4">
              Devin Hunt
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl text-forest-600 dark:text-forest-300 mb-6">
              Water Resources Engineer & Explorer
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6">
              Passionate about understanding and solving water resource challenges in California 
              through data-driven approaches. Skilled in leveraging open-source data, spatial 
              analysis, and groundwater modeling to support sustainable water management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/portfolio">
                <Button variant="outline" className="border-forest-600 text-forest-600 dark:border-forest-200
                dark:text-forest-200 hover:bg-forest-900 hover:text-forest-600 hover:border-forest-600 w-full sm:w-auto">
                  Explore Portfolio
                </Button>
              </Link>
              <Link href="/resume">
                <Button className="bg-forest-600 hover:bg-forest-700 w-full sm:w-auto">View Resume</Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-lg relative w-full h-[280px] sm:h-[320px] md:h-[350px]">
              <Image
                src="/images/profile.jpg"
                alt="Devin Hunt exploring nature - a water resources engineer in his element"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
                <p className="text-white text-xs sm:text-sm italic">
                  "The world is big, and I want to have a good look at it before it gets dark." – John Muir
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-forest-700 dark:text-forest-300 mb-6">Professional Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Water Resources Engineering</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Development of CA SGMA Groundwater Sustainability Plans (GSPs), groundwater budgets,
                and optimization of recharge and extraction through geospatial analyses.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Geospatial Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Expertise in ArcGIS Pro, QGIS, and cartography. Creating innovative solutions 
                to visualize and analyze water resource data.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data-Driven Approaches</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Utilization of Python, R, and SQL to process large datasets and develop
                automated workflows for water resource management.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-forest-700 dark:text-forest-300 mb-6">Personal Passions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/interests#exploration" className="group touch-manipulation">
            <Card className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm h-full transition-[transform,box-shadow] duration-300 md:group-hover:shadow-md active:shadow-md md:group-hover:scale-105 active:scale-[0.98] md:active:scale-[1.02] group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2 dark:group-focus-visible:ring-offset-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="text-earth-600 w-6 h-6" aria-hidden={true} />
                  Exploration
                </CardTitle>
                <CardDescription>Discovering remote natural places</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Traveling in my First Generation Tundra to reach desolate areas, always in search of 
                  quieter places to fully immerse in nature.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/interests#fishing" className="group touch-manipulation">
            <Card className="bg-white/90 dark:bg-[#404040]/90 backdrop-blur-sm h-full transition-[transform,box-shadow] duration-300 md:group-hover:shadow-md active:shadow-md md:group-hover:scale-105 active:scale-[0.98] md:active:scale-[1.02] group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2 dark:group-focus-visible:ring-offset-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FishIcon className="text-river-600 w-6 h-6" aria-hidden={true} />
                  Fishing
                </CardTitle>
                <CardDescription>Learning about streams from within</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Fishing nearly all water features encountered, understanding how fish tell stories 
                  about water quality, color, cover types, and food sources.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
