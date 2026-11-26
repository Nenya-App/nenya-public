// The "make your own" guides (docs/smithy-guides-scope.md): how a guide file is read, and the rules every guide must keep.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';
import { parseGuide, readingGrade, guideProblems, REPO_BLOB } from '../src/lib/smithyGuide.ts';

const sample = (body: string, files = 'README.md, package.json') =>
  `---\nnumber: 2\nslug: get-the-code\ntitle: Get the code and light it up\nsummary: Get your copy and open it.\nstatus: draft\nfiles: ${files}\n---\n\n${body}\n`;
const PLAIN = '## Get your copy\n\nYou need the code on your computer. Then you can open it.\n\n1. Open the page.\n2. Save the file.\n\n```bash\nnpm install\n```\n\n| File | What it holds |\n|---|---|\n| `package.json` | The list of parts |';
const exists = (p: string) => ['README.md', 'package.json', 'src/app/App.tsx'].includes(p);
const problems = (body: string, files?: string) => guideProblems(parseGuide(sample(body, files)), exists);
const throwsWith = (md: string, re: RegExp) => { try { parseGuide(md); return false; } catch (e) { return re.test(String((e as Error).message)); } };

const g = parseGuide(sample(PLAIN));
ok('parses the front block and each block kind', g.number === 2 && g.slug === 'get-the-code' && g.status === 'draft' && g.files.join() === 'README.md,package.json' && g.blocks.map((b) => b.k).join() === 'h,p,list,code,table');
ok('a plain guide has no problems', guideProblems(g, exists).length === 0, guideProblems(g, exists).join('; '));

const literal = '<script>|\n`a` ``b`` **c** [d](javascript:x)';
const lit = parseGuide(sample('Run this.\n\n```text\n' + literal + '\n```'));
const block = lit.blocks.find((b) => b.k === 'code');
ok('code is literal', block?.k === 'code' && block.code === literal && block.lang === 'text');
ok('raw HTML outside code is refused, naming the line', throwsWith(sample('Hello <b>there</b>.'), /line \d+/));
ok('an unclosed code block is refused', throwsWith(sample('```bash\nnpm install'), /line \d+/));
ok('a status other than draft or approved is refused', throwsWith(sample(PLAIN).replace('status: draft', 'status: ready'), /status/));

for (const href of ['javascript:alert(1)', 'http://github.com/Nenya-App/nenya-public', 'https://example.com', 'https://github.com/someone/else', 'https://github.com/Nenya-App/nenya-public/../../someone', '/about']) {
  ok(`refuses unsafe links: ${href}`, problems(`Read [this page](${href}).`).some((p) => /link/i.test(p)));
}
for (const href of ['https://github.com/Nenya-App/nenya-public', 'https://nodejs.org/en/download', 'https://www.gnu.org/licenses/agpl-3.0.html']) {
  ok(`allows the link: ${href}`, problems(`Read [this page](${href}).`).length === 0, problems(`Read [this page](${href}).`).join('; '));
}

ok('every named file must exist', problems(PLAIN, 'README.md, nope.md').some((p) => p.includes('nope.md')));
ok('a repository link must point at a real file', problems(`Open [src/app/Nope.tsx](${REPO_BLOB}src/app/Nope.tsx).`).some((p) => p.includes('src/app/Nope.tsx')));
ok('a repository link needs its path written as text', problems(`Open [the main file](${REPO_BLOB}src/app/App.tsx).`).some((p) => /path/i.test(p)));
ok('a repository link with its path written is fine', problems(`Open [\`src/app/App.tsx\`](${REPO_BLOB}src/app/App.tsx).`).length === 0, problems(`Open [\`src/app/App.tsx\`](${REPO_BLOB}src/app/App.tsx).`).join('; '));

ok('server binding: an open server command is a problem', problems('Run it.\n\n```bash\npython3 -m http.server 8000\n```').length > 0);
ok('server binding: bound to this computer is fine', problems('Run it.\n\n```bash\npython3 -m http.server 8000 --bind 127.0.0.1\n```').length === 0);
ok('server binding: --host is a problem', problems('Run it.\n\n```bash\nnpm run dev -- --host\n```').length > 0);

