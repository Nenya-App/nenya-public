// The terms receipt: signed by the site, held for the visit, carried into a signed transcript and a consent receipt, and never an identifier.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
const kp = generateKeyPairSync('ed25519');
const other = generateKeyPairSync('ed25519');
const KEY = (kp.privateKey.export({ type: 'pkcs8', format: 'der' }) as Buffer).toString('base64');
const OTHER = (other.privateKey.export({ type: 'pkcs8', format: 'der' }) as Buffer).toString('base64');
process.env.COACH_ENABLED = 'true'; process.env.COACH_ABOUT_ANSWERS = 'off'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2'; process.env.COACH_SIGNING_KEY = KEY;
delete process.env.COACH_IP_SECRET; delete process.env.COACH_ARC; delete process.env.COACH_VALUES;
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'What are you noticing?' } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
// device storage stubs: local (kept by choice) and session (the visit)
const local: Record<string, string> = {}; const sess: Record<string, string> = {};
const mk = (st: Record<string, string>) => ({ get length() { return Object.keys(st).length; }, key: (i: number) => Object.keys(st)[i] ?? null, getItem: (k: string) => (k in st ? st[k] : null), setItem: (k: string, v: string) => { st[k] = String(v); }, removeItem: (k: string) => { delete st[k]; } });
(globalThis as any).localStorage = mk(local); (globalThis as any).sessionStorage = mk(sess); (globalThis as any).window = { addEventListener() {}, removeEventListener() {} };
const { signTerms, verifyTerms, termsFromOurKey } = await import('../src/lib/termsReceipt.ts');
const dm = await import('../src/lib/deviceMemory.ts');
const { agreeToTerms } = await import('../src/lib/visitConsent.ts');
const { default: handler } = await import('../netlify/functions/coach.mts');
const { default: agree } = await import('../netlify/functions/terms-agree.mts');
const { signedProblem } = await import('../src/lib/signedCheck.ts');
const { LEGAL_EFFECTIVE_DATE } = await import('../src/lib/legalDocument.ts');
import { ok } from './helpers.mts';

// ---- the receipt
const now = new Date('2026-11-10T12:00:00.000Z');
const r = signTerms('November 9, 2026', '1.1.0-dev+abc1234', now, KEY)!;
ok('a signed receipt holds the Terms date, the time, the build and a signature, and no address or identifier', r.terms === 'November 9, 2026' && r.agreedAt === now.toISOString() && r.build === '1.1.0-dev+abc1234' && !!r.signature && Object.keys(r).sort().join() === 'agreedAt,build,keyId,kind,publicKey,signature,terms,v');
ok('it verifies, and changing the date, the time or the build breaks it', verifyTerms(r) && !verifyTerms({ ...r, terms: 'November 1, 2026' }) && !verifyTerms({ ...r, agreedAt: '2026-11-11T12:00:00.000Z' }) && !verifyTerms({ ...r, build: 'x' }));
ok('without a signing key there is no receipt', signTerms('x', 'b', now, undefined) === null);
const theirs = signTerms('November 9, 2026', 'b', now, OTHER)!;
ok('a receipt signed by another key is not accepted as ours; neither is one from the future or garbage', termsFromOurKey(theirs, r.keyId) === null && termsFromOurKey(r, r.keyId, now) !== null && termsFromOurKey(signTerms('t', 'b', new Date(Date.now() + 3600_000), KEY), r.keyId) === null && termsFromOurKey({ nope: 1 }, r.keyId) === null);

// ---- the route
const post = (body = '{}', origin = 'https://nenya.biz') => agree(new Request('https://nenya.biz/api/terms-agree', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body }));
const a = await post();
const aj: any = await a.json();
ok('the route signs the Terms version the site is on, and stores nothing', a.status === 200 && aj.receipt.terms === LEGAL_EFFECTIVE_DATE && verifyTerms(aj.receipt) && a.headers.get('cache-control') === 'no-store');
ok('it refuses other methods and other origins', (await agree(new Request('https://nenya.biz/api/terms-agree', { method: 'GET' }))).status === 405 && (await post('{}', 'https://evil.example')).status === 403);

