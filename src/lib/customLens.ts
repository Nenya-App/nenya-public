// A custom lens (docs/eight-sided-gem-scope.md Part 2, section 5): a name, a colour from the site's palette, a short description and, optionally, a link to one of the existing
// Patterns. Pure functions, no screen and no storage. VISIT ONLY: nothing here is saved to the device (src/lib/deviceMemory.ts says visitor-written text is never kept; keeping it
// needs the owner's privacy wording, scope step 18). Nothing here is sent anywhere: not to the coach, not into a report or a PDF, not to a server. Text is plain text only, English
// only, control and direction-changing characters removed, length limited, and always shown as text (never as HTML).

import { shapeById } from './gatewayShapes.ts';

export const MAX_CUSTOM_LENSES = 5;
export const NAME_MAX = 24;
export const DESCRIPTION_MAX = 120;
/** How many palettes valarColors has (src/app/components/ValarBreathingLogo.tsx); a test keeps the two equal. A colour is chosen by its index in that list, never typed, so contrast is already checked. */
export const PALETTE_COUNT = 16;

export interface CustomLens {
  /** "custom-1" and so on: made here, never typed. */
  id: string;
  name: string;
  /** Index into valarColors. */
  color: number;
  description: string;
  /** A Pattern drawing's id (gatewayShapes.ts, set 'pattern'), or null. */
  pattern: string | null;
}

export interface CustomLensInput { name?: unknown; color?: unknown; description?: unknown; pattern?: unknown }
export type CustomLensField = 'name' | 'color' | 'description' | 'pattern' | 'limit';
export type CustomLensResult = { ok: true; lens: CustomLens } | { ok: false; errors: Partial<Record<CustomLensField, string>> };

// Control characters (C0, DEL, C1), zero-width and direction-changing characters, the line and paragraph separators, and the angle brackets (no markup, ever).
const STRIP = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF<>]/g;

/** Plain text only: anything that is not a string becomes empty; control characters and angle brackets are removed; any run of white space becomes one space; the ends are trimmed. Tabs and line breaks count as spaces. */
export function sanitiseText(x: unknown): string {
  if (typeof x !== 'string') return '';
  return x.replace(/[\t\n\r\u000B\u000C\u0085\u2028\u2029]/g, ' ').replace(STRIP, '').replace(/\s+/g, ' ').trim();
}

// English only: Latin letters A-Z, digits, spaces and plain punctuation (curly quotes and dashes allowed). Accented or other-script letters are refused, not silently changed.
const ENGLISH = /^[A-Za-z0-9 '’"“”\-–—.,!?:;&()/…%+*=_]+$/;
export const isEnglishText = (s: string): boolean => s.length === 0 || ENGLISH.test(s);

const isIndex = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x < PALETTE_COUNT;

/** The smallest "custom-n" not already used, so removing one and adding another never repeats an id in this visit. */
export function nextCustomId(existing: readonly CustomLens[]): string {
  const used = new Set(existing.map((l) => l.id));
  for (let n = 1; ; n++) if (!used.has(`custom-${n}`)) return `custom-${n}`;
}

/** Checks and cleans one custom lens. `existing` is the list so far (for the limit and for refusing a name already in use, ignoring case). */
export function validateCustomLens(input: CustomLensInput, existing: readonly CustomLens[] = []): CustomLensResult {
  const errors: Partial<Record<CustomLensField, string>> = {};
  const name = sanitiseText(input.name), description = sanitiseText(input.description);
  if (existing.length >= MAX_CUSTOM_LENSES) errors.limit = `You can make up to ${MAX_CUSTOM_LENSES} lenses of your own. Take one out to make another.`;
  if (name.length < 1) errors.name = 'Give your lens a name of 1 to 24 characters.';
  else if (name.length > NAME_MAX) errors.name = `A name can be up to ${NAME_MAX} characters. This one is ${name.length}.`;
  else if (!isEnglishText(name)) errors.name = 'Use English letters, numbers and plain punctuation in the name.';
  else if (existing.some((l) => l.name.toLowerCase() === name.toLowerCase())) errors.name = 'You already have a lens with that name.';
  if (description.length > DESCRIPTION_MAX) errors.description = `A description can be up to ${DESCRIPTION_MAX} characters. This one is ${description.length}.`;
  else if (!isEnglishText(description)) errors.description = 'Use English letters, numbers and plain punctuation in the description.';
  if (!isIndex(input.color)) errors.color = 'Choose one of the colours.';
  let pattern: string | null = null;
  if (input.pattern !== undefined && input.pattern !== null && input.pattern !== '') {
    const s = typeof input.pattern === 'string' ? shapeById(input.pattern) : undefined;
    if (!s || s.set !== 'pattern') errors.pattern = 'Choose one of the Patterns in the list.';
    else pattern = s.id;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, lens: { id: nextCustomId(existing), name, color: input.color as number, description, pattern } };
}

/** Adds a valid lens to the list (a new array); an invalid one leaves the list as it was and returns the errors. */
export function addCustomLens(list: readonly CustomLens[], input: CustomLensInput): { list: CustomLens[]; errors: Partial<Record<CustomLensField, string>> | null } {
  const r = validateCustomLens(input, list);
  return 'errors' in r ? { list: [...list], errors: r.errors } : { list: [...list, r.lens], errors: null };
}

export const removeCustomLens = (list: readonly CustomLens[], id: string): CustomLens[] => list.filter((l) => l.id !== id);

/** One line for the ring's caption: the description, or a plain default when there is none. */
export const customLine = (l: CustomLens): string => l.description || 'A lens you made for this visit.';
