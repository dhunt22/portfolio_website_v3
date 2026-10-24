// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/PhoneShot.tsx
// A framed app screenshot at its intrinsic size (no layout shift), scaled to its container.

import Image from 'next/image';
import type { ShotImage } from '@/lib/stanscribe';
import { cn } from '@/lib/utils';

interface PhoneShotProps {
  image: ShotImage;
  className?: string;
  /** Only the hero loads eagerly; every other shot is lazy. */
  priority?: boolean;
}

export function PhoneShot({ image, className, priority = false }: PhoneShotProps) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      priority={priority}
      className={cn('h-auto w-full', className)}
    />
  );
}
