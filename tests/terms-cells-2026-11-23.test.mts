// The 2026-11-23 partner-practice cells revision of the Terms: Section 22 and two cross-references, shown only in a build with VITE_CELL_ENABLED=on, with the date November 23, 2026.
// The Terms are rendered with the cells switch off and on, alone and together with every other page switch off and on. Each claim in Section 22 is tied to the code that makes it true
// (netlify/functions/cell.mts, cell-cleanup.mts, src/lib/cellClient.ts, src/lib/cellCrypto.ts, src/cell/CellPage.tsx). Plain text checks: they say the text matches the code, not that a lawyer has reviewed it.
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ok } from './helpers.mts';
import { CELL_MAX_AGE_MS } from '../netlify/functions/cell.mts';
import { KEEP_DAYS } from '../src/lib/submissions.ts';
import { CODE_LENGTH } from '../src/lib/cellCrypto.ts';

interface Sec { number: number; heading: string; paragraphs: string[]; bullets?: string[]; after?: string[]; subsections?: { heading: string; paragraphs: string[] }[] }
const SRC = resolve('src/lib/legalDocument.ts');
const VOCAB = resolve('src/lib/vocabulary.ts');
const dir = mkdtempSync(join(tmpdir(), 'terms-cells-'));
let n = 0;
async function render(env: Record<string, string>): Promise<{ sections: Sec[]; date: string }> {
  const code = `const __E = ${JSON.stringify(env)};\n` + readFileSync(SRC, 'utf8').replace(/import\.meta\.env\?\./g, '__E.').replace("from './vocabulary.ts'", `from '${pathToFileURL(VOCAB).href}'`);
  const file = join(dir, `r${n++}.mts`);
  writeFileSync(file, code);
  const m = await import(pathToFileURL(file).href);
  unlinkSync(file);
  return { sections: (m.LEGAL_PARTS as { sections: Sec[] }[]).flatMap((p) => p.sections), date: m.LEGAL_EFFECTIVE_DATE };
}
const textOf = (s: Sec) => [s.heading, ...s.paragraphs, ...(s.bullets ?? []), ...(s.after ?? []), ...(s.subsections ?? []).flatMap((x) => [x.heading, ...x.paragraphs])].join(' ');
const OTHERS = ['VITE_SCREEN_MODEL', 'VITE_LENS_TRAY', 'VITE_TERMS_FIRST', 'VITE_WORD_HELP', 'VITE_SUMMARY_REQUEST'];
const othersOn = Object.fromEntries(OTHERS.map((k) => [k, 'on']));

const code = (f: string) => readFileSync(resolve(f), 'utf8');
const cellFn = code('netlify/functions/cell.mts');
const cleanup = code('netlify/functions/cell-cleanup.mts');
const client = code('src/lib/cellClient.ts');
const page = code('src/cell/CellPage.tsx');

for (const [label, others] of [['page switches off', {}], ['page switches on', othersOn]] as const) {
  const off = await render(others);
  const on = await render({ ...others, VITE_CELL_ENABLED: 'on' });
  const offAll = off.sections.map(textOf).join(' ');

  // Switch off: nothing about cells, the old date, sections 1 to 21.
  ok(`off (${label}): the date is the base date, November 27, 2026 (the fuller list of reply changes moved it from November 24)`, off.date === 'November 27, 2026');
  ok(`off (${label}): sections 1 to 21 only`, off.sections.map((s) => s.number).join() === Array.from({ length: 21 }, (_, i) => i + 1).join());
  ok(`off (${label}): the Terms do not mention cells`, !/partner-practice|partner practice|Section 22|\bcell\b/i.test(offAll));
  ok(`off (${label}): a switch that is not "on" (such as "off" or "true") also leaves it off`, (await render({ ...others, VITE_CELL_ENABLED: 'true' })).sections.length === 21);

  // Switch on: only Section 22, two cross-references and the date differ.
  ok(`on (${label}): the cells-on date is November 28, 2026, later than the base date`, on.date === 'November 28, 2026');
  ok(`on (${label}): sections 1 to 22 without gaps`, on.sections.map((s) => s.number).join() === Array.from({ length: 22 }, (_, i) => i + 1).join());
  const undo = (s: Sec): Sec => {
    const f = (t: string) => t.replace(' a partner-practice cell (Section 22),', '').replace('the form, The Color API, the coach demo, or a partner-practice cell (Section 22)', 'the form, The Color API, or the coach demo');
    return { ...s, bullets: s.bullets?.map(f) };
  };
  ok(`on (${label}): sections 1 to 21 are the switch-off text, apart from the two cross-references`, JSON.stringify(on.sections.slice(0, 21).map(undo)) === JSON.stringify(off.sections));
  ok(`on (${label}): the cross-references are in Sections 12 and 17`, /a partner-practice cell \(Section 22\),/.test(textOf(on.sections[11])) && /a partner-practice cell \(Section 22\)\./.test(textOf(on.sections[16])));
  const sec = on.sections[21];
  const t = textOf(sec);
  ok(`on (${label}): Section 22 is headed as a preview`, sec.heading === 'Partner-practice cells (preview)');
  ok(`on (${label}): every Section reference resolves`, [...on.sections.map(textOf).join(' ').matchAll(/Sections? (\d+)(?: and (\d+))?/g)].flatMap((m) => [m[1], m[2]].filter(Boolean).map(Number)).every((k) => k >= 1 && k <= 22));
  ok(`on (${label}): Section 22 refers only to Sections 4, 13 and 21`, [...t.matchAll(/Section (\d+)/g)].map((m) => m[1]).sort().join() === '13,21,4');
  const words = t.split(/\s+/).length;
  ok(`on (${label}): Section 22 is about 150 to 440 words (the brief said about 150 to 300; the bullet labels count; raised from 350 on 2026-11-23 for the owner's consent-to-share rule, and from 420 on 2026-11-27 for the approved seat-key words)`, words >= 150 && words <= 440, String(words));
  ok(`on (${label}): none of the banned words`, !/\b(safe|safely|secure|securely|security|private|privately|anonymous|anonymously|end-to-end)\b/i.test(t));
  ok(`on (${label}): no legal-review or legal-advice claim is made (the Terms do not make one elsewhere)`, !/lawyer|legal advice|attorney/i.test(t));
}

