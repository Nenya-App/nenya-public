// The static public pages (public/about-nenya.html, why-nenya.html, llms.txt, manifest.json and the files beside them) were checked against the rewritten
// About pages and the Terms on 2026-11-22. This pins the removed overclaims, the corrected storage statements and the absence of local paths.
// These files are not rewritten by scripts/apply-lens-copy.mts (their lens words are already the new ones, so the build reports "no change").
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const read = (f: string) => readFileSync(f, 'utf8');
const files = ['public/about-nenya.html', 'public/why-nenya.html', 'public/llms.txt', 'public/manifest.json', 'public/pdf-assets/ATTRIBUTIONS.md'];
const all = files.map(read).join('\n');
const about = read('public/about-nenya.html');
const why = read('public/why-nenya.html');
const llms = read('public/llms.txt');

const banned: Array<[string, RegExp]> = [
  ['NVC+', /NVC\+/],
  ['proven', /\bproven\b/i],
  ['zero-knowledge', /zero-knowledge/i],
  ['stores nothing / sends nothing', /\b(stores|sends) nothing\b/i],
  ['public charity / public arts charity', /public (arts )?charity/i],
  ['"Nothing you enter is collected"', /Nothing you enter is collected/i],
  ['user-sovereign', /user-sovereign/i],
  ['privacy-first', /privacy-first/i],
  ['"no backend"', /no backend/i],
  ['"never sent anywhere", "architectural fact"', /never\s+sent\s+anywhere|architectural fact/i],
  ['"built exactly for this"', /built exactly for this/i],
  ['"independently verifiable"', /independently verifiable/i],
  ['"psychological framework"', /psychological framework/i],
  ['"prove what"', /\bprove what\b/i],
  ['old lens words (gateway, Insight)', /gateway|\bInsight\b/i],
  ['"often more useful"', /often more useful/i],
  ['"functions like one"', /functions like one/i],
  ['"Yes, entirely"', /Yes, entirely/i],
  ['"decide for you"', /decide for you/i],
  ['"method" for our own approach (method notes)', /method notes|NVC method|Our NVC/i],
  ['"exactly" what it is built for / "scientifically"', /scientifically (proven|recognized)/i],
];
for (const [name, rx] of banned) ok(`the public files no longer say: ${name}`, !rx.test(all));

ok('Fractured Atlas is "a 501(c)(3) nonprofit" everywhere the files name it', /501\(c\)\(3\) nonprofit/.test(about) && !/501\(c\)\(3\) (?!nonprofit)/.test(all));
ok('the Terms keep "sole proprietor", so no public file claims the nonprofit corporation yet', !/Minnesota nonprofit|nonprofit corporation/i.test(all));
ok('the pages say the conversation is not stored unless a signed transcript is sent', /unless a visitor chooses to send a signed transcript/.test(about) && /unless you choose to send a signed transcript/.test(why) && /signed transcript to Nenya's own private storage/.test(llms));
ok('the between-visits storage names both small notes (the timestamp and the word-list note), as Terms Sections 12 and 16 do', (about.match(/word lists/g) ?? []).length >= 2 && /word lists/.test(why));
ok('Save and return later is named, with its 24 hours at most', /Save and return later/.test(about) && /24 hours at most/.test(about));
ok('the check for automated traffic is described as not enforced for now (Terms Section 15)', (about.match(/not enforced/g) ?? []).length >= 2);
ok('the daily codes are named for the coach limit, the guestbook and the palette button, deleted within two days', /one-way daily codes from connection addresses \(for the coach demo's daily limit, the guestbook and the palette button\), deleted within two days/.test(about));
ok('the pages say no study of Nenya was done and no clinician or lawyer reviewed it', /have not measured whether Nenya helps, and no clinician or lawyer has reviewed it/.test(why) && /no clinician or lawyer has reviewed it/.test(llms) && /We have not tested whether it helps/.test(about));
ok('"approach" names our own way of doing things, and the added layer is called untested', /Our Approach page/.test(about) && /untested/.test(llms) && /has not been tested/.test(about));
ok('the manifest does not promise that everything stays on the device', !/What you enter stays on your device\./.test(read('public/manifest.json')) && /unless you choose to send it/.test(read('public/manifest.json')));
ok('no public file holds a local path of the owner\'s computer', ![...files, 'public/pdf-assets/visual-aids-review/_manifest.json', 'public/robots.txt', 'public/sitemap.xml'].some((f) => /\/Users\//.test(read(f))));
ok('the visual-aids manifest still parses and every entry has a relative file path', (() => { const m = JSON.parse(read('public/pdf-assets/visual-aids-review/_manifest.json')); return Array.isArray(m) && m.length > 0 && m.every((e: { file: string }) => typeof e.file === 'string' && !e.file.startsWith('/')); })());
ok('about-nenya.html structured data still parses', (() => { try { return JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(about)![1]).mainEntity.length === 10; } catch { return false; } })());
