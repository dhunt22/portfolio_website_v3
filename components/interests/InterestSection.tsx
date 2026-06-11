// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/interests/InterestSection.tsx
// Editorial alternating section: plain image figure + Newsreader italic pull-quote.

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
  flip?: boolean;
}

export function InterestSection({
  id,
  title,
  image,
  quote,
  paragraphs,
  externalLink,
  flip = false,
}: InterestSectionProps) {
  return (
    <section
      id={id}
      className={`flex flex-col gap-10 py-16 md:flex-row md:items-center ${flip ? 'md:flex-row-reverse' : ''} scroll-mt-16`}
    >
      <figure className="md:w-5/12">
        <img src={image.src} alt={image.alt} loading="lazy" className="w-full" />
        {image.caption && <figcaption className="eyebrow mt-3">{image.caption}</figcaption>}
      </figure>

      <div className="md:w-7/12">
        <h2 className="font-display text-2xl text-ink-strong">{title}</h2>

        {quote && (
          <blockquote className="mt-4 font-display text-xl italic leading-snug text-ink-strong">
            “{quote.text}”
            <span className="eyebrow mt-2 block">{quote.author}</span>
          </blockquote>
        )}

        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mt-4 leading-relaxed text-ink-body">
            {paragraph}
          </p>
        ))}

        {externalLink && (
          <a
            href={externalLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet mt-6 inline-block"
            {...(externalLink.ariaLabel ? { 'aria-label': externalLink.ariaLabel } : {})}
          >
            {externalLink.label}
          </a>
        )}
      </div>
    </section>
  );
}

export default InterestSection;
