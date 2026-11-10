// The Sound and Sight gateways can start from each other, in either order, and the second one never changes the first or what was reported about it.
// Sight first: the Sound melody starts from the two Sight colors (src/lib/longMelody.ts). Sound first: a melody made from silence can offer its two
// colors (the first three notes and the next three) as Sight's starting colors. Either way it is only a starting point the person can change.

const HEX = /^#[0-9a-f]{6}$/i;

/** The colors a melody made on its own can offer Sight, from the Sound gateway's saved data; null if there is no such melody (none made, or it was
 *  connected to Sight's colors, which then already came from Sight). */
export function melodyColorsFor(sound: any): { color1: string; color2: string } | null {
  if (!sound || sound.melodyConnected !== false) return null;
  const notes = Array.isArray(sound.melody) ? sound.melody.filter((n: unknown) => typeof n === 'number') : [];
  if (notes.length < 6) return null;
  const { melodyColor1: a, melodyColor2: b } = sound;
  return typeof a === 'string' && typeof b === 'string' && HEX.test(a) && HEX.test(b) ? { color1: a.toUpperCase(), color2: b.toUpperCase() } : null;
}
