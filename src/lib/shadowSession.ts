// The shadow ID in the Terms-first entry (docs/terms-first-entry-scope.md, owner's final decision 2026-11-18, refined the same day).
// A completely random pair of colors, made when the visitor agrees, held in memory for the whole session (never stored, never sent anywhere except as the
// coach's `session` field), regenerated on every load. It stays for the session even after the person chooses colors or makes a melody, because those
// lenses can be dropped: their own colors, when they exist, are the session ID; the shadow pair is what the footer mark shows for everyone else.
// Being random it can be made again at any time (a "forget who I was") without disturbing anything.
import { sessionIdFrom, shadowId } from './savedReflection.ts';

// VITE_TERMS_FIRST (off by default): the pair is made at agreement and not on page load.
export const termsFirstOn = (): boolean => import.meta.env?.VITE_TERMS_FIRST === 'on';

/** The session ID: the person's own Sight colors, else their melody's colors, else the shadow pair. */
export function sessionIdFor(sight: any, sound: any, shadow: string): string {
  return (
    (sight && sessionIdFrom(sight.color1, sight.color2)) ||
    (sound && sessionIdFrom(sound.melodyColor1, sound.melodyColor2)) ||
    shadow
  );
}

/** A new random pair: the first one, and every "forget who I was" after it. */
export const newShadow = (rand?: (n: number) => Uint8Array): string => shadowId(rand);
