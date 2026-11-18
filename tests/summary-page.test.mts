// The "Request a summary" page (step 3, VITE_SUMMARY_REQUEST, off): the request, how every answer is read, and how the page uses it.
import { readFileSync } from 'node:fs';
import { readSummaryAnswer, summaryRequestBody, summaryRequestOn, SUMMARY_UI, SUMMARY_FAILED_TEXT } from '../src/lib/summaryRequest.ts';
import { SUMMARY_FLAGGED_LEAD } from '../src/lib/finalSummary.ts';
import { ok } from './helpers.mts';

const S = { color1: '#7a9b9e', color2: '#DAC682' };
const msgs = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
const proof = 'a'.repeat(64);

ok('the switch is off by default', summaryRequestOn() === false);
const b: any = summaryRequestBody({ session: S, messages: msgs, ticket: 't' });
ok('the request is the one the route expects: action summary, session, all ten messages, ticket; no context unless one was brought', b.action === 'summary' && b.session === S && b.messages.length === 10 && b.ticket === 't' && !('context' in b) && (summaryRequestBody({ session: S, messages: msgs, ticket: 't', context: 'C' }) as any).context === 'C');
const okr = readSummaryAnswer(200, { summary: 'You felt tired.', transcriptLine: 'x', text: 'You felt tired. x', proof, form: 'written' });
ok('a good answer gives the summary, the text and the proof to keep', okr.kind === 'ok' && okr.summary === 'You felt tired.' && okr.text === 'You felt tired. x' && okr.proof === proof && okr.credit === false);
ok('credit shows only when the server says it is needed', (readSummaryAnswer(200, { summary: 's', text: 's t', proof, credit: true }) as any).credit === true);
const fl = readSummaryAnswer(200, { refused: 'flagged', text: `${SUMMARY_FLAGGED_LEAD} Call 988.` });
ok('a flagged conversation shows the site\'s own text, as given', fl.kind === 'flagged' && fl.text === `${SUMMARY_FLAGGED_LEAD} Call 988.`);
ok('a cap shows a plain sentence and a failure shows the site\'s failure text', readSummaryAnswer(200, { refused: 'cap' }).kind === 'cap' && (readSummaryAnswer(200, { refused: 'failed' }) as any).text === SUMMARY_FAILED_TEXT);
ok('a switched-off server (503) means show nothing', readSummaryAnswer(503, { error: 'off' }).kind === 'off');
ok('anything unexpected is a plain error sentence, never a half-shown summary', ['{}', 'null', '"x"'].every((x) => readSummaryAnswer(200, JSON.parse(x)).kind === 'error') && readSummaryAnswer(400, { error: 'bad' }).kind === 'error' && readSummaryAnswer(200, { summary: 's', text: 't', proof: 'short' }).kind === 'error' && readSummaryAnswer(200, { summary: '', text: 't', proof }).kind === 'error');
ok('the words say what a summary is and is not', /how the AI read what you wrote\. It is not a record/.test(SUMMARY_UI.note) && /exact record/.test(SUMMARY_UI.note) && /Summary of this conversation, written by the AI/.test(SUMMARY_UI.label));

const comp = readFileSync('src/coach/SummaryRequest.tsx', 'utf8');
const demo = readFileSync('src/coach/CoachDemo.tsx', 'utf8');
const tools = readFileSync('src/coach/TranscriptTools.tsx', 'utf8');
ok('the button never runs by itself: it asks only on a press', /onClick=\{request\}/.test(comp) && !/useEffect/.test(comp));
ok('it is a real button with a description, at least 44px, and a polite live region says what it is doing', /min-h-11/.test(comp) && /aria-describedby="summary-note"/.test(comp) && /role="status" aria-live="polite"/.test(comp));
ok('one summary per conversation: once there is one the button is gone and there is no second request', /state !== 'done' && \(/.test(comp) && /if \(busy\.current \|\| state === 'done'\) return;/.test(comp));
ok('the result is its own labelled block, with the credit and link only when needed', /aria-labelledby="summary-title"/.test(comp) && /outcome\.credit &&/.test(comp) && /SUMMARY_CREDIT_LINK/.test(comp));
ok('a switched-off server hides the button entirely', /if \(outcome\?\.kind === 'off'\) return null;/.test(comp));
ok('nothing is stored or sent from the component beyond the one request', !/localStorage|sessionStorage|indexedDB|document\.cookie|countEvent/.test(comp));
ok('the page shows it only behind the switch, after the closing, on a finished unflagged conversation', /stage === 'done' && !flag && summaryRequestOn\(\) && !!ticket && messages\.filter\(\(m\) => m\.role === 'user'\)\.length === MAX_TURNS/.test(demo) && demo.indexOf('pageBubble(CLOSING)') < demo.indexOf('<SummaryRequest'));
ok('the summary is kept in the page and given to both transcript tools; it resets with a new conversation', (demo.match(/summary=\{summary\}/g) ?? []).length === 2 && /setSummary\(null\)/.test(demo));
ok('the signed transcript carries the summary only if there is one: it is sent in the receipt request with its proof, and the unsigned copy uses it too', /\.\.\.\(summary \? \{ summary: \{ text: summary\.text, proof: summary\.proof \} \} : \{\}\)/.test(tools) && (tools.match(/editList, summary\?\.text \?\? null\)/g) ?? []).length === 2);
ok('a new summary clears the cached receipt so the next download includes it', /\[messages\.length, summary\?\.text\]/.test(tools));
ok('the sealed route does not use this page, so it has no button', !/SummaryRequest|summaryRequest/.test(readFileSync('src/coach/SealedChat.tsx', 'utf8')));
