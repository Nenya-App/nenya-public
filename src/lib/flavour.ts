// Essence in the tray (docs/wireframes/lens/essence.html, owner 2026-11-17): "what is the flavor of the life you have, and the one you want?" A flavor, not a meal: five taste dials, a few notes,
// a feel in the mouth and what lingers, said back as a tasting note. Nothing needs to be tasted; it works from imagination. Pure functions (words, the note, the difference, the figure) so they are tested.
// No food, diet or hunger language anywhere.

export const DIALS = ['sweet', 'sour', 'salty', 'bitter', 'umami'] as const;
export type Dial = (typeof DIALS)[number];
/** Each dial 0 (none) to 4 (very strong). None is a choice. */
export type Dials = Record<Dial, number>;
export const emptyDials = (): Dials => ({ sweet: 0, sour: 0, salty: 0, bitter: 0, umami: 0 });
export const DIAL_WORDS = ['none', 'faint', 'mild', 'strong', 'very strong'] as const;
export const clampDial = (n: unknown): number => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(4, Math.round(n))) : 0);
export const cleanDials = (x: unknown): Dials => { const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>; return { sweet: clampDial(o.sweet), sour: clampDial(o.sour), salty: clampDial(o.salty), bitter: clampDial(o.bitter), umami: clampDial(o.umami) }; };
export const anyDial = (d: Dials): boolean => DIALS.some((k) => d[k] > 0);

export const BASES = [
  { id: 'memory', label: 'A memory', line: 'A smell or taste that takes you back to a time that felt good.', ask: 'Think of a time that tasted good. If your life were a flavor, how much of each taste is in it now?' },
  { id: 'mood', label: 'A mood', line: 'How things taste to you right now.', ask: 'If your life were a flavor, how much of each taste is in it right now?' },
  { id: 'small', label: 'A small thing to try', line: 'Start from the flavor you want, and end with one small step toward it.', ask: 'If your life were a flavor, how much of each taste is in it right now?' },
] as const;
export type BasisId = (typeof BASES)[number]['id'];

/** A few prompts for "need an idea?": plain things to think of, not a quiz. No food or hunger language. */
export const IDEAS = ['Think of a season or a place. What flavor would it be?', 'Think of a time you felt at ease. What was in the air, and what lingered after?', 'Is your life more like something sharp, something soft, something dark, or something light?'] as const;

export const NOTES = ['smoky', 'citrus', 'earthy', 'floral', 'toasted', 'herbal'] as const;
export const MOUTH = ['creamy', 'dry', 'juicy', 'thin', 'syrupy', 'tingly'] as const;
export const LINGERS = ['a warmth', 'a sweetness', 'a bitterness', 'a coolness', 'smoke', 'nothing much'] as const;

/** "sweet strong, bitter faint": only the dials above none, strongest first; or "nothing yet". */
export function dialsLine(d: Dials): string {
  const parts = DIALS.filter((k) => d[k] > 0).sort((a, b) => d[b] - d[a]).map((k) => `${k} ${DIAL_WORDS[d[k]]}`);
  return parts.length ? parts.join(', ') : 'nothing yet';
}
/** What one dial says to a screen reader. */
export const dialSays = (k: Dial, v: number): string => `${k[0].toUpperCase()}${k.slice(1)}, none to very strong, ${DIAL_WORDS[clampDial(v)]}`;

