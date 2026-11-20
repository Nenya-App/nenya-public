// POST /api/feedback: off until switched on; every existing check runs before anything reaches the form; a failed note is dropped; the email is used once and never kept.
process.env.COACH_IP_SECRET = 'ip-secret-ip-secret-ip-secret';
process.env.COACH_TICKET_SECRET = 'ticket-secret-ticket-secret-12345';
for (const k of ['FEEDBACK_ENABLED', 'FEEDBACK_AUTOREPLY', 'FEEDBACK_PER_CONNECTION', 'FEEDBACK_DAILY_CAP', 'COACH_TURNSTILE', 'COACH_EXTRA_HOSTS', 'COACH_FORM_CHECK']) delete process.env[k];
const posted: FormData[] = [];
let formStatus = 200;
const turnstile: { reply: any; calls: number } = { reply: { success: true, action: 'feedback', hostname: 'nenya.biz' }, calls: 0 };
(globalThis as any).fetch = async (url: any, init: any) => {
  if (String(url).includes('challenges.cloudflare.com')) { turnstile.calls++; return new Response(JSON.stringify(turnstile.reply), { status: 200 }); }
  posted.push(init.body as FormData);
  return new Response(null, { status: formStatus });
};
const logged: string[] = [];
const oLog = console.log, oErr = console.error;
console.log = (...a: any[]) => { logged.push(a.join(' ')); oLog(...a); };
console.error = (...a: any[]) => { logged.push(a.join(' ')); oErr(...a); };
const { default: fn, __useStoreForTests, __useSenderForTests } = await import('../netlify/functions/feedback.mts');
const { proofHolds } = await import('../src/lib/feedbackChecks.ts');
const { readCounts, recentDays } = await import('../src/lib/counters.ts');
import { ok } from './helpers.mts';

const mem = new Map<string, { v: string; e: number }>();
const fakeStore = {
  async getWithMetadata(k: string) { const x = mem.get(k); return x ? { data: x.v, etag: String(x.e) } : null; },
  async get(k: string) { return mem.get(k)?.v ?? null; },
  async set(k: string, v: string, o: any) { const x = mem.get(k); if (o?.onlyIfNew && x) return { modified: false }; if (o?.onlyIfMatch && (!x || o.onlyIfMatch !== String(x.e))) return { modified: false }; mem.set(k, { v, e: (x?.e ?? 0) + 1 }); return { modified: true }; },
};
__useStoreForTests(fakeStore);
const sent: any[] = [];
__useSenderForTests({ async send(m) { sent.push(m); return true; } });
const GOOD = { route: '/breath?x=1#top', features: ['breathing', 'nope', 'breathing'], picked: 'button: Start', comment: 'The breathing circle is calm and I like how slowly it moves.' };
const call = async (body: any, o: { origin?: string | null; method?: string; type?: string; ip?: string; path?: string } = {}) => {
  const headers: Record<string, string> = { 'content-type': o.type ?? 'application/json' };
  if (o.origin !== null) headers.origin = o.origin ?? 'https://nenya.biz';
  const res = await fn(new Request(`https://nenya.biz${o.path ?? '/api/feedback'}`, { method: o.method ?? 'POST', headers, body: o.method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body) }), { ip: o.ip ?? '203.0.113.7' });
  const t = await res.text();
  return { status: res.status, json: t ? JSON.parse(t) : null };
};

