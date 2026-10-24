// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/DownloadBlock.tsx
// One app's download tile: name and offer, then "Coming soon" (plus the public beta, where there is
// one) before launch, or Apple's badge after. RELEASED in lib/stanscribe.ts flips every tile at once.

import { APPS, APP_STORE_BADGE, RELEASED, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

interface DownloadBlockProps {
  app: AppKey;
  className?: string;
}

export function DownloadBlock({ app, className }: DownloadBlockProps) {
  const info = APPS[app];
  return (
    <div className={cn('panel flex flex-col items-start gap-3 rounded-lg md:p-6', className)}>
      <p className="font-display text-2xl leading-tight text-ink-strong">{info.name}</p>
      <p className="text-lg text-ink-body">{info.offer}</p>
      {RELEASED ? (
        <a href={info.appStoreUrl} aria-label={`Download ${info.name} on the App Store`} className="mt-1 inline-block rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- Apple's badge is used exactly as supplied */}
          <img src={APP_STORE_BADGE.src} alt="" width={APP_STORE_BADGE.width} height={APP_STORE_BADGE.height} className="h-10 w-auto" />
        </a>
      ) : (
        <>
          <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-input px-3 py-1.5 text-base font-medium text-ink-strong">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            Coming soon to the App Store
          </p>
          {info.betaUrl && (
            <a href={info.betaUrl} className="inline-block py-1 text-lg text-link underline decoration-1 underline-offset-4 transition-colors hover:text-link-hover">
              Try the public beta on TestFlight
            </a>
          )}
        </>
      )}
    </div>
  );
}
