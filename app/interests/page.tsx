// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/interests/page.tsx
// Exploring personal interests like a river finds its path - always curious about where it leads!

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Personal interests page component showcasing hobbies and passions
 * @returns {React.JSX.Element} The rendered interests page
 */
export default function InterestsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background SVG */}
      <div className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden">
        <div
          className="w-full h-full bg-repeat-y bg-center opacity-10"
          style={{
            backgroundImage: 'url(/images/american_river_homepage_contour_bwn.svg)',
            backgroundSize: 'contain',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold text-forest-800 mb-6">Personal Interests</h1>

        <div className="space-y-12">
        <section id="exploration" className="scroll-mt-16">
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Exploration</h2>
                
                <blockquote className="mb-6 text-lg italic">
                  "The world is big, and I want to have a good look at it before it gets dark."
                  <footer className="text-forest-600 mt-1">— John Muir</footer>
                </blockquote>
                
                <p className="mb-4">
                  I travel in my First Generation Tundra as much as possible, reaching desolate areas. 
                  I am always in search of a quieter place, somewhere I can fully immerse myself in nature.
                </p>
                
                <p>
                  My favorite places to travel include Moab UT, Fraser CO, Garden of Eden in Santa Cruz CA, and Stanislaus National Forest.
                </p>
              </div>
              
              <div className="relative h-[300px] md:h-auto">
                <Image
                  src="/images/exploration.jpg"
                  alt="A silver Tundra covered in orange Moab mud after driving Shafer Trail in Canyonlands National Park"
                  className="object-cover object-bottom"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs italic">
                    A silver Tundra covered in orange Moab mud after driving Shafer Trail in Canyonlands National Park
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
        
        <section id="fishing" className="scroll-mt-16">
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-[300px] md:h-auto order-last md:order-first">
                <Image
                  src="/images/fishing.jpg"
                  alt="A calm alpine lake at dusk near Winter Park, Colorado"
                  className="object-cover object-center"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs italic">
                    A calm alpine lake at dusk near Winter Park, Colorado
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Fishing</h2>
                
                <blockquote className="mb-6 text-lg italic">
                  "What better way to learn about streams than within?"
                  <footer className="text-forest-600 mt-1">— Devin Hunt</footer>
                </blockquote>
                
                <p className="mb-4">
                  I have fished nearly all water features I reach (in obedience with regulations and reason 
                  [i.e. not a puddle]). A fish can tell a story about the water quality, color, cover types, 
                  and food sources.
                </p>
                
                <p>
                  Some of my favorite time in Colorado was spent hiking and driving out to remote water with 
                  no reviews on Fishbrain. I feel that it is best to experience the water as it is, therefore, 
                  I did not use waders to protect from the cold.
                </p>
              </div>
            </div>
          </Card>
        </section>
        
        <section id="mycology" className="scroll-mt-16">
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Mycology</h2>
                
                <blockquote className="mb-6 text-lg italic">
                  "Fungi are the interface organisms between life and death."
                  <footer className="text-forest-600 mt-1">— Paul Stamets</footer>
                </blockquote>
                
                <p className="mb-4">
                  Fungi are everywhere, you just have to look. It was not until my days in Colorado that 
                  I sought out fungi. I love to document, forage, and spatially bookmark my mushroom observations.
                </p>
                
                <p>
                  I am working on a better field documentation workflow utilizing QField, currently I keep track using Organic Maps. 
                  My Mushroom Observer account needs updating, as I have found species that I have not been able to identify using guidebooks.
                </p>
              </div>
              
              <div className="relative h-[300px] md:h-auto">
                <Image
                  src="/images/mycology.jpg"
                  alt="Unidentified mushroom in Fraser Experimental Forest"
                  className="object-cover object-bottom"
                  fill
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs italic">
                    Unidentified mushroom in Fraser Experimental Forest
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
        
        <section id="photography" className="scroll-mt-16">
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-[300px] md:h-auto order-last md:order-first">
                <Image
                  src="/images/photography.jpg"
                  alt="Wood texture captured during a hike"
                  className="object-cover object-bottom"
                  fill
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs italic">
                    Wood texture captured during a hike
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Photography</h2>
                
                <p className="mb-4">
                  My goal was to capture life from the perspective of someone who is curious, confident, and isolated. 
                  I started capturing in high school and carried on through college.
                </p>
                
                <p>
                  Nowadays I use my Sony a6300 for macro shots of fungi and textures of nature. All photos on this 
                  site are self-captured. The homepage features a wood texture I saw on a hike.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section id="bicycles" className="scroll-mt-16">
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Bicycles</h2>

                <blockquote className="mb-6 text-lg italic">
                  "It's all mechanical, you can mend it with a hammer."
                  <footer className="text-forest-600 mt-1">— Richard Hammond</footer>
                </blockquote>

                <p className="mb-4">
                  While the quote references Jeremy's BMW, I find working on bicycles to be a purely mechanical pursuit that I genuinely enjoy. 
                  I love building and riding bikes, and my current fleet consists of a 2009 Fuji Cross Pro and a Cannondale CX3 — these two bikes 
                  account for about 90% of my travel.

                </p>

                <p>
                  Some notable rides include the Sacramento to Davis Causeway, Lake Tahoe (Tour De Tahoe Route), and the American River Trail from 
                  Midtown to Folsom Lake.

                </p>
              </div>

              <div className="relative h-[300px] md:h-auto">
                <Image
                  src="/images/bicycle_kitchen.jpg"
                  alt="A 'Shaft Drive' bicycle- a rare sight for the Bike Kitchen"
                  className="object-cover object-bottom"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs italic">
                    A 'Shaft Drive' bicycle- a rare sight for the Bike Kitchen
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="community" className="scroll-mt-16">
          <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-[300px] md:h-auto order-last md:order-first">
                <Image
                  src="/images/placeholder-community.jpg"
                  alt="Community engagement and collaboration"
                  className="object-cover object-bottom"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs italic">
                    Community engagement and collaboration
                  </p>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Community</h2>

                <p className="mb-4">
                  Building connections within local and professional communities enriches both personal growth
                  and collaborative problem-solving. Whether through mentorship, volunteer work, or shared projects,
                  community engagement creates lasting positive impact.
                </p>

                <p>
                  From technical meetups to environmental advocacy, participating in community initiatives
                  allows for knowledge sharing and collective action toward common goals.
                </p>
              </div>
            </div>
          </Card>
        </section>
        </div>
      </div>
    </div>
  );
}
