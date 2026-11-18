// The requested summary (action "summary" of netlify/functions/coach.mts, COACH_SUMMARY_REQUEST=on; docs/request-a-summary-scope.md), with the model stubbed.
import { generateKeyPairSync } from 'node:crypto';
import { ok } from './helpers.mts';
import { signedProblem } from '../src/lib/signedCheck.ts';
import { siteMessagesFor } from '../src/lib/siteMessages.ts';
import { readableTranscript } from '../src/lib/transcript.ts';
import { countTurn } from '../src/lib/dailyCap.ts';
import { checkConversation } from '../src/lib/safetyFlags.ts';
import { SUMMARY_FLAGGED_LEAD, TRANSCRIPT_LINES } from '../src/lib/finalSummary.ts';

const GOOD = 'You felt worn down and unheard at home. You were looking for rest and for being understood by the people close to you. You also named how much you care about doing right by your family. It took honesty to say all of that out loud.';
process.env.COACH_ENABLED = 'true'; process.env.COACH_PROVIDER = 'venice'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = 's3cret-s3cret-s3cret'; process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_INSTRUCTIONS = 'v2.1'; delete process.env.COACH_EXTRA_HOSTS; delete process.env.COACH_FINAL_SUMMARY; delete process.env.COACH_SUMMARY_FORM;
let summaries: string[] = [];
let summaryCalls = 0;
let lastSummaryInput = '';
(globalThis as any).fetch = async (_u: string, init: any) => {
  const system = JSON.parse(init.body).messages[0].content as string;
  const isSummary = /^You (?:write the last part|read a short conversation)/.test(system);
  if (isSummary) { summaryCalls++; lastSummaryInput = JSON.parse(init.body).messages[1].content; }
  return new Response(JSON.stringify({ choices: [{ message: { content: isSummary ? (summaries.shift() ?? '') : 'That sounds like a lot to hold, and you said it plainly.' } }] }), { status: 200 });
};
const { default: handler, __useStoreForTests } = await import('../netlify/functions/coach.mts');
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const post = async (body: unknown): Promise<{ status: number; j: any }> => {
  const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify(body) }));
  return { status: res.status, j: await res.json() };
};
const play = async (users: string[]): Promise<{ msgs: { role: string; content: string }[]; ticket: string; last: any }> => {
  const msgs: { role: string; content: string }[] = [];
  let ticket = '', last: any;
  for (const u of users) {
    msgs.push({ role: 'user', content: u });
    last = (await post({ session: SESSION, messages: msgs, ticket: ticket || undefined })).j;
    msgs.push({ role: 'assistant', content: last.reply });
    ticket = last.ticket;
  }
  return { msgs, ticket, last };
};
const ordinary = Array.from({ length: 5 }, (_, i) => `I have been feeling tired and unheard at home, message number ${i + 1}.`);
const finished = await play(ordinary);
const ask = (extra: Record<string, unknown> = {}) => post({ action: 'summary', session: SESSION, messages: finished.msgs, ticket: finished.ticket, ...extra });

