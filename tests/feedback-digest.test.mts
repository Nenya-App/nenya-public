// The daily feedback digest, the mail interface, the shared field rules and the pointed-at label. No network: Netlify's API, the form and the sender are faked.
process.env.COACH_TICKET_SECRET = 'ticket-secret-ticket-secret-12345';
for (const k of ['FEEDBACK_DIGEST', 'FEEDBACK_NETLIFY_TOKEN', 'FEEDBACK_SITE_ID', 'SITE_ID', 'FEEDBACK_DIGEST_VIA', 'FEEDBACK_ADMIN_EMAIL', 'FEEDBACK_MAIL_URL']) delete process.env[k];
process.env.URL = 'https://dev.example.test';
const { runDigest, __useStoreForTests, __useSenderForTests } = await import('../netlify/functions/feedback-digest.mts');
const { feedbackProof } = await import('../src/lib/feedbackChecks.ts');
const { buildDigest, senderFromEnv, thankYouMail } = await import('../src/lib/feedbackMail.ts');
const { cleanEmail, cleanFeatures, cleanRoute, feedbackOn, featureLabel, FEATURE_IDS } = await import('../src/lib/feedback.ts');
const { describePick } = await import('../src/lib/feedbackPick.ts');
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const SECRET = process.env.COACH_TICKET_SECRET!;
const NOW = new Date('2026-11-20T07:00:00Z');
const note = (comment: string, at: string, proof = true, extra: any = {}) => {
  const f = { route: '/breath', picked: '', features: 'breathing,lens-insight', comment, ...extra };
  return { created_at: at, data: { ...f, checked: proof ? feedbackProof(SECRET, f) : 'f'.repeat(64) } };
};
const subs = [
  note('Newest good note, thank you', '2026-11-20T01:00:00Z'),
  note('Posted around the function', '2026-11-19T20:00:00Z', false),
  note('Older good note', '2026-11-19T10:00:00Z'),
  note('Before the window', '2026-11-18T10:00:00Z'),
];
const calls: { url: string; auth: string | null; body?: any }[] = [];
const fake = async (url: any, init: any = {}) => {
  const u = String(url);
  calls.push({ url: u, auth: init.headers?.Authorization ?? null, body: init.body });
  if (u.endsWith('/forms')) return new Response(JSON.stringify([{ id: 'f1', name: 'other' }, { id: 'f2', name: 'feedback' }]), { status: 200 });
  if (u.includes('/forms/f2/submissions')) return new Response(JSON.stringify(u.includes('page=1') ? subs : []), { status: 200 });
  if (u.startsWith('https://dev.example.test/')) return new Response(null, { status: 200 });
  return new Response('no', { status: 404 });
};
const mem = new Map<string, string>();
__useStoreForTests({ async get(k: string) { return mem.get(k) ?? null; }, async set(k: string, v: string) { mem.set(k, v); }, async getWithMetadata() { return null; } });
const sent: any[] = [];
__useSenderForTests({ async send(m) { sent.push(m); return true; } });

ok('off by default: nothing is read or sent', (await runDigest(NOW, fake as any)) === 'off' && calls.length === 0);
process.env.FEEDBACK_DIGEST = 'on';
ok('on without the token and site: a plain config answer, nothing sent', (await runDigest(NOW, fake as any)) === 'config' && calls.length === 0);
process.env.FEEDBACK_NETLIFY_TOKEN = 'tok'; process.env.SITE_ID = 'site-1';
const r = await runDigest(NOW, fake as any);
const form = calls.find((c) => c.url === 'https://dev.example.test/')?.body as FormData;
const digest = String(form?.get('digest') ?? '');
ok('the digest is delivered to the form "feedback-digest" (its notification is the email)', r === 'sent' && form.get('form-name') === 'feedback-digest');
ok('the Netlify API is asked with the token, for this site, and only the form named feedback', calls[0].auth === 'Bearer tok' && calls[0].url.includes('/sites/site-1/forms') && calls.some((c) => c.url.includes('/forms/f2/submissions')) && !calls.some((c) => c.url.includes('/forms/f1/')));
ok('it holds the two notes that passed their checks inside the window, oldest first, and nothing else', /2 feedback notes/.test(digest) && digest.indexOf('Older good note') < digest.indexOf('Newest good note') && !/around the function|Before the window/.test(digest));
ok('feature ids are read as names (the sixth lens by its lens name), and no address appears', /Breathing tool, Pattern lens/.test(digest) && !/@/.test(digest.replace('info@', '')));
ok('the time of the delivered digest is the only thing kept', mem.get('fb-digest/last') === NOW.toISOString() && [...mem.keys()].every((k) => k === 'fb-digest/last' || k.startsWith('m/')));
calls.length = 0;
ok('a second run in the same moment finds nothing new and sends nothing', (await runDigest(new Date('2026-11-20T07:01:00Z'), fake as any)) === 'quiet' && !calls.some((c) => c.url === 'https://dev.example.test/'));
mem.clear();
const failing = async (url: any, init: any) => (String(url).startsWith('https://dev.example.test/') ? new Response(null, { status: 500 }) : fake(url, init));
ok('a failed delivery leaves the window open (no time kept) so the notes go out next time', (await runDigest(NOW, failing as any)) === 'failed' && !mem.has('fb-digest/last'));
const down = async () => new Response('x', { status: 500 });
ok('Netlify unreachable: failed, nothing kept, nothing sent', (await runDigest(NOW, down as any)) === 'failed' && !mem.has('fb-digest/last'));
process.env.FEEDBACK_DIGEST_VIA = 'mail';
ok('mail delivery without an admin address is a config answer', (await runDigest(NOW, fake as any)) === 'config');
process.env.FEEDBACK_ADMIN_EMAIL = 'admin@example.test';
ok('mail delivery goes through the sender interface to the admin', (await runDigest(NOW, fake as any)) === 'sent' && sent.length === 1 && sent[0].to === 'admin@example.test' && /Newest good note/.test(sent[0].text));

