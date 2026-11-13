// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/AppIcon.tsx
// An app's own icon, rounded as iOS rounds it. It always sits beside the app's name, so it is decoration
// and hidden from screen readers. Give it a size with a class (h-10 w-10, h-26 w-26).

import { APP_ICONS, type AppKey } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

export function AppIcon({ app, className }: { app: AppKey; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block shrink-0 rounded-[22%] bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${APP_ICONS[app].src})` }}
    />
  );
}
