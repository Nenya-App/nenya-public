// The v2.1 final exchange as TWO parts (owner, 2026-11-18): the coach's ordinary closing reply, and a short summary of the feelings and needs the person
// expressed, written by a separate, focused model call that sees ONLY the person's own messages. The site then adds one sentence about the downloadable
// transcript. That sentence is written by people (a pool for the owner to approve), not by the model, because it makes a factual claim: the signed transcript is
// the exact record. A conversation always gets the same one (chosen from its own words), so a reader of several conversations sees different wording.
// Pure functions, no model: the function (netlify/functions/coach.mts) calls them, and tests read them. Switch: COACH_FINAL_SUMMARY=call.
import { createHash } from 'node:crypto';
import { asksOrInvites } from './coachClosing.ts';
import { pullsAgainstPeople } from './boundaryGuard.ts';
import { present } from './personaChecks.ts';

/** The instruction for the summary call. The model sees nothing else of the conversation, so it cannot echo the coach or answer the last message. */
export const SUMMARY_SYSTEM =
  'You write the last part of a short conversation with an AI listening companion. You will be given only what the person wrote, message by message. ' +
  'Write a summary of three or four sentences, under 90 words, addressed to the person as "you". ' +
  'First name the feelings and then the needs you can hear in what they wrote, using their own words where you can, and only ones they expressed or clearly implied: do not add feelings or events they did not mention, and do not diagnose or explain them. ' +
  'Then add one sentence of encouragement grounded in something they said or did, not general advice. ' +
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
  if (/\b(?:you should|you could try|try to|i suggest|i recommend|next step)\b/i.test(t)) out.push('advice');
  if (words(t) > 110) out.push('too-long');
  if (words(t) < 15) out.push('too-short');
  if (!/[.!]["”’)]?$/.test(t)) out.push('unfinished');
  return out;
}

/** The final reply: the closing, a blank line, the summary, and the transcript sentence. Nothing is cut here; the function's length trim applies afterwards. */
export function assembleFinal(closing: string, summary: string, transcriptLine: string): string {
  return `${closing.trim()}\n\n${summary.trim()} ${transcriptLine.trim()}`;
}
