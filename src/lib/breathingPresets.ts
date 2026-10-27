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
  { ih: 5000, hi: 0, ex: 5000, ho: 0, lb: '5·5', desc: 'Resonance — HRV coherence' },
  { ih: 4000, hi: 0, ex: 6000, ho: 0, lb: '4·6', desc: 'Calming — extended exhale' },
  { ih: 4000, hi: 0, ex: 8000, ho: 0, lb: '4·8', desc: 'Deep calm — sleep onset' },
  { ih: 3000, hi: 0, ex: 3000, ho: 0, lb: '3·3', desc: 'Energising — activation' },
  { ih: 4000, hi: 4000, ex: 4000, ho: 4000, lb: 'Box', desc: 'Box — focus and reset' },
  { ih: 4000, hi: 7000, ex: 8000, ho: 0, lb: '4-7-8', desc: '4-7-8 — anxiety and sleep' },
];

export const sameTechnique = (a: BreathingTechnique, b: BreathingTechnique) =>
  a.ih === b.ih && (a.hi || 0) === (b.hi || 0) && a.ex === b.ex && (a.ho || 0) === (b.ho || 0);
