// The address guard (src/lib/addressGuard.ts, docs/address-guard.md): every web address in a coach reply is checked against the addresses the site itself uses; a wrong one is swapped for
// findahelpline.com (in a sentence about finding help) or taken out. Pure tests first, then through the real coach function with a stand-in model. No model call, no network.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
process.env.COACH_ENABLED = 'true'; process.env.VENICE_API_KEY = 'k'; process.env.COACH_PROVIDER = 'venice'; process.env.COACH_TICKET_SECRET = randomBytes(24).toString('hex'); process.env.COACH_MODEL = 'deepseek-v3.2';
process.env.COACH_SIGNING_KEY = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64');
process.env.COACH_FORM_CHECK = 'off'; process.env.COACH_DISTRESS_TEXT = 'on'; process.env.COACH_INSTRUCTIONS = 'v2.1';
for (const k of ['COACH_IP_SECRET', 'COACH_VALUES', 'COACH_SCREEN', 'COACH_EXTRA_HOSTS', 'COACH_ADDRESS_GUARD', 'COACH_ARC', 'COACH_BOUNDARY_GUARD']) delete process.env[k];
let says: string[] = [];
let calls = 0;
(globalThis as any).fetch = async () => { calls++; return new Response(JSON.stringify({ choices: [{ message: { content: says.length > 1 ? says.shift()! : says[0] } }] }), { status: 200 }); };
const { default: coach, __trace } = await import('../netlify/functions/coach.mts');
const { findAddresses, repairAddresses, hasOnlyAllowedAddresses, addressGuardOn, ALLOWED_ADDRESSES, HELPLINE_ADDRESS, ADDRESS_FALLBACK } = await import('../src/lib/addressGuard.ts');
const { KNOWN_RESOURCE_DOMAINS } = await import('../src/lib/externalLinks.ts');
const { ABOUT_IDS, aboutPath } = await import('../src/lib/aboutRoutes.ts');
const { present } = await import('../src/lib/personaChecks.ts');
const { reviewEnv } = await import('../src/lib/envReview.ts');
import { ok } from './helpers.mts';

const fix = (t: string) => repairAddresses(t).reply;

// ---- the owner's run of 2026-11-24: the four wrong addresses, in the sentences the coach wrote
const OWNER: [string, string][] = [
  ["I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US or Canada, or find a helpline at helpaghelp.com.", "I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US or Canada, or find a helpline at findahelpline.com."],
  ['Since I am an AI, I cannot help in a crisis, so please reach out to someone you trust or call or text 988 in the US and Canada, or findhelpline.com', 'Since I am an AI, I cannot help in a crisis, so please reach out to someone you trust or call or text 988 in the US and Canada, or findahelpline.com'],
  ['If you are in distress, please reach out to someone you trust, or call or text 988 in the US and Canada, or find a helpline at helpaglobal.com', 'If you are in distress, please reach out to someone you trust, or call or text 988 in the US and Canada, or find a helpline at findahelpline.com'],
  ['If you are feeling overwhelmed, please reach out to someone you trust or call or text 988 in the US and Canada, or visit helpahline.com', 'If you are feeling overwhelmed, please reach out to someone you trust or call or text 988 in the US and Canada, or visit findahelpline.com'],
  ["I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US and Canada, or find a helpline at helpageline.com.", "I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US and Canada, or find a helpline at findahelpline.com."],
  ["I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US or Canada, or find a helpline at helpline.com.", "I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US or Canada, or find a helpline at findahelpline.com."],
];
ok('the wrong addresses from the owner\'s run are swapped for findahelpline.com, and the rest of the sentence is exactly as written', OWNER.every(([a, b]) => fix(a) === b), OWNER.filter(([a, b]) => fix(a) !== b).map(([a]) => fix(a)).join(' | '));
ok('the four named wrong addresses (findhelpline.com, helpaglobal.com, helpaghelp.com, helpahline.com) are found as not allowed', ['findhelpline.com', 'helpaglobal.com', 'helpaghelp.com', 'helpahline.com'].every((h) => { const f = findAddresses(`Find a helpline at ${h}.`); return f.length === 1 && !f[0].allowed && f[0].raw === h; }));

