// The 2026-11-22 corrections to the Terms (docs/terms-accuracy-fixes-2026-11-22.md): the text is checked in BOTH switch sets, all page switches off (what production shows today)
// and all on (what staging shows), because the Terms are built from build-time switches. Each phrase that the audit found false must be gone from both, and each new sentence must be
// where the audit's decision put it. Plain text checks only: they say the Terms read as decided, not that a lawyer has reviewed them.
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ok } from './helpers.mts';

const SRC = resolve('src/lib/legalDocument.ts');
const VOCAB = resolve('src/lib/vocabulary.ts');
const dir = mkdtempSync(join(tmpdir(), 'terms-render-'));

async function render(env: Record<string, string>, name: string): Promise<string> {
  const code = `const __E = ${JSON.stringify(env)};\n` + readFileSync(SRC, 'utf8').replace(/import\.meta\.env\?\./g, '__E.').replace("from './vocabulary.ts'", `from '${pathToFileURL(VOCAB).href}'`);
  const file = join(dir, `${name}.mts`);
  writeFileSync(file, code);
  const m = await import(pathToFileURL(file).href);
  unlinkSync(file);
  return (m.LEGAL_PARTS as { sections: { heading: string; paragraphs: string[]; bullets?: string[]; after?: string[]; subsections?: { heading: string; paragraphs: string[] }[] }[] }[])
    .flatMap((p) => p.sections)
    .map((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => [x.heading, ...x.paragraphs])].join(' '))
    .join(' ');
}

const OFF = await render({}, 'off');
const ALL = await render({ VITE_SCREEN_MODEL: 'on', VITE_LENS_TRAY: 'on', VITE_TERMS_FIRST: 'on', VITE_WORD_HELP: 'on', VITE_SUMMARY_REQUEST: 'on' }, 'all');
const both = (name: string, re: RegExp) => ok(`${name} (both switch sets)`, re.test(OFF) && re.test(ALL));
const neither = (name: string, re: RegExp) => ok(`${name} (neither switch set)`, !re.test(OFF) && !re.test(ALL));

// Finding 1: sent transcripts are kept, and the Terms say how long, for what, and the public page.
neither('the old "passes it on without keeping or logging it" claim is gone', /without keeping or logging it/);
both('a sent transcript is kept in private storage for the chosen time, and can be narrowed or deleted with the signed file', /keeps it in our own private storage until the time you chose; a person at Nenya reads it there\. You can narrow what you allowed, or delete it, at any time with your signed file at nenya\.biz\/my-transcript/);
both('the keeping times are named', /\(30 days, 90 days, one year, or until you ask us to delete it\)/);
both('public showing: a person edits first, can come down, cannot be recalled, names may be missed, never after a safety stop', /a copy with names and details removed, read and edited by a person before anything is shown, may appear on that page for the time you choose, and you can take it down at any time\. We cannot recall copies that others have already made of anything shown in public, and names may be missed\. A conversation in which the safety check stopped a message is never shown\./);
both('the overlap codes are described and deleted with the transcript', /short codes made from your messages with a secret key; they cannot be turned back into your words and are deleted with the transcript/);
both('Retention: a sent transcript is kept for the chosen time, then deleted', /A signed transcript you send is kept for the time you chose, then deleted; the short codes we keep to spot the same conversation sent twice are deleted with it\./);
both('Rights: a sent transcript is deleted with the signed file', /for a signed transcript, with your signed file at nenya\.biz\/my-transcript/);

// Finding 2: the automatic summary and the need-focus sentence.
neither('the old "only when you press the button" claim is gone', /made only when you press the button/);
both('the automatic summary is described, with the extra Venice call and the cases with no summary', /At the fifth exchange the coach’s last reply may include a short summary\. To write it, our server sends the conversation \(your messages with identifiers replaced, and the coach’s replies\) to Venice AI once more, in the same way as a message\. We do not store it\. If any message was flagged by the checks, or your last message was critical of the coach or abusive toward it, no summary is written\./);
both('the site-written list has the transcript sentence and the need-focus sentence', /At the end of a conversation our server adds one sentence of its own about the transcript you can download[\s\S]*When a message of yours names four or more needs, our server adds one plain sentence after the reply recommending that you choose one to three to focus on/);
// The button sentence depends on the switch.
ok('the summary-button sentence is absent with the switch off', !/A summary you ask for with the button/.test(OFF) && !/after a summary you ask for/.test(OFF));
ok('the summary-button sentence is present with the switch on', /A summary you ask for with the button works the same way/.test(ALL) && /after a summary you ask for/.test(ALL));
neither('the false counts of summaries asked for, written or refused are gone', /how many summaries are asked for/);

