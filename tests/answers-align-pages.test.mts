// The fixed answers (src/lib/aboutNenya.ts) say no more than the rewritten About pages they summarise (2026-11-22). The statements chapter flagged the answers
// on Where We Stand (h-genocide, h-apartheid, h-colonization, h-political), Who runs Nenya (n-who) and the cost (n-free); the audit of every other answer found a few more.
// This test keeps the old, stronger phrasing from coming back, checks that the labelled positions and hedges the pages carry are in the answers, and that the
// dates and figures an answer repeats are on the page.
import { readFileSync } from 'node:fs';
import { ANSWERS, type Answer } from '../src/lib/aboutNenya.ts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ok } from './helpers.mts';

const by = (id: string): Answer => ANSWERS.find((a) => a.id === id)!;
const words = (a: Answer) => [a.short, ...a.full].join(' ').replace(/[‘’]/g, "'");
const page = (name: string) => readFileSync(`src/app/components/about/${name}.tsx`, 'utf8').replace(/&rsquo;|&apos;/g, "'").replace(/\s+/g, ' ');

// 1. The old strong phrasing is gone from the answers the chapter flagged
const gone: [string, RegExp, string][] = [
  ['h-genocide', /found[^.]{0,60}to be genocide/i, '"found ... to be genocide"'],
  ['h-genocide', /have concluded it is genocide/i, '"concluded it is genocide" as a flat statement'],
  ['h-genocide', /no Jewish person anywhere is responsible/i, 'the universal sentence about Jewish people'],
  ['h-genocide', /no Palestinian for Hamas/i, 'the universal sentence about Palestinians'],
  ['h-genocide', /run to 2029/i, 'a date for the written rounds that the page does not give'],
  ['h-apartheid', /ICJ[^.]{0,20}found the occupation unlawful/i, 'a court "finding" where the page says advisory opinion'],
  ['h-apartheid', /International Court of Justice found the occupation unlawful/i, 'a court "finding" where the page says advisory opinion'],
  ['h-apartheid', /Israel and others dispute it, and no court has ruled/i, 'the old dispute sentence'],
  ['h-apartheid', /is not hatred of a people/i, 'a sentence the page does not say'],
  ['h-apartheid', /Antisemitism, anti-Palestinian racism and Islamophobia are dehumanization/i, 'a list the page does not give'],
  ['h-colonization', /None of this is a matter of two sides/i, '"none of this is a matter of two sides"'],
  ['h-colonization', /has apologized for some of (?:it|this)/i, 'an apology wider than the one the page names'],
  ['h-colonization', /not about blaming people alive today/i, 'a sentence the page does not say'],
  ['h-political', /political choice too/i, '"a political choice too"'],
  ['h-political', /do not treat genocide, apartheid or occupation as matters of opinion/i, '"not matters of opinion"'],
  ['h-belief', /does not change what the record shows/i, 'a sentence the page does not say'],
  ['h-belief', /hurt used as a reason that nothing can be said/i, 'a sentence the page does not say'],
  ['n-who', /public charity/i, '"public charity" (the pages say nonprofit arts service organization)'],
  ['n-who', /recognized nonprofit home/i, 'the old sponsorship wording'],
  ['n-who', /creative and directional independence/i, '"keeps its creative and directional independence"'],
  ['n-who', /direction is decided by its creator/i, 'the old direction sentence'],
  ['n-who', /not a commercial product/i, 'a claim the page does not make'],
  ['n-free', /public charity/i, '"public charity"'],
  ['n-free', /help keep the project free and its servers running/i, 'the old use-of-donations sentence'],
  ['n-name', /never touched by Sauron/i, '"never touched" (the page says never held, made in his shadow)'],
  ['n-name', /tool that tends an inner space and does not take from it/i, 'a claim the page does not make'],
  ['n-region', /sends nothing/i, '"sends nothing" (a few optional buttons do send)'],
  ['n-else', /Everything except the coach runs in your browser/i, 'an exception-free line'],
  ['n-else', /the power of color/i, 'the old page name'],
  ['n-opensource', /Section 15 of the Terms describes them/i, 'the wrong section for the host logs'],
  ['n-affiliation', /categories follow CNVC/i, '"follow" (the credit page says informed by the structure of)'],
  ['c-methods', /categories follow CNVC/i, '"follow" (the credit page says informed by the structure of)'],
  ['c-wrote', /In two situations our server may replace/i, 'the old count of replacement cases'],
];
for (const [id, re, what] of gone) ok(`${id}: ${what} is gone`, !re.test(words(by(id))));

