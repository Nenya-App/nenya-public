// The one place the lens vocabulary lives (docs/lens-vocabulary-audit.md, owner approved 2026-11-17). With VITE_LENS_COPY=on, the visitor-facing words
// change from "gateway" to "lens" and the sixth lens is called Pattern (it was Insight); with the switch off, nothing changes. Ids, routes, saved-data
// keys and types keep their old names (a saved draft still reads), so only what a person reads or hears goes through here.
// Structural changes (the tray, "of six", Add this to my report) belong to the lens rewrite, not to this word swap.

// ON by default (owner, 2026-11-18: the lens words go across the whole site). VITE_LENS_COPY=off is the only way back to the old words.
export const lensCopyOn = (): boolean => import.meta.env?.VITE_LENS_COPY !== 'off';

const OLD_LENS_WORDS = /gateways?/i;

/** A visitor-facing string in the lens vocabulary when the switch is on; the same string when it is off. `on` is for tests and the build script. */
export function L(text: string, on: boolean = lensCopyOn()): string {
  if (!on) return text;
  let t = text;
  // The sixth lens is Pattern, wherever the old words or its siblings are in the same text.
  if (OLD_LENS_WORDS.test(t) || /\bMovement (?:and|or) Insight\b/.test(t) || /\bInsight lens\b/.test(t)) t = t.replace(/\ban Insight\b/g, 'a Pattern').replace(/\bInsight\b/g, 'Pattern');
  return t.replace(/Gateways/g, 'Lenses').replace(/gateways/g, 'lenses').replace(/GATEWAYS/g, 'LENSES').replace(/Gateway/g, 'Lens').replace(/gateway/g, 'lens').replace(/GATEWAY/g, 'LENS');
}

/** The sixth lens's visitor name (its id stays "insight"). */
export const sixthLensName = (on: boolean = lensCopyOn()): string => (on ? 'Pattern' : 'Insight');
