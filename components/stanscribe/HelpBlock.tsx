// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/HelpBlock.tsx
// Help and fine print: the support email App Review looks for, large, then each app's legal links,
// the copyright line and Apple's trademark line (copy.md section 9), centred under the section's heading.

import { LegalLinks } from '@/components/stanscribe/LegalLinks';
import { COLUMN, Section } from '@/components/stanscribe/Section';
import { TYPE } from '@/components/stanscribe/type';
import { SUPPORT_EMAIL, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

export function HelpBlock({ apps }: { apps: AppKey[] }) {
  return (
    <Section id="help" title="Help">
      <div className="text-center">
        <p className={TYPE.lead}>Questions, problems or ideas? Email</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className={cn(TYPE.heading, TYPE.link, 'mt-1 inline-block max-w-full wrap-anywhere')}
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
      <div className={cn(TYPE.small, COLUMN, 'mt-12 space-y-3 border-t border-border pt-8 text-center')}>
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