// ---- other wrong forms in a help sentence
const HELP = 'If you need to talk to someone, you can find a helpline in your country at ';
const OTHER = ['findahelpline.org', 'findahelpline.net', 'https://findahelpline.org', 'http://www.findhelpline.com/', 'https://www.helpaglobal.com/countries/us', 'findahelpline.ca', 'FINDHELPLINE.COM', 'find-a-helpline.com', 'findahelpline.com/countries/us', 'findahelpline.com:8080', 'findahelplíne.com', 'findahelpline.com.au', 'help.findahelpline.com', 'findahelpline . org', 'findhelpline dot com', 'findhelpline[.]com', 'findhelpline (dot) com', 'iasp.org', 'findahelpline.help'];
const bad = OTHER.filter((o) => { const r = repairAddresses(HELP + o + '.'); return r.reply !== HELP + (o.startsWith('http') ? 'https://' : '') + 'findahelpline.com.' || r.swapped !== 1; });
ok('other wrong or look-alike forms (other endings, www, https, a path, a port, a sub-domain, an accented letter, spelled-out dots) are swapped too', bad.length === 0, bad.map((o) => fix(HELP + o + '.')).join(' | '));
ok('a spelled-out or spaced form is found as an address', ['findhelpline dot com', 'findhelpline . com', 'findhelpline[.]com', 'findhelpline (dot) com', 'findhelpline DOT com'].every((s) => findAddresses(`Visit ${s} today`).length === 1));
ok('the allowed address in a longer URL form (a path, a query, a port) is not on the list, so it is swapped for the exact one', fix('Find a helpline at https://findahelpline.com/countries/us?x=1 any time.') === 'Find a helpline at https://findahelpline.com any time.');

// ---- addresses that are correct are never altered
const CORRECT = [
  'You can find a helpline at findahelpline.com.',
  'Find one at findahelpline.com, or call 988.',
  'See https://findahelpline.com or nenya.biz.',
  'Visit www.findahelpline.com for lines in other countries.',
  'FindAHelpline.com lists lines in other countries.',
  'The site is nenya.biz, and the page is nenya.biz/about/privacy-promise.',
  'Read nenya.biz/my-transcript, nenya.biz/verify/ or https://nenya.biz/about/six-lenses.',
  'The directory is at iasp.info/resources/Crisis_Centres.',
  'You can report it at report.cybertip.org, or see stopitnow.org.',
  'The code is at github.com/Nenya-App/nenya-public.',
  'See cnvc.org or nvcacademy.com.',
  'The mark is written nənya.biz.',
  'Ask Nenya about it. Nenya is a place to pause.',
  'I am Nenya, and nenya.biz has more.',
  'Find a helpline at findahelpline dot com.',
];
ok('every correct address is left exactly as written, with no change reported', CORRECT.every((c) => { const r = repairAddresses(c); return r.reply === c && !r.changed && r.swapped === 0 && r.removed === 0 && hasOnlyAllowedAddresses(c); }), CORRECT.filter((c) => fix(c) !== c).map(fix).join(' | '));
ok('a correct address next to a wrong one stays exactly as written', fix('Call 988, or find a helpline at helpaglobal.com or findahelpline.com.') === 'Call 988, or find a helpline at findahelpline.com.' && fix('Try nenya.biz and example.com.').includes('nenya.biz'));

