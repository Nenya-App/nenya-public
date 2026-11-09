// A few plain words about each of the sixteen palettes: the image it is built around, and a few feelings and needs it MIGHT point to. These are
// rudimentary guesses, offered as questions, never as readings: no colour has a fixed meaning, the palettes are simple starting points, and Nenya is
// not a scientific or medical instrument. They are written by hand (2026-11-09; the words for feelings and needs follow the Feelings and Needs
// Inventory credited in docs/about-nenya-questions-scope.md) and are used when a person chooses to share part of a report with the coach
// (src/lib/reportShare.ts) so the coach has more than a name to work from. Keyed by the palette's outward name (src/lib/paletteNames.ts).

export interface PaletteInfo {
  image: string;
  feelings: string[];
  needs: string[];
}

export const PALETTE_INFO: Record<string, PaletteInfo> = {
  Sky: { image: 'wind, clouds and high light', feelings: ['spacious', 'clear', 'distant', 'free'], needs: ['perspective', 'freedom', 'clarity', 'order'] },
  Starlight: { image: 'stars and silver in a dark night', feelings: ['hopeful', 'awed', 'small', 'quietly bright'], needs: ['meaning', 'hope', 'beauty', 'orientation'] },
  Tide: { image: 'deep sea, foam and moving water', feelings: ['moved', 'deep', 'restless', 'calm'], needs: ['flow', 'connection', 'depth', 'release'] },
  'Soft Rain': { image: 'rain, mist and tender grey', feelings: ['sad', 'tender', 'grieving', 'soft'], needs: ['comfort', 'mourning', 'compassion', 'to be witnessed'] },
  Craft: { image: 'a forge, iron and stone', feelings: ['determined', 'steady', 'absorbed'], needs: ['competence', 'purpose', 'making things', 'contribution'] },
  Greenwood: { image: 'leaf, fruit, grain and bark', feelings: ['nourished', 'grounded', 'patient'], needs: ['growth', 'nourishment', 'belonging to the living world', 'care'] },
  Blossom: { image: 'a spring meadow in flower', feelings: ['joyful', 'light', 'hopeful', 'playful'], needs: ['play', 'renewal', 'beauty', 'freshness'] },
  Twilight: { image: 'last light, ash and the record of what happened', feelings: ['solemn', 'wistful', 'reflective'], needs: ['acceptance', 'remembrance', 'closure', 'honesty'] },
  Tapestry: { image: 'thread, dye and gold', feelings: ['reflective', 'connected to a longer story'], needs: ['meaning', 'continuity', 'belonging', 'understanding'] },
  Stride: { image: 'a forest trail, a horn and dawn', feelings: ['eager', 'brave', 'alert'], needs: ['adventure', 'courage', 'movement', 'autonomy'] },
  Ember: { image: 'strong fire, gold and laughter', feelings: ['energized', 'defiant', 'joyful', 'fierce'], needs: ['vitality', 'strength', 'play', 'to stand up for something'] },
  Rhythm: { image: 'dance, a spring lawn and a swift deer', feelings: ['lively', 'free', 'playful'], needs: ['movement', 'spontaneity', 'freedom', 'joy'] },
  Reverie: { image: 'dream, moon, garden and midnight', feelings: ['dreamy', 'imaginative', 'restful'], needs: ['rest', 'imagination', 'inner life', 'peace'] },
  Haven: { image: 'mist, a calm lake and warm sand', feelings: ['safe', 'tired', 'soothed'], needs: ['rest', 'safety', 'healing', 'care'] },
  Cinder: { image: 'fire and frost, ash and iron', feelings: ['tense', 'conflicted', 'angry', 'numb'], needs: ['power', 'to be heard', 'release', 'integrity'] },
  Hollow: { image: 'the void, silver web and hunger', feelings: ['empty', 'hungry', 'exhausted', 'cold'], needs: ['nourishment', 'connection', 'to be seen', 'warmth'] },
};

/** One plain sentence about a palette, with the guesses marked as guesses. */
export function describePalette(name: string): string {
  const p = PALETTE_INFO[name];
  if (!p) return '';
  return `${name} is built around ${p.image}. It might point, very roughly, to feelings like ${p.feelings.join(', ')} and needs like ${p.needs.join(', ')}.`;
}
