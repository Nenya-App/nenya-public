export interface BreathingTechnique {
  ih: number; // inhale ms
  hi: number; // hold after inhale ms
  ex: number; // exhale ms
  ho: number; // hold after exhale ms
}

export interface BreathingPreset extends BreathingTechnique {
  lb: string;
  desc: string;
  /** The first screen's name and sentence for this pace. */
  name: string;
  blurb: string;
  /** Sits behind "More options" on the first screen. */
  more?: boolean;
}

// Shared by the breathing counter's pattern list and the first-visit
// rhythm picker, so the two can never disagree about what a label means.
export const PRESETS: BreathingPreset[] = [
  { ih: 6000, hi: 0, ex: 6000, ho: 0, lb: '6·6', desc: 'Steady — 6 in, 6 out (the default)', name: 'Steady', blurb: 'Even breaths, about five a minute. A good place to begin.' },
  { ih: 5000, hi: 0, ex: 5000, ho: 0, lb: '5·5', desc: 'Even — 5 in, 5 out', name: 'Even', blurb: 'Even breaths, about six a minute.', more: true },
  { ih: 4000, hi: 0, ex: 6000, ho: 0, lb: '4·6', desc: 'Long exhale — 4 in, 6 out', name: 'Long exhale', blurb: 'In for four, out for six.' },
  { ih: 4000, hi: 0, ex: 8000, ho: 0, lb: '4·8', desc: 'Longer exhale — 4 in, 8 out', name: 'Longer exhale', blurb: 'In for four, out for eight.', more: true },
  { ih: 3000, hi: 0, ex: 3000, ho: 0, lb: '3·3', desc: 'Quick — 3 in, 3 out', name: 'Quick', blurb: 'Quicker, lighter breaths: in for three, out for three.' },
  { ih: 4000, hi: 4000, ex: 4000, ho: 4000, lb: 'Box', desc: 'Box — 4 in, hold 4, out 4, hold 4', name: 'Box', blurb: 'In, hold, out, hold, all the same length.' },
  { ih: 4000, hi: 7000, ex: 8000, ho: 0, lb: '4-7-8', desc: '4-7-8 — 4 in, hold 7, out 8', name: '4-7-8', blurb: 'A long hold between breaths. Skip it if holding your breath is uncomfortable.', more: true },
];

export const sameTechnique = (a: BreathingTechnique, b: BreathingTechnique) =>
  a.ih === b.ih && (a.hi || 0) === (b.hi || 0) && a.ex === b.ex && (a.ho || 0) === (b.ho || 0);

/** The first screen's two lists, in the order above. Taken from the presets themselves, so a changed label (the Smithy's pace guide asks for that) cannot leave a name missing. */
export const firstScreenPaces = (presets: BreathingPreset[]) => ({ main: presets.filter((p) => !p.more), more: presets.filter((p) => p.more) });