delete process.env.COACH_SUMMARY_REQUEST;
ok('with the switch off the request is refused and no model is called', (await ask()).status === 503 && summaryCalls === 0);
process.env.COACH_SUMMARY_REQUEST = 'on';
summaries = [GOOD];
let r = await ask();
ok('on, a finished conversation with its ticket gets one summary and a transcript sentence from the pool', r.status === 200 && r.j.summary === GOOD && TRANSCRIPT_LINES.includes(r.j.transcriptLine) && r.j.form === 'written' && summaryCalls === 1, JSON.stringify(r.j));
ok('the summary call is given the whole conversation: both the person\'s messages and the coach\'s replies, labelled', /The person: I have been feeling tired/.test(lastSummaryInput) && /The coach: That sounds like a lot to hold/.test(lastSummaryInput));
ok('the response carries the text as shown (summary and the site\'s sentence) and a proof', r.j.text === `${GOOD} ${r.j.transcriptLine}` && /^[0-9a-f]{64}$/.test(r.j.proof));
const receiptWith = async (summary: unknown, msgs = finished.msgs, ticket = finished.ticket) => (await post({ action: 'receipt', session: SESSION, messages: msgs, ticket, ...(summary !== undefined ? { summary } : {}) })).j;
{
  const withS = await receiptWith({ text: r.j.text, proof: r.j.proof });
  const sm = withS.transcript.site.filter((x: any) => x.kind === 'summary');
  ok('a receipt asked with a proven summary carries it as a site message after the closing, and the signed transcript still verifies', sm.length === 1 && sm[0].after === 9 && sm[0].text === r.j.text && withS.transcript.site.findIndex((x: any) => x.kind === 'closing') < withS.transcript.site.findIndex((x: any) => x.kind === 'summary') && signedProblem({ transcript: withS.transcript, receipt: withS.receipt }) === null, String(signedProblem({ transcript: withS.transcript, receipt: withS.receipt })));
  const plain = await receiptWith(undefined);
  ok('without a summary the transcript has none and verifies as before', plain.transcript.site.every((x: any) => x.kind !== 'summary') && signedProblem({ transcript: plain.transcript, receipt: plain.receipt }) === null);
  const other = await play(ordinary.map((t) => t.replace('tired and unheard', 'worn out and alone')));
  const forged = [await receiptWith({ text: r.j.text, proof: 'f'.repeat(64) }), await receiptWith({ text: r.j.text + ' And more words.', proof: r.j.proof }), await receiptWith({ text: r.j.text, proof: r.j.proof }, other.msgs, other.ticket)];
  ok('a forged proof, changed words, or a proof moved to another conversation are ignored (the transcript is made without the summary)', forged.every((f) => f.transcript && f.transcript.site.every((x: any) => x.kind !== 'summary')));
  const readable = readableTranscript(withS.transcript.messages, withS.transcript.session, withS.receipt, '', withS.transcript.meta, withS.transcript.site);
  ok('the readable copy labels the summary as the AI\'s reading, not a record', /Summary you asked for \(the AI's reading of what you wrote, not a record/.test(readable));
  ok('the page\'s own copy (siteMessagesFor) shows the summary only on a finished, unflagged conversation', siteMessagesFor(finished.msgs as any, 5, [], '', [], [], 'S text.').some((x) => x.kind === 'summary') && !siteMessagesFor(finished.msgs.slice(0, 8) as any, 5, [], '', [], [], 'S text.').some((x) => x.kind === 'summary'));
}
ok('a tampered ticket, an altered message and a wrong session are refused', (await ask({ ticket: finished.ticket.slice(0, -2) + 'xx' })).status === 400 && (await ask({ messages: finished.msgs.map((m, i) => (i === 2 ? { ...m, content: m.content + ' x' } : m)) })).status === 400 && (await ask({ session: { color1: '#000000', color2: '#ffffff' } })).status === 400);
const early = await play(ordinary.slice(0, 4));
ok('a conversation of fewer than five exchanges is refused', (await post({ action: 'summary', session: SESSION, messages: early.msgs, ticket: early.ticket })).status === 400);
summaries = ['What are you hoping for next? Tell me more.', "I'll remember you and be here for you."];
r = await ask();
ok('a summary that fails its checks twice is refused as failed, with no text', r.j.refused === 'failed' && r.j.summary === undefined, JSON.stringify(r.j));
process.env.COACH_SUMMARY_FORM = 'picked';
summaries = ['Feelings: tired, lonely\nNeeds: rest, understanding\nCare: You kept saying it out loud, and that takes courage.'];
r = await ask();
ok('in the picked form the site writes the summary from the chosen words and says the credit is needed', r.j.form === 'picked' && r.j.credit === true && /^You felt tired and lonely\. You were looking for rest and understanding\./.test(r.j.summary), JSON.stringify(r.j));
delete process.env.COACH_SUMMARY_FORM;

// A conversation the safety checks flag gets the fixed sentence and no model call. A message of the soften tier lets the conversation go on to five exchanges.
const soft = ['I feel so hopeless and worthless lately.', "I'm killing myself at work with these deadlines"].find((t) => checkConversation([t])?.tier === 'soften');
if (soft) {
  const flaggedConv = await play([soft, ...ordinary.slice(1)]);
  summaryCalls = 0;
  const f = await post({ action: 'summary', session: SESSION, messages: flaggedConv.msgs, ticket: flaggedConv.ticket });
  ok('a flagged conversation gets the site\'s fixed sentence and its distress sentence, and no model is called', f.j.refused === 'flagged' && f.j.text.startsWith(SUMMARY_FLAGGED_LEAD) && summaryCalls === 0, JSON.stringify(f.j).slice(0, 300));
} else ok('(no soften-tier message found to test a flagged conversation; the check itself is exercised by the crisis tests)', true);

// The request counts against the daily cap as one turn.
{
  const mem = new Map<string, { v: string; e: number }>();
  __useStoreForTests({
    async get(k: string) { return mem.get(k)?.v ?? null; },
    async getWithMetadata(k: string) { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
    async set(k: string, v: string, o: any = {}) { const x = mem.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true, etag: String((x?.e ?? 0) + 1) }; },
    async setJSON(k: string, v: unknown) { mem.set(k, { v: JSON.stringify(v), e: (mem.get(k)?.e ?? 0) + 1 }); },
    async list({ prefix = '' }: { prefix?: string } = {}) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(k: string) { mem.delete(k); },
  } as any);
  process.env.COACH_DAILY_CAP = '3';
  const st: any = { getWithMetadata: async (k: string) => { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; }, set: async (k: string, v: string, o: any = {}) => { const x = mem.get(k); if (o.onlyIfNew && x) return { modified: false }; if (o.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; } };
  await countTurn(st, 3, true); await countTurn(st, 3, true); await countTurn(st, 3, true);
  summaryCalls = 0; summaries = [GOOD];
  r = await ask();
  ok('when the day\'s cap is reached the request is refused as cap and no model is called', r.j.refused === 'cap' && summaryCalls === 0, JSON.stringify(r.j));
  delete process.env.COACH_DAILY_CAP;
}
delete process.env.COACH_SUMMARY_REQUEST;
