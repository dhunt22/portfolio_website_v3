// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// lib/gsap.ts
// Single GSAP registration point. ONLY imported from 'use client' components —
// never imported at the module scope of any server component.

import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

export { gsap };
