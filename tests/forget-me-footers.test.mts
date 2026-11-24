// "A Forget me link at the bottom of every page" is said in the Terms (Section 16), the privacy page, the settings window, the About answers, the Mind's facts and
// the safety features card. This test keeps it true: every visitor page either carries the shared footer (AppFooter) or the small one (MinimalFooter), both of which hold the
// Forget me link, or is listed below with a reason. A new page added without either fails here until it has a footer or an allow-list entry with a reason.
// The list of pages and the reasons are also in docs/forget-me-footers.md (this test checks the two agree).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ok } from './helpers.mts';

const root = new URL('..', import.meta.url).pathname;
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const hasFooter = (src: string) => /<(AppFooter|MinimalFooter)\b/.test(src);

// 1. The two footers hold the link and the non-affiliation notice.
const app = read('src/app/components/AppFooter.tsx');
const min = existsSync(join(root, 'src/app/components/MinimalFooter.tsx')) ? read('src/app/components/MinimalFooter.tsx') : '';
ok('the full footer holds the Forget me link and the non-affiliation notice', /<ForgetMeLink\s*\/>/.test(app) && /NON_AFFILIATION/.test(app));
ok('the small footer exists and holds the Forget me link (the one from DeviceMemoryControls) and the non-affiliation notice', /<ForgetMeLink\s*\/>/.test(min) && /from '\.\/DeviceMemoryControls'/.test(min) && /NON_AFFILIATION/.test(min));

// 2. Every entry page. Allowed without a footer: only with a reason.
type Entry = { html: string; main?: string; footer: string[] | null; reason?: string; visitor: boolean; viaScript?: boolean };
const PAGES: Entry[] = [
  { html: 'index.html', main: 'src/main.tsx', footer: ['src/app/App.tsx'], visitor: true },
  { html: 'coach/index.html', main: 'src/coach/main.tsx', footer: ['src/coach/CoachPage.tsx', 'src/coach/CoachDemo.tsx'], visitor: true },
  { html: 'verify/index.html', main: 'src/verify/main.tsx', footer: ['src/verify/VerifyPage.tsx'], visitor: true },
  { html: 'my-transcript/index.html', main: 'src/mytranscript/main.tsx', footer: ['src/mytranscript/MyTranscriptPage.tsx'], visitor: true },
  { html: 'cell/index.html', main: 'src/cell/main.tsx', footer: ['src/cell/CellPage.tsx'], visitor: true },
  { html: 'admin/index.html', main: 'src/admin/main.tsx', footer: null, visitor: false, reason: 'the owner\'s private numbers page: behind a sign-in, not linked from anywhere, and it keeps nothing on the device for Forget me to erase' },
  { html: 'bench/index.html', main: 'src/bench/main.tsx', footer: null, visitor: false, reason: 'the owner\'s logo design bench: not linked anywhere, not indexed, a tool for tuning the gem' },
  { html: 'logo-export/index.html', main: 'src/logo-export/main.tsx', footer: null, visitor: false, reason: 'drawn by the dev server only to render logo files (not a build input, so not in the production site)' },
  { html: 'public/about-nenya.html', footer: null, visitor: true, viaScript: true },
  { html: 'public/why-nenya.html', footer: null, visitor: true, viaScript: true },
];

// Every html page in the repo (outside the places that are not the site) is in the table.
// `dev` is a git-ignored folder of local preview tools (breath, gem and vector previews) that exists only in some checkouts and is not part of the site or the repo.
const skip = new Set(['node_modules', '.git', '.claude', 'docs', 'scripts', 'dist', 'tests', 'netlify', 'dev']);
const found: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(join(root, dir))) {
    if (skip.has(name) || name === 'node_modules') continue;
    const p = dir ? `${dir}/${name}` : name;
    if (statSync(join(root, p)).isDirectory()) { if (!p.startsWith('public/') || p === 'public') walk(p); } else if (name.endsWith('.html')) found.push(p);
  }
};
walk('');
const listed = new Set(PAGES.map((p) => p.html));
ok('every html page in the repo is in the table above (a new page needs a footer or an allow-list reason)', found.every((f) => listed.has(f)) && PAGES.every((p) => found.includes(p.html)), found.filter((f) => !listed.has(f)).join(', '));