// ---- held for the visit
ok('nothing is held at the start', dm.getTermsRecord() === null && !dm.termsAcceptedFor(LEGAL_EFFECTIVE_DATE));
await agreeToTerms(async () => new Response(JSON.stringify(aj), { status: 200 }) as any);
ok('agreeing holds the signed receipt in this visit\'s storage only, and a reload counts as agreed', !!sess['nenya.terms.receipt'] && local['nenya.terms.receipt'] === undefined && dm.termsAcceptedFor(LEGAL_EFFECTIVE_DATE) && (dm.getTermsRecord() as any).receipt.signature === aj.receipt.signature);
ok('another Terms version is not counted as agreed', !dm.termsAcceptedFor('January 1, 2030'));
dm.wipeDevice({ keepOwner: true });
ok('Forget me / Emergency Exit clear the visit\'s agreement', !sess['nenya.terms.receipt'] && !dm.termsAcceptedFor(LEGAL_EFFECTIVE_DATE));
await agreeToTerms(async () => { throw new Error('offline'); });
ok('if the site cannot sign, the agreement is still held, as an unsigned note that is never sent as a receipt', dm.termsAcceptedFor(LEGAL_EFFECTIVE_DATE) && (dm.getTermsRecord() as any).receipt === undefined);
dm.wipeDevice({ keepOwner: true });
dm.setRemembering(true);
await agreeToTerms(async () => new Response(JSON.stringify(aj), { status: 200 }) as any);
ok('with "Remember on this device" on, the same record is kept on the device too', !!local['nenya.terms.receipt'] && local['nenya.terms'] === LEGAL_EFFECTIVE_DATE);
for (const k of Object.keys(sess)) delete sess[k]; // the tab closed
ok('and survives the tab closing (by choice)', dm.termsAcceptedFor(LEGAL_EFFECTIVE_DATE) && !!dm.getTermsRecord()?.receipt);
dm.setRemembering(false);
ok('turning it off erases what was kept', local['nenya.terms.receipt'] === undefined && local['nenya.terms'] === undefined);
dm.wipeDevice({ keepOwner: false });

// ---- carried into the signed transcript
const SESSION = { color1: '#7a9b9e', color2: '#DAC682' };
const chat = async (texts: string[]) => { let h: any[] = []; let t: string | undefined; for (const x of texts) { h = [...h, { role: 'user', content: x }]; const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: h, session: SESSION, ...(t ? { ticket: t } : {}) }) })); const j: any = await res.json(); t = j.ticket; h = [...h, { role: 'assistant', content: j.reply }]; } return { h, t }; };
const { h, t } = await chat(['I had a hard day.']);
const sign = async (terms?: unknown) => { const res = await handler(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ action: 'receipt', messages: h, session: SESSION, ticket: t, ...(terms ? { terms } : {}) }) })); return (await res.json()) as any; };
const withTerms = await sign(aj.receipt);
ok('a valid terms receipt goes inside the signed transcript\'s meta (so it is covered by the signature)', withTerms.transcript.meta.terms.terms === LEGAL_EFFECTIVE_DATE && withTerms.transcript.meta.terms.agreedAt === aj.receipt.agreedAt && signedProblem({ transcript: withTerms.transcript, receipt: withTerms.receipt }) === null);
const without = await sign();
ok('without one, the transcript has no terms field and is as before', without.transcript.meta.terms === undefined && signedProblem({ transcript: without.transcript, receipt: without.receipt }) === null);
const forged = await sign({ ...aj.receipt, agreedAt: '2020-01-01T00:00:00.000Z' });
ok('a forged or changed receipt is ignored, not copied', forged.transcript.meta.terms === undefined);
const foreign = await sign(theirs);
ok('a receipt signed by another key is ignored', foreign.transcript.meta.terms === undefined);
const { readableTranscript } = await import('../src/lib/transcript.ts');
const text = readableTranscript(withTerms.transcript.messages, withTerms.transcript.session, withTerms.receipt, '', withTerms.transcript.meta, withTerms.transcript.site ?? []);
ok('the readable copy says when the Terms were agreed; one without it reads as before', /Terms agreed during this visit: the Terms of Use and Privacy Policy dated /.test(text) && !/Terms agreed/.test(readableTranscript(without.transcript.messages, without.transcript.session, without.receipt, '', without.transcript.meta, without.transcript.site ?? [])));
const bad = { ...withTerms.transcript, meta: { ...withTerms.transcript.meta, terms: { terms: 5 } } };
ok('a transcript whose terms field is the wrong shape is refused by the checker', signedProblem({ transcript: bad, receipt: withTerms.receipt }) !== null);

// ---- carried into the consent receipt (the report route passes the transcript's own signed terms facts to it)
const { signConsent, verifyConsent } = await import('../src/lib/consentReceipt.ts');
const { parseChoices } = await import('../src/lib/transcriptPolicy.ts');
const choices = parseChoices({ adult: true, keep: '30d', uses: ['evaluate'] })!;
const cr = signConsent('a'.repeat(64), choices, now, KEY, withTerms.transcript.meta.terms)!;
ok('the consent receipt copies the agreement, and its signature covers it', cr.termsAgreed?.agreedAt === aj.receipt.agreedAt && cr.termsAgreed?.terms === LEGAL_EFFECTIVE_DATE && verifyConsent(cr) && !verifyConsent({ ...cr, termsAgreed: null }) && !verifyConsent({ ...cr, termsAgreed: { ...cr.termsAgreed!, agreedAt: '2020-01-01T00:00:00.000Z' } }));
ok('with no agreement recorded it says null, and still verifies', signConsent('b'.repeat(64), choices, now, KEY)!.termsAgreed === null && verifyConsent(signConsent('b'.repeat(64), choices, now, KEY)!));
