// Pulls the member lists of Wiktionary's English slur and offensive-term categories (CC BY-SA 4.0) into the research folder (outside the repository), and reports COUNTS ONLY:
// how many terms per category, how many are single words, and how many the current list already has. No term is printed.
//   node scripts/pull-wiktionary.mts            # writes datasets/wiktionary/members.csv and PROVENANCE.md
// Polite by design: a descriptive User-Agent with no personal details, one request at a time, a pause between requests, a wait and retry when asked to slow down.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { researchPaths } from '../src/lib/researchDir.ts';
import { readLexicon } from '../src/lib/lexiconLoader.ts';

const UA = 'NenyaResearch/1.0 (nonprofit research tool)';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function api(p: Record<string, string>): Promise<any> {
  for (let t = 0; t < 6; t++) {
    const r = await fetch('https://en.wiktionary.org/w/api.php?' + new URLSearchParams({ format: 'json', maxlag: '5', ...p }), { headers: { 'User-Agent': UA } });
    const txt = await r.text();
    try { const j = JSON.parse(txt); if (!j.error) return j; } catch { /* asked to slow down */ }
    await sleep(15000 * (t + 1));
  }
  throw new Error('gave up after repeated rate limits');
}
const TOP = ['ethnic slurs', 'religious slurs', 'anti-LGBTQ slurs', 'dysphemisms', 'offensive terms', 'derogatory terms', 'vulgarities'];

const P = researchPaths();
const dir = join(P.datasets, 'wiktionary');
mkdirSync(dir, { recursive: true });
const seen = new Map<string, Set<string>>(); // term -> categories
const perCat: Record<string, number> = {};
async function members(cat: string): Promise<string[]> {
  const subs: string[] = []; let cont: string | undefined; let n = 0;
  do {
    const d = await api({ action: 'query', list: 'categorymembers', cmtitle: 'Category:' + cat, cmlimit: '500', cmtype: 'page|subcat', cmnamespace: '0|14', ...(cont ? { cmcontinue: cont } : {}) });
    for (const m of d.query.categorymembers) {
      if (m.ns === 14) subs.push(m.title.replace(/^Category:/, ''));
      else { const k = m.title.toLowerCase(); (seen.get(k) ?? seen.set(k, new Set()).get(k)!).add(cat); n++; }
    }
    cont = d.continue?.cmcontinue;
    await sleep(1500);
  } while (cont);
  perCat[cat] = n;
  return subs;
}
const queue = TOP.map((c) => 'English ' + c); const done = new Set<string>();
while (queue.length) {
  const c = queue.shift()!; if (done.has(c)) continue; done.add(c);
  for (const s of await members(c)) if (/^English /.test(s)) queue.push(s);
}
const q = (s: string) => '"' + s.replace(/"/g, '""') + '"';
const lines = ['term,categories'];
for (const [t, cs] of [...seen].sort((a, b) => a[0].localeCompare(b[0]))) lines.push(`${q(t)},${q([...cs].join('|'))}`);
const csv = lines.join('\n') + '\n';
writeFileSync(join(dir, 'members.csv'), csv);
writeFileSync(join(dir, 'PROVENANCE.md'), `# Wiktionary English slur and offensive-term categories (private research folder; terms never printed or committed)\n- Source: en.wiktionary.org (MediaWiki API, categorymembers), pulled ${new Date().toISOString().slice(0, 10)} with the User-Agent "${UA}".\n- Categories (with subcategories): ${[...done].join('; ')}.\n- Licence: CC BY-SA 4.0 (Wiktionary text). Credit goes in ATTRIBUTIONS.md before any list built from it is switched on. members.csv SHA-256: ${createHash('sha256').update(csv).digest('hex')}.\n- Use: candidates for the private list, reviewed like HurtLex rows; never distributed.\n`);

const listFile = join(P.datasets, 'hurtlex', 'list', 'slurs.en.csv');
const have = existsSync(listFile) ? new Set(readLexicon(readFileSync(listFile, 'utf8')).rows.map((r) => r.term)) : new Set<string>();
console.log(`Pulled ${seen.size} distinct terms from ${done.size} categories.`);
for (const [c, n] of Object.entries(perCat)) {
  const terms = [...seen].filter(([, cs]) => cs.has(c)).map(([t]) => t);
  console.log(`  ${c.padEnd(40)} ${String(n).padStart(5)} pages, single words ${terms.filter((t) => !/\s/.test(t)).length}, already in the list ${terms.filter((t) => have.has(t)).length}`);
}
const only = [...seen].filter(([t, cs]) => !have.has(t) && [...cs].some((c) => /ethnic slurs|religious slurs|anti-LGBTQ slurs|dysphemisms/.test(c)));
console.log(`In the slur categories (ethnic, religious, anti-LGBTQ, dysphemisms) and NOT already in the list: ${only.length} (single words ${only.filter(([t]) => !/\s/.test(t)).length}).`);
console.log(`Wrote ${join(dir, 'members.csv')} and PROVENANCE.md (not for the repository).`);
