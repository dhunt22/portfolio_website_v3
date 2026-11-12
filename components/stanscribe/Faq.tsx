// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/Faq.tsx
// A page's questions and answers, every answer open, and the same words again as schema.org FAQPage data for
// search and answer engines.

import { Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { type AppKey } from '@/lib/stanscribe';
import { answerText, faq } from '@/lib/stanscribe-faq';
import { cn } from '@/lib/utils';

export function Faq({ app }: { app: AppKey }) {
  const items = faq(app);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answerText(answer) },
    })),
  };
  return (
    <Section id="questions" title="Questions and answers">
      <ul role="list" className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        {items.map(({ question, answer }) => (
          <li key={question}>
            <h3 className={TYPE.heading}>{question}</h3>
            <p className={cn(TYPE.body, 'mt-2')}>
              {answer.map((part) =>
                typeof part === 'string' ? (
                  part
                ) : (
                  <a key={part.href} href={part.href} className={TYPE.link}>
                    {part.text}
                  </a>
                ),
              )}
            </p>
          </li>
        ))}
      </ul>
      {/* "<" is escaped so no answer can close the script element. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Section>
  );
}
