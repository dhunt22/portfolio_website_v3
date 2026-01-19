// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/interests/page.tsx
// Exploring personal interests like a river finds its path - always curious about where it leads!

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAmericanRiverBackground } from '@/hooks/useThemeBackground';
import { InterestSection, InterestSectionProps } from '@/components/interests/InterestSection';
import { PageBackground } from '@/components/ui/PageBackground';

// Blur data URL constant (reused across multiple sections)
const DEFAULT_BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

/**
 * Interest section data configuration
 */
const interestSections: InterestSectionProps[] = [
  {
    id: 'exploration',
    title: 'Exploration',
    imagePosition: 'right',
    image: {
      src: '/images/exploration.jpg',
      alt: 'A silver Tundra covered in orange Moab mud after driving Shafer Trail in Canyonlands National Park',
      caption: 'A silver Tundra covered in orange Moab mud after driving Shafer Trail in Canyonlands National Park',
      objectPosition: 'bottom',
      blurDataURL: DEFAULT_BLUR_DATA_URL,
    },
    quote: {
      text: 'The world is big, and I want to have a good look at it before it gets dark.',
      author: 'John Muir',
    },
    paragraphs: [
      'I travel in my First Generation Tundra as much as possible, reaching desolate areas. I am always in search of a quieter place, somewhere I can fully immerse myself in nature.',
      'My favorite places to travel include Moab UT, Fraser CO, Garden of Eden in Santa Cruz CA, and Stanislaus National Forest.',
    ],
  },
  {
    id: 'fishing',
    title: 'Fishing',
    imagePosition: 'left',
    image: {
      src: '/images/fishing.jpg',
      alt: 'A calm alpine lake at dusk near Winter Park, Colorado',
      caption: 'A calm alpine lake at dusk near Winter Park, Colorado, where I caught my first lake trout',
      objectPosition: 'center',
      blurDataURL: DEFAULT_BLUR_DATA_URL,
    },
    quote: {
      text: 'What better way to learn about streams than within?',
      author: 'Devin Hunt',
    },
    paragraphs: [
      'I have fished nearly all water features I reach (in obedience with regulations). A fish can tell a story about the water quality, color, cover types, and food sources.',
      'Some of my favorite time in Colorado was spent hiking and driving out to remote water with no reviews on Fishbrain. I feel that it is best to experience the water as it is, therefore, I did not use waders to protect from the cold.',
      'I release all of the fish I catch.',
    ],
  },
  {
    id: 'bicycles',
    title: 'Bicycles',
    imagePosition: 'right',
    image: {
      src: '/images/bicycle_kitchen.jpg',
      alt: "A 'Shaft Drive' bicycle- a rare sight for the Bike Kitchen",
      caption: "A 'Shaft Drive' bicycle- a rare sight for the Bike Kitchen",
      objectPosition: 'bottom',
      blurDataURL: DEFAULT_BLUR_DATA_URL,
    },
    quote: {
      text: "It's all mechanical, you can mend it with a hammer.",
      author: 'Richard Hammond',
    },
    paragraphs: [
      "While the quote references Jeremy's BMW, I find working on bicycles to be a purely mechanical pursuit that I genuinely enjoy. I love building and riding bikes, and my current fleet consists of a 2009 Fuji Cross Pro and a Cannondale CX3 — these two bikes account for about 90% of my travel.",
      'Some notable rides include the Sacramento to Davis Causeway, Lake Tahoe (Tour De Tahoe Route), and the American River Trail from Midtown to Folsom Lake.',
    ],
  },
  {
    id: 'community',
    title: 'Community',
    imagePosition: 'left',
    image: {
      src: '/images/vacancyFee.png',
      alt: 'Vacancy Fee organization logo',
      caption: 'An organization I have joined to support the city!',
      objectPosition: 'center',
    },
    paragraphs: [
      'Sacramento is full of opportunities for civic engagement and community involvement.',
      'From climbing sessions to technical meetings, I enjoy being involved in a variety of subcultures that expose me to the wonders of the city and beyond!',
    ],
    externalLink: {
      href: 'https://vacancyfee.org/',
      label: 'Get Involved',
    },
  },
  {
    id: 'mycology',
    title: 'Mycology',
    imagePosition: 'right',
    image: {
      src: '/images/mycology.jpg',
      alt: 'Unidentified mushroom in Fraser Experimental Forest',
      caption: 'Unidentified mushroom in Fraser Experimental Forest',
      objectPosition: 'bottom',
    },
    quote: {
      text: 'Fungi are the interface organisms between life and death.',
      author: 'Paul Stamets',
    },
    paragraphs: [
      'Fungi are everywhere, you just have to look. It was not until my days in Colorado that I sought out fungi. I love to document, forage, and spatially bookmark my mushroom observations.',
      'I am working on a better field documentation workflow utilizing QField, currently I keep track using Organic Maps. My Mushroom Observer account needs updating, as I have found species that I have not been able to identify using guidebooks.',
    ],
  },
  {
    id: 'photography',
    title: 'Photography',
    imagePosition: 'left',
    image: {
      src: '/images/photography.jpg',
      alt: 'Wood texture captured during a hike',
      caption: 'One of my first first long-exposure captures',
      objectPosition: 'bottom',
    },
    paragraphs: [
      'My goal was to capture life from the perspective of someone who is curious, confident, and isolated. I started capturing in high school and carried on through college.',
      'Nowadays I use my Sony a6300 for macro shots of fungi and textures of nature. All photos on this site are self-captured. The homepage features a wood texture I saw on a hike.',
    ],
  },
];

/**
 * Personal interests page component showcasing hobbies and passions
 * @returns {React.JSX.Element} The rendered interests page
 */
export default function InterestsPage() {
  const { isMobile, backgroundImage } = useAmericanRiverBackground();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Carousel images for GIS section
  const carouselImages = [
    { src: '/images/american_river_contour_dark.svg', alt: 'American River Contour Map' },
    { src: '/images/upper_folsom_contour_dark.svg', alt: 'Upper Folsom Contour Map' },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background SVG */}
      <PageBackground backgroundImage={backgroundImage} isMobile={isMobile} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-forest-800 dark:text-forest-200 mb-6">
          Personal Interests
        </h1>

        <div className="space-y-8">
          {/* Render standard interest sections */}
          {interestSections.map((section) => (
            <InterestSection key={section.id} {...section} />
          ))}

          {/* GIS Section - unique carousel layout */}
          <section id="gis" className="scroll-mt-16">
            <Card
              className="bg-white/70 dark:bg-[#404040]/70 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-river-300 focus-within:border-river-300 focus-within:shadow-sm"
              tabIndex={0}
              aria-label="GIS interest section"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6">
                  <h2 className="text-3xl font-semibold text-forest-700 dark:text-forest-300 mb-4">GIS</h2>
                  <p className="mb-4">
                    I love data visualization and deriving digital beauty from the physical world.
                    See these topographic vectors I made for the website backgrounds.
                  </p>
                  <p className="mb-4">
                    Contact me if you are planning a community event or share an interest in GIS- lets collaborate!
                  </p>
                </div>

                <div className="relative h-[300px] sm:h-[350px] md:h-[400px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={carouselImages[currentImageIndex].src}
                        alt={carouselImages[currentImageIndex].alt}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-forest-700 dark:text-forest-300 rounded-full p-3 shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-forest-700 dark:text-forest-300 rounded-full p-3 shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {carouselImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className="p-2 flex items-center justify-center"
                          aria-label={`Go to image ${index + 1}`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-forest-600 dark:bg-forest-400 w-6'
                                : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
