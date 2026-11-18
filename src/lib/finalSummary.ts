// The v2.1 final exchange as TWO parts (owner, 2026-11-18): the coach's ordinary closing reply, and a short summary of the feelings and needs the person
// expressed, written by a separate, focused model call that sees ONLY the person's own messages. The site then adds one sentence about the downloadable
// transcript. That sentence is written by people (a pool for the owner to approve), not by the model, because it makes a factual claim: the signed transcript is
// the exact record. A conversation always gets the same one (chosen from its own words), so a reader of several conversations sees different wording.
// Pure functions, no model: the function (netlify/functions/coach.mts) calls them, and tests read them. Switch: COACH_FINAL_SUMMARY=call.
import { createHash } from 'node:crypto';
import { asksOrInvites, sentences } from './coachClosing.ts';
import { pullsAgainstPeople } from './boundaryGuard.ts';
import { present } from './personaChecks.ts';
import { wordsOf } from './feelingsNeeds.ts';
import { MANY_NEEDS, NEED_FOCUS_SUMMARY, needsNamed } from './needFocus.ts';
import { tallyLine, tallyOf } from './conversationTally.ts';

/** The instruction for the summary call. The model sees nothing else of the conversation, so it cannot echo the coach or answer the last message. */
export const SUMMARY_SYSTEM =
  'You write the last part of a short conversation with an AI listening companion. You will be given the whole conversation, both what the person wrote and what the coach (an AI) answered. ' +
  'Summarize the conversation as a whole, as one piece: not message by message, not by speaker, and not by topic. The feelings and needs you name are the PERSON\'s: the coach\'s words are context, not evidence about them, so do not give them a feeling or need only the coach named unless they agreed with it, and do not repeat the coach\'s advice or questions. Address the person as "you". Write four sentences in this order, under 90 words in all: ' +
  '(1) "You felt" followed by the feelings you can hear across what they wrote, in their own words where you can. ' +
  '(2) "You were looking for" followed by the needs under those feelings, each written as a noun or a short phrase such as rest, understanding, connection, respect or a sense of control (never "looking for to"). Name feelings as feelings, such as tired, anxious, hurt or relieved. ' +
  '(3) One sentence naming something they did or said that shows care for themselves or others. ' +
  '(4) One sentence of encouragement grounded in that, not general advice. ' +
  'Use only feelings and needs the person expressed or clearly implied: do not add feelings or events they did not mention, do not diagnose or explain them, and do not predict what will help or what will happen. ' +
  'Do not ask a question and do not invite a reply: they cannot answer. Do not say goodbye or thank them, do not promise to remember them or to be there later, do not mention transcripts or downloads, and do not suggest what to do next. ' +
  'Write plain sentences only: no lists, no headings, no quotation marks around the whole text. End on a full stop.';

/** A firmer note for one retry. */
export const SUMMARY_RETRY =
  'Your previous attempt did not follow the instructions (a question, a promise, advice, or too long). Write it again: three or four plain sentences, under 90 words, feelings and needs they expressed, one sentence of encouragement, no question, no promise.';

/** The sentences about the transcript, written for the owner to approve. Each says the same fact: the signed transcript keeps exactly what was said. */
export const TRANSCRIPT_LINES: readonly string[] = [
  'The transcript you can download keeps exactly what was said, in your words and in mine.',
  'If you would like the exact words, the signed transcript you can download keeps them just as they were said.',
  'This summary is only my reading. The transcript you can download is the exact record of what was said.',
  'The words themselves are in the transcript you can download, exactly as they were written, whenever you want them.',
  'You can keep the exact conversation: the signed transcript you can download holds it word for word.',
  'For the exact words, rather than my summary of them, the transcript you can download is the record to keep.',
];

/** A stable choice from the conversation's own words, so the same conversation always shows the same sentence. */
export function pickTranscriptLine(userTexts: readonly string[], lines: readonly string[] = TRANSCRIPT_LINES): string {
  const h = createHash('sha256').update(userTexts.join('\u0000')).digest();
  return lines[h.readUInt32BE(0) % lines.length];
}

/** One message of a conversation, as the summary calls read it. */
export interface Turn { role: 'user' | 'assistant'; content: string }

