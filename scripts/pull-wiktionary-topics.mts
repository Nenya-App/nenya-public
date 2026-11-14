// Pulls the member lists of Wiktionary's TOPIC categories for the groups the slur categories do not cover (women, sexism, prostitution, transgender and gender, disability and mental health), and
// keeps the terms that are ALSO in the offensive, derogatory, vulgar or slur sets pulled by scripts/pull-wiktionary.mts. So a term is a candidate only if Wiktionary itself both labels it offensive
// or derogatory and files it under a topic about the group: nothing is taken from memory. Counts only on screen; files in the research folder (outside the repository), CC BY-SA 4.0 (credited in ATTRIBUTIONS.md).
//   node scripts/pull-wiktionary-topics.mts            # women, gender, trans, disability (topic-candidates.csv)
//   node scripts/pull-wiktionary-topics.mts --coded    # Nazism, racism, antisemitism and euphemisms: coded terms and ideology vocabulary (topic-candidates-coded.csv)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { researchPaths } from '../src/lib/researchDir.ts';
import { parseCsv, readLexicon } from '../src/lib/lexiconLoader.ts';

const UA = 'NenyaResearch/1.0 (nonprofit research tool)';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function api(p: Record<string, string>): Promise<any> {
  for (let t = 0; t < 5; t++) {
    const r = await fetch('https://en.wiktionary.org/w/api.php?' + new URLSearchParams({ format: 'json', maxlag: '5', ...p }), { headers: { 'User-Agent': UA } });
    const x = await r.text();
    try { const j = JSON.parse(x); if (!j.error) return j; } catch { /* slow down */ }
    await sleep(15000 * (t + 1));
  }
  throw new Error('gave up');
}
const CODED = process.argv.includes('--coded');
const TOPICS: [string, string][] = CODED ? [['en:Nazism', 'nazism'], ['en:Racism', 'racism'], ['en:Antisemitism', 'antisemitism'], ['English euphemisms', 'euphemism']] : [['en:Women', 'women'], ['en:Sexism', 'women'], ['en:Prostitution', 'women'], ['en:Feminism', 'women'], ['en:Gender', 'gender'], ['en:Transgender', 'trans'], ['en:Disability', 'disability'], ['en:Mental health', 'disability'], ['en:Deafness', 'disability'], ['en:Blindness', 'disability']];
const P = researchPaths();
const dir = join(P.datasets, 'wiktionary');
const topicOf = new Map<string, Set<string>>();
const perTopic: Record<string, number> = {};
async function members(cat: string, label: string, depth: number): Promise<void> {
  let cont: string | undefined; const subs: string[] = [];
  do {
    const d = await api({ action: 'query', list: 'categorymembers', cmtitle: 'Category:' + cat, cmlimit: '500', cmtype: 'page|subcat', cmnamespace: '0|14', ...(cont ? { cmcontinue: cont } : {}) });
    for (const m of d.query.categorymembers) {
      if (m.ns === 14) subs.push(m.title.replace(/^Category:/, ''));
      else { const k = m.title.toLowerCase(); (topicOf.get(k) ?? topicOf.set(k, new Set()).get(k)!).add(label); perTopic[cat] = (perTopic[cat] ?? 0) + 1; }
    }
    cont = d.continue?.cmcontinue; await sleep(1500);
  } while (cont);
  if (depth < 1) for (const s of subs) if (/^en:/.test(s)) await members(s, label, depth + 1);
}
for (const [cat, label] of TOPICS) await members(cat, label, 0);
const pulled = parseCsv(readFileSync(join(dir, 'members.csv'), 'utf8')).slice(1).map((r) => ({ term: r[0], cats: r[1].split('|') }));
const offensive = new Map(pulled.map((p) => [p.term, p.cats]));
const have = new Set(readLexicon(readFileSync(join(P.datasets, 'hurtlex', 'list', 'slurs.en.csv'), 'utf8')).rows.map((r) => r.term));
const q = (s: string) => '"' + s.replace(/"/g, '""') + '"';
const lines = ['term,topics,wiktionary_labels,in_list'];
const cand: string[] = [];
for (const [t, tops] of topicOf) {
  const lab = offensive.get(t);
  if (!lab) continue;
  cand.push(t);
  lines.push([q(t), q([...tops].join('|')), q(lab.map((c) => c.replace('English ', '')).join('|')), have.has(t) ? 'yes' : ''].join(','));
}
mkdirSync(join(dir, 'prepared'), { recursive: true });
writeFileSync(join(dir, 'prepared', CODED ? 'topic-candidates-coded.csv' : 'topic-candidates.csv'), lines.join('\n') + '\n');
const by: Record<string, number> = {};
for (const t of cand) for (const l of topicOf.get(t)!) by[l] = (by[l] ?? 0) + 1;
console.log('Topic pages pulled:', JSON.stringify(perTopic));
console.log('Terms in a topic AND labelled offensive, derogatory, vulgar or slur by Wiktionary:', cand.length, JSON.stringify(by), '; already in the list:', cand.filter((t) => have.has(t)).length, '; single words:', cand.filter((t) => !/\s/.test(t)).length);
