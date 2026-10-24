// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/HelpBlock.tsx
// Help and fine print: the support email App Review looks for, large, then each app's legal links,
// the copyright line and Apple's trademark line (copy.md section 9).

import { LegalLinks } from '@/components/stanscribe/LegalLinks';
import { Section } from '@/components/stanscribe/Section';
import { SUPPORT_EMAIL, type AppKey } from '@/lib/stanscribe';

export function HelpBlock({ apps }: { apps: AppKey[] }) {
  return (
    <Section id="help" eyebrow="Support" title="Help">
      <p className="text-xl leading-relaxed text-ink-body">Questions, problems or ideas? Email</p>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="mt-1 inline-block max-w-full font-display text-[clamp(1.5rem,5vw,2.5rem)] text-link underline decoration-1 underline-offset-[0.18em] transition-colors [overflow-wrap:anywhere] hover:text-link-hover"
      >
        {SUPPORT_EMAIL}
      </a>
      <div className="mt-12 space-y-4 border-t border-border pt-8 text-base leading-relaxed text-ink-muted">
        {apps.map((app) => (
          <LegalLinks key={app} app={app} />
        ))}
        <p>© 2026 Devin Hunt. Stan Scribe is an independent app.</p>
        <p>
          Apple, the Apple logo, iPhone, iPad and iCloud are trademarks of Apple Inc., registered in the U.S. and other
          countries and regions. App Store is a service mark of Apple Inc.
        </p>
      </div>
    </Section>
  );
}
