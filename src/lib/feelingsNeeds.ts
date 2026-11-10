// The word lists shown beside the coach's message box, so the person can find their own words for feelings and needs. The words are
// CNVC's Feelings and Needs Inventory (2023), unchanged, shared with the credit CNVC asks for (see ATTRIBUTIONS.md and the About NVC
// page). CNVC says the lists are "neither exhaustive nor definitive". Adding or rewording words is an adaptation: write to CNVC first
// (docs/coach-practice-arc-scope.md). Everything here stays on the page: no word, and no choice of word, is sent anywhere.

export const CNVC_CREDIT = 'The Center for Nonviolent Communication © 2023, www.CNVC.org, cnvc@cnvc.org';
export const CNVC_LINK = 'https://www.cnvc.org/store/feelings-and-needs-inventory';

export interface WordGroup {
  family: string;
  words: string[];
}

const g = (family: string, words: string): WordGroup => ({ family, words: words.split(',').map((w) => w.trim()) });

/** Feelings when needs are being met. */
export const FEELINGS_MET: WordGroup[] = [
  g('Affectionate', 'compassionate, friendly, loving, open-hearted, sympathetic, tender, warm'),
  g('Engaged', 'absorbed, alert, curious, engrossed, enchanted, entranced, fascinated, interested, intrigued, involved, spellbound, stimulated'),
  g('Hopeful', 'expectant, encouraged, optimistic'),
  g('Confident', 'empowered, open, proud, safe, secure'),
  g('Excited', 'amazed, animated, ardent, aroused, astonished, dazzled, eager, energetic, enthusiastic, giddy, invigorated, lively, passionate, surprised, vibrant'),
  g('Grateful', 'appreciative, moved, thankful, touched'),
  g('Inspired', 'amazed, awed, wonder'),
  g('Joyful', 'amused, delighted, glad, happy, jubilant, pleased, tickled'),
  g('Exhilarated', 'blissful, ecstatic, elated, enthralled, exuberant, radiant, rapturous, thrilled'),
  g('Peaceful', 'calm, clear-headed, comfortable, centered, content, equanimous, fulfilled, mellow, quiet, relaxed, relieved, satisfied, serene, still, tranquil, trusting'),
  g('Refreshed', 'enlivened, rejuvenated, renewed, rested, restored, revived'),
];

/** Feelings when needs are not being met. */
export const FEELINGS_UNMET: WordGroup[] = [
  g('Afraid', 'apprehensive, dread, foreboding, frightened, mistrustful, panicked, petrified, scared, suspicious, terrified, wary, worried'),
  g('Annoyed', 'aggravated, dismayed, disgruntled, displeased, exasperated, frustrated, impatient, irritated, irked'),
  g('Angry', 'enraged, furious, incensed, indignant, irate, livid, outraged, resentful'),
  g('Aversion', 'animosity, appalled, contempt, disgusted, dislike, hate, horrified, hostile, repulsed'),
  g('Confused', 'ambivalent, baffled, bewildered, dazed, hesitant, lost, mystified, perplexed, puzzled, torn'),
  g('Disconnected', 'alienated, aloof, apathetic, bored, cold, detached, distant, distracted, indifferent, numb, removed, uninterested, withdrawn'),
  g('Disquiet', 'agitated, alarmed, discombobulated, disconcerted, disturbed, perturbed, rattled, restless, shocked, startled, surprised, troubled, turbulent, turmoil, uncomfortable, uneasy, unnerved, unsettled, upset'),
  g('Embarrassed', 'ashamed, chagrined, flustered, guilty, mortified, self-conscious'),
  g('Fatigue', 'beat, burnt out, depleted, exhausted, lethargic, listless, sleepy, tired, weary, worn out'),
  g('Pain', 'agony, anguished, bereaved, devastated, grief, heartbroken, hurt, lonely, miserable, regretful, remorseful'),
  g('Sad', 'depressed, dejected, despair, despondent, disappointed, discouraged, disheartened, forlorn, gloomy, heavy-hearted, hopeless, melancholy, unhappy, wretched'),
  g('Tense', 'anxious, cranky, distressed, distraught, edgy, fidgety, frazzled, irritable, jittery, nervous, overwhelmed, restless, stressed out'),
  g('Vulnerable', 'fragile, guarded, helpless, insecure, leery, reserved, sensitive, shaky'),
  g('Yearning', 'envious, jealous, longing, nostalgic, pining, wistful'),
];

export const NEEDS: WordGroup[] = [
  g('Physical wellbeing', 'air, food, movement/exercise, rest/sleep, sexual expression, safety, shelter, touch, water'),
  g('Connection', 'acceptance, affection, appreciation, belonging, cooperation, communication, closeness, community, companionship, compassion, consideration, consistency, empathy, inclusion, intimacy, love, mutuality, nurturing, respect/self-respect, safety, security, stability, support, to know and be known, to see and be seen, to understand and be understood, trust, warmth'),
  g('Honesty', 'authenticity, integrity, presence'),
  g('Play', 'joy, humor'),
  g('Peace', 'beauty, communion, ease, equality, harmony, inspiration, order'),
  g('Autonomy', 'choice, freedom, independence, space, spontaneity'),
  g('Meaning', 'awareness, celebration of life, challenge, clarity, competence, consciousness, contribution, creativity, discovery, efficacy, effectiveness, growth, hope, learning, mourning, participation, purpose, self-expression, stimulation, to matter, understanding'),
];

export type WordKind = 'feeling' | 'need';

/** Every distinct word of one kind, lower case. The family names count too ("angry", "sad", "connection" are words people use). */
export function wordsOf(kind: WordKind): string[] {
  const groups = kind === 'feeling' ? [...FEELINGS_MET, ...FEELINGS_UNMET] : NEEDS;
  return [...new Set(groups.flatMap((x) => [x.family.toLowerCase(), ...x.words]))];
}

/** Groups narrowed to the words containing what was typed (case-insensitive). Empty groups are dropped. */
export function filterGroups(groups: WordGroup[], query: string): WordGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.map((x) => ({ family: x.family, words: x.words.filter((w) => w.includes(q) || x.family.toLowerCase().includes(q)) })).filter((x) => x.words.length > 0);
}

/**
 * The phrase a picked word adds to the message box. The person can edit it: it is a starting sentence, not a statement made for them.
 *  */
export function phraseFor(kind: WordKind, word: string): string {
  return kind === 'feeling' ? `I might be feeling ${word}.` : `I might need ${word}.`;
}

/** The draft with the phrase added, never past `max` characters (then the draft is returned as it was). */
export function addWordToDraft(draft: string, kind: WordKind, word: string, max: number): string {
  const add = phraseFor(kind, word);
  const sep = draft.length === 0 || /\s$/.test(draft) ? '' : ' ';
  const next = draft + sep + add;
  return next.length <= max ? next : draft;
}
