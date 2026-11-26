// The "make your own" guides (docs/smithy-guides-scope.md): how a guide file is read, and the rules every guide must keep.
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
