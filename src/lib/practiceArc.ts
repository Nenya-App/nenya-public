// The practice arc (docs/coach-practice-arc-scope.md): Nenya's coach as a way to practise naming feelings and needs, met and unmet,
// with the PERSON doing the naming. The coach asks and checks; it does not name for them, except as a short menu of options after
// they say they do not know. Switched on with COACH_ARC=practice (off until the owner approves the wording and the evaluation). It
// steps aside when the message is flagged for distress, when hostility is aimed at the coach, and wherever a stance says so.
import { wordsOf } from './feelingsNeeds.ts';
import { sentences } from './coachClosing.ts';

export const practiceArcOn = (value: string | undefined = process.env.COACH_ARC): boolean => value === 'practice';

// "I don't know", "no idea", "I can't name it": the person is stuck, and a menu of two or three words is allowed.
const STUCK =
  /\b(?:i\s*(?:do not|don(?:'|’)t|dont)\s*(?:really\s*)?(?:know|have (?:the )?words)|idk|no idea|not sure|(?:i\s*)?(?:can(?:'|’)?t|cannot|can not)\s*(?:really\s*)?(?:tell|say|name|find|put)|(?:i\s*)?(?:have|got) no words|i\s*(?:have no|don(?:'|’)t have any) idea|don(?:'|’)t know what (?:i(?:'|’)m|i am|to)\s*(?:feel|need|say))\b/i;
export const isStuck = (text: string): boolean => STUCK.test(text);

/**
 * A message that is only words picked from the page's lists ("I might be feeling apprehensive. I might need affection."), with no situation
 * in it. Echoing these back and asking "is that what you said?" is irritating, so the coach is told what to do instead (WORDS_ONLY_NOTE).
 */
export function isWordsOnly(text: string): boolean {
  let rest = text.toLowerCase().replace(/\bi might (?:be feeling|need)\b/g, ' ');
  const all = [...wordsOf('feeling'), ...wordsOf('need')].sort((a, b) => b.length - a.length);
  const before = rest;
  for (const w of all) rest = rest.split(w.toLowerCase()).join(' ');
  if (rest === before) return false; // no known word at all
  return rest.replace(/\b(?:and|or|but|also)\b/g, ' ').replace(/[^a-z]/g, '').length === 0;
}

export const WORDS_ONLY_NOTE =
  'The person has sent only words they picked from lists of feelings and needs, with no account of what happened in this message. Do not repeat their words back as a list, and do not ask whether those are the words they meant. Thank them briefly for finding words and say it gives you something to work with. Then, in one short, warm invitation, offer these ways to go on and let them choose: tell you a little of what is going on that brings these up; think about what would be a helpful way to spend this time; or work out a request they could make, of themselves or of someone else. You may add that, if they would like, they can also think about what another person in the situation might be feeling and needing, only if that feels okay, and that it is never about excusing what happened. Do not guess a situation for them, and do not name any feeling or need yourself.';

/** The paragraph that replaces "reflect... name the feeling or need underneath" while the arc is on. */
export const ARC_CORE =
  'This conversation is practice at finding words for feelings and needs, and the person should do the finding. Do not name their feeling or need for them. The shape you are helping them toward is: what happened (as a camera would see it), what they feel, the need under that feeling, and what could help meet that need. It is for you to hold in mind, never to say aloud in those words, and never as a formula. Whichever piece is missing is what you invite next, as an open question, and a feeling is best linked to a need and a need to a feeling. Take any feeling or need words they have given as given: do not ask whether they are right, do not offer a different word beside theirs, do not ask them to say it again in one word, and do not repeat their words back as a list. Use their words naturally in what you ask next. If they have not said what happened, invite it, but never as a condition. Phrase any guess of your own as a question, never as "you feel" or "you need". The page shows them word lists, so do not list words yourself. If they only want to be heard, reflect and invite once without pushing. Ask at most one question. Do not give medical, legal, or financial advice, and do not tell the person what they must do.';

/** What each exchange is for, and the menu rule when the person is stuck. */
export function arcTurnLine(turn: number, max: number, stuck: boolean): string {
  const lines: string[] = [];
  if (stuck && turn < max) {
    lines.push('The person has said they do not know or cannot find the word. Offer two or three possible words as options, and tell them none of them has to fit (choose words that fit what they said, and add that it may be something else). Never state one word as fact about them.');
  }
  if (turn === 1) lines.push('Exchange 1 of the practice: reflect briefly what happened in their words. If they have not named a feeling, invite what they notice in themselves; if they have, take it as given and invite the piece that is missing. Do not ask them to boil it down to one word.');
  else if (turn === 2) lines.push('Exchange 2 of the practice: take any words they gave as given, with no check on them, and invite the missing piece: the feeling, the need, or what happened.');
  else if (turn === 3) lines.push('Exchange 3 of the practice: if it has not come up, ask which need is not being met and which is being met, even a little. Keep any guess of theirs as theirs.');
  else if (turn === max - 1) lines.push('Exchange 4 of the practice: make your one question about a request in their own words (what would help, from them or from someone else), and say they may add anything else they would still like to say. You may offer, as something they can decline, to guess what the other person might be feeling and needing. Say a caution in your own words with it: only if it feels okay, it is not about excusing what happened, and if they have been hurt or are not safe they owe no one understanding.');
  return lines.join(' ');
}

/** The exchange before the last, in the practice: the one question is about a request, and the last word is theirs to add. */
export const ARC_INVITE =
  'One exchange remains after this one. Do not open a new topic. Make your one question about a request in their own words: what would help, from them or from someone else. Say they may add anything else they would still like to say. Do not name a feeling or need for them. Do not mention how many exchanges are left.';

/** The closing exchange of the practice: only the person's own words come back. */
export const ARC_CLOSE =
  'Say back, in their own words only, the feeling and need words they chose, which need was unmet, which was met if they said one, and the request if they made one. Add no new feeling or need word of your own. Do not give medical, legal, or financial advice, and do not tell the person what they must do.';

// ---- what the person has named so far (feeling, need), so the coach can lead to the missing piece (feelings link to needs, needs to feelings)
// Detection only: a few everyday words that are not in CNVC's list, so "I'm so mad" counts as a feeling named.
const EVERYDAY_FEELINGS = ['mad', 'pissed', 'pissed off', 'sad', 'happy', 'down', 'stressed', 'fed up', 'worked up', 'freaking out', 'ticked off', 'upset', 'angry', 'scared', 'anxious'];
const esc = (w: string): string => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FEEL_LEAD = "(?:i(?:'|’)m|i am|i feel|i felt|i was|i have been|i(?:'|’)ve been|feel|feeling|felt|makes? me|made me|am|so|really|very|just|kind of|a bit|a little|pretty|quite)\\s+(?:(?:so|really|very|a bit|a little|kind of|pretty|just|quite|totally|more than)\\s+)*";
const NEED_LEAD = "(?:(?:i|we)\\s+(?:might\\s+)?(?:need|needed|want|miss|crave|lack)|needs?|need for|lack of|longing for|wish(?:ing)? for)\\s+(?:(?:some|more|a|the|my|our|any|to have)\\s+)?";
let named: { feel: RegExp; need: RegExp } | null = null;
function namedRegexes(): { feel: RegExp; need: RegExp } {
  if (named) return named;
  const alt = (ws: string[]): string => [...new Set(ws.map((w) => w.toLowerCase()))].sort((a, b) => b.length - a.length).map(esc).join('|');
  named = {
    feel: new RegExp(`${FEEL_LEAD}(?:${alt([...wordsOf('feeling'), ...EVERYDAY_FEELINGS])})(?![a-z-])`, 'i'),
    need: new RegExp(`${NEED_LEAD}(?:${alt(wordsOf('need'))})(?![a-z-])`, 'i'),
  };
  return named;
}

/** Whether the person has named a feeling and a need, across what they have written so far (a picked-words message counts as both kinds it holds). */
export function namedParts(userTexts: string[]): { feeling: boolean; need: boolean } {
  const r = namedRegexes();
  let feeling = false;
  let need = false;
  for (const t of userTexts) {
    const x = t.replace(/[“”]/g, '"');
    if (r.feel.test(x)) feeling = true;
    if (r.need.test(x)) need = true;
    if (isWordsOnly(x)) {
      if (matches(x, wordsOf('feeling')).length && /\bi might be feeling\b|\bfeeling\b/i.test(x)) feeling = true;
      if (matches(x, wordsOf('need')).length && /\bi might need\b|\bneed/i.test(x)) need = true;
    }
  }
  return { feeling, need };
}

/** What to lead toward, from what has been named so far. Empty if nothing is named yet. */
export function gapText(p: { feeling: boolean; need: boolean }): string {
  if (p.feeling && p.need) return 'They have named a feeling and a need. Take both as given: do not ask them to confirm, repeat or choose between them. Ask what they could do, or ask of someone, that would better meet that need, and whether there are other ways to meet it.';
  if (p.feeling) return 'They have named a feeling but no need. Take the feeling as given, with no check on it. Invite them to wonder what need sits under it, and later what they could ask for or try.';
  if (p.need) return 'They have named a need but no feeling. Take the need as given, with no check on it. Invite what they feel when that need is not being met, and what happened, described as a camera would see it, without judgment.';
  return '';
}

// ---- checks (plain phrase checks, like personaChecks: they find replies worth reading, they are not proof of judgment)
const NAMES_FOR_THEM =
  /\b(?:you(?:'|’)re|you are|you must be|you seem to be|sounds like you(?:'|’)re|sounds like you are)\s+(?:really\s+)?feeling\b|(?<!\b(?:do|did|would|could|can|if|when|whether|what|how|help|helps|helped|let|lets|make|makes|made|get|gets|will|might)\s)\byou(?:\s+(?:really|just))?\s+(?:feel|need)\s+(?!to\b)|\bsounds like you\s+(?:feel|need)\b/i;

// Questions that check words the person has already spelled out ("is that right?", "could X be one of the words you are using?", "is it also possible you feel Y?").
const CONFIRMS = /\b(?:is that (?:right|correct|what you (?:mean|meant|feel))|did i (?:get|hear) (?:that )?right|could [\"“']?\w[\w -]*[\"”']? be one of the words|is it (?:also )?possible (?:that )?you(?:'|’)?re feeling|are you saying|is that how you feel|is that the (?:right )?word)\b/i;

export interface ArcProblem {
  check: 'asksConfirm' | 'echoesWords' | 'namesForThem' | 'noQuestion' | 'questionOnClose' | 'wordList' | 'noMenu' | 'newWords';
  detail?: string;
}

const matches = (text: string, words: string[]): string[] => {
  const t = text.toLowerCase();
  return words.filter((w) => new RegExp(`(?<![a-z-])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z-])`).test(t));
};

/**
 * What is wrong with a reply, given the exchange and what the person wrote so far. Empty means nothing was found.
 * - exchanges before the close: it must ask (a question), must not tell them their feeling or need, and must not list words (a menu of up to 4
 *   is allowed only when the person is stuck, and then it needs at least 2);
 * - the close: no question, and no feeling or need word the person did not use.
 */
export function arcProblems(reply: string, o: { turn: number; max: number; userTexts: string[] }): ArcProblem[] {
  const wordsOnly = o.turn < o.max && isWordsOnly(o.userTexts[o.userTexts.length - 1] ?? '');
  const out: ArcProblem[] = [];
  const all = [...wordsOf('feeling'), ...wordsOf('need')];
  const last = o.userTexts[o.userTexts.length - 1] ?? '';
  const stuck = o.turn < o.max && isStuck(last);
  const inReply = matches(reply, all);
  if (o.turn >= o.max) {
    if (/[?？]/.test(reply)) out.push({ check: 'questionOnClose' });
    const used = new Set(matches(o.userTexts.join(' '), all));
    const fresh = inReply.filter((w) => !used.has(w));
    if (fresh.length) out.push({ check: 'newWords', detail: fresh.join(', ') });
    return out;
  }
  if (!/[?？]/.test(reply)) out.push({ check: 'noQuestion' });
  const said = namedParts(o.userTexts);
  if ((said.feeling || said.need) && CONFIRMS.test(reply)) out.push({ check: 'asksConfirm', detail: 'checks words the person already gave' });
  if (wordsOnly) {
    const theirs = matches(last, all);
    if (matches(reply, theirs).length >= 2) out.push({ check: 'echoesWords', detail: 'repeats the words they sent' });
    return out;
  }
  if (!stuck && NAMES_FOR_THEM.test(reply)) out.push({ check: 'namesForThem' });
  if (stuck) {
    if (inReply.length < 2) out.push({ check: 'noMenu' });
    if (inReply.length > 4) out.push({ check: 'wordList', detail: `${inReply.length} words` });
  } else if (inReply.length > 4) out.push({ check: 'wordList', detail: `${inReply.length} words` });
  return out;
}

// ---- the guard: ask once more, then repair (see the arc guard in netlify/functions/coach.mts). The model is small and sometimes names the feeling,
// checks words the person already gave, or repeats picked words back whatever the instructions say, so the site enforces it.
export const GUARDED: ArcProblem['check'][] = ['namesForThem', 'asksConfirm', 'echoesWords', 'noQuestion'];
export const guardedProblems = (reply: string, o: { turn: number; max: number; userTexts: string[] }): ArcProblem[] => arcProblems(reply, o).filter((p) => GUARDED.includes(p.check));

export const ARC_NOTE =
  'Your last draft told the person what they feel, or asked them to confirm words they had already given, or repeated their words back. Write it again. Reflect briefly, in your own words, what they shared. Do not name any feeling or need yourself. Do not ask whether their words are right, and do not repeat their words back. End with one open question that invites the piece they have not given yet.';

/** What the site says when the person sent only picked words and the model would not stop repeating them. */
export const WORDS_ONLY_SITE_REPLY =
  'Thank you for finding those words. They give us something to work with. Would you like to tell me a little of what is going on, think about how to spend this time, or work out a request, for yourself or someone else?';

/** One plain question for the piece that is missing. */
export function gapQuestion(p: { feeling: boolean; need: boolean }): string {
  if (p.feeling && p.need) return 'What could help meet that need?';
  if (p.feeling) return 'What need do you think sits under that?';
  if (p.need) return 'What do you feel when that need is not being met?';
  return 'What are you noticing in yourself as you think about it?';
}

/** The reply with the sentences that name or confirm taken out and, if no question is left, one plain question added. For picked words alone, the site's own reply. */
export function repairArc(reply: string, o: { userTexts: string[]; wordsOnly: boolean }): string {
  if (o.wordsOnly) return WORDS_ONLY_SITE_REPLY;
  const kept = sentences(reply).filter((x) => !NAMES_FOR_THEM.test(x) && !CONFIRMS.test(x));
  const text = kept.join(' ').trim();
  return /[?？]/.test(text) ? text : `${text}${text ? ' ' : ''}${gapQuestion(namedParts(o.userTexts))}`;
}
