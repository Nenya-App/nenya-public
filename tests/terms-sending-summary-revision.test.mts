// The 2026-11-19 Terms revision (docs/drafts/terms-sending-18plus-draft.md and docs/drafts/terms-summary-request-draft.md, approved as written): the sending sentences always, the summary sentences only with their switch, the archive.
import { readFileSync, existsSync } from 'node:fs';
import { LEGAL_EFFECTIVE_DATE, LEGAL_PARTS } from '../src/lib/legalDocument.ts';
import { ok } from './helpers.mts';

const src = readFileSync('src/lib/legalDocument.ts', 'utf8');
const text = LEGAL_PARTS.flatMap((p) => p.sections).map((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => x.paragraphs)].join(' ')).join(' ');
const archive = 'docs/legal/archive/terms-and-privacy-until-2026-11-19.md';

ok('the effective date is November 19, 2026', LEGAL_EFFECTIVE_DATE === 'November 19, 2026');
ok('the outgoing text is archived and the README lists it and the new version', existsSync(archive) && /Effective:\*\* November 18, 2026/.test(readFileSync(archive, 'utf8')) && /Breathing safely\./.test(readFileSync(archive, 'utf8')) && /terms-and-privacy-until-2026-11-19\.md/.test(readFileSync('docs/legal/README.md', 'utf8')));
ok('Section 2 keeps the age rule and adds the cross-reference', /Nenya is for people aged 13 and older/.test(text) && /Sending something to us \(Section 14\) is only for people 18 and older, even though using the site is open from 13\./.test(text));
ok('Section 14: the screen, 18 and older, the server refusal, what is kept, the one-way repeat code', /Before anything is sent, a screen shows you exactly what would be sent, who reads it, what we may do with it, how long we keep it, and that a deletion code will be shown once; nothing is sent until you press Send there, and Don’t send is just as easy to press\. Sending is for people 18 and older: the screen asks you to tick “I am 18 or older”, Send stays off until you do, and our server refuses a send that does not carry that confirmation\. We keep no age and nothing else about you from this: only the text, the dates, and a plain daily total of how many sends were refused for lacking it\./.test(text) && /To refuse an identical repeat, we keep a one-way code of what you sent for as long as we keep it\. It cannot be turned back into your words, and it is deleted when the submission is deleted, so deleting one lets you send the same words again if you choose\./.test(text));
ok('signed transcripts: 18 and older, a repeat refused, an update only removes permissions', /Sending a signed transcript is also for people 18 and older, and the choices screen asks you to confirm this before it lets you send\. If you send the same signed transcript again with the same choices, we refuse it and change nothing; sending it with different choices is treated as an update, and an update can only remove permissions, never add them\./.test(text));
// The button sentences show only with VITE_SUMMARY_REQUEST (off here). The automatic five-exchange summary and the need-focus sentence are always described (corrected 2026-11-22: production has COACH_FINAL_SUMMARY=call and COACH_NEED_FOCUS=on).
ok('with the summary switch off, the Terms do not mention the summary button or its counts, but do describe the automatic summary and the need-focus sentence', !/ask for one summary/.test(text) && !/If you ask for a summary/.test(text) && !/A request for a summary counts/.test(text) && !/how many summaries are asked for/.test(text) && !/A summary you ask for with the button/.test(text) && !/or after a summary you ask for/.test(text) && !/a summary of it if you ask for one/.test(text)
  && /At the fifth exchange the coach’s last reply may include a short summary\. To write it, our server sends the conversation \(your messages with identifiers replaced, and the coach’s replies\) to Venice AI once more, in the same way as a message\. We do not store it\./.test(text)
  && /If any message was flagged by the checks, or your last message was critical of the coach or abusive toward it, no summary is written\./.test(text)
  && /When a message of yours names four or more needs, our server adds one plain sentence after the reply recommending that you choose one to three to focus on/.test(text)
  && /At the end of a conversation our server adds one sentence of its own about the transcript you can download/.test(text));
ok('the summary-button sentences are in the source, behind the switch, in the approved wording; the false "how many summaries" counts are gone', /const SUMMARY = import\.meta\.env\?\.VITE_SUMMARY_REQUEST === 'on';/.test(src) && [
  'A summary you ask for with the button works the same way: the conversation goes to Venice AI once more, and Venice AI writes the summary. We do not store it.',
  'If any message in the conversation was flagged by these checks, no summary is written: the page shows a short sentence of ours and the same pointers to people.',
  ' (or after a summary you ask for)',
  'If you asked for a summary, a signed copy includes it, marked as the AI’s reading and not a record; our server includes it only if it can prove it wrote that text for that conversation. A signed copy without a summary is unchanged.',
  'A request for a summary counts as one message in that daily total. A request stopped by a limit is not passed to Venice AI and is not kept.',
  ', and a summary of it if you ask for one',
].every((t) => src.includes(t.replace(/'/g, "\\'"))) && !src.includes('how many summaries are asked for'));
