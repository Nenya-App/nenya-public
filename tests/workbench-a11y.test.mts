// Static checks on the phrase workbench page's source (docs/phrase-workbench-scope.md, section 5; WCAG 2.2 AAA): what can be read from the code. Not a replacement
// for a person using it with a screen reader, a keyboard and a switch (docs/accessibility-standard.md).
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f: string) => readFileSync(join(root, f), 'utf8');
const page = read('src/app/components/pages/PhraseWorkbenchPage.tsx');
const wbDir = 'src/app/components/workbench';
const parts = readdirSync(join(root, wbDir)).filter((f) => /\.tsx?$/.test(f)).map((f) => read(`${wbDir}/${f}`));
const all = [page, ...parts].join('\n');

ok('nothing can be dragged: no draggable, no drag handlers', !/draggable|onDrag|onDrop|ondrag|dragstart/i.test(all));
ok('no mouse-only or touch-only handlers (everything works by tap or key)', !/onMouse(Down|Up|Move)|onTouch(Start|End|Move)|onPointer(Down|Up|Move)/.test(all));
ok('every button says type="button"', (all.match(/<button\b/g) ?? []).length === (all.match(/<button\b[^>]*type="button"/gs) ?? []).length);
ok('word chips are buttons that say whether they are selected, with a name that includes their marks', /data-tok=/.test(page) && /aria-pressed=\{selected\(t\.id\)\}/.test(page) && /aria-label=\{`\$\{t\.text\}, \$\{desc\}`\}/.test(page));
ok('a mark shows as a visible text tag and a line or box shape, not colour alone', /markInfo\(m\.kind\)\.name\.toLowerCase\(\)/.test(page) && /shapeStyle\(/.test(page) && !/backgroundColor|bg-(red|green|blue|yellow|orange|purple)/.test(all));
ok('the page never uses a warning or error colour', !/destructive|text-red|bg-red|border-red|text-rose|border-rose/.test(all));
ok('changes are announced in a polite live region', /role="status" aria-live="polite"/.test(page));
ok('controls are at least 44 by 44 pixels', /min-h-11 min-w-11/.test(page) && !/\bsize-(5|6|7|8)\b[^"]*\bbutton/.test(page));
ok('the sentence box has a label and a description', /htmlFor="wb-sentence"/.test(page) && /aria-describedby="wb-count"/.test(page));
ok('steps are a labelled list of buttons, the current one marked', /<nav aria-label="Steps">/.test(page) && /aria-current=\{s\.step === i \? 'step' : undefined\}/.test(page));
ok('the sentence is also available as plain text for a screen reader', /The sentence reads:/.test(page));
ok('"More marks" says whether it is open', /aria-expanded=\{s\.more\}/.test(page));
ok('the credit is shown with a link to CNVC’s own page', /WB\.credit/.test(page) && /CNVC_PAGE/.test(page));
ok('the page has one heading level 1 and is a main landmark with a target for the skip link', (page.match(/<h1\b/g) ?? []).length === 1 && /<main id="main-content"/.test(page));
ok('the page stores and sends nothing: no fetch, no storage, no cookies', !/fetch\(|localStorage|sessionStorage|document\.cookie|XMLHttpRequest|sendBeacon/.test(page.replace(/Remember on this device/g, '')) || /deviceMemory/.test(page));

// The switch
const app = read('src/app/App.tsx');
ok('the page is reached only when the build switch is on', /currentScreen === 'phrases' && phraseWorkbenchOn\(\)/.test(app) && /phraseWorkbenchOn\(\) && isPhrasesPath/.test(app));
ok('the switch is off unless VITE_PHRASE_WORKBENCH is "on", and documented', /=== 'on'/.test(read('src/lib/workbenchSwitch.ts')) && read('docs/production-env.md').includes('VITE_PHRASE_WORKBENCH'));
