// Copyright (c) 2026 Devin Hunt contact@devinhunt.com
// lib/stanscribe-demo.ts
// The caption demo's script and colours. The reader watches three other people make a plan. Alex and Rosa are
// fictional names from the app's own demo, and "Person 3" is the label the app gives a speaker nobody has named.

export interface DemoTurn {
  speaker: string;
  /** The speaker's colour, brightened so the name clears 7:1 on DEMO_GROUND. */
  color: string;
  words: string;
}

/** The demo's panel. It is dark in both themes, as a phone's screen is. */
export const DEMO_GROUND = '#16191b';

export const DEMO_TURNS: DemoTurn[] = [
  { speaker: 'Alex', color: '#6cb6ff', words: 'Are we still on for Saturday?' },
  { speaker: 'Rosa', color: '#ffa24a', words: 'Yes. Come at six, and bring the salad.' },
  { speaker: 'Person 3', color: '#3ddc97', words: 'I will bring dessert.' },
];
