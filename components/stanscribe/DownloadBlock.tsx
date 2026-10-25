// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/DownloadBlock.tsx
// One app's download tile: name and offer, then "Coming soon" (plus the public beta, where there is
// one) before launch, or Apple's badge after. RELEASED in lib/stanscribe.ts flips every tile at once.

import { TYPE } from '@/components/stanscribe/type';
import { APPS, APP_STORE_BADGE, RELEASED, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

interface DownloadBlockProps {
  app: AppKey;
  className?: string;
}

export function DownloadBlock({ app, className }: DownloadBlockProps) {
  const info = APPS[app];
  return (
    <div className={cn('flex flex-col items-start gap-2 rounded-lg border border-border bg-muted p-5', className)}>
      <p className={TYPE.heading}>{info.name}</p>
      <p className={TYPE.body}>{info.offer}</p>
      {RELEASED ? (
        <a href={info.appStoreUrl} aria-label={`Download ${info.name} on the App Store`} className="mt-2 inline-block rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- Apple's badge is used exactly as supplied */}
          <img src={APP_STORE_BADGE.src} alt="" width={APP_STORE_BADGE.width} height={APP_STORE_BADGE.height} className="h-10 w-auto" />
        </a>
      ) : (
        <>
          <p className={cn(TYPE.body, 'mt-2 flex items-baseline gap-2 font-semibold text-ink-strong')}>
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
            Coming soon to the App Store
          </p>
          {info.betaUrl && (
            <a href={info.betaUrl} className={cn(TYPE.body, TYPE.link, 'inline-block py-1')}>
              Try the public beta on TestFlight
            </a>
          )}
        </>
      )}
    </div>
  );
}
