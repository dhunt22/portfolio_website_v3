// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// components/stanscribe/icons.tsx
// The one place the Stan Scribe pages name their icons. The app's tour uses Apple's SF Symbols, which Apple
// licenses for apps on its platforms and not for websites, so each icon here is the nearest Lucide drawing
// (ISC licence). The speaker dots are drawn here, in the app's colours.

export {
  Captions as CaptionsIcon,
  WifiOff as OfflineIcon,
  UserRoundX as NoAccountIcon,
  Smartphone as DeviceIcon,
  EyeOff as NoTrackingIcon,
  MicOff as NoAudioIcon,
  Share as SendIcon,
  Hand as AskIcon,
  AudioLines as VoicesIcon,
  ALargeSmall as TextSizeIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  Palette as LooksIcon,
  Mic as StartIcon,
  Square as StopIcon,
  List as ConversationsIcon,
  ChevronDown as ChevronIcon,
} from 'lucide-react';

/** Two speakers, each in their own colour. */
export function SpeakerDots() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="12" r="4.2" fill="#2b95ff" />
      <circle cx="17" cy="12" r="4.2" fill="#ff8a1f" />
    </svg>
  );
}
