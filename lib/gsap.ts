// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/gsap.ts
// Single GSAP registration point. ONLY imported from 'use client' components —
// never imported at the module scope of any server component.
// MotionPathPlugin removed in v3: the reverse-glow overlay uses opacity tweens
// only (no sprite path-following), so MotionPathPlugin is no longer needed.

import { gsap } from 'gsap';

export { gsap };
