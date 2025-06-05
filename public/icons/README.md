# Icons Library

This directory contains SVG icons used throughout the portfolio website. All icons are designed to be consistent in style and optimized for web use.

## Icon Set

### Navigation & UI
- `menu.svg` - Hamburger menu icon
- `close.svg` - Close/X icon
- `external-link.svg` - External link indicator

### Actions
- `download.svg` - Download action icon
- `email.svg` - Email/contact icon

### Social & Professional
- `github.svg` - GitHub social icon
- `linkedin.svg` - LinkedIn professional icon

### Thematic Icons
- `fishing-pole.svg` - Custom fishing pole icon representing Devin's passion for fishing
- `map.svg` - Map/exploration icon representing travel and discovery

## Usage

### As Static Assets
```html
<img src="/icons/fishing-pole.svg" alt="Fishing" width="24" height="24" />
```

### As React Components
These icons are also available as React components in `/components/ui/icons/common-icons.tsx`:

```tsx
import { FishIcon, MapIcon } from '@/components/ui/icons/common-icons';

<FishIcon className="w-6 h-6 text-river-600" />
<MapIcon className="w-6 h-6 text-earth-600" />
```

## Design Guidelines

- **Size**: All icons are designed at 24x24px but scale well to any size
- **Stroke**: Uses consistent stroke width (typically 2px for main elements, 1-1.5px for details)
- **Style**: Outlined style with rounded line caps and joins
- **Color**: Designed to work with `currentColor` for easy theming

## Icon Specifications

- **Format**: SVG
- **Viewbox**: 0 0 24 24
- **Stroke**: currentColor (inherits text color)
- **Fill**: none (outline style)
- **License**: Copyright (c) 2025 Devin Hunt

## Accessibility

All icons should be used with appropriate:
- `alt` attributes when used as images
- `aria-hidden="true"` when decorative
- `aria-label` when conveying meaning
- Proper color contrast (icons inherit text color)

## Custom Icons

### Fishing Pole Icon
A custom-designed fishing pole icon that represents Devin's passion for understanding water ecosystems through fishing. The icon includes:
- Fishing rod (diagonal line)
- Reel (circle at handle)
- Fishing line (curved line)
- Hook (small curved element)

This icon is specifically designed to match the portfolio's water resources theme while being immediately recognizable as a fishing pole.