// ---- near misses: things that are not web addresses
const NEAR = [
  'For example, e.g. a short walk, or i.e. a pause.',
  'In the U.S. or Canada you can call 988.',
  'Call at 9 a.m. or 5 p.m. in the U.S.',
  'About 3.5 hours, or 2.25 miles, or $4.99 for it.',
  'I saved it as notes.txt and report.pdf and photo.jpg.',
  'Dr. Smith, Ph.D., works in the U.K. and the U.S.A.',
  'It helps. Info is below. Net result: calm. Org charts are dull.',
  'The community network is a good place.',
  'Email me at help@findahelpline.com, or name.surname@example.org.',
  'Ok.Then we go on. Fine.Com or no.',
  'No.1 on the list, and v2.0 of the plan.',
  'Wait... then com... or net.',
  'It was 1.5.net savings, said nobody.',
  'Anyone.Org? no.',
];
ok('near misses are left exactly as written: "e.g.", "U.S.", "a.m.", decimals, file names, emails, ordinary sentences', NEAR.every((n) => repairAddresses(n).reply === n && findAddresses(n).length === 0), NEAR.filter((n) => findAddresses(n).length).map((n) => n + ' -> ' + findAddresses(n).map((a) => a.raw)).join(' | '));
ok('a reply with no address comes back as the same string', repairAddresses('That sounds like a lot. What matters most right now?').reply === 'That sounds like a lot. What matters most right now?');

// ---- the rest of the sentence stays intact; removal tidies
const keeps = fix('Thank you for telling me. If you need to talk to someone, find a helpline at findhelpline.com, and take your time. What would help most?');
ok('the sentences around a swapped address are untouched', keeps === 'Thank you for telling me. If you need to talk to someone, find a helpline at findahelpline.com, and take your time. What would help most?');
const REMOVE: [string, string][] = [
  ['Learn more about breathing at example.com. A slow breath can help.', 'Learn more about breathing. A slow breath can help.'],
  ['You can read about it on example.com, which is great.', 'You can read about it, which is great.'],
  ['A slow breath can help. Visit example.com.', 'A slow breath can help.'],
  ['Great ideas (see example.org) for later.', 'Great ideas for later.'],
  ['Try [this guide](https://example.org/x) tonight.', 'Try this guide tonight.'],
  ['There is a good page at https://www.example.com/page_(one)?q=1, and I like it.', 'There is a good page, and I like it.'],
  ['Visit example.com or call your doctor about it.', 'Call your doctor about it.'],
  ['Check your options on example.com or on nenya.biz.', 'Check your options on nenya.biz.'],
  ['There is a good page at https://www.example.com/page, and I like it.', 'There is a good page, and I like it.'],
];
ok('outside a sentence about finding help, an address is taken out and the sentence tidied so it still reads: dangling "at/on/see/visit", brackets, markdown links, a following "or", a sentence left with too little', REMOVE.every(([a, b]) => fix(a) === b), REMOVE.filter(([a, b]) => fix(a) !== b).map(([a]) => fix(a)).join(' | '));
ok('a sentence that would be left with nothing is dropped, and a reply that would be left empty gets the draft site sentence', fix('Visit example.com.') === ADDRESS_FALLBACK && fix('Take a slow breath. Visit example.com.') === 'Take a slow breath.');
ok('a swapped address already has a correct twin in its sentence: the wrong one is taken out, not doubled', fix('Call 988, or find a helpline at helpline.com or findahelpline.com.') === 'Call 988, or find a helpline at findahelpline.com.' && fix('Find a helpline at helpline.com or helpaghelp.com. Take care.') === 'Find a helpline at findahelpline.com. Take care.');
ok('an address on a line of its own keeps the other lines and their breaks', fix('Here is a thought.\n\nSee example.com for more.\n\nTake your time.') === 'Here is a thought.\n\nTake your time.');
ok('a made-up page of the site is not on the list, a real one is', !hasOnlyAllowedAddresses('See nenya.biz/madeup.') && hasOnlyAllowedAddresses('See nenya.biz/about/terms.') && fix('Read nenya.biz/madeup and nenya.biz.') === 'Read nenya.biz.');
ok('markdown: a wrong link target in a help sentence becomes the correct address, and a wrong label address is swapped once', fix('Find a [helpline](https://helpaglobal.com) near you.') === 'Find a [helpline](https://findahelpline.com) near you.' && fix('Find a helpline at [findhelpline.com](https://findhelpline.com).') === 'Find a helpline at findahelpline.com.');
ok('counts: swapped and removed are reported, and nothing changed reports false', (() => { const r = repairAddresses('Call 988. Find a helpline at findhelpline.com. Also see example.com for tea recipes.'); return r.changed && r.swapped === 1 && r.removed === 1 && r.reply === 'Call 988. Find a helpline at findahelpline.com.'; })());
ok('a swap in a sentence with no words about help is a removal (a recipe site is not the helpline)', fix('You could look at example.com for a tea recipe tonight.') === 'You could look for a tea recipe tonight.');
ok('a reply whose crisis words are in the sentence before the address does not make a recipe link a helpline', !/findahelpline/.test(fix('I hear you. Try the recipe at example.com tonight.')));