/** The whole conversation as one block of data, both speakers labelled (owner, 2026-11-18: the summary is of the conversation as a whole, not of one side). */
const conversationBlock = (turns: readonly Turn[]): string => turns.map((t) => `${t.role === 'user' ? 'The person' : 'The coach'}: ${t.content.trim()}`).join('\n\n');

/** The messages for the summary call: the instruction, and the whole conversation as one block of data. */
export function summaryMessages(turns: readonly Turn[]): { system: string; messages: { role: 'user'; content: string }[] } {
  return { system: SUMMARY_SYSTEM, messages: [{ role: 'user', content: `Here is the conversation.\n\n${conversationBlock(turns)}\n\nWrite the summary now.` }] };
}

const words = (t: string): number => t.trim().split(/\s+/).filter(Boolean).length;

/** What is wrong with a summary, as short names (empty = usable). Phrase checks, like the persona checks: they catch the common failures, not every one. */
export function summaryProblems(text: string): string[] {
  const t = text.trim();
  const out: string[] = [];
  if (!t) return ['empty'];
  if (asksOrInvites(t)) out.push('asks');
  if (pullsAgainstPeople(t) || present('promisesMemory', t) || present('farewellBond', t) || present('claimsMissingOrWorry', t) || present('claimsHumanLife', t)) out.push('promise-or-persona');
  if (/\b(transcript|download)\b/i.test(t)) out.push('mentions-transcript');
  if (/^\s*(?:[-*•]|\d+[.)])\s/m.test(t) || /^#/m.test(t)) out.push('list-or-heading');
  if (/\b(?:you should|you could|you can try|you might|you may want|try to|i suggest|i recommend|next step)\b/i.test(t)) out.push('advice');
  if (/(?:^|[.!;:]\s+|,\s+(?:and|so)\s+)(?:allow|try|take|consider|remember|give|let|keep|start|make|write|ask|talk|reach|set|trust|honou?r|notice|breathe|rest|be)\b/i.test(t)) out.push('advice');
  if (/\b(?:helps?|can help|could help)\s+you\b/i.test(t)) out.push('prediction'); // "has helped you feel steadier" reports what the person said and is allowed
  if (/\b(?:will|would|should)\s+(?:\w+\s+){0,2}(?:help|ease|make|allow|bring|give|lead|improve|reduce|build|create|open|strengthen|deepen|heal|bridge|grow|change|turn|become|bring|show)\b/i.test(t)) out.push('prediction');
  if (/\b(?:suggests?|indicates?|seems? to need|implies|a need for)\b/i.test(t)) out.push('interprets');
  if (/\blooking for (?:to|being)\b/i.test(t)) out.push('grammar');
  if (!/\b(?:felt|feel|feeling|feelings)\b/i.test(t)) out.push('no-feelings');
  if (!/\b(?:looking for|needs?|needing|longing|wanting)\b/i.test(t)) out.push('no-needs');
  if (words(t) > 110) out.push('too-long');
  if (words(t) < 15) out.push('too-short');
  if (!/[.!]["”’)]?$/.test(t)) out.push('unfinished');
  return out;
}

/** The final reply: the closing, a blank line, the summary, and the transcript sentence. Nothing is cut here; the function's length trim applies afterwards. */
export function assembleFinal(closing: string, summary: string, transcriptLine: string): string {
  return `${closing.trim()}\n\n${summary.trim()} ${transcriptLine.trim()}`;
}

// ---- The picked form (small models) -------------------------------------------------------------------------------------------------------------------------
// A small model writes feelings and needs badly ("felt miss", "looking for to be heard") and over-reads. In the picked form it does not write them: it CHOOSES words
// from CNVC's Feelings and Needs Inventory (src/lib/feelingsNeeds.ts, credited, unchanged), and the SITE writes the two sentences around them, so the grammar is right
// and every word is a real, credited one. The model also writes one short sentence of care or encouragement, which is used only if it passes the checks.

export const PICK_SYSTEM =
  'You read what a person wrote in a short conversation and choose words for what they felt and needed. You will be given only their messages, and two word lists. ' +
  'Choose up to three feelings and up to three needs that you can hear in what the person wrote, across all of their messages. Use ONLY words from the lists, spelled exactly as listed. Choose only what they expressed or clearly implied. ' +
  'Then write one short sentence (under 30 words) addressed to the person as "you" that names something they said or did that shows care for themselves or others, and ends with encouragement grounded in it. No question, no advice, no prediction, no promise, no goodbye. ' +
  'Answer in exactly this form and nothing else:\nFeelings: word, word, word\nNeeds: word, word, word\nCare: one sentence.';

/** The messages for the picking call. A focused call for small models (owner, 2026-11-18): it sees ONLY the person's messages, not the coach's replies, which a small model confuses with the person's own words. */
export function pickMessages(turns: readonly Turn[]): { system: string; messages: { role: 'user'; content: string }[] } {
  const mine = turns.filter((t) => t.role === 'user').map((t) => t.content);
  const body = mine.map((t, i) => `Message ${i + 1}: ${t.trim()}`).join('\n\n');
  const used = tallyLine(tallyOf(mine)); // the list words the person themselves used: a hint, so the choice stays close to their own words
  const lists = `Feeling words: ${wordsOf('feeling').join(', ')}\n\nNeed words: ${wordsOf('need').join(', ')}`;
  return { system: PICK_SYSTEM, messages: [{ role: 'user', content: `${lists}\n\nHere is what the person wrote.\n\n${body}${used ? `\n\nWords the person used that are on the lists (prefer these when they fit): ${used}` : ''}\n\nAnswer in the form given.` }] };
}

export interface Picks { feelings: string[]; needs: string[]; care: string; /** More than three valid needs were chosen: the summary then recommends focusing on one to three. */ moreNeeds?: boolean }

const splitWords = (line: string): string[] => line.split(/,|\band\b|;/i).map((w) => w.trim().replace(/^["'“”‘’.]+|["'“”‘’.]+$/g, '').toLowerCase()).filter(Boolean);

/** Reads the model's answer: only words that are in the inventory survive (any other word is dropped), at most three of each, no repeats. The care sentence must pass the checks or it is left out. */
export function parsePicks(raw: string): Picks {
  // An inventory word written with a slash ("rest/sleep") may be chosen whole or as either part ("rest").
  const expand = (ws: string[]): Set<string> => new Set(ws.flatMap((w) => (w.includes('/') ? [w, ...w.split('/')] : [w])));
  const feelingSet = expand(wordsOf('feeling')), needSet = expand(wordsOf('need'));
  const line = (label: string): string => (raw.match(new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, 'im'))?.[1] ?? '').trim();
  // "to matter" and the like do not fit the site's sentence ("looking for ..."); a slash word is shown by its first part ("rest" for "rest/sleep").
  const pick = (label: string, set: Set<string>): string[] => [...new Set(splitWords(line(label)).filter((w) => set.has(w) && !/^to /.test(w)).map((w) => w.split('/')[0]))];
  const care = line('Care');
  const careSentences = care.split(/(?<=[.!?])\s+/).filter(Boolean);
  const careOk = care.length > 0 && care.split(/\s+/).length >= 6 && care.split(/\s+/).length <= 40 && careSentences.every((x) => x.split(/\s+/).length >= 4) && summaryProblems(`${care} You felt it. You were looking for need.`).every((p) => p === 'too-short' || p === 'no-feelings' || p === 'no-needs');
  const needsAll = pick('Needs', needSet);
  return { feelings: pick('Feelings', feelingSet).slice(0, 3), needs: needsAll.slice(0, 3), care: careOk ? care : '', ...(needsAll.length >= MANY_NEEDS ? { moreNeeds: true } : {}) };
}

const joinWords = (w: string[]): string => (w.length <= 1 ? (w[0] ?? '') : `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}`);

/** The summary the site writes from the picks, or null if there is nothing to say (no feeling and no need was chosen from the lists). */
export function buildPicked(p: Picks): string | null {
  if (!p.feelings.length && !p.needs.length) return null;
  const parts: string[] = [];
  if (p.feelings.length) parts.push(`You felt ${joinWords(p.feelings)}.`);
  if (p.needs.length) parts.push(`You were looking for ${joinWords(p.needs)}.`);
  if (p.moreNeeds) parts.push(NEED_FOCUS_SUMMARY);
  if (p.care) parts.push(/[.!]$/.test(p.care) ? p.care : `${p.care}.`);
  return parts.join(' ');
}

export { SUMMARY_CREDIT, SUMMARY_CREDIT_LINK } from './summaryWords.ts';

/** Sentences of the coach's own closing that claim what something does for the person or what it shows about them ("it helps you", "this will build the bridge", "it suggests a desire"). */
const EFFECT_CLAIM = /\b(?:helps?|helped|can help|could help)\s+you\b|\b(?:will|would|should)\s+(?:\w+\s+){0,2}(?:help|ease|make|allow|bring|give|lead|improve|reduce|build|create|open|strengthen|deepen|heal|bridge|grow|change|turn|become|show)\b|\b(?:suggests?|indicates?|implies|seems? to need|a need for|a desire to)\b/i;

/** The closing without its effect-claim sentences, used when a separate summary follows (the summary carries the reading; the closing only answers the last message). Never empties the closing: if every sentence would go, it is left as it was. */
export function withoutEffectClaims(closing: string): string {
  const parts = sentences(closing);
  const kept = parts.filter((x) => !EFFECT_CLAIM.test(x));
  return kept.length && kept.length < parts.length ? kept.join(' ') : closing;
}

/** Which form of the summary a model gets (owner, 2026-11-18: written for the 26B, picked for small models). COACH_SUMMARY_FORM=written or picked forces one; unset or "auto" goes by the size in the model's name
 *  (the largest "<n>b" in it): 20 billion parameters or more is written, smaller is picked. A name with no size is written (the coach's own models all name it). */
export function summaryFormFor(model: string, setting?: string): 'written' | 'picked' {
  if (setting === 'written' || setting === 'picked') return setting;
  const sizes = [...model.toLowerCase().matchAll(/(?:^|[^a-z0-9.])(?:e|a)?(\d+(?:\.\d+)?)b(?![a-z0-9])/g)].map((m) => Number(m[1]));
  return sizes.length && Math.max(...sizes) < 20 ? 'picked' : 'written';
}

/** Opening reflection sentences ("It sounds like...", "It seems...", "I hear...") that the separate summary now carries. */
const REFLECTION_OPENING = /^\s*["“]?(?:it\s+(?:sounds|seems|feels|looks)\b|i\s+(?:can\s+)?hear\b|what\s+i\s+hear\b)/i;

/** The closing without its "It sounds like..." sentences, used when a separate summary follows (owner, 2026-11-18). Never empties the closing. */
export function withoutReflectionOpening(closing: string): string {
  const parts = sentences(closing);
  const kept = parts.filter((x) => !REFLECTION_OPENING.test(x));
  return kept.length && kept.length < parts.length ? kept.join(' ') : closing;
}

/** The one new fixed sentence for a conversation the safety checks flagged (draft wording, for the owner's approval): no model summary is written; the site's existing distress sentence for the category follows it (src/lib/distressText.ts). */
export const SUMMARY_FLAGGED_LEAD = 'I will not write a summary of this conversation: what you shared matters too much to be reduced to one, and people can hold it better than I can.';

export { SUMMARY_FAILED_TEXT } from './summaryWords.ts';

/** The requested summary as shown and as signed into a transcript: the summary and the site's sentence about the transcript, in one paragraph. */
export const assembleSummaryText = (summary: string, transcriptLine: string): string => `${summary.trim()} ${transcriptLine.trim()}`;

/** The recommendation to focus on one to three needs is added to a summary (once) when the summary names four or more, or when four or more different needs have come up in the person's own messages (the running tally). */
export function withSummaryNeedFocus(summary: string, userTexts: readonly string[] = []): string {
  if (/\bone to three\b/i.test(summary)) return summary;
  const many = needsNamed(summary).length >= MANY_NEEDS || tallyOf(userTexts).needs.length >= MANY_NEEDS;
  return many ? `${summary.trim()} ${NEED_FOCUS_SUMMARY}` : summary;
}
