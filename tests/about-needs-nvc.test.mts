// Chapter 3 of the About thesis (2026-11-22): The Pantheon of Needs, the page now called "Our Approach" (it was "Our NVC+ Method") and the Welcome page, with the
// rename of NVC+ to "our approach" across the visitor-facing text. Every cited number has a list entry, the overclaims the chapter removed stay gone, the
// owner's decisions of 2026-11-22 hold (reasonable + "our view"; the research section stays; no NVC+; no diagnosis-like or force-like card wording), and the
// pieces that quote these pages (the fixed answers, the public files, the menu) agree with them.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { ANSWERS } from '../src/lib/aboutNenya.ts';
import { VENICE_DIFFERENCES } from '../src/lib/veniceLinks.ts';
import { ABOUT_TITLES } from '../src/lib/aboutRoutes.ts';

const read = (f: string) => readFileSync(f, 'utf8');
const strip = (s: string) => s.replace(/\s+/g, ' ');
const dir = 'src/app/components/about/';
const pages: Record<string, string> = {
  PantheonOfNeeds: read(dir + 'PantheonOfNeeds.tsx'),
  NVCMethod: read(dir + 'NVCMethod.tsx'),
  Mellonamin: read(dir + 'Mellonamin.tsx'),
};

// ---- every Cite number has a matching list entry, and the list is in order ----
for (const [name, src] of Object.entries(pages)) {
  const cited = new Set<number>();
  for (const m of src.matchAll(/<Cite pageId=\{PAGE_ID\} n=\{(\[[^\]]*\]|\d+)\} \/>/g)) {
    const v = JSON.parse(m[1]) as number | number[];
    for (const k of Array.isArray(v) ? v : [v]) cited.add(k);
  }
  const listed = [...src.matchAll(/^\s*\{ n: (\d+), text: /gm)].map((m) => Number(m[1]));
  const missing = [...cited].filter((k) => !listed.includes(k));
  ok(`${name}: it cites sources, and every cited number has a matching entry in its list (${cited.size} cited, ${listed.length} listed)`, cited.size >= 5 && missing.length === 0, `missing: ${missing.join(',')}`);
  ok(`${name}: the list is numbered 1, 2, 3 ... without gaps`, listed.every((k, i) => k === i + 1));
  ok(`${name}: it shows one reference list, with the page's own id`, (src.match(/<ReferenceList /g) ?? []).length === 1 && /<ReferenceList pageId=\{PAGE_ID\}/.test(src) && /const PAGE_ID = '/.test(src));
  ok(`${name}: no reference gives a page number`, !/\bpp?\.\s?\d/.test(src.slice(src.indexOf('const PAGE_ID'), src.indexOf('export default'))));
}
ok('the three pages use three different list ids, so a link never points into another page', new Set(Object.values(pages).map((s) => /const PAGE_ID = '([a-z]+)'/.exec(s)?.[1])).size === 3);
ok('a paywalled publisher page is labelled "may need payment"', /linkLabel: "Publisher page \(may need payment\)"/.test(pages.NVCMethod) && /linkLabel: "Publisher page \(may need payment\)"/.test(pages.PantheonOfNeeds));

// ---- overclaims the chapter removed stay gone ----
const banned: [string, RegExp][] = [
  ['"proven"', /\bproven\b/i], ['"profound"', /\bprofound/i], ['"scientifically recognized"', /scientifically recognized/i],
  ['"righteous"', /righteous/i], ['"universal human needs"', /universal human needs/i], ['"crucial"', /\bcrucial/i], ['"atrophy"', /atrophy/i],
  ['"fundamental human motivation"', /fundamental human motivation/i], ['"authentic NVC training"', /authentic nvc/i], ['"trusted organizations"', /trusted organizations/i],
  ['"re-sanctifying"', /re-sanctif/i], ['"subconscious wisdom"', /subconscious wisdom/i], ['"wisdom inherent in pain"', /wisdom inherent in pain/i],
  ['"it often signals real pain"', /often signals real pain/i], ['"healing from depletion or trauma"', /healing from depletion or trauma/i],
  ['"Feel, don\'t think about feeling"', /don't think about feeling/i], ['"asks less ... than most"', /grids than most/i], ['"without anyone watching"', /without anyone watching/i],
  ['"nothing to build one from"', /nothing to build one from/i], ['"no color has a fixed meaning"', /no color has a fixed meaning/i],
  ['the old NVC Academy address', /nvctraining\.com/i], ['"global hub"', /global hub/i], ['"social justice" in a biography', /social justice/i], ['"conflict facilitator"', /conflict facilitator/i],
  ['"directly informs"', /directly informs/i], ['"mythic archetypes"', /mythic archetypes/i],
];
const bannedHits = Object.entries(pages).flatMap(([name, src]) => banned.filter(([, re]) => re.test(src)).map(([label]) => `${name}: ${label}`));
ok('the overclaims and old phrases the chapter removed are gone from the three pages', bannedHits.length === 0, bannedHits.join(' | '));

// ---- decision 3: the name NVC+ is not used (the pages, the menu, the titles and the visitor-facing files) ----
const visitorFiles = [
  dir + 'PantheonOfNeeds.tsx', dir + 'NVCMethod.tsx', dir + 'Mellonamin.tsx', dir + 'AboutMenu.tsx', 'src/lib/aboutRoutes.ts', 'src/app/components/DyadicCellInterface.tsx',
  'public/about-nenya.html', 'public/llms.txt', 'README.md', 'ATTRIBUTIONS.md', 'src/lib/veniceLinks.ts', 'src/app/components/ValarBreathingLogo.tsx',
];
ok('NVC+ does not appear in the three pages, the menu, the route titles, the walkthrough, the public files or the README', visitorFiles.every((f) => !/NVC\+|NVC plus|NVCPlus/.test(read(f))), visitorFiles.filter((f) => /NVC\+|NVC plus|NVCPlus/.test(read(f))).join(', '));
const aboutNenyaSrc = read('src/lib/aboutNenya.ts');
const answerTexts = ANSWERS.flatMap((a) => [a.short, ...a.full, ...(a.workersAi?.full ?? []), a.workersAi?.short ?? '']);
ok('no fixed answer says NVC+ (a visitor who types the old name is still understood: it stays only as a way of asking)', answerTexts.every((t) => !/NVC\+/.test(t)) && ANSWERS.every((a) => a.links.every((l) => !/NVC\+/.test(l.label))));
ok('the only NVC+ left in aboutNenya.ts is the asked-phrase for the old name', (aboutNenyaSrc.match(/NVC\+/g) ?? []).length === 1 && /asked: \[[^\]]*'what is NVC\+'/.test(aboutNenyaSrc));
ok('the NVC page and its menu entry are called "Our Approach"', ABOUT_TITLES['nvc-method'] === 'Our Approach' && /title: 'Our Approach'/.test(read(dir + 'AboutMenu.tsx')) && /<h1>Our Approach:/.test(pages.NVCMethod));
ok('the fixed answers link to it by its new name', ANSWERS.filter((a) => a.links.some((l) => l.page === 'nvc-method')).every((a) => a.links.filter((l) => l.page === 'nvc-method').every((l) => l.label === 'Our Approach')));
ok('Rosenberg\'s Nonviolent Communication keeps its own name and credit: the CNVC credit line is unchanged', strip(pages.NVCMethod).includes('The Center for Nonviolent Communication © 2023, www.CNVC.org, cnvc@cnvc.org') && pages.NVCMethod.includes('id="cnvc-credit"'));

// ---- decisions 1 and 2: "reasonable" with "our view"; the research section stays ----
const nvc = strip(pages.NVCMethod);
ok('the injustice line says "reasonable response" and labels it "our view", not a finding', /It can be a reasonable response to unfair treatment\. That is our view, not a research finding\./.test(nvc) && /Our view: what people feel is shaped in part/.test(nvc));
ok('the "What research says about NVC" section stays, says NVC has been tested only a little, and says nobody has tested a self-guided tool or an AI coach', /What research says about NVC/.test(nvc) && /NVC has been tested, but not much, and mostly in small studies/.test(nvc) && /We found no study of a self-guided tool or an AI coach, so we do not know if practicing with Nenya helps\./.test(nvc));
ok('the NVC page says our added layer is our own and has not been tested, and that no clinician has reviewed the page', /It is our own extension and has not been tested/.test(nvc) && /no clinician has reviewed this page/.test(nvc));
ok('the NVC page names no one as an endorser: it says linking does not mean they endorse Nenya, and listing the two organizations is not a partnership', /Linking to them does not mean they endorse Nenya/.test(nvc) && /Listing them is not a partnership/.test(nvc));
ok('NVC Academy is linked at nvcacademy.com', /href="https:\/\/nvcacademy\.com"/.test(pages.NVCMethod));
ok('the biographies say only what the people\'s own sites say (clinical psychologist, author, podcast host; BayNVC co-founder with a doctorate in sociology; trainer, speaker and coach)', /Clinical psychologist, author, and podcast host/.test(nvc) && /Co-founder of Bay Area Nonviolent Communication \(BayNVC\), with a doctorate in sociology/.test(nvc) && /Trainer, speaker, and coach on empathy at work/.test(nvc));
ok('nothing on the NVC page states a date, a "nonprofit" label or a clinical title that only the owner can confirm', !/1984|nonprofit/i.test(pages.NVCMethod) && !/clinical psychologist, developed/i.test(nvc));
ok('the Welcome page\'s four shifts are the rewritten ones, and are labelled habits to try', ['Notice first, judge later', 'Name the feeling, simply', 'Ask what you need, not only what to do', 'Ask, don\'t demand'].every((t) => pages.Mellonamin.includes(t)) && /habits to try, not a tested program/.test(strip(pages.Mellonamin)));
ok('the Welcome page says the footprint claim has not been measured', /We have not measured this/.test(strip(pages.Mellonamin)));

// ---- decision 4: no diagnosis-like focus lines, no "force" on the cards ----
const logo = read('src/app/components/ValarBreathingLogo.tsx');
const pan = pages.PantheonOfNeeds + logo;
const diagnosisWords = ['Despair', 'Nihilism', 'Self-Domination', 'Fixed Corruption', 'Systematic Destruction', 'Oppression, Nihilism', 'Radical Self-Will', 'Raw Power', 'Unconstrained', 'Uncomplicated Physical Power', 'Energetic Defense', 'Enforcing Shared Boundaries', 'Ethical Defense', 'Will to Break', 'Power turned destructive', 'power wounds'];
ok('the Valar-derived focus lines and the cards carry none of the diagnosis-like or force-like wording', diagnosisWords.every((w) => !pan.includes(w)), diagnosisWords.filter((w) => pan.includes(w)).join(', '));
ok('Ember\'s shared need no longer speaks of using force; it speaks of keeping people safe without harming others', !/use force/i.test(pages.PantheonOfNeeds) && /protect life without harming others/.test(pages.PantheonOfNeeds));
ok('Hollow says there may be pain underneath, cites studies, and says this does not excuse harm', /there may be pain underneath/.test(pages.PantheonOfNeeds) && /This does not excuse harm/.test(pages.PantheonOfNeeds) && /n=\{\[5, 6, 7, 8\]\}/.test(pages.PantheonOfNeeds));
ok('the Pantheon says plainly that it is our own design, not a tested scale', /This is our own design\. It is not a tested scale, and no study shows that needs divide into these sixteen\./.test(strip(pages.PantheonOfNeeds)));
ok('the menu entry for the Pantheon no longer talks of re-sanctifying, and the menu says "approach", not "method"', /Sixteen archetypes of need, each with its own colors/.test(read(dir + 'AboutMenu.tsx')) && /the approach behind them/.test(read(dir + 'AboutMenu.tsx')));

// ---- the fixed answers agree with the pages ----
const nvcAnswer = ANSWERS.find((a) => a.id === 'n-nvc')!;
const aff = ANSWERS.find((a) => a.id === 'n-affiliation')!;
const methods = ANSWERS.find((a) => a.id === 'c-methods')!;
const t = (a: (typeof ANSWERS)[number]) => [a.short, ...a.full].join(' ');
ok('the NVC answer says the lessons and the coach use the four parts (not "every reflection") and that our addition has not been tested', !/every reflection/.test(t(nvcAnswer)) && /lessons and its optional coach are built on/.test(t(nvcAnswer)) && /has not been tested/.test(t(nvcAnswer)));
ok('the affiliation answer says "learn from human NVC trainers as well" and that we have not tested whether Nenya helps, with no "certified" or "strongly"', /learn from human NVC trainers as well/.test(t(aff)) && /have not tested whether it does/.test(t(aff)) && !/certified human|strongly encourage/.test(t(aff)));
ok('the coach\'s self-description says the added layer is our own and untested, and still says it was not trained by any individual teacher', /our own extension and has not been tested/.test(t(methods)) && /I was not trained by any individual teacher/.test(t(methods)) && /human NVC trainers/.test(t(methods)));
ok('the Venice differences line no longer says "most features need an account" (unverified)', !/need an account/.test(VENICE_DIFFERENCES) && /under 18/.test(VENICE_DIFFERENCES));

// ---- the public files ----
const pub = read('public/about-nenya.html') + read('public/llms.txt');
ok('the public page and llms.txt describe the added layer as ours and untested, and name the page "Our Approach"', /Our Approach page/.test(pub) && /has not been tested/.test(read('public/about-nenya.html')) && /untested addition/.test(read('public/llms.txt')));

// ---- reading level ----
for (const [name, src] of Object.entries(pages)) {
  const paras = [...src.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<Cite[^>]*\/>/g, '').replace(/<[^>]+>/g, '').replace(/\{' '\}/g, ' ').replace(/&apos;/g, "'").replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 8);
  const g = gradeLevel(paras.join(' '));
  const worst = Math.max(...paras.map((p) => gradeLevel(p)));
  ok(`${name}: its paragraphs, read together, are at grade 8 or below (${g.toFixed(1)}), and none is above grade 10.5 (${worst.toFixed(1)})`, g <= 8 && worst <= 10.5);
}
