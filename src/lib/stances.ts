// Stances: the coach's base (Nenya: empathic reflection) with, in the future, up to two layers added on top (Vilya: teaching and
// system-oriented; Narya: challenging, encouraging growth). Not a strict switch between three coaches: one base, and filters that
// add to it. See docs/coach-lenses-scope.md. NONE OF THE LAYERS EXISTS YET: their text is empty and the gate below refuses them.
// What is built now is the safeguards, so that when a layer is written (and, in time, perhaps sold as a paid option) it can only be
// used where it is safe and allowed:
//  - a request for a stance is validated against a fixed list (a message cannot invent one);
//  - a stance is used only if it has text (is active) and the visitor is entitled to it (today everyone has the base only);
//  - any layer falls back to the base when the crisis check flags the message or a sensitive topic is present;
//  - layer text is linted before it can be used (it may not weaken the honest lines, the safety rules or the tone), and kept short;
//  - a layer is added to the base's instructions and never replaces them.
import type { SafetyFlag } from './safetyFlags.ts';
import type { SensitiveTopic } from './sensitiveTopics.ts';

export const STANCE_IDS = ['nenya', 'vilya', 'narya'] as const;
export type Stance = (typeof STANCE_IDS)[number];
export const BASE_STANCE: Stance = 'nenya';

/**
 * What each is. The labels visitors would see are the neutral working labels with the element as a descriptor ("Reflect (Water)", "Learn
 * (Air)", "Stretch (Fire)"); Water is the default. The ring names are the owner's own shorthand for the notes and the repository, not shown to visitors.
 */
export const STANCES: Record<Stance, { ring: string; element: 'Water' | 'Air' | 'Fire'; working: string; description: string }> = {
  nenya: { ring: 'Ring of Water', element: 'Water', working: 'Reflect', description: 'The base: listens, reflects, names the feeling and the need underneath.' },
  vilya: { ring: 'Ring of Air', element: 'Air', working: 'Learn', description: 'Adds teaching: explains the steps and why a pattern repeats, in a few sentences, and hands back to the person.' },
  narya: { ring: 'Ring of Fire', element: 'Fire', working: 'Stretch', description: 'Adds gentle challenge: questions a thought, names an assumption, offers one small stretch. Never confronts.' },
};

/** The text of each layer. Empty (null) means the stance does not exist yet and cannot be used. Nenya is the base and has none. */
let layers: Record<Stance, string | null> = { nenya: null, vilya: null, narya: null };

/**
 * The Learn (Vilya, Air) layer, draft wording for the owner's review (docs/coach-lenses-scope.md, "Gentle teaching of other NVC ideas"). It is in use only
 * where COACH_STANCES contains "learn" (off by default) and, like every layer, it falls back to the base on a distress flag or a sensitive topic.
 */
export const LEARN_LAYER =
  'Learn: add a little teaching to the practice, one idea at a time, as an invitation and in plain words, and only when the person\'s own words show it. For example: "I feel ignored" tells a story about what someone did, and a feeling like lonely or hurt may sit under it; what happened can be said as a camera would see it, apart from what we made of it; a need is not the same as one way of meeting it; a request leaves room for a no; a label for a whole person can stand in for what we needed; behind "I have to" there is often a choice and a need. Explain in two or three sentences, give one small example, then hand it back as a question. Offer one idea in a reply, never when they only want to be heard, and never as a correction.';
export const learnOn = (value: string | undefined = process.env.COACH_STANCES): boolean => /\blearn\b/i.test(value ?? '');
export const stanceLayers = (): Record<Stance, string | null> => ({ ...layers, vilya: layers.vilya ?? (learnOn() ? LEARN_LAYER : null) });
/** For tests: set layer text (it is linted first). Pass null to clear. */
export function __setStanceLayersForTests(next: Partial<Record<Stance, string | null>> | null): void {
  if (next === null) {
    layers = { nenya: null, vilya: null, narya: null };
    return;
  }
  for (const [k, v] of Object.entries(next)) if (v) assertValidLayer(v, k);
  layers = { ...layers, ...next } as Record<Stance, string | null>;
}

/** A request's stance: one of the known names, else the base. Never anything else, whatever was sent. */
export function parseStance(raw: unknown): Stance {
  return typeof raw === 'string' && (STANCE_IDS as readonly string[]).includes(raw) ? (raw as Stance) : BASE_STANCE;
}

