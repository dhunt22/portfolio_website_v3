// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/interests/page.tsx
// Exploring personal interests like a river finds its path - always curious about where it leads!

import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { InterestSection, InterestSectionProps } from '@/components/interests/InterestSection';


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
      src: '/images/bicycle_kitchen.webp',
      alt: "A 'Shaft Drive' bicycle- a rare sight for the Bike Kitchen",
      caption: "A 'Shaft Drive' bicycle- a rare sight for the Bike Kitchen",
      objectPosition: 'bottom',
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
      src: '/images/photography.webp',
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
  return (
    <div className="relative min-h-svh">
      <ContourBackdrop page="interests" />

      <div className="container relative z-10 mx-auto px-6">
        <header className="pt-16 pb-8">
          <h1 className="display text-4xl">Personal Interests</h1>
        </header>

        {interestSections.map((section) => (
          <InterestSection key={section.id} {...section} />
        ))}

        {/* GIS Section - topographic vectors shown plainly */}
        <section id="gis" className="panel mb-4 scroll-mt-16">
          <h2 className="font-display text-2xl text-ink-strong">GIS</h2>
          <p className="mt-4 leading-relaxed text-ink-body">
            I love data visualization and deriving digital beauty from the physical world.
            See these topographic vectors I made for the website backgrounds.
          </p>
          <p className="mt-4 leading-relaxed text-ink-body">
            Contact me if you are planning a community event or share an interest in GIS- lets collaborate!
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="border border-border bg-background">
              <img
                src="/images/american_river_contour_bwn.svg"
                alt="American River Contour Map"
                loading="lazy"
                className="block w-full max-h-[420px] object-cover object-top dark:hidden"
              />
              <img
                src="/images/american_river_contour_dark.svg"
                alt="American River Contour Map"
                loading="lazy"
                className="hidden w-full max-h-[420px] object-cover object-top dark:block"
              />
            </div>
            <div className="border border-border bg-background">
              <img
                src="/images/upper_folsom_contour_bwn.svg"
                alt="Upper Folsom Contour Map"
                loading="lazy"
                className="block w-full max-h-[420px] object-cover object-top dark:hidden"
              />
              <img
                src="/images/upper_folsom_contour_dark.svg"
                alt="Upper Folsom Contour Map"
                loading="lazy"
                className="hidden w-full max-h-[420px] object-cover object-top dark:block"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
