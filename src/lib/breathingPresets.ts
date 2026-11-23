export interface BreathingTechnique {
  ih: number; // inhale ms
  hi: number; // hold after inhale ms
  ex: number; // exhale ms
  ho: number; // hold after exhale ms
}

export interface BreathingPreset extends BreathingTechnique {
  lb: string;
  desc: string;
}

// Shared by the breathing counter's pattern list and the first-visit
// rhythm picker, so the two can never disagree about what a label means.
export const PRESETS: BreathingPreset[] = [
  { ih: 6000, hi: 0, ex: 6000, ho: 0, lb: '6·6', desc: 'Steady — 6 in, 6 out (the default)' },
  { ih: 5000, hi: 0, ex: 5000, ho: 0, lb: '5·5', desc: 'Even — 5 in, 5 out' },
  { ih: 4000, hi: 0, ex: 6000, ho: 0, lb: '4·6', desc: 'Long exhale — 4 in, 6 out' },
  { ih: 4000, hi: 0, ex: 8000, ho: 0, lb: '4·8', desc: 'Longer exhale — 4 in, 8 out' },
  { ih: 3000, hi: 0, ex: 3000, ho: 0, lb: '3·3', desc: 'Quick — 3 in, 3 out' },
  { ih: 4000, hi: 4000, ex: 4000, ho: 4000, lb: 'Box', desc: 'Box — 4 in, hold 4, out 4, hold 4' },
  { ih: 4000, hi: 7000, ex: 8000, ho: 0, lb: '4-7-8', desc: '4-7-8 — 4 in, hold 7, out 8' },
];

export const sameTechnique = (a: BreathingTechnique, b: BreathingTechnique) =>
  a.ih === b.ih && (a.hi || 0) === (b.hi || 0) && a.ex === b.ex && (a.ho || 0) === (b.ho || 0);
