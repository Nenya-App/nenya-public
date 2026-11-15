// Plain wording for the simpler gateways (owner, 2026-11-15): one main choice per step with a one-line instruction right above it,
// the rest under "Add more detail", and a short "How this works" for anyone who wants it. Kept here, apart from the pages, so the
// reading-level test (tests/gateway-copy-simple.test.mts) checks every line (WCAG 2.2 AAA 3.1.5 Reading Level, 3.3.5 Help).
// Shown only when the build has VITE_GATEWAYS_SIMPLE=on (staging first); the earlier pages stay as they are until the owner approves.

export const simpleGatewaysOn = (): boolean => import.meta.env?.VITE_GATEWAYS_SIMPLE === 'on';

export const STEP_NAMES = { present: 'Now', wish: 'How you would like it to feel' } as const;

export const TOUCH_COPY = {
  intro: 'Imagine you could touch this feeling. First, how it feels now. Then, how you would like it to feel.',
  howTitle: 'How this works',
  how: [
    'Pick the surface that feels closest. One picture is enough.',
    'If you want, open “Add more detail” to say more: warm or cold, heavy or light, and so on.',
    'Then go on to how you would like it to feel. Everything is optional, and nothing leaves your device.',
  ],
  pick: {
    present: 'Pick the surface closest to how it feels right now. That is enough; the rest is optional.',
    wish: 'Pick the surface closest to how you would like it to feel.',
  },
  more: 'Add more detail',
  moreHint: 'Rough or smooth, cold or hot, loose or tight, light or heavy, blunt or sharp, and your own words.',
  wordsLabel: 'In your own words (optional)',
  wordsPlaceholder: { present: 'What does it feel like?', wish: 'What would you like it to feel like?' },
} as const;

/** Every line of the Touch wording, for the reading-level check. */
export const touchCopyLines = (): string[] => [
  TOUCH_COPY.intro,
  ...TOUCH_COPY.how,
  TOUCH_COPY.pick.present,
  TOUCH_COPY.pick.wish,
  TOUCH_COPY.moreHint,
  TOUCH_COPY.wordsLabel,
  ...Object.values(TOUCH_COPY.wordsPlaceholder),
  ...Object.values(STEP_NAMES),
];