let r = await call(GOOD);
ok('off until FEEDBACK_ENABLED=true, and nothing is filed', r.status === 503 && r.json.error === 'off' && posted.length === 0);
process.env.FEEDBACK_ENABLED = 'true';
r = await call(GOOD);
const f = posted[0];
ok('on: a good note is filed in the form "feedback" with only the path, the features, the pointed label, the comment and the proof', r.status === 200 && posted.length === 1 && f.get('form-name') === 'feedback' && f.get('route') === '/breath' && f.get('features') === 'breathing' && f.get('picked') === 'button: Start' && String(f.get('comment')).startsWith('The breathing circle') && [...f.keys()].sort().join() === 'bot-field,checked,comment,features,form-name,picked,route');
ok('the proof holds for the stored fields, and fails for an altered one or none', proofHolds(process.env.COACH_TICKET_SECRET, { route: '/breath', picked: 'button: Start', features: 'breathing', comment: String(f.get('comment')) }, f.get('checked')) && !proofHolds(process.env.COACH_TICKET_SECRET, { route: '/breath', picked: 'x', features: 'breathing', comment: String(f.get('comment')) }, f.get('checked')) && !proofHolds(process.env.COACH_TICKET_SECRET, { route: '/', picked: '', features: '', comment: 'x' }, undefined));
const n = posted.length;
ok('only POST, only JSON, only the public route', (await call(GOOD, { method: 'GET' })).status === 405 && (await call(GOOD, { type: 'text/plain' })).status === 415 && (await call(GOOD, { path: '/.netlify/functions/feedback' })).status === 404);
ok('another site, or no origin, is refused', (await call(GOOD, { origin: 'https://example.com' })).status === 403 && (await call(GOOD, { origin: null })).status === 403);
ok('bad JSON and an oversized body are refused', (await call('{nope')).status === 400 && (await call({ ...GOOD, comment: 'x'.repeat(9000) })).status === 413);
r = await call({ ...GOOD, website: 'http://spam' });
ok('the honeypot gets a pretend success and keeps nothing', r.status === 200 && posted.length === n);
ok('an empty or too-short comment is asked for again, and nothing is filed', (await call({ ...GOOD, comment: '  ' })).json.error === 'empty' && (await call({ ...GOOD, comment: 'Nice' })).json.error === 'short' && (await call({ ...GOOD, comment: 'asdfgh qwerty zxcvbn' })).json.error === 'unclear' && posted.length === n);
posted.length = 0;
await call({ ...GOOD, comment: 'Please write to jane.doe@example.com or call 612-555-0182 about this.' }, { ip: '198.51.100.20' });
const scrubbed = String(posted[0]?.get('comment') ?? '');
ok('an email address and a phone number in the comment are taken out before it is filed', posted.length === 1 && !/jane|example\.com|555/.test(scrubbed) && /\[EMAIL\]/.test(scrubbed));
ok('markup is removed and the length is limited', (() => { posted.length = 0; return true; })() && (await call({ ...GOOD, comment: '<b>bold</b> ' + 'word '.repeat(600) }, { ip: '198.51.100.21' })).status === 200 && !/<b>/.test(String(posted[0].get('comment'))) && String(posted[0].get('comment')).length <= 2000);

// the private list's matcher: a flagged note is refused and dropped
const lex = await import('../src/lib/lexiconStore.ts');
lex.__forgetLexiconForTests();
const CSV = 'term,category,target,severity,mode,cues,language,source,confidence,note\n"zorkblat","slur","group",3,"token","","en","test","high",""\n';
const { loadLexicon } = await import('../src/lib/lexiconLoader.ts');
const probe = loadLexicon(CSV).matcher;
const withList = { ...fakeStore, async get(k: string) { return k === lex.LEXICON_KEY ? CSV : (mem.get(k)?.v ?? null); } };
__useStoreForTests(withList);
posted.length = 0;
r = await call({ ...GOOD, comment: 'This app is for zorkblat people and I hate them all' }, { ip: '198.51.100.30' });
ok('(sanity) the test list compiles', !!probe);
ok('a note the private list flags is refused with 422, filed nowhere, and its words are not logged', r.status === 422 && r.json.error === 'language' && posted.length === 0 && !logged.join(' ').includes('zorkblat'));
r = await call(GOOD, { ip: '198.51.100.31' });
ok('with the list loaded, an ordinary note still passes', r.status === 200 && posted.length === 1);
__useStoreForTests(fakeStore); lex.__forgetLexiconForTests();

// limits
process.env.FEEDBACK_PER_CONNECTION = '2'; mem.clear(); posted.length = 0;
await call(GOOD, { ip: '198.51.100.40' }); await call(GOOD, { ip: '198.51.100.40' });
ok('a connection over its daily limit is refused (429), and another connection is not', (await call(GOOD, { ip: '198.51.100.40' })).status === 429 && (await call(GOOD, { ip: '198.51.100.41' })).status === 200);
ok('the limit keys sit under c/<day>/, where the daily cleanup deletes them, and hold only a one-way code', [...mem.keys()].filter((k) => k.includes('fb-')).every((k) => /^c\/\d{4}-\d\d-\d\d\/fb-(total|[0-9a-f]{32})$/.test(k)) && ![...mem.keys()].join().includes('198.51.100'));
delete process.env.FEEDBACK_PER_CONNECTION;
process.env.FEEDBACK_DAILY_CAP = '1'; mem.clear();
await call(GOOD, { ip: '198.51.100.50' });
ok('the daily cap for all connections is enforced', (await call(GOOD, { ip: '198.51.100.51' })).status === 429);
delete process.env.FEEDBACK_DAILY_CAP; mem.clear();