// 2. No answer uses the dropped name as visitor text (the detector may still match people who type it, and `asked` lists their words)
ok('no answer says "NVC+" in its short or full text', ANSWERS.every((a) => !/NVC\+/.test(words(a))), ANSWERS.filter((a) => /NVC\+/.test(words(a))).map((a) => a.id).join(','));
ok('no answer calls our own way of working a "method" (Rosenberg\'s NVC keeps its name)', ANSWERS.every((a) => !/\b(?:our|the|Nenya's|Nenya's own) (?:NVC )?method\b/i.test(words(a))), ANSWERS.filter((a) => /\b(?:our|the|Nenya's) (?:NVC )?method\b/i.test(words(a))).map((a) => a.id).join(','));

// 3. The labelled positions and hedges the pages carry are in the answers
const h = (id: string) => words(by(id));
ok('h-genocide says the bodies are not courts, that agreeing is our position and not a ruling, and that Israel\'s government rejects the conclusions', /not a court|None of them is a court/i.test(h('h-genocide')) && /our position/i.test(h('h-genocide')) && /rejects these conclusions/i.test(h('h-genocide')));
ok('h-genocide says no court has ruled and what the January 2024 order did not decide', /No court has (?:yet )?ruled/i.test(h('h-genocide')) && /did not decide whether genocide has happened/i.test(h('h-genocide')));
ok('h-genocide names the three kinds of body the page names (UN commission, Amnesty, Israeli groups)', /commission of inquiry/.test(h('h-genocide')) && /Amnesty/.test(h('h-genocide')) && /B'Tselem/.test(h('h-genocide')));
ok('h-genocide says being Jewish or Palestinian does not make anyone responsible, and that people answer for what they do or order', /Being Jewish does not make anyone responsible/.test(h('h-genocide')) && /Being Palestinian does not make anyone responsible/.test(h('h-genocide')) && /what they themselves do or order/.test(h('h-genocide')));
ok('h-apartheid says the opinion is advisory, not a judgment between states, that Israel\'s government rejects it, and that the Court did not rule on the crime of apartheid', /advisory opinion/.test(h('h-apartheid')) && /not a judgment in a case between states/.test(h('h-apartheid')) && /rejects the opinion/.test(h('h-apartheid')) && /did not rule on the crime of apartheid/.test(h('h-apartheid')));
ok('h-apartheid says the apartheid conclusions are those of organizations, not courts, and that agreeing is our position', /organizations, not courts/.test(h('h-apartheid')) && /our position/.test(h('h-apartheid')));
ok('h-colonization limits "no second side" to the facts listed, and does not decide the word genocide for the United States', /On these facts, we do not give a second side/.test(h('h-colonization')) && /does not say whether the word genocide applies to the United States/.test(h('h-colonization')));
ok('h-colonization names the 2024 apology as the President\'s, for the boarding schools', /President Biden formally apologized for those schools/.test(h('h-colonization')));
ok('h-political says these are questions of law and evidence, that the page names who decided, and that our own positions are labelled', /questions of law and evidence, not of taste/.test(h('h-political')) && /Where none has, we say that too/.test(h('h-political')) && /our own position as ours|is ours and not a court's/.test(h('h-political')));
ok('h-political says the coach is set up not to shame and can get it wrong', /set up not to shame/.test(h('h-political')) && /can get this wrong/.test(h('h-political')));
ok('n-who names the sponsor\'s oversight, the creator setting the creative direction, and that independence is a belief', /some oversight of how donated money is spent/.test(h('n-who')) && /creative direction is set by its creator/.test(h('n-who')) && /that is our belief/.test(h('n-who')));
ok('n-free says Fractured Atlas charges a fee, that the plan for free tools is a plan, and that subscriptions are only being explored', /administrative fee/.test(h('n-free')) && /The plan is for the core breathing and reflection tools to stay free/.test(h('n-free')) && /exploring subscriptions/.test(h('n-free')));
ok('n-contact says the email is also handled by the email provider', /email provider/.test(h('n-contact')));
ok('n-privacy names the "Save and return later" exception', /Save and return later/.test(h('n-privacy')));
ok('n-region says a few optional buttons send something, and that the on-device coach is not built', /optional buttons/.test(h('n-region')) && /It is not built yet/.test(h('n-region')));
ok('n-else says the six lenses are our own design, not a tested measure', /our own design/.test(h('n-else')) && /not a tested measure/.test(h('n-else')));
ok('n-name says Sauron never held the Three and they were made in his shadow', /Sauron never held them/.test(h('n-name')) && /made in his shadow/.test(h('n-name')));
ok('n-nvc says NVC has been tested but not much, and that no study tested a self-guided tool or an AI coach', /tested, but not much/.test(h('n-nvc')) && /no study of a self-guided tool or an AI coach/.test(h('n-nvc')));
ok('n-affiliation and c-methods say the categories were informed by the structure of the Inventory', /informed by the structure of CNVC/.test(h('n-affiliation')) && /informed by the structure of CNVC/.test(h('c-methods')));
ok('c-methods says the lens framework is our own design and not a tested instrument, and that the guidance may be wrong and will change', /our own design, not a tested instrument/.test(h('c-methods')) && /may be wrong, and it will change/.test(h('c-methods')));
ok('n-transcripts says a signature is not an identity check and does not show who typed the person\'s side', /not an identity check/.test(h('n-transcripts')) && /does not show who typed/.test(h('n-transcripts')));
ok('n-safety and c-stopped say none of the checks is a safety system to rely on, and describe the too-short check', ['n-safety', 'c-stopped'].every((id) => /safety system you should rely on/.test(h(id)) && /uses no turn/.test(h(id))));

// 4. Every stand answer is tied to the Where We Stand page by at least three checks, and a date an answer repeats is on the page
for (const id of ['h-genocide', 'h-apartheid', 'h-colonization', 'h-political', 'h-belief']) {
  ok(`${id}: at least three checks read the Where We Stand page`, by(id).checks.filter((c) => c.file.endsWith('WhereWeStand.tsx')).length >= 3);
}
const stand = page('WhereWeStand');
const dates = [...h('h-genocide').matchAll(/\b(\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d)\b/g)].map((m) => m[1]);
ok('every date the Gaza answer repeats is on the page', dates.length > 0 && dates.every((d) => stand.includes(d)), dates.filter((d) => !stand.includes(d)).join(', '));
ok('the figures the Gaza answer repeats (1,200 killed, about 250 hostages) are on the page', /about 1,200 people/.test(stand) && /about 250 hostages/.test(stand) && /about 1,200 people, mostly civilians, and took about 250 hostages/.test(h('h-genocide')));
ok('the vote the apartheid answer repeats (11 to 4) is on the page', /The vote was 11 to 4/.test(stand) && /11 to 4/.test(h('h-apartheid')));

// 5. Plain language: the rewritten stand answers read at about grade 9 or lower
for (const id of ['h-genocide', 'h-apartheid', 'h-colonization', 'h-political', 'h-belief', 'n-free', 'n-region', 'n-else']) {
  const g = gradeLevel(by(id).full.join(' '));
  ok(`${id}: the full answer reads at grade 10 or below`, g <= 10, g.toFixed(1));
}
for (const id of ['h-genocide', 'h-apartheid', 'h-colonization', 'h-political', 'h-belief']) {
  const g = gradeLevel(by(id).short);
  ok(`${id}: the card reads at grade 10 or below`, g <= 10, g.toFixed(1));
}