for (const w of ['heal', 'healing', 'calm', 'calming', 'stress relief', 'proven', 'anonymous', 'trauma-informed', 'therapy']) {
  ok(`claim words: "${w}" is a problem`, problems(`This will ${w} you.`).some((p) => /claim/i.test(p)));
}
ok('claim words: "not therapy" is fine, and so is "health"', problems('It is not therapy. Check the health of your disk.').length === 0);
ok('claim words: a setting name written as code is not a claim', problems('Pick the `Calm` look.').length === 0);

const hard = 'Subsequently, comprehensive configuration necessitates considerable organizational understanding regarding interdependent infrastructural characteristics.';
ok('reading grade: hard prose is a problem', readingGrade(parseGuide(sample(hard))) > 9.5 && problems(hard).some((p) => /reading/i.test(p)));
ok('reading grade: the plain sample is at or below 9.5', readingGrade(g) <= 9.5, String(readingGrade(g)));
ok('reading grade: code is left out', readingGrade(parseGuide(sample(PLAIN + '\n\n```text\n' + hard + '\n```'))) === readingGrade(g));

// ---- the guides themselves, and the offline check (Task 2)
const { outwardRequests } = await import('../src/lib/smithyOffline.ts');
ok('outward requests: only what leaves this origin', outwardRequests(['http://127.0.0.1:8000/a', 'data:x', 'blob:y', 'https://example.com/z', 'http://localhost:9/q'], 'http://127.0.0.1:8000').join() === 'https://example.com/z,http://localhost:9/q');