// Turnstile (the coach's check, action "feedback")
process.env.COACH_TURNSTILE = 'on'; process.env.TURNSTILE_SECRET_KEY = 'secret'; process.env.TURNSTILE_HOSTNAMES = 'nenya.biz';
posted.length = 0;
ok('Turnstile on: no token is refused (403) and nothing is filed', (await call(GOOD, { ip: '198.51.100.60' })).status === 403 && posted.length === 0);
ok('Turnstile on: a token Cloudflare accepts for this action passes', (await call({ ...GOOD, token: 'tok' }, { ip: '198.51.100.61' })).status === 200 && posted.length === 1);
turnstile.reply = { success: true, action: 'coach', hostname: 'nenya.biz' };
ok('a token made for the coach (another action) is refused', (await call({ ...GOOD, token: 'tok' }, { ip: '198.51.100.62' })).status === 403);
process.env.COACH_TURNSTILE = 'shadow'; posted.length = 0;
ok('shadow mode checks and counts but never refuses', (await call({ ...GOOD, token: 'tok' }, { ip: '198.51.100.63' })).status === 200 && posted.length === 1);
delete process.env.COACH_TURNSTILE; turnstile.reply = { success: true, action: 'feedback', hostname: 'nenya.biz' };

// the form refusing, and the email
formStatus = 500;
ok('when the form cannot take it the answer is a plain 502', (await call(GOOD, { ip: '198.51.100.70' })).status === 502);
formStatus = 200; posted.length = 0; sent.length = 0;
r = await call({ ...GOOD, email: 'visitor@example.org' }, { ip: '198.51.100.71' });
ok('autoreply off by default: an address is ignored, nothing is sent', r.status === 200 && r.json.thanked === null && sent.length === 0);
process.env.FEEDBACK_AUTOREPLY = 'on';
r = await call({ ...GOOD, email: 'visitor@example.org' }, { ip: '198.51.100.72' });
ok('autoreply on: one thank-you goes to the address, in fixed words that do not repeat the comment', r.json.thanked === true && sent.length === 1 && sent[0].to === 'visitor@example.org' && !sent[0].text.includes('breathing circle') && /did not keep it/.test(sent[0].text));
ok('the address is in no form field, no store key or value, no log line', ![...posted.at(-1)!.values()].join(' ').includes('visitor@') && ![...mem.entries()].join().includes('visitor@') && !logged.join(' ').includes('visitor@'));
sent.length = 0;
ok('an address that is not valid (or has a line break) is ignored, never sent to a sender', (await call({ ...GOOD, email: 'a@b.c\nBcc: x@y.z' }, { ip: '198.51.100.73' })).json.thanked === null && (await call({ ...GOOD, email: 'not an address' }, { ip: '198.51.100.74' })).json.thanked === null && sent.length === 0);
ok('no address at all is fine and nothing is sent', (await call(GOOD, { ip: '198.51.100.75' })).status === 200 && sent.length === 0);
__useSenderForTests({ async send() { return false; } });
r = await call({ ...GOOD, email: 'visitor@example.org' }, { ip: '198.51.100.76' });
ok('a sender that fails does not lose the note', r.status === 200 && r.json.thanked === false);
const c = await readCounts(fakeStore as any, recentDays(1)[0], ['feedback.received', 'feedback.refused.language', 'feedback.refused.limit', 'feedback.reply.sent', 'feedback.reply.failed']);
ok('plain counts are kept for what happened', c['feedback.received'] > 0 && c['feedback.reply.sent'] === 1 && c['feedback.reply.failed'] === 1, JSON.stringify(c));
ok('nothing about a note (comment, address, connection) is logged', !logged.join(' ').match(/breathing circle|visitor@|198\.51\.100|203\.0\.113/));
console.log = oLog; console.error = oErr;
