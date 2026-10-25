// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/interests/InterestSection.tsx
// Editorial alternating section: plain image figure + pull-quote.

import { SITE_LINK, SITE_TYPE } from '@/components/site/type';
import { cn } from '@/lib/utils';

interface InterestImageConfig {
  src: string;
  alt: string;
  caption: string;
  objectPosition?: 'bottom' | 'center';
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
  imagePosition = 'left',
  quote,
  paragraphs,
  externalLink,
}: InterestSectionProps) {
  return (
    <section id={id} className="grid scroll-mt-24 gap-[clamp(24px,4vw,56px)] py-10 first:pt-0 min-[861px]:grid-cols-12 min-[861px]:items-center">
      {/* Text block is ALWAYS first in the DOM so the <h2> leads reading/tab order;
          the image's visual side is set with `order` utilities. */}
      <div className={cn('min-[861px]:col-span-7', imagePosition === 'left' && 'min-[861px]:order-last')}>
        <h2 className={SITE_TYPE.headline}>{title}</h2>
        {quote && (
          <figure className="m-0 mt-5">
            <blockquote className={cn(SITE_TYPE.lead, 'm-0 max-w-[34rem] text-ink-strong')}>“{quote.text}”</blockquote>
            <figcaption className={cn(SITE_TYPE.label, 'mt-2')}>{quote.author}</figcaption>
          </figure>
        )}
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={cn(SITE_TYPE.body, 'mt-4 max-w-[60ch]')}>{paragraph}</p>
        ))}
        {externalLink && (
          <a
            href={externalLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(SITE_LINK, 'mt-6 inline-block font-site text-site-body')}
            aria-label={externalLink.ariaLabel || `${externalLink.label} - Open in new tab`}
          >
            {externalLink.label}
          </a>
        )}
      </div>
      <figure className={cn('m-0 min-[861px]:col-span-5', imagePosition === 'left' && 'min-[861px]:order-first')}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className={cn('block aspect-[4/3] w-full object-cover', image.objectPosition === 'bottom' ? 'object-bottom' : 'object-center')}
        />
        {image.caption && <figcaption className={cn(SITE_TYPE.label, 'mt-3 max-w-[40rem]')}>{image.caption}</figcaption>}
      </figure>
    </section>
  );
}

export default InterestSection;
