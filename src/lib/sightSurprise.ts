// "Surprise Me" on the Sight page (owner, 2026-11-25): it is per picker. On the first picker (the current state) it chooses only the first color;
// on the second (the wish) only the second. Before this the one button changed both, so pressing it while picking the second color
// also replaced a first color the person had already chosen, with its name and words. Pure, so it is tested; no storage, no calls.
export type SightStage = 'present' | 'wish';

/** Which picker a stage belongs to. */
export function pickerForStage(stage: SightStage): 1 | 2 {
  return stage === 'present' ? 1 : 2;
}

/** The fields Surprise Me replaces for one picker: the color, and the name and words that belonged to the old color. The other picker is not named here, so it is never touched. */
export function surprisePatch(stage: SightStage, hex: string):
  | { color1: string; color1Name: ''; color1Qualities: [] }
  | { color2: string; color2Name: ''; color2Qualities: [] } {
  return pickerForStage(stage) === 1
    ? { color1: hex, color1Name: '', color1Qualities: [] }
    : { color2: hex, color2Name: '', color2Qualities: [] };
}
