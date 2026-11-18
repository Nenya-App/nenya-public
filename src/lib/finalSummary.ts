// The v2.1 final exchange as TWO parts (owner, 2026-11-18): the coach's ordinary closing reply, and a short summary of the feelings and needs the person
// expressed, written by a separate, focused model call that sees ONLY the person's own messages. The site then adds one sentence about the downloadable
// transcript. That sentence is written by people (a pool for the owner to approve), not by the model, because it makes a factual claim: the signed transcript is
// the exact record. A conversation always gets the same one (chosen from its own words), so a reader of several conversations sees different wording.
// Pure functions, no model: the function (netlify/functions/coach.mts) calls them, and tests read them. Switch: COACH_FINAL_SUMMARY=call.
import { createHash } from 'node:crypto';
import { asksOrInvites } from './coachClosing.ts';
import { pullsAgainstPeople } from './boundaryGuard.ts';
import { present } from './personaChecks.ts';
import { CNVC_LINK, wordsOf } from './feelingsNeeds.ts';

/** The instruction for the summary call. The model sees nothing else of the conversation, so it cannot echo the coach or answer the last message. */
export const SUMMARY_SYSTEM =
  'You write the last part of a short conversation with an AI listening companion. You will be given only what the person wrote, message by message. ' +
  'Summarize the conversation as a whole, as one piece: not message by message, and not by topic. Address the person as "you". Write four sentences in this order, under 90 words in all: ' +
  '(1) "You felt" followed by the feelings you can hear across what they wrote, in their own words where you can. ' +
  '(2) "You were looking for" followed by the needs under those feelings, each written as a noun or a short phrase such as rest, understanding, connection, respect or a sense of control (never "looking for to"). Name feelings as feelings, such as tired, anxious, hurt or relieved. ' +
  '(3) One sentence naming something they did or said that shows care for themselves or others. ' +
  '(4) One sentence of encouragement grounded in that, not general advice. ' +
  'Use only feelings and needs they expressed or clearly implied: do not add feelings or events they did not mention, do not diagnose or explain them, and do not predict what will help or what will happen. ' +
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

/** The messages for the summary call: the instruction, and the person's messages as one block of data. */
export function summaryMessages(userTexts: readonly string[]): { system: string; messages: { role: 'user'; content: string }[] } {
  const body = userTexts.map((t, i) => `Message ${i + 1}: ${t.trim()}`).join('\n\n');
  return { system: SUMMARY_SYSTEM, messages: [{ role: 'user', content: `Here is what the person wrote.\n\n${body}\n\nWrite the summary now.` }] };
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
  if (/\b(?:helps?|helped|can help|could help)\s+you\b/i.test(t)) out.push('prediction');
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
  'Choose up to three feelings and up to three needs that you can hear in what they wrote, across the whole conversation. Use ONLY words from the lists, spelled exactly as listed. Choose only what they expressed or clearly implied. ' +
  'Then write one short sentence (under 30 words) addressed to the person as "you" that names something they said or did that shows care for themselves or others, and ends with encouragement grounded in it. No question, no advice, no prediction, no promise, no goodbye. ' +
  'Answer in exactly this form and nothing else:\nFeelings: word, word, word\nNeeds: word, word, word\nCare: one sentence.';

/** The messages for the picking call: the instruction with both lists, and the person's messages as data. */
export function pickMessages(userTexts: readonly string[]): { system: string; messages: { role: 'user'; content: string }[] } {
  const body = userTexts.map((t, i) => `Message ${i + 1}: ${t.trim()}`).join('\n\n');
  const lists = `Feeling words: ${wordsOf('feeling').join(', ')}\n\nNeed words: ${wordsOf('need').join(', ')}`;
  return { system: PICK_SYSTEM, messages: [{ role: 'user', content: `${lists}\n\nHere is what the person wrote.\n\n${body}\n\nAnswer in the form given.` }] };
}

export interface Picks { feelings: string[]; needs: string[]; care: string }

const splitWords = (line: string): string[] => line.split(/,|\band\b|;/i).map((w) => w.trim().replace(/^["'“”‘’.]+|["'“”‘’.]+$/g, '').toLowerCase()).filter(Boolean);

/** Reads the model's answer: only words that are in the inventory survive (any other word is dropped), at most three of each, no repeats. The care sentence must pass the checks or it is left out. */
export function parsePicks(raw: string): Picks {
  // An inventory word written with a slash ("rest/sleep") may be chosen whole or as either part ("rest").
  const expand = (ws: string[]): Set<string> => new Set(ws.flatMap((w) => (w.includes('/') ? [w, ...w.split('/')] : [w])));
  const feelingSet = expand(wordsOf('feeling')), needSet = expand(wordsOf('need'));
  const line = (label: string): string => (raw.match(new RegExp(`^\\s*${label}\\s*:\\s*(.+)$`, 'im'))?.[1] ?? '').trim();
  // "to matter" and the like do not fit the site's sentence ("looking for ..."); a slash word is shown by its first part ("rest" for "rest/sleep").
  const pick = (label: string, set: Set<string>): string[] => [...new Set(splitWords(line(label)).filter((w) => set.has(w) && !/^to /.test(w)).map((w) => w.split('/')[0]))].slice(0, 3);
  const care = line('Care');
  const careSentences = care.split(/(?<=[.!?])\s+/).filter(Boolean);
  const careOk = care.length > 0 && care.split(/\s+/).length >= 6 && care.split(/\s+/).length <= 40 && careSentences.every((x) => x.split(/\s+/).length >= 4) && summaryProblems(`${care} You felt it. You were looking for need.`).every((p) => p === 'too-short' || p === 'no-feelings' || p === 'no-needs');
  return { feelings: pick('Feelings', feelingSet), needs: pick('Needs', needSet), care: careOk ? care : '' };
}

const joinWords = (w: string[]): string => (w.length <= 1 ? (w[0] ?? '') : `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}`);

/** The summary the site writes from the picks, or null if there is nothing to say (no feeling and no need was chosen from the lists). */
export function buildPicked(p: Picks): string | null {
  if (!p.feelings.length && !p.needs.length) return null;
  const parts: string[] = [];
  if (p.feelings.length) parts.push(`You felt ${joinWords(p.feelings)}.`);
  if (p.needs.length) parts.push(`You were looking for ${joinWords(p.needs)}.`);
  if (p.care) parts.push(/[.!]$/.test(p.care) ? p.care : `${p.care}.`);
  return parts.join(' ');
}

/** The credit the page shows under a summary made in the picked form (the words are CNVC's, unchanged); the link is CNVC's page for the inventory. */
export const SUMMARY_CREDIT = 'The feeling and need words come from the Center for Nonviolent Communication\'s Feelings and Needs Inventory (cnvc.org).';
export const SUMMARY_CREDIT_LINK = CNVC_LINK;
