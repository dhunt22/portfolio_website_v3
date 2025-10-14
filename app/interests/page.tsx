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
      <div className="absolute -inset-[200px] -z-10 overflow-hidden">
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
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
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
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
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
                  I do not have access to my Survey123 data from my time at CSU, but keep track using Organic Maps. 
                  I am still amazed that I come across species that are not documented in my field books. I am working 
                  on updating more records to the Mushroom Observer for identification.
                </p>
              </div>
              
              <div className="relative h-[300px] md:h-auto">
                <Image 
                  src="/images/mycology.jpg" 
                  alt="Mushroom in the forest" 
                  className="object-cover"
                  fill
                />
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
                  className="object-cover"
                  fill
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Photography</h2>
                
                <p className="mb-4">
                  My goal was to capture life from the perspective of someone who is curious, confident, and isolated. 
                  I started capturing in high school and carried on through college.
                </p>
                
                <p>
                  Nowadays I use my Sony a6300 for macro shots of fungi and textures of nature. All photos on this 
                  site are self-captured. Above is a wood texture I saw on a hike.
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
                  "Life is like riding a bicycle. To keep your balance, you must keep moving."
                  <footer className="text-forest-600 mt-1">— Albert Einstein</footer>
                </blockquote>

                <p className="mb-4">
                  Cycling offers a unique perspective on the landscape - moving fast enough to cover ground,
                  yet slow enough to truly observe the environment. Whether it's mountain trails or urban paths,
                  bicycles provide an intimate connection with the terrain.
                </p>

                <p>
                  From technical single-track to long-distance touring, cycling combines physical challenge
                  with environmental awareness, making it a perfect complement to my interests in exploration
                  and natural systems.
                </p>
              </div>

              <div className="relative h-[300px] md:h-auto">
                <Image
                  src="/images/placeholder-bicycle.jpg"
                  alt="Bicycle and outdoor adventures"
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
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
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>

              <div className="p-6">
                <h2 className="text-3xl font-semibold text-forest-700 mb-4">Community</h2>

                <blockquote className="mb-6 text-lg italic">
                  "Alone we can do so little; together we can do so much."
                  <footer className="text-forest-600 mt-1">— Unnamed</footer>
                </blockquote>

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
