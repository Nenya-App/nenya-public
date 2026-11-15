// The site's edits to a reply (a sentence put in front, sentences taken out by the mirror guard) through the real coach function, with a model that mirrors:
// the server reports each with a proof, the receipt records only the ones it can prove, and a forged, moved or altered proof is ignored. No model call.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_FORM_CHECK = 'off'; process.env.COACH_VALUES = 'on';
delete process.env.COACH_IP_SECRET; delete process.env.COACH_DISTRESS_TEXT; delete process.env.COACH_INSTRUCTIONS; delete process.env.COACH_SCREEN; delete process.env.COACH_EXTRA_HOSTS;
let modelSays = 'It must be really tough to feel this way. What has happened that brought you to this?';
(globalThis as any).fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: modelSays } }] }), { status: 200 });
const { default: coach } = await import('../netlify/functions/coach.mts');
import { ok } from './helpers.mts';

const S = { color1: '#7a9b9e', color2: '#DAC682' };
const post = async (body: object) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify(body) }))).json() as Promise<any>;
const m: { role: 'user' | 'assistant'; content: string }[] = [];
let ticket: string | undefined;
const turn = async (text: string) => { m.push({ role: 'user', content: text }); const j = await post({ messages: m, session: S, ticket }); m.push({ role: 'assistant', content: j.reply }); ticket = j.ticket; return j; };

const first = await turn('I think we should just kill them all.');
const kinds = (first.edits ?? []).map((e: any) => e.kind);
ok('a mirroring reply during a call to harm: the server reports the added sentence and the removal, each with a 64-character proof', kinds.includes('added') && kinds.includes('removed') && first.edits.every((e: any) => typeof e.proof === 'string' && e.proof.length === 64 && e.n >= 1), JSON.stringify(first.edits));
const removed = first.edits.find((e: any) => e.kind === 'removed');
modelSays = 'What has happened that brought you to this?';
const plain = await turn('My week was long and my boss was short with me.');
ok('a turn the site did not touch reports no edits', plain.edits === undefined || plain.edits.length === 0);
modelSays = 'It must be really tough to feel this way. What has happened?';
await turn('I think we should just kill them all.'); await turn('They are all evil.'); await turn('I wish they would all die.');

const receipt = async (edits: unknown) => post({ action: 'receipt', session: S, messages: m, ticket, ...(edits ? { edits } : {}) });
const withProof = first.edits.map((e: any) => ({ after: 1, kind: e.kind, n: e.n, proof: e.proof }));
const good = await receipt(withProof);
const marks = good.transcript.site.filter((x: any) => x.kind === 'edit');
ok('proven edits are recorded in the signed transcript right after the reply they changed', marks.length === 2 && marks.every((x: any) => x.after === 1));
ok('the added-sentence mark says the site wrote it, and the removal mark gives the count and not the words', marks.some((x: any) => /added the opening sentence/.test(x.text) && /not by the AI/.test(x.text)) && marks.some((x: any) => new RegExp(`removed ${removed.n === 1 ? 'one sentence' : `${removed.n} sentences`}`).test(x.text) && !/must be really tough/.test(x.text)));
ok('with no edits sent, none is recorded', (await receipt(undefined)).transcript.site.every((x: any) => x.kind !== 'edit'));
const bad = async (patch: object) => (await receipt([{ ...withProof[1], ...patch }])).transcript.site.every((x: any) => x.kind !== 'edit');
ok('a forged proof is ignored', await bad({ proof: 'f'.repeat(64) }));
ok('a proof moved to another reply is ignored', await bad({ after: 3 }));
ok('a changed count or kind is ignored', (await bad({ n: removed.n + 1 })) && (await bad({ kind: 'added' })));
ok('a signed transcript carrying edit marks has a receipt', !!good.receipt);