ok('a quiet day builds no digest', buildDigest([], 'a', 'b') === null);
ok('with no mail address configured there is no sender, and a non-https one is refused', senderFromEnv({}) === null && senderFromEnv({ FEEDBACK_MAIL_URL: 'http://x.test' }) === null);
let seen: any = null;
const s = senderFromEnv({ FEEDBACK_MAIL_URL: 'https://relay.example.test/send', FEEDBACK_MAIL_TOKEN: 'abc', FEEDBACK_MAIL_FROM: 'feedback@example.test' }, (async (u: any, i: any) => { seen = { u, i }; return new Response(null, { status: 202 }); }) as any)!;
ok('the sender POSTs the one documented JSON shape with the token, and reports success', (await s.send({ to: 'a@b.co', subject: 'S', text: 'T' })) === true && seen.i.method === 'POST' && seen.i.headers.Authorization === 'Bearer abc' && JSON.parse(seen.i.body).from === 'feedback@example.test' && Object.keys(JSON.parse(seen.i.body)).sort().join() === 'from,subject,text,to');
const bad = senderFromEnv({ FEEDBACK_MAIL_URL: 'https://relay.example.test/send' }, (async () => { throw new Error('x'); }) as any)!;
ok('a sender that cannot reach its relay answers false, never throws', (await bad.send({ to: 'a@b.co', subject: 'S', text: 'T' })) === false);
ok('the thank-you never repeats a comment and says the address was not kept', !/comment:/i.test(thankYouMail('a@b.co').text) && /did not keep it/.test(thankYouMail('a@b.co').text) && thankYouMail('a@b.co').to === 'a@b.co');

ok('routes are a path only: query, fragment and odd characters are dropped', cleanRoute('/coach?id=9#x') === '/coach' && cleanRoute('https://evil.test/a') === '/' && cleanRoute(5) === '/' && cleanRoute('/a b<script>') === '/abscript');
ok('features: known ids only, once each, at most six', cleanFeatures(['coach', 'coach', 'zzz', 5, ...FEATURE_IDS]).length === 6 && cleanFeatures('x').length === 0);
ok('an email is one plain address; line breaks, spaces, angle brackets and lengths are refused', cleanEmail(' a@b.co ') === 'a@b.co' && cleanEmail('a@b') === '' && cleanEmail('a@b.co\nBcc: x@y.zz') === '' && cleanEmail('<a@b.co>') === '' && cleanEmail('a@b.co, c@d.co') === '' && cleanEmail('x'.repeat(250) + '@b.co') === '');
ok('every feature has an English label, and the lens ones use the lens words', FEATURE_IDS.every((id) => /^[A-Z][A-Za-z ]+$/.test(featureLabel(id))) && featureLabel('lens-insight') === 'Pattern lens' && !/gateway/i.test(FEATURE_IDS.map(featureLabel).join(' ')));
ok('the front-end switch reads as off with no env (a server, or production)', feedbackOn() === false);