const list = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export interface Flavour { now: Dials; wish: Dials; notes: string[]; mouth: string | null; lingers: string | null }
/** The tasting note, composed from the choices: "Mostly sweet and a little bitter, with notes of smoky and citrus. Creamy in the mouth, and a warmth lingering." Empty until there is something to say. */
export function tastingNote(f: Pick<Flavour, 'now' | 'notes' | 'mouth' | 'lingers'>): string {
  const top = DIALS.filter((k) => f.now[k] >= 3), low = DIALS.filter((k) => f.now[k] > 0 && f.now[k] < 3);
  const bits: string[] = [];
  if (top.length) bits.push(`Mostly ${list(top)}${low.length ? `, with a little ${list(low)}` : ''}`);
  else if (low.length) bits.push(`A little ${list(low)}`);
  if (f.notes.length) bits.push(`${bits.length ? 'with ' : 'With '}notes of ${list(f.notes.map((n) => n.toLowerCase()))}`);
  let sentence = bits.join(', ');
  if (sentence) sentence += '.';
  const tail: string[] = [];
  if (f.mouth) tail.push(`${f.mouth[0].toUpperCase()}${f.mouth.slice(1)} in the mouth`);
  if (f.lingers) tail.push(f.lingers === 'nothing much' ? 'not much lingering' : `${f.lingers} lingering`);
  const second = tail.length ? `${tail.join(', and ')}.` : '';
  return [sentence, second].filter(Boolean).join(' ');
}
/** How the flavor you want differs from now, in words, with no judgement: "more sweet, less bitter", or "no difference yet". */
export function differenceLine(now: Dials, wish: Dials): string {
  const more = DIALS.filter((k) => wish[k] > now[k]).map((k) => `more ${k}`), less = DIALS.filter((k) => wish[k] < now[k]).map((k) => `less ${k}`);
  const all = [...more, ...less];
  return all.length ? all.join(', ') : 'no difference yet';
}
/** The five-pointed figure for one set of dials: points on a pentagon, a dial at 0 near the centre and at 4 on the rim. */
export function figurePoints(d: Dials, r = 40, cx = 50, cy = 50): string {
  return DIALS.map((k, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5, rad = r * (0.12 + 0.88 * (d[k] / 4)); return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`; }).join(' ');
}
export const randomDials = (rng: () => number = Math.random): Dials => ({ sweet: Math.floor(rng() * 5), sour: Math.floor(rng() * 5), salty: Math.floor(rng() * 5), bitter: Math.floor(rng() * 5), umami: Math.floor(rng() * 5) });

export interface EssenceV2 { v: 2; basis: BasisId; now: Dials; wish: Dials; notes: string[]; mouth: string | null; lingers: string | null; tastingNote: string; smallThing: string; extra: string }
/** Essence was first saved wrapped, as { essenceV2: {...} }, and never reached the report. Unwrap it so anything saved that way (a draft, a lens already added) still reads. */
export const unwrapEssence = (x: unknown): unknown => (x && typeof x === 'object' && (x as Record<string, unknown>).essenceV2 && typeof (x as Record<string, unknown>).essenceV2 === 'object' ? (x as Record<string, unknown>).essenceV2 : x);
export const cleanV2 = (x: unknown): EssenceV2 | null => {
  const o = (unwrapEssence(x) && typeof unwrapEssence(x) === 'object' ? unwrapEssence(x) : null) as Record<string, any> | null;
  if (!o || o.v !== 2) return null;
  const s = (v: unknown, n = 400): string => (typeof v === 'string' ? v.slice(0, n) : '');
  return { v: 2, basis: (['memory', 'mood', 'small'] as const).includes(o.basis) ? o.basis : 'mood', now: cleanDials(o.now), wish: cleanDials(o.wish), notes: Array.isArray(o.notes) ? o.notes.filter((n: unknown) => typeof n === 'string').slice(0, 12) : [], mouth: typeof o.mouth === 'string' ? o.mouth : null, lingers: typeof o.lingers === 'string' ? o.lingers : null, tastingNote: s(o.tastingNote), smallThing: s(o.smallThing, 200), extra: s(o.extra) };
};
/** The lines for the report (words only, never a picture). */
export function essenceReportLines(e: EssenceV2): string[] {
  const out: string[] = [`Flavor of your life now: ${dialsLine(e.now)}`, `Flavor you want: ${dialsLine(e.wish)}`, `  From now to what you want: ${differenceLine(e.now, e.wish)}`];
  out.push(`  Started from: ${BASES.find((b) => b.id === e.basis)?.label.toLowerCase() ?? e.basis}`);
  if (e.notes.length) out.push(`  Notes: ${e.notes.join(', ')}`);
  if (e.mouth) out.push(`  In the mouth: ${e.mouth}`);
  if (e.lingers) out.push(`  What lingers: ${e.lingers}`);
  if (e.tastingNote) out.push(`  Tasting note: ${e.tastingNote}`);
  if (e.smallThing) out.push(`  One small thing to try: ${e.smallThing}`);
  if (e.extra) out.push(`  Description: ${e.extra}`);
  return out;
}
