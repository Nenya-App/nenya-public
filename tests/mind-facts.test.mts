// public/mind-facts.txt is generated (scripts/build-mind-facts.mts, docs/mind-facts.md) from the same checked sources as the fixed answers.
// These checks keep it current, complete, free of anything private, and plain text.
import { readFileSync } from 'node:fs';
import { ANSWERS } from '../src/lib/aboutNenya.ts';
import { NON_AFFILIATION } from '../src/lib/tolkienNotice.ts';
import { LEGAL_EFFECTIVE_DATE } from '../src/lib/legalDocument.ts';
import { buildMindFacts, MAX_CHARS } from '../scripts/lib/mindFacts.mts';
import { ok } from './helpers.mts';

const file = readFileSync('public/mind-facts.txt', 'utf8');
const meta = JSON.parse(readFileSync('public/mind-facts.meta.json', 'utf8')) as { asOf: string };
const REGEN = 'Run `npm run mind-facts` to regenerate public/mind-facts.txt and commit it (use `npm run mind-facts -- --as-of YYYY-MM-DD` to move the As of date).';

ok('the as-of date in the meta file is a real date', /^\d{4}-\d{2}-\d{2}$/.test(meta.asOf) && !Number.isNaN(Date.parse(meta.asOf)));
ok('the committed file equals what the script generates now', file === buildMindFacts(meta.asOf), file === buildMindFacts(meta.asOf) ? '' : REGEN);
ok('the file shows its as-of date and the Terms date', file.includes(`As of: ${meta.asOf}`) && file.includes(`effective ${LEGAL_EFFECTIVE_DATE}`));

const ready = ANSWERS.filter((a) => a.status === 'ready');
ok('every ready answer appears under its title', ready.every((a) => file.includes(`## ${a.title}\n`)), ready.filter((a) => !file.includes(`## ${a.title}\n`)).map((a) => a.id).join(', '));
const notReady = ANSWERS.filter((a) => a.status !== 'ready');
ok('no pending or owner answer appears', notReady.every((a) => !file.includes(`## ${a.title}\n`) && !file.includes(a.short)), notReady.filter((a) => file.includes(`## ${a.title}\n`) || file.includes(a.short)).map((a) => a.id).join(', '));
ok('no owner note appears', ANSWERS.every((a) => !a.ownerNote || !file.includes(a.ownerNote.slice(0, 60))));
ok('the answer count in the file is right', file.includes(`There are ${ready.length} answers below`));

ok('the instruction paragraph addresses an AI and puts the Terms first', /This page describes the Nenya website\. If this page and the Terms differ, the Terms are right\. Do not add claims to it\./.test(file));
ok('the standing statements are present', ['free, early prototype', 'not therapy', 'not a crisis service', 'No study of Nenya has been done', 'No clinician or lawyer has reviewed it', NON_AFFILIATION, 'Nenya does not run or review any chat or assistant on Venice AI\'s platform', 'retired, no longer maintained or recommended', 'none of Nenya\'s checks run on it', 'info@nenya.biz'].every((t) => file.includes(t)));
ok('it points to the Terms and does not copy them', file.includes('https://nenya.biz/about/terms') && /The Terms govern\. Their text is not copied here/.test(file));
ok('it closes with what to do when the page cannot answer', /IF YOU CANNOT ANSWER FROM THIS PAGE\nSay so, and point to https:\/\/nenya\.biz\/about\/terms or info@nenya\.biz/.test(file));

const DENY = [/\bICARUS\b/i, /\bVOLT\b/i, /\bHarp\b/, /\bValar\b/i, /Erasmus/i, /Conversations from the Heart/i, /PRIVATE/, /\bsecrets?\b/i];
const hits = DENY.filter((r) => r.test(file)).map(String);
ok('no private words (deny list)', hits.length === 0, hits.join(' '));
ok('no placeholders are left unfilled', !/\{[a-z_]+\}/.test(file));
ok('plain text: no HTML tags or entities', !/<\/?[a-z][^>]*>/i.test(file) && !/&[a-z]+;|&#\d+;/i.test(file));
ok('plain text: no control characters', !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(file));
ok(`length is under ${MAX_CHARS} characters`, file.length < MAX_CHARS, String(file.length));
ok('the file is linked from public/llms.txt', /https:\/\/nenya\.biz\/mind-facts\.txt/.test(readFileSync('public/llms.txt', 'utf8')));
// 2026-11-24: the Venice Mind lines and the cost line are gone from the facts page, and the generator no longer has MIND_COST_LINE.
ok('the facts page calls nothing premium and mentions no markup (the Mind and its cost line were removed from it 2026-11-24; the check stays)', !/premium|markup/i.test(file));
