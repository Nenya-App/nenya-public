// The practice arc (docs/coach-practice-arc-scope.md): Nenya's coach as a way to practise naming feelings and needs, met and unmet,
// with the PERSON doing the naming. The coach asks and checks; it does not name for them, except as a short menu of options after
// they say they do not know. Switched on with COACH_ARC=practice (off until the owner approves the wording and the evaluation). It
// steps aside when the message is flagged for distress, when hostility is aimed at the coach, and wherever a stance says so.
import { wordsOf } from './feelingsNeeds.ts';

export const practiceArcOn = (value: string | undefined = process.env.COACH_ARC): boolean => value === 'practice';

// "I don't know", "no idea", "I can't name it": the person is stuck, and a menu of two or three words is allowed.
const STUCK =
  /\b(?:i\s*(?:do not|don(?:'|’)t|dont)\s*(?:really\s*)?(?:know|have (?:the )?words)|idk|no idea|not sure|(?:i\s*)?(?:can(?:'|’)?t|cannot|can not)\s*(?:really\s*)?(?:tell|say|name|find|put)|(?:i\s*)?(?:have|got) no words|i\s*(?:have no|don(?:'|’)t have any) idea|don(?:'|’)t know what (?:i(?:'|’)m|i am|to)\s*(?:feel|need|say))\b/i;
export const isStuck = (text: string): boolean => STUCK.test(text);

/** The paragraph that replaces "reflect... name the feeling or need underneath" while the arc is on. */
export const ARC_CORE =
  'This conversation is practice at finding words for feelings and needs, and the person should do the finding. Do not name their feeling or need for them. In your first reply, reflect briefly what happened in their own words, then invite them to try one word for what they are feeling, and say that a guess that misses is still useful. In the next, hand their word back, check it against one near word as a choice, and ask them to guess the need underneath. Then ask which need is not being met, and which need is being met, even a little. Phrase every guess as a question, never as "you feel" or "you need". The page shows them word lists, so do not list words yourself. If they only want to be heard, reflect and invite once without pushing. Ask at most one question. Do not give medical, legal, or financial advice, and do not tell the person what they must do.';

/** What each exchange is for, and the menu rule when the person is stuck. */
export function arcTurnLine(turn: number, max: number, stuck: boolean): string {
  const lines: string[] = [];
  if (stuck && turn < max) {
    lines.push('The person has said they do not know or cannot find the word. Offer two or three possible words as options, and tell them none of them has to fit ("it might be closer to drained, numb or overwhelmed, or something else"). Never state one word as fact about them.');
  }
  if (turn === 1) lines.push('Exchange 1 of the practice: reflect what happened in their words, then invite one feeling word. Do not name the feeling.');
  else if (turn === 2) lines.push('Exchange 2 of the practice: check their feeling word, offering at most one near word as a choice, then ask them to guess the need underneath.');
  else if (turn === 3) lines.push('Exchange 3 of the practice: keep their guess as a guess ("does that fit?"), then ask which need is not being met, and which need is being met, even a little.');
  else if (turn === max - 1) lines.push('Exchange 4 of the practice: make your one question about a request in their own words (what would help, from them or from someone else), and say they may add anything else they would still like to say. If it fits, they may guess what the other person needs, but do not ask this when the other person is hurting them or being hurt.');
  return lines.join(' ');
}

/** The closing exchange of the practice: only the person's own words come back. */
export const ARC_CLOSE =
  'Say back, in their own words only, the feeling and need words they chose, which need was unmet, which was met if they said one, and the request if they made one. Add no new feeling or need word of your own. Do not give medical, legal, or financial advice, and do not tell the person what they must do.';

// ---- checks (plain phrase checks, like personaChecks: they find replies worth reading, they are not proof of judgment)
const NAMES_FOR_THEM =
  /\b(?:you(?:'|’)re|you are|you must be|you seem to be|sounds like you(?:'|’)re|sounds like you are)\s+(?:really\s+)?feeling\b|(?<!\b(?:do|did|would|could|can|if|when|whether|what|how)\s)\byou(?:\s+(?:really|just))?\s+(?:feel|need)\s+(?!to\b)|\bsounds like you\s+(?:feel|need)\b/i;

export interface ArcProblem {
  check: 'namesForThem' | 'noQuestion' | 'questionOnClose' | 'wordList' | 'noMenu' | 'newWords';
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
  if (!stuck && NAMES_FOR_THEM.test(reply)) out.push({ check: 'namesForThem' });
  if (stuck) {
    if (inReply.length < 2) out.push({ check: 'noMenu' });
    if (inReply.length > 4) out.push({ check: 'wordList', detail: `${inReply.length} words` });
  } else if (inReply.length > 4) out.push({ check: 'wordList', detail: `${inReply.length} words` });
  return out;
}
