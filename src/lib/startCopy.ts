// The start chooser (owner, 2026-11-15; docs/start-chooser-scope.md): the first screen says what Nenya offers and asks where to
// start. Then the Terms, then the chosen path. Shown only when the build has VITE_START_CHOOSER=on (staging first). The wording is
// checked by tests/start-chooser.test.mts for reading level (WCAG 2.2 AAA 3.1.5).

export type StartChoice = 'breathing' | 'reflection' | 'coach';

export const startChooserOn = (): boolean => import.meta.env?.VITE_START_CHOOSER === 'on';

export const START_COPY = {
  heading: 'Welcome to Nenya',
  line: 'A private place to pause. Here is what you will find. Where would you like to start?',
  options: [
    {
      id: 'breathing',
      title: 'Breathing',
      line: 'A minute of paced breathing, at a rhythm you choose.',
      more: 'A glow and a counter breathe with you. You can change the rhythm any time, or turn the motion off. Many people start here.',
    },
    {
      id: 'reflection',
      title: 'Reflection',
      line: 'Describe how you feel with color, sound, touch and more.',
      more: 'Six short gateways, all optional, in any order. Pick one or all six. A summary is made on your device, to keep or to bring to someone you trust.',
    },
    {
      id: 'coach',
      title: 'Coach',
      line: 'A short talk with an AI about feelings and needs. Open in the United States for now.',
      more: 'At most five exchanges, then it ends. It is an AI. It is not therapy, and it is not for emergencies.',
    },
  ] as { id: StartChoice; title: string; line: string; more: string }[],
  learnMore: 'Learn more',
  notSure: 'Not sure? Breathing is a gentle place to begin.',
  crisis: 'In danger or crisis? Call or text 988 (US and Canada).',
  rhythmHeading: 'Choose a breathing rhythm',
  back: 'Back',
} as const;

export const startCopyLines = (): string[] => [
  START_COPY.line,
  ...START_COPY.options.flatMap((o) => [o.line, o.more]),
  START_COPY.notSure,
  START_COPY.crisis,
];