// Finding 3: the palette and word look-up codes are deleted within two days (the cleanup job does it: tests/connection-limit.test.mts).
both('The Color API: a count under a one-way daily code, deleted within two days, and a plain daily total', /we keep only a count under a one-way daily code, deleted within two days, and a plain daily total of uses/);
ok('the word look-up says the same in the full paragraph (switch on)', /Nothing you looked up is kept\. We keep only a count under a one-way daily code, deleted within two days, and a plain daily total of look-ups/.test(ALL) && !/Nothing about the request is kept/.test(ALL));
ok('the word look-up is described in the switch-off text too, because the server answers it (switch off)', /A word look-up is switched on at our server, though no page of the site offers it yet\./.test(OFF) && /deleted within two days, and a plain daily total of look-ups/.test(OFF));
both('Retention names all the daily codes', /The daily codes \(the coach demo’s, the guestbook’s, The Color API button’s and the word look-up’s\) are deleted within two days/);

// Finding 4: Turnstile.
neither('the old "the coach cannot start" and "daily count of checks" claims are gone', /the coach cannot start|daily count of checks/);
both('Turnstile: not enforced for now, you can still try sending, we will say so first, nothing stored or logged', /We do not store the result and do not log it\. For now the result is not enforced: if the check fails or cannot load \(some blockers stop it\), you can still try sending\. If we start enforcing it, we will say so here first\./);

// Finding 5: what stays on the device.
neither('"one timestamp" as the only thing kept is gone', /is one timestamp|only the timestamp after/);
both('the word-list note is named in the short version and in Section 16', /a note of whether you left the coach page’s word lists open or folded \(“yes” or “no”\)/);
both('Save and return later also holds body-map placements and colors, and is erased on the next load after 24 hours', /together with your body-map placements and your interface colors[\s\S]*It is erased the next time the site loads after those 24 hours/);
both('Forget me and Emergency Exit are described as they behave', /erases what Nenya saved on your device, apart from the short codes the open tab keeps of what it sent[\s\S]*Emergency Exit erases all of it before it leaves the page, then leaves a one-word flag in that tab so that Back does not return you to the page/);
// Updated on purpose 2026-11-24 (docs/safety-features-card.md): the exit no longer goes to Wikipedia, so Section 18 names the Google home page, an ordinary page that does not mention Nenya. The referrer sentence is kept in the same form.
both('Section 18 names the Emergency Exit destination and the referrer', /The Emergency Exit button takes you to the Google home page \(www\.google\.com\), an ordinary page whose address does not mention Nenya; because it leaves from our site, Google can see that you came from nenya\.biz, though not which page you were on/);

// Finding 6: the address.
neither('"in one place only" is gone', /in one place only/);
both('the address is read only to make the one-way daily codes, which are listed, and is not stored', /reads your connection address only to make the one-way daily codes described in Sections 14 and 15 \(the coach demo’s daily limit, the guestbook, The Color API button and the word look-up\), and it does not store the address/);

// Finding 7: encryption.
both('the hardware check currently logs and carries on', /We check the proof Venice gives for that environment\. For now, if one part of that check fails, we log it and carry on rather than stop the message\./);
neither('the unqualified "only Venice’s secure processing environment can read it" is gone', /only Venice’s secure processing environment can read it/);

// Finding 8: learning cards, and the "full list" now has them.
both('the learning cards are in the list of site-written words', /Short learning cards\. When a message contains language that treats people as less than human[\s\S]*A signed transcript records an offer our server made, marked as written by the site, and the card’s title\./);

// Finding 10: the emailed copy of each form notice is deleted after 30 days (the owner sets this up in the mailbox); the form service's own list is kept until deleted by hand, and no schedule is promised for it.
both('the emailed copy of each notice is deleted after 30 days, and the form service list has no schedule', /The emailed copy of each notice is deleted automatically after 30 days\. The form service also keeps the entry in its own list, which we delete by hand and not on a set schedule\./);
both('the retention section says the same', /The emailed copy of each short notice that reaches us through our web host’s form service is deleted automatically after 30 days; the form service’s own list of entries is kept until we delete it by hand\./);
neither('the old "kept until we delete them" for the notices is gone', /Those notices are kept until we delete them/);

// The archive and the register of versions.
ok('the outgoing text is archived and the README lists the new version', existsSync('docs/legal/archive/terms-and-privacy-until-2026-11-22.md') && /terms-and-privacy-until-2026-11-22\.md/.test(readFileSync('docs/legal/README.md', 'utf8')));
ok('the archive holds the text that was live (the classifier revision, the old claims)', /without keeping or logging it/.test(readFileSync('docs/legal/archive/terms-and-privacy-until-2026-11-22.md', 'utf8')));
