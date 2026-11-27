// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/icons.tsx
// The one place the Stan Scribe pages draw their icons. The app uses Apple's SF Symbols, which Apple licenses
// for apps on its platforms and not for websites, so each icon here is the Lucide drawing nearest the symbol
// the app shows in the same place, named above each one.
// The drawings are from Lucide (https://lucide.dev), ISC licence, copyright Lucide Icons and Contributors; the
// chevron, circle, lock, search, share, phone and square are Lucide's from Feather, MIT licence, copyright Cole
// Bemis. They are copied from lucide-static 1.63.0. Both licences are in full in icons.LICENSE.txt beside this
// file. The speaker dots are drawn here.

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

/** The app's captions.bubble: Lucide's message-square holding the lines of Lucide's captions. */
export function CaptionsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
      <path d="M7 13h4M15 13h2M7 9h2M13 9h4" />
    </Svg>
  );
}

/** The app's wifi.slash: Lucide's wifi-off. */
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

/**
 * The app's person.crop.circle.badge.xmark: Lucide's circle-user-round, opened at the lower left as clock-plus is
 * opened at the lower right, with user-round-x's cross in the gap.
 */
export function NoAccountIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.08 13.267a10 10 0 1 1 8.653 8.653" />
      <path d="M17.926 20.057a6 6 0 0 0-7.926-4.717" />
      <circle cx="12" cy="11" r="4" />
      <path d="m2.5 16.5 5 5" />
      <path d="m7.5 16.5-5 5" />
    </Svg>
  );
}

/** The app's iphone: Lucide's smartphone, without the home button. */
export function DeviceIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    </Svg>
  );
}

/** The app's eye.slash: Lucide's eye-off. */
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

/** The app's waveform.slash: Lucide's audio-lines-off. */
export function NoAudioIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 10v11" />
      <path d="M10 3v1.35" />
      <path d="M14 14v1" />
      <path d="M14 8v.35" />
      <path d="M18 5v7.35" />
      <path d="M2 10v3" />
      <path d="m2 2 20 20" />
      <path d="M22 10v3" />
      <path d="M6 6v11" />
    </Svg>
  );
}

/** The app's square.and.arrow.up: Lucide's share. */
export function SendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2v13" />
      <path d="m16 6-4-4-4 4" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    </Svg>
  );
}

/** The app's hand.raised: Lucide's hand. */
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

/** The app's waveform: Lucide's audio-lines. */
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

/** The app's A− and A+ buttons, as one drawing: Lucide's a-large-small. */
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

/** The app's lock.fill: Lucide's lock, its body filled. */
export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="currentColor" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

/** The app's magnifyingglass: Lucide's search. */
export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </Svg>
  );
}

/** The app's circle.lefthalf.filled, its symbol for themes: Lucide's circle, its left half filled. */
export function LooksIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
    </Svg>
  );
}

/** The app's mic.fill, on its Start button: Lucide's mic, its head filled. */
export function StartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19v3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor" />
    </Svg>
  );
}

/** The app's stop.fill, on its Stop button: Lucide's square, filled. */
export function StopIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" fill="currentColor" />
    </Svg>
  );
}

/** The app's star, on its Save button: Lucide's star. */
export function SaveIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </Svg>
  );
}

/** The app's list.bullet, on its Saved button: Lucide's list. */
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

/** The app's chevron.down: Lucide's chevron-down. */
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
