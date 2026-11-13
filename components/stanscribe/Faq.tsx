// Copyright (c) 2026 Devin Hunt contact@devinhunt.com

import { Disclosure } from '@/components/stanscribe/Disclosure';
import { COLUMN, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { type AppKey } from '@/lib/stanscribe';
import { ACCURACY_QUESTION, answerText, faq } from '@/lib/stanscribe-faq';

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
      <div className={COLUMN}>
        {items.map(({ question, answer }) => (
          <Disclosure key={question} label={question} open={question === ACCURACY_QUESTION}>
            <p>
              {answer.map((part, index) =>
                typeof part === 'string' ? (
                  part
                ) : (
                  <a key={index} href={part.href} className={TYPE.link}>
                    {part.text}
                  </a>
                ),
              )}
            </p>
          </Disclosure>
        ))}
      </div>
      {/* "<" is escaped so no answer can close the script element. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Section>
  );
}
