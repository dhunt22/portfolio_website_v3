// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/icons.tsx
// The one place the Stan Scribe pages draw their icons. The app's tour uses Apple's SF Symbols, which Apple
// licenses for apps on its platforms and not for websites, so each icon here is the nearest Lucide drawing.
// The drawings are from Lucide (https://lucide.dev), ISC licence, copyright Lucide Icons and Contributors; the
// chevron, lock, search, share, phone and square are Lucide's from Feather, MIT licence, copyright Cole Bemis.
// They are copied from lucide-react 1.63.0 as static SVG, so the pages ship no icon library and no script for
// their icons. The speaker dots are drawn here, in the app's colours.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Lucide's frame: a 24px box, a 2px line in the text colour, round ends and corners. Decoration by default. */
function Svg(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

/** Lucide's captions. */
export function CaptionsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
      <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
    </Svg>
  );
}

/** Lucide's wifi-off. */
export function OfflineIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20h.01" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
      <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
      <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
      <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
      <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
      <path d="m2 2 20 20" />
    </Svg>
  );
}

/** Lucide's user-round-x. */
export function NoAccountIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m16.5 16.5 5 5" />
      <path d="M2 21a8 8 0 0 1 11.531-7.18" />
      <path d="m21.5 16.5-5 5" />
      <circle cx="10" cy="8" r="5" />
    </Svg>
  );
}

/** Lucide's smartphone. */
export function DeviceIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </Svg>
  );
}

/** Lucide's eye-off. */
export function NoTrackingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </Svg>
  );
}

/** Lucide's mic-off. */
export function NoAudioIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19v3" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M16.95 16.95A7 7 0 0 1 5 12v-2" />
      <path d="M18.89 13.23A7 7 0 0 0 19 12v-2" />
      <path d="m2 2 20 20" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    </Svg>
  );
}

/** Lucide's share. */
export function SendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2v13" />
      <path d="m16 6-4-4-4 4" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    </Svg>
  );
}

/** Lucide's hand. */
export function AskIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </Svg>
  );
}

/** Lucide's audio-lines. */
export function VoicesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 10v3" />
      <path d="M6 6v11" />
      <path d="M10 3v18" />
      <path d="M14 8v7" />
      <path d="M18 5v13" />
      <path d="M22 10v3" />
    </Svg>
  );
}

/** Lucide's a-large-small. */
export function TextSizeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16" />
      <path d="M15.697 14h5.606" />
      <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
      <path d="M3.304 13h6.392" />
    </Svg>
  );
}

/** Lucide's lock. */
export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

/** Lucide's search. */
export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </Svg>
  );
}

/** Lucide's palette. */
export function LooksIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </Svg>
  );
}

/** Lucide's mic. */
export function StartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19v3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <rect x="9" y="2" width="6" height="13" rx="3" />
    </Svg>
  );
}

/** Lucide's square. */
export function StopIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </Svg>
  );
}

/** Lucide's list. */
export function ConversationsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 5h.01" />
      <path d="M3 12h.01" />
      <path d="M3 19h.01" />
      <path d="M8 5h13" />
      <path d="M8 12h13" />
      <path d="M8 19h13" />
    </Svg>
  );
}

/** Lucide's chevron-down. */
export function ChevronIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

/** Two speakers, each in their own colour. */
export function SpeakerDots() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="12" r="4.2" fill="#2b95ff" />
      <circle cx="17" cy="12" r="4.2" fill="#ff8a1f" />
    </svg>
  );
}