for (const p of PAGES) {
  if (p.viaScript) {
    // A static page has no React footer. It carries the control in its own footer and loads /forget-me.js (a same-origin file: the site allows no inline scripts).
    const html = read(p.html);
    const footer = /<footer>[\s\S]*<\/footer>/.exec(html)?.[0] ?? '';
    ok(`${p.html}: has the Forget me control (a real button) in its footer and loads /forget-me.js, with no inline script`, /<button type="button" id="forget-me-button">Forget me<\/button>/.test(footer) && /id="forget-me-status" role="status"/.test(footer) && /<script src="\/forget-me\.js" defer><\/script>/.test(html) && ![...html.matchAll(/<script\b([^>]*)>/g)].some((m) => !/\bsrc=|type="application\/ld\+json"/.test(m[1])));
    ok(`${p.html}: the script file exists and holds the wipe logic (nenya keys, the terms receipt, a click handler)`, existsSync(join(root, 'public/forget-me.js')) && /indexOf\('nenya'\) === 0/.test(read('public/forget-me.js')) && /sessionStorage\.removeItem\(RECEIPT\)/.test(read('public/forget-me.js')) && /addEventListener\('click'/.test(read('public/forget-me.js')));
  } else if (p.footer) {
    ok(`${p.html}: its page carries the shared footer, so the Forget me link`, p.footer.some((f) => hasFooter(read(f))) && p.footer.every((f) => existsSync(join(root, f))));
  } else {
    ok(`${p.html}: allowed without the link, with a reason`, !!p.reason && p.reason.length > 30);
  }
  if (p.main) ok(`${p.html}: its entry file ${p.main} exists and the page loads it`, read(p.html).includes(p.main.replace(/^/, '/')));
}
const vite = read('vite.config.ts');
ok('every page the build makes is in the table', [...vite.matchAll(/path\.resolve\(__dirname, '([^']+\.html)'\)/g)].every((m) => listed.has(m[1])));

// 3. Every About page and every screen of the app carries a footer, unless it is a part of another page.
const PART_OF_ANOTHER = new Map<string, string>([
  ['AboutReferences.tsx', 'a list of references that other About pages put in their own footer-carrying page; not a page'],
]);
for (const dir of ['src/app/components/about', 'src/app/components/pages']) {
  for (const f of readdirSync(join(root, dir)).filter((n) => n.endsWith('.tsx'))) {
    const src = read(`${dir}/${f}`);
    const name = f.replace(/\.tsx$/, '');
    // Two pages are given their footer by the About router, right after the page.
    const byRouter = new RegExp(`<${name}\\b[^>]*/>\\s*<AppFooter`).test(read('src/app/components/AboutNenya.tsx'));
    ok(`${dir}/${f}: carries the footer, or is a part of another page`, hasFooter(src) || byRouter || (PART_OF_ANOTHER.has(f) && PART_OF_ANOTHER.get(f)!.length > 20));
  }
}
// The screens of the app and the coach that are not under those two folders.
for (const f of ['src/coach/SessionKeyPicker.tsx', 'src/coach/BreathFirst.tsx', 'src/coach/ModeChooser.tsx', 'src/coach/SealedChat.tsx', 'src/coach/RegionGate.tsx', 'src/app/components/DyadicCellCreation.tsx', 'src/app/components/DyadicCellInterface.tsx']) {
  const owner = read('src/app/App.tsx') + read('src/coach/CoachPage.tsx') + read(f);
  ok(`${f}: a screen that shows with a footer (its own, or the page that holds it)`, hasFooter(owner));
}
ok('the app puts the small footer under the screens that have none of their own (key picker, preview cell screens)', /<MinimalFooter\b/.test(read('src/app/App.tsx')));
ok('the coach page puts it under every step before the conversation', /<MinimalFooter\b/.test(read('src/coach/CoachPage.tsx')));
ok('a visitor outside the US, shown the region notice, still gets the footer', /<MinimalFooter\b/.test(read('src/coach/RegionGate.tsx')));

// 4. The words that say where the link is agree with the pages: "every page" only when no visitor page is without it.
const gaps = PAGES.filter((p) => p.visitor && !p.footer && !p.viaScript).map((p) => p.html);
const card = read('src/lib/safetyFeaturesCard.ts');
const cardMatch = /text: 'A link at the bottom of (every|most) pages?/.exec(card);
const cardSays = cardMatch?.[1];
ok('the safety features card says "most pages" for Forget me while any visitor page lacks the link, and "every page" only when none does (a static page counts once it loads /forget-me.js)', !!cardMatch && (gaps.length > 0 ? cardSays === 'most' : cardSays === 'every'), `pages without it: ${gaps.join(', ') || 'none'}`);

// 5. The page list in the docs agrees with this one.
const doc = read('docs/forget-me-footers.md');
ok('docs/forget-me-footers.md names every page and every reason', PAGES.every((p) => doc.includes(p.html)) && PAGES.filter((p) => p.reason).every((p) => doc.includes(p.reason!)));
ok('docs/forget-me-footers.md says the two static pages get it through /forget-me.js', PAGES.filter((p) => p.viaScript).every((p) => new RegExp(`\\| \`${p.html.replace(/\./g, '\\.')}\` \\| via \`/forget-me\\.js\``).test(doc)));
// The site's content security policy allows the same-origin script (and still no inline scripts).
const csp = /Content-Security-Policy = "([^"]*)"/.exec(read('netlify.toml'))?.[1] ?? '';
ok('the content security policy allows scripts from the site itself and no inline script', /script-src 'self'[ ;]/.test(csp) && !/script-src[^;]*'unsafe-inline'/.test(csp));
