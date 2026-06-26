// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// app/interests/page.tsx
// Exploring personal interests like a river finds its path - always curious about where it leads!

import { ContourBackdrop } from '@/components/ui/ContourBackdrop';
import { InterestSection, InterestSectionProps } from '@/components/interests/InterestSection';
import { interests as content } from '@/content/generated/interests';
import { interestsConfig } from '@/lib/page-config';
import { child } from '@/content/_helpers';

/**
 * Interest sections assembled from structural config (lib/page-config.json) +
 * editable text from content/interests.md (content/generated/interests.ts).
 */
const interestSections: InterestSectionProps[] = interestsConfig.map((cfg) => {
  const card = child(content.interests, cfg.id);
  return {
    id: cfg.id,
    title: card.title,
    imagePosition: cfg.imagePosition,
    image: {
      src: card.image!.src,
      alt: card.image!.alt,
      caption: card.image!.caption ?? '',
      objectPosition: cfg.objectPosition,
    },
    quote: card.quote ? { text: card.quote.text, author: card.quote.author ?? '' } : undefined,
    paragraphs: card.body,
    externalLink: card.links[0] ? { href: card.links[0].href, label: card.links[0].label } : undefined,
  };
});

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
          <h2 className="font-display text-2xl text-ink-strong">{content.gis.title}</h2>
          {content.gis.body.map((paragraph, index) => (
            <p key={index} className="mt-4 leading-relaxed text-ink-body">
              {paragraph}
            </p>
          ))}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded border border-border bg-card">
              <img
                src="/images/american_river_contour_bwn.svg"
                alt="American River Contour Map"
                loading="lazy"
                className="block w-full aspect-[16/10] object-cover object-top dark:hidden"
              />
              <img
                src="/images/american_river_contour_dark.svg"
                alt="American River Contour Map"
                loading="lazy"
                className="hidden w-full aspect-[16/10] object-cover object-top dark:block"
              />
            </div>
            <div className="overflow-hidden rounded border border-border bg-card">
              <img
                src="/images/upper_folsom_contour_bwn.svg"
                alt="Upper Folsom Contour Map"
                loading="lazy"
                className="block w-full aspect-[16/10] object-cover object-top dark:hidden"
              />
              <img
                src="/images/upper_folsom_contour_dark.svg"
                alt="Upper Folsom Contour Map"
                loading="lazy"
                className="hidden w-full aspect-[16/10] object-cover object-top dark:block"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