const el = (tag: string, attrs: Record<string, string> = {}, text = '', parent: any = null, anc: Record<string, any> = {}): any => {
  const e: any = { tagName: tag.toUpperCase(), id: attrs.id ?? '', textContent: text, parentElement: parent, getAttribute: (n: string) => attrs[n] ?? null, closest: (sel: string) => anc[sel] ?? null };
  return e;
};
ok('pointing: the site\'s own feature name wins; an aria-label or a button\'s text names the rest', describePick(el('div', {}, '', null, { '[data-feedback-feature]': el('div', { 'data-feedback-feature': 'Breathing circle' }) })) === 'Breathing circle' && describePick(el('svg', {}, '', el('button', { 'aria-label': 'Open the Sight lens' }))) === 'button: Open the Sight lens' && describePick(el('span', {}, '', el('button', {}, '  Start   now '))) === 'button: Start now');
ok('pointing: a text field is only ever "a text field" (what is typed is never read), and a plain box gets its tag', describePick(el('textarea', {}, 'MY PRIVATE WORDS', null, { 'textarea, input, select, [contenteditable=""], [contenteditable="true"]': el('textarea') })) === 'a text field' && describePick(el('div', { id: 'x<y' })) === 'div#xy' && describePick(null) === '');

// the tool itself, read as source: the pieces a person relies on
const tool = readFileSync('src/app/components/FeedbackTool.tsx', 'utf8');
ok('the button, the list (the non-pointer way), "Something else", and Escape/Cancel for pointing are all there', /Give feedback/.test(tool) && /Point at something on the page/.test(tool) && /Or choose from the list/.test(tool) && /type="checkbox"/.test(tool) && /e\.key === 'Escape'/.test(tool) && /Cancel/.test(tool) && FEATURE_IDS.includes('other'));
ok('the email field is optional, never prefilled or remembered, and nothing is written to storage', /Email address \(optional\)/.test(tool) && /autoComplete="off"/.test(tool) && !/\brequired\b[^>]*value=\{email\}|value=\{email\}[^>]*\brequired\b/.test(tool) && /useState\(''\)/.test(tool) && !/localStorage|sessionStorage|indexedDB|document\.cookie/.test(tool));
ok('it renders nothing unless the switch is on, and is mounted once in the app', /if \(!feedbackOn\(\) \|\| !ready\) return null/.test(tool) && (readFileSync('src/app/App.tsx', 'utf8').match(/<FeedbackTool /g) ?? []).length === 1);
ok('every control has a visible name, the highlight has a two-colour edge, and nothing animates', !/transition|animate|motion/.test(tool.replace(/transition-/g, '')) && /border: '3px solid #ffffff'/.test(tool) && /outline: '3px solid #000000'/.test(tool) && /<Label htmlFor=\{ids\.comment\}>/.test(tool));

// switches and docs
const toml = readFileSync('netlify.toml', 'utf8');
const dev = toml.slice(toml.indexOf('[context.dev.environment]'), toml.indexOf('[functions]'));
const build = toml.slice(toml.indexOf('[build.environment]'), toml.indexOf('[context.dev.environment]'));
ok('VITE_FEEDBACK is on in dev builds and local dev only: not in the shared build block, not for production', /VITE_FEEDBACK = "on"/.test(dev) && !/VITE_FEEDBACK/.test(build) && /^VITE_FEEDBACK=on$/m.test(readFileSync('.env.development', 'utf8')));
const envDoc = readFileSync('docs/production-env.md', 'utf8');
ok('every new server variable is in docs/production-env.md', ['FEEDBACK_ENABLED', 'FEEDBACK_AUTOREPLY', 'FEEDBACK_PER_CONNECTION', 'FEEDBACK_DAILY_CAP', 'FEEDBACK_MIN_SEVERITY', 'FEEDBACK_MAIL_URL', 'FEEDBACK_MAIL_TOKEN', 'FEEDBACK_MAIL_FROM', 'FEEDBACK_DIGEST', 'FEEDBACK_NETLIFY_TOKEN', 'FEEDBACK_SITE_ID', 'FEEDBACK_DIGEST_VIA', 'FEEDBACK_ADMIN_EMAIL', 'VITE_FEEDBACK'].every((v) => envDoc.includes('`' + v + '`')));
const html = readFileSync('index.html', 'utf8');
ok('both Netlify forms exist in the built page, with a honeypot, and the email is in neither', /<form name="feedback" data-netlify="true" netlify-honeypot="bot-field"/.test(html) && /<form name="feedback-digest" data-netlify="true" netlify-honeypot="bot-field"/.test(html) && !/name="email"/.test(html.slice(html.indexOf('name="feedback"'), html.indexOf('exit-guard'))));
ok('the data register has the feedback rows', /Feedback notes \(`feedback` form/.test(readFileSync('docs/data-register.md', 'utf8')) && /fb-<code>/.test(readFileSync('docs/data-register.md', 'utf8')));
const legal = readFileSync('src/lib/legalDocument.ts', 'utf8');
ok('the Terms name the tool only behind the switch', /const FEEDBACK = import\.meta\.env\?\.VITE_FEEDBACK === 'on';/.test(legal) && /\.\.\.\(FEEDBACK \? \['A feedback note/.test(legal) && /\(FEEDBACK \? ' a feedback note \(Section 14\),' : ''\)/.test(legal));