// ---- the allow-list is derived from the repo: every address the site's own text names that the coach could repeat is on it
const readText = (f: string) => readFileSync(f, 'utf8');
const NOT_FOR_THE_COACH = new Set(['poison.org', 'venice.ai/legal/tos', 'thecolorapi.com', 'api.venice.ai/api/v1/chat/completions']); // a code comment; the Venice terms and the Color API, named only in fixed answers the site writes itself; the model's own endpoint
const fromRepo = ['src/lib/safetyFlags.ts', 'src/lib/distressText.ts', 'src/lib/aboutNenya.ts', 'src/lib/externalLinks.ts', 'netlify/functions/coach.mts', 'docs/venice-card-v2/instructions.txt'].flatMap((f) => findAddresses(readText(f)));
const missing = fromRepo.filter((a) => !a.allowed && !NOT_FOR_THE_COACH.has(a.host + a.rest)).map((a) => a.host + a.rest);
ok('every address in the distress resources, the fixed answers, the coach instructions and the site\'s own link list is on the allow-list (or named as not for the coach)', missing.length === 0, missing.join(' '));
ok('the site\'s own resource-domain list (src/lib/externalLinks.ts) is allowed in full', KNOWN_RESOURCE_DOMAINS.every((d) => hasOnlyAllowedAddresses(d) && findAddresses(d).length === 1));
ok('every About page address is allowed, and the Six Lenses page too', ABOUT_IDS.every((id) => hasOnlyAllowedAddresses('nenya.biz' + aboutPath(id))) && hasOnlyAllowedAddresses('nenya.biz/about/six-gateways'));
ok('the allow-list names a reason for each entry and the helpline address is first', ALLOWED_ADDRESSES.every((a) => a.why.length > 3) && ALLOWED_ADDRESSES[0].host === HELPLINE_ADDRESS && HELPLINE_ADDRESS === 'findahelpline.com');
const instructions = readText('docs/venice-card-v2/instructions.txt') + readText('netlify/functions/coach.mts');
ok('the address the coach is told to give is exactly the correct one', /findahelpline\.com/.test(instructions) && !/findhelpline|helpaglobal/i.test(instructions));

// ---- the persona check
ok('onlyAllowedAddresses: present for none, for allowed ones and for emails and file names; absent for any other', present('onlyAllowedAddresses', 'Call 988.') && present('onlyAllowedAddresses', 'Find one at findahelpline.com.') && present('onlyAllowedAddresses', 'Write to help@example.org about notes.txt.') && !present('onlyAllowedAddresses', 'Find one at findhelpline.com.') && !present('onlyAllowedAddresses', 'Call 988 or see https://example.com/help') && !present('onlyAllowedAddresses', 'findahelpline dot org'));

// ---- the switch
ok('the switch is off unless exactly "on"', addressGuardOn('on') && !addressGuardOn(undefined) && !addressGuardOn('off') && !addressGuardOn('true') && !addressGuardOn(''));
const BASEV = ['VENICE_API_KEY', 'COACH_TICKET_SECRET', 'COACH_SIGNING_KEY', 'COACH_IP_SECRET', 'COACH_OWNER_TOKEN_HASH'].map((k) => ({ key: k, value: 's', isSecret: true, inProduction: true })).concat([{ key: 'COACH_ENABLED', value: 'true', isSecret: false, inProduction: true }, { key: 'COACH_INSTRUCTIONS', value: 'v2.1', isSecret: false, inProduction: true }]);
const env1 = reviewEnv([...BASEV, { key: 'COACH_ADDRESS_GUARD', value: 'on', inProduction: true }]).find((f) => f.key === 'COACH_ADDRESS_GUARD');
const env2 = reviewEnv([...BASEV, { key: 'COACH_ADDRESS_GUARD', value: 'off', inProduction: true }]).find((f) => f.key === 'COACH_ADDRESS_GUARD');
ok('the environment review lists the switch when it is on and does not call "off" a guard turned off', env1?.level === 'REVIEW' && env2?.level !== 'TURN OFF');
ok('the switch is named in docs/production-env.md and the guard has its own page', /COACH_ADDRESS_GUARD/.test(readText('docs/production-env.md')) && /VITE_ADDRESS_GUARD/.test(readText('docs/production-env.md')) && /COACH_ADDRESS_GUARD/.test(readText('docs/address-guard.md')));