let entitledOverride: Stance[] | null = null;
/** For tests: pretend the visitor is entitled to these stances. Pass null to clear. */
export const __setEntitledForTests = (list: Stance[] | null): void => {
  entitledOverride = list;
};
/** Which stances this visitor may use. Today everyone has the base only; a paid tier would extend this from an account (not built). */
export const entitledStances = (): Stance[] => entitledOverride ?? (learnOn() ? [BASE_STANCE, 'vilya'] : [BASE_STANCE]);

export type StanceReason = 'base' | 'allowed' | 'inactive' | 'not-entitled' | 'distress-flag' | 'sensitive-topic';

/** The stance that actually runs, and why it is not the one asked for. The base always runs when anything above says no. */
export function effectiveStance(o: {
  requested: Stance;
  entitled?: Stance[];
  active?: Record<Stance, string | null>;
  flag?: SafetyFlag | null;
  topics?: SensitiveTopic[];
}): { stance: Stance; layer: string | null; reason: StanceReason } {
  const entitled = o.entitled ?? entitledStances();
  const active = o.active ?? stanceLayers();
  if (o.requested === BASE_STANCE) return { stance: BASE_STANCE, layer: null, reason: 'base' };
  if (!active[o.requested]) return { stance: BASE_STANCE, layer: null, reason: 'inactive' };
  if (!entitled.includes(o.requested)) return { stance: BASE_STANCE, layer: null, reason: 'not-entitled' };
  if (o.flag) return { stance: BASE_STANCE, layer: null, reason: 'distress-flag' };
  if (o.topics && o.topics.length) return { stance: BASE_STANCE, layer: null, reason: 'sensitive-topic' };
  return { stance: o.requested, layer: active[o.requested], reason: 'allowed' };
}

export const MAX_LAYER_CHARS = 900;

// What layer text may not say: anything that works against the honest lines, the safety rules, or the gentleness the base keeps.
const FORBIDDEN: [RegExp, string][] = [
  [/\bignore\b[^.]{0,40}\b(?:rules|instructions|above|earlier|previous|safety|care note)\b/i, 'tells the model to ignore the rules above'],
  [/\b(?:do not|don'?t|never)\b[^.]{0,30}\b(?:mention|name|give|offer|point to|suggest)\b[^.]{0,30}\b(?:crisis|988|resources?|a person|someone you trust|professional)\b/i, 'tells the model to withhold help or a person'],
  [/\b(?:do not|don'?t|never)\b[^.]{0,20}\b(?:say|admit|tell)\b[^.]{0,30}\b(?:you(?:'re| are) an AI|AI)\b/i, 'tells the model to hide that it is an AI'],
  [/\bpretend\b[^.]{0,30}\b(?:person|human|therapist|friend|real)\b|\bact as (?:a|their) (?:therapist|counselor|doctor|friend)\b/i, 'tells the model to act as a person or a therapist'],
  [/\byou (?:can|may|should) diagnose\b/i, 'allows diagnosing'],
  [/\b(?:tell|say to) (?:them|the person) (?:that )?(?:they|you) (?:must|have to|need to|should)\b/i, 'tells the model to command the person'],
  [/\b(?:confront|shame|guilt[- ]trip|call (?:them|the person) out|force|demand|push (?:them|the person) hard|tough love)\b/i, 'asks for confrontation, shame or force'],
  [/\b(?:promise|remember (?:them|the person)|miss (?:them|the person)|be there (?:for them )?later)\b/i, 'asks for a promise the coach cannot keep'],
  [/\b(?:ask (?:them|the person) to )?(?:describe|explain|detail)\b[^.]{0,30}\b(?:suicid\w*|dark thoughts|self[- ]harm)\b/i, 'asks for details about suicidal thoughts'],
];

/** Problems with a piece of layer text (an empty list means it may be used). */
export function layerProblems(text: string): string[] {
  const out: string[] = [];
  if (!text.trim()) out.push('is empty');
  if (text.length > MAX_LAYER_CHARS) out.push(`is longer than ${MAX_LAYER_CHARS} characters (a small model keeps less in view)`);
  for (const [re, why] of FORBIDDEN) if (re.test(text)) out.push(why);
  return out;
}

export function assertValidLayer(text: string, name = 'layer'): void {
  const p = layerProblems(text);
  if (p.length) throw new Error(`The ${name} text ${p.join('; ')}.`);
}

/** The line that introduces a layer inside the instructions: it adds to the base and never overrides it. */
export const LAYER_LEAD = 'A stance for this conversation, which adds to everything above and below and never overrides the honest lines, the care for someone in distress, or the closing rules:';
export const layerBlock = (layer: string | null): string => (layer ? `${LAYER_LEAD} ${layer.trim()}` : '');