// Every claim, tied to the code.
const on = await render({ VITE_CELL_ENABLED: 'on' });
const t = textOf(on.sections[21]);
const maxMessages = Number(/const MAX_MESSAGES = (\d+)/.exec(cellFn)?.[1]);
const maxChars = Number(/const MAX_CHARS = (\d+)/.exec(page)?.[1]);
ok('3 hours: the Terms say 3 hours and the code is 3 hours', CELL_MAX_AGE_MS === 3 * 60 * 60 * 1000 && /never kept past 3 hours from opening/.test(t));
ok('the hourly job exists and deletes by that same age', /schedule: '@hourly'/.test(cleanup) && /CELL_MAX_AGE_MS/.test(cleanup) && /an hourly job removes any that remain/.test(t));
ok('300 messages per person: the Terms match the server limit', maxMessages === 300 && /up to 300 messages/.test(t) && /log\.length >= MAX_MESSAGES/.test(cellFn) && /per side/.test(cellFn));
ok('1,000 characters: the Terms match the page limit', maxChars === 1000 && /of up to 1,000 characters/.test(t) && /maxLength=\{MAX_CHARS\}/.test(page));
ok('the code is 16 letters and digits', CODE_LENGTH === 16 && /code of 16 letters and digits/.test(t));
ok('two seats, each once, and a person who did not make the code cannot open a cell', /two seats, each taken once/.test(t) && /onlyIfNew: true/.test(cellFn) && /role === 'b'\) return json\(404/.test(cellFn) && /error: 'taken'/.test(cellFn));
ok('two safety colors are compared', /compare two colors/.test(t) && /safetyColors/.test(client) && /They do not match: close/.test(page));
ok('either person closing deletes the cell, and leaving the page tries to', /deleted when either person closes it \(leaving the page tries to close it\)/.test(t) && /action === 'close'[\s\S]{0,80}closeCell/.test(cellFn) && /addEventListener\('pagehide'/.test(page) && /client\.current\?\.close\(\)/.test(page));
ok('messages are encrypted in the browser before sending, and the code is never sent', /Your browser encrypts each message before sending/.test(t) && /sealMessage\(this\.session/.test(client) && /AES-GCM/.test(code('src/lib/cellCrypto.ts')) && !/code: this\.code|JSON\.stringify\(\{[^}]*\bcode\b/.test(client) && /which we never receive/.test(t));
ok('what the server holds is the mailbox name, public key, tag, a one-way code of each seat key, envelopes (number, iv, ciphertext, check value) and the opening time, nothing else', /meta: `cell\/\$\{box\}\/meta`/.test(cellFn) && /interface Meta \{\s*created: number;\s*\}/.test(cellFn) && /\{ pub: h\.pub, tag: h\.tag, seat: seatCode\(seatKey\) \}/.test(cellFn) && /createHash\('sha256'\)\.update\(seat\)/.test(cellFn) && /a one-way code of a random key your browser makes for your seat \(so that no one else can act for you, including agreeing to share\)/.test(t) && /\{ seq: env\.seq, iv: env\.iv, ct: env\.ct, commit: env\.commit \}/.test(cellFn) && /a mailbox name made from the code, each person’s public key, the encrypted messages \(each with a number and a check value\), and the time the cell opened/.test(t));
ok('the server never reads the text of an unreported message (no decrypt in the function)', !/openMessage|decrypt|sealMessage/.test(cellFn));
ok('sharing the whole conversation needs both people: either may ask, the other must agree, saying no sends nothing, it holds both people’s words and times, it is kept without the mailbox name for 90 days and the daily job deletes it, and we cannot confirm it matches what was written', /Either person can ask to share the whole conversation with us\. It is shared only if the other person agrees; saying no sends nothing\. What is shared holds both people’s words and times/.test(t) && /We keep it in our storage with our host, without the mailbox name/.test(t) && /we cannot confirm it matches what was written/.test(t) && /view\.state !== 'agreed'\) return json\(403/.test(cellFn) && /privateStore\(\)\.setJSON\(`cell-report\/\$\{id\}`, \{ receivedAt: [^}]*keepUntil: cellReportKeepUntil\(new Date\(now\)\), messages: lines, bothAgreed: true, verified: false \}\)/.test(cellFn) && !/box/.test(/cell-report[^\n]*\n/.exec(cellFn)![0]) && /It is deleted 90 days after it is filed, and you can email us to have it deleted sooner \(Section 21\)/.test(t) && KEEP_DAYS === 90 && !/No date is set/.test(t) && !/cell-report/.test(cleanup) && /CELL_REPORT_PREFIX/.test(code('netlify/functions/submission-expiry.mts')) && /expireCellReports\(\)/.test(code('netlify/functions/submission-expiry.mts')) && /cannot read or check any of it/.test(cellFn) && /MAX_REPORT_LINES/.test(cellFn) && /a note of who asked and who agreed/.test(t))
ok('the Terms tell a person who needs to leave to close the cell and email their own copy, and the page says the same', /To leave without anyone’s agreement, close the cell; you can email us your own copy of what you saw/.test(t) && /you do not need their agreement to leave: close the cell/.test(page) && /email info@nenya\.biz yourself with your own copy/.test(page))
ok('the cell page asks the other person in plain words (whole conversation, both people’s words and times, 90 days, no means nothing is sent) and has Yes and No', /asks to share this whole conversation with Nenya/.test(page) && /It includes your words and theirs, with the times/.test(page) && /kept for 90 days, then deleted/.test(page) && /If you say No, nothing is sent/.test(page) && /No, send nothing/.test(page) && /Nenya cannot confirm it matches what was written/.test(page))
ok('only the receiving device checks, on the other person’s text messages, and a stop-level flag pauses the cell for both', /detectFlag\(m\.text\)/.test(client) && /flag\?\.tier === 'stop'/.test(client) && /setPaused\(\{ by: 'me', flag, text: m\.text \}\)/.test(page) && /kind: 'pause'/.test(page) && /pauses the cell for both/.test(t) && !/detectFlag/.test(/async send\([\s\S]*?\n  \}/.exec(client)![0]));
ok('no coach and no AI is used in a cell: the cell code reaches no endpoint but /api/cell and imports no coach or model code', !/\/api\/(?!cell)/.test(cellFn + client + page) && !/from '\.\/(coach|venice|openrouter|model)/i.test(cellFn + client) && !/from '\.\.\/(coach|lib\/(coach|venice))[^']*'/.test(page.replace(/from '\.\.\/coach\/FlagNotice'/, '')) && /No coach or AI is used in a cell/.test(t) && /not available yet/.test(page));
ok('logging: only two counts are kept, and no message or code is written to a log', [...cellFn.matchAll(/tallyCount\([^,]+, '([^']+)'\)/g)].map((m) => m[1]).sort().join() === 'cell.opened,cell.report.verified' && !/console\./.test(cellFn) && /cells opened and reports kept/.test(t) && /We do not write messages or codes to our logs/.test(t));
ok('the hourly job logs only a number', /console\.log\(`cell-cleanup: deleted \$\{n\} cell\(s\)`\)/.test(cleanup) && !/console\.log\([^)]*(box|key)/.test(cleanup));
ok('no name, email or account is collected: the hello holds only a public key, tag and seat code, and the page has no field for them', /\{ pub: h\.pub, tag: h\.tag, seat: seatCode\(seatKey\) \}/.test(cellFn) && !/type="email"|autoComplete="(name|email)"/.test(page) && /A cell has no account, name or email/.test(t));
ok('the server refuses a send from a person who has not left a hello, and a sequence out of order', /no hello/.test(cellFn) && /error: 'seq'/.test(cellFn));
ok('the status endpoint is the on switch: the server answers 503 when CELL_ENABLED is not true', /CELL_ENABLED === 'true'/.test(cellFn) && /json\(503, \{ error: 'off' \}\)/.test(cellFn) && /api\/cell\?status/.test(page));
ok('the Terms name the preview status the page also names', /It is a preview that can change or stop/.test(t));

// The date is also what the cell page asks visitors to have agreed to.
ok('the cell page asks for agreement to the effective date of these Terms', /termsAcceptedFor\(LEGAL_EFFECTIVE_DATE\)/.test(page));
