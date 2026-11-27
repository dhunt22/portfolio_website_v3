// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/DownloadBlock.tsx
// One app's download block, set centred in a hero with no box of its own: name and offer, then Apple's badge
// linking to the app's App Store page.

import { TYPE } from '@/components/stanscribe/type';
import { APPS, APP_STORE_BADGE, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

interface DownloadBlockProps {
  app: AppKey;
  /** Off where the page's own h1 and tagline already give the name and offer, so they are said once. */
  withName?: boolean;
  className?: string;
}

export function DownloadBlock({ app, withName = true, className }: DownloadBlockProps) {
  const info = APPS[app];
  return (
    <div className={cn('flex flex-col items-center gap-1 text-center', className)}>
      {withName && (
        <>
          <p className={TYPE.heading}>{info.name}</p>
          <p className={TYPE.body}>{info.offer}</p>
        </>
      )}
      <a href={info.appStoreUrl} aria-label={`Download ${info.name} on the App Store`} className={cn('inline-block rounded-[10px]', withName && 'mt-2')}>
        {/* A plain img: Apple's badge is used exactly as supplied. */}
        <img src={APP_STORE_BADGE.src} alt="" width={APP_STORE_BADGE.width} height={APP_STORE_BADGE.height} className="h-10 w-auto" />
      </a>
    </div>
  );
}