// ---- through the real coach function
const S = { color1: '#7a9b9e', color2: '#DAC682' };
const send = async (text: string) => (await coach(new Request('https://nenya.biz/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://nenya.biz' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }], session: S }) }), { ip: '203.0.113.8' })).json() as Promise<any>;
const DISTRESS = 'I do not see the point in going on.';
const WRONG = "I'm an AI and can't help in a crisis, so please reach someone you trust, or call or text 988 in the US or Canada, or find a helpline at helpaglobal.com.";

calls = 0; says = [WRONG];
const offRun = await send(DISTRESS);
ok('with the switch off (the default) the reply is exactly what the model wrote', /helpaglobal\.com/.test(offRun.reply.split('\n\n')[0]));

process.env.COACH_ADDRESS_GUARD = 'on';
__trace.on(true); __trace.take();
calls = 0; says = [WRONG];
const onRun = await send(DISTRESS);
const trace = __trace.take();
const body = onRun.reply.split('\n\n')[0];
ok('with the switch on, the wrong address in a crisis reply is swapped for the correct one, in one model call (no retry)', calls === 1 && /find a helpline at findahelpline\.com\./.test(body) && !/helpaglobal/.test(onRun.reply));
ok('the site\'s own distress sentence still follows, untouched', /988/.test(onRun.reply) && onRun.reply.length > body.length);
ok('the guard is recorded as coach.guard.address with what it changed, and the trace never holds the reply text', trace.events.includes('coach.guard.address') && trace.events.includes('coach.guard.address.swapped') && !trace.events.some((e: string) => /helpaglobal|findahelpline|crisis/.test(e)));
ok('the guard is a repair, not a replacement (the persona layer counts replacements by name)', !trace.events.some((e: string) => /^coach\.guard\.address\.(?:replaced|final)$/.test(e)));

calls = 0; says = ['I hear you. Is there someone you trust you could tell? A good page is at https://example.com/page.'];
const rm = await send(DISTRESS);
ok('a made-up address that is not about help is taken out, and the rest of the reply stays', !/example\.com/.test(rm.reply) && /someone you trust you could tell\?/.test(rm.reply));

calls = 0; says = ['That sounds heavy. You can see nenya.biz/about/privacy-promise for how this works.'];
const fine = await send('I am nervous about talking to my manager tomorrow about credit on the project.');
ok('a reply with only allowed addresses is not changed, and nothing is recorded', fine.reply === 'That sounds heavy. You can see nenya.biz/about/privacy-promise for how this works.');

// The coach answers in one piece (stream:false), so there is no partial text to check; the sealed path (encrypted, run in the browser) has its own build switch.
const src = readText('netlify/functions/coach.mts');
ok('the coach does not stream its reply, so the guard sees the whole text before it is sent', /stream: false/.test(src) && !/stream: true/.test(src));
const sealed = readText('src/lib/sealedCoach.ts');
ok('the sealed path runs the same repair behind VITE_ADDRESS_GUARD, after the other guards', /VITE_ADDRESS_GUARD/.test(sealed) && /if \(addressGuardOnSealed\(\)\) r = repairAddresses\(r\)\.reply/.test(sealed));
ok('the coach function runs the guard behind the switch and never logs the text', /addressGuardOn\(\)/.test(src) && /tally\('coach\.guard\.address'\)/.test(src));
delete process.env.COACH_ADDRESS_GUARD;
