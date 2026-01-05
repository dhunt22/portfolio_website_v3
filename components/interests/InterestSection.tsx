// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/interests/InterestSection.tsx

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon } from '@/components/ui/icons/common-icons';

interface InterestImageConfig {
  src: string;
  alt: string;
  caption: string;
  objectPosition?: 'bottom' | 'center';
  blurDataURL?: string;
}

interface InterestQuoteConfig {
  text: string;
  author: string;
}

interface InterestLinkConfig {
  href: string;
  label: string;
  ariaLabel?: string;
}

export interface InterestSectionProps {
  id: string;
  title: string;
  image: InterestImageConfig;
  imagePosition?: 'left' | 'right';
  quote?: InterestQuoteConfig;
  paragraphs: React.ReactNode[];
  externalLink?: InterestLinkConfig;
}

export function InterestSection({
  id,
  title,
  image,
  imagePosition = 'right',
  quote,
  paragraphs,
  externalLink,
}: InterestSectionProps) {
  const isImageLeft = imagePosition === 'left';
  const objectPositionClass = image.objectPosition === 'bottom' ? 'object-bottom' : 'object-center';

  const renderImage = () => (
    <div className={`relative h-[250px] sm:h-[300px] md:h-auto ${isImageLeft ? 'order-last md:order-first' : ''}`}>
      <Image
        src={image.src}
        alt={image.alt}
        className={`object-cover ${objectPositionClass}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        {...(image.blurDataURL && {
          placeholder: 'blur',
          blurDataURL: image.blurDataURL,
        })}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-white text-xs italic text-shadow-lg">{image.caption}</p>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="p-6">
      <h2 className="text-3xl font-semibold text-forest-700 dark:text-forest-300 mb-4">{title}</h2>

      {quote && (
        <blockquote className="mb-6 text-lg italic text-foreground">
          "{quote.text}"
          <footer className="text-forest-600 dark:text-forest-400 mt-1">— {quote.author}</footer>
        </blockquote>
      )}

      {paragraphs.map((paragraph, index) => {
        const isLast = index === paragraphs.length - 1;
        const hasLinkAfter = isLast && externalLink;
        return (
          <p key={index} className={hasLinkAfter ? 'mb-6' : isLast ? '' : 'mb-4'}>
            {paragraph}
          </p>
        );
      })}

      {externalLink && (
        <a href={externalLink.href} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="border-forest-600 dark:border-forest-400 text-forest-600 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-800 transition-colors"
            aria-label={externalLink.ariaLabel || `${externalLink.label} - Open in new tab`}
          >
            <ExternalLinkIcon className="w-4 h-4" />
            <span className="ml-1">{externalLink.label}</span>
          </Button>
        </a>
      )}
    </div>
  );

  return (
    <section id={id} className="scroll-mt-16">
      <Card
        className="bg-white/70 dark:bg-[#404040]/70 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-river-300 focus-within:border-river-300 focus-within:shadow-sm"
        tabIndex={0}
        aria-label={`${title} interest section`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isImageLeft ? (
            <>
              {renderImage()}
              {renderContent()}
            </>
          ) : (
            <>
              {renderContent()}
              {renderImage()}
            </>
          )}
        </div>
      </Card>
    </section>
  );
}

export default InterestSection;
