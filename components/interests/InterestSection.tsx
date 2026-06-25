// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// components/interests/InterestSection.tsx
// Editorial alternating section: plain image figure + Newsreader italic pull-quote.

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
    <section
      id={id}
      className="panel mb-4 flex flex-col gap-10 md:flex-row md:items-center scroll-mt-16"
    >
      {/* Text block is ALWAYS first in the DOM so the <h2> leads reading/tab order;
          the image's visual side is set with `order` utilities, not flex-row-reverse. */}
      <div className={`md:w-7/12 ${imagePosition === 'left' ? 'md:order-last' : ''}`}>
        <h2 className="font-display text-2xl text-ink-strong">{title}</h2>

        {quote && (
          <figure className="mt-4 border-l-2 border-border pl-5">
            <blockquote className="max-w-[34rem] font-display italic text-xl leading-snug text-ink-strong">
              “{quote.text}”
            </blockquote>
            <figcaption className="eyebrow mt-2">{quote.author}</figcaption>
          </figure>
        )}

        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mt-4 max-w-[40rem] leading-relaxed text-ink-body">
            {paragraph}
          </p>
        ))}

        {externalLink && (
          <a
            href={externalLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet mt-6"
            aria-label={externalLink.ariaLabel || `${externalLink.label} - Open in new tab`}
          >
            {externalLink.label}
          </a>
        )}
      </div>

      <figure className={`md:w-5/12 ${imagePosition === 'left' ? 'md:order-first' : ''}`}>
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className={`w-full aspect-[4/3] object-cover ${image.objectPosition === 'bottom' ? 'object-bottom' : 'object-center'}`}
        />
        {image.caption && (
          <figcaption className="mt-3 max-w-[40rem] text-sm text-ink-muted">{image.caption}</figcaption>
        )}
      </figure>
    </section>
  );
}

export default InterestSection;
