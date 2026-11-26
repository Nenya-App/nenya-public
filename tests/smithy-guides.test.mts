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