const dir = fileURLToPath(new URL('../docs/smithy/', import.meta.url));
const root = fileURLToPath(new URL('..', import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const guides = files.map((f) => ({ f, g: parseGuide(readFileSync(join(dir, f), 'utf8')), text: readFileSync(join(dir, f), 'utf8') }));
ok('guides 1, 2 and 6 are written', [1, 2, 6].every((n) => guides.some((x) => x.g.number === n)));
ok('each file is named NN-<slug>.md', guides.every((x) => x.f === `${String(x.g.number).padStart(2, '0')}-${x.g.slug}.md`), files.join(' '));
for (const { f, g: one } of guides) {
  const p = guideProblems(one, (path) => existsSync(join(root, path)));
  ok(`no problems: ${f}`, p.length === 0, p.join('; '));
}

const two = guides.find((x) => x.g.number === 2)!;
const codes = two.g.blocks.flatMap((b) => (b.k === 'code' ? [b.code] : []));
const firstNode = codes.findIndex((c) => /\bnode\b/.test(c));
ok('guide 2 checks Node first', codes[firstNode]?.includes('node --version') === true && firstNode < codes.findIndex((c) => c.includes('npm install')));
ok('guide 2 names version 24', /\b24\b/.test(two.text));
for (const { f, g: one, text } of guides) {
  if (!/\bpython3\b/.test(text)) continue;
  const heads = one.blocks.flatMap((b) => (b.k === 'h' ? [b.text.map((p) => p.s).join('')] : []));
  ok(`commands that differ are shown for both systems: ${f}`, /(^|\n)py /.test(one.blocks.flatMap((b) => (b.k === 'code' ? [b.code] : [])).join('\n')) && heads.some((h) => h.includes('Mac')) && heads.some((h) => h.includes('Windows')));
}

// ---- the generated site data (Task 4)
const { smithyDataSource } = await import('../src/lib/smithyGuide.ts');
const { SMITHY_GUIDES } = await import('../src/lib/smithyData.ts');
const approved = guides.map((x) => x.g).filter((x) => x.status === 'approved');
ok('data is current (run `npm run smithy`)', smithyDataSource(approved) === readFileSync(join(root, 'src/lib/smithyData.ts'), 'utf8'));
ok('only approved guides ship', SMITHY_GUIDES.length === approved.length && SMITHY_GUIDES.every((x) => x.status === 'approved'));
const data = readFileSync(join(root, 'src/lib/smithyData.ts'), 'utf8');
ok('no draft slug appears in the data file', guides.filter((x) => x.g.status !== 'approved').every((x) => !data.includes(`"slug": "${x.g.slug}"`)));

// ---- guides 3, 4, 5 and 7 (Task 6)
const text = (n: number) => guides.find((x) => x.g.number === n)?.text ?? '';
ok('guide 3 shows where things live', ['README.md', 'src/app/App.tsx', 'src/lib'].every((f) => text(3).includes(f)));
ok('guide 4 names its files', ['src/styles/globals.css', 'src/lib/breathingPresets.ts', 'src/lib/logoLook.ts', 'src/lib/logoColours.ts', 'src/app/components/NenyaLogo.tsx'].every((f) => text(4).includes(f)));
ok('guide 4 says the lighter animation levels are only planned', /planned/i.test(text(4)) && /not built/i.test(text(4)));
ok('guide 4 warns about curly quotes', /curly quotes/i.test(text(4)));
ok('guide 5 names every place to start with', ['info@nenya.biz', 'TRADEMARK.md', 'index.html', 'public/manifest.json', 'public/icons'].every((f) => text(5).includes(f)));
ok('guide 5 gives a search for both systems', text(5).includes('grep -rn') && text(5).includes('findstr'));
ok('guide 7 says what it is not, and names the license and the name rules', ['not legal advice', 'AGPL-3.0', 'TRADEMARK.md', 'LICENSE'].every((f) => text(7).includes(f)));
ok('all seven guides are written', [1, 2, 3, 4, 5, 6, 7].every((n) => guides.some((x) => x.g.number === n)));
ok('guide 5 names the header and welcome screen too', ['src/app/components/GlobalNavigation.tsx', 'src/app/components/OnboardingFlow.tsx'].every((f) => text(5).includes(f)));

// ---- from the branch review (2026-11-25)
ok('guide 5 searches all of src, for the name and the address', ['grep -rni "nenya" src index.html public', 'findstr /s /n /i "nenya" src\\* public\\*', 'findstr /n /i "nenya" index.html'].every((c) => text(5).includes(c)));
ok('guide 5 names the saved report and the answers text', ['src/lib/nenyaPdfReport.ts', 'src/lib/aboutNenya.ts', 'src/lib/smithyData.ts'].every((f) => text(5).includes(f)));
ok('guide 6 shows how to run the check off a Mac', text(6).includes('set "CHROME=') && text(6).includes('CHROME=/usr/bin/google-chrome node scripts/smithy-offline-check.mts') && /have not been tried/.test(text(6)));

// formats the reader would see wrongly are refused, not passed through
for (const [name, body] of [
  ['a quote', '> quoted words'], ['a ~~~ fence', '~~~\nx\n~~~'], ['a rule', 'Words.\n\n---'], ['underscore italics', 'This is _very_ good.'], ['star italics', 'This is *very* good.'],
  ['an HTML entity', 'Fish &amp; chips.'], ['a list starting at 3', '3. Third thing.'], ['a list line carried on without indent', '- First item\nand more of it'], ['a link inside bold', '**see [this](https://nodejs.org)**'],
] as const) {
  ok(`refused: ${name}`, throwsWith(sample(body), /line \d+/));
}
ok('code keeps all of those literally', parseGuide(sample('Run.\n\n```text\n> a\n~~~\n---\n_x_ &amp; *y*\n```')).blocks.some((b) => b.k === 'code' && b.code.includes('_x_ &amp; *y*')));
ok('inline code may hold underscores and stars', parseGuide(sample('Open `DEFAULT_LOGO_LEAVES` and `src/*` now.')).blocks.length === 1);
const offline = readFileSync(join(root, 'scripts/smithy-offline-check.mts'), 'utf8');
ok('the offline check closes the panel by its name, and counts it if it cannot', offline.includes("click('Close the breathing panel', 'close the breathing panel')"));
