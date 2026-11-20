// Rephrasing's screens, rendered to static markup with a stand-in (esbuild bundles the real components; react-dom/server draws
// them; no browser), and the source read for the rules that must stay true: marks never colour alone, text labels, equal choices,
// 44 px targets, polite live regions, no storage, no AI route, the switch off by default. NOT checked here: how it looks, focus
// order in a real browser, a screen reader, contrast of rendered colours (no new colours are used; that is checked by reading).
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = (f: string) => readFileSync(join(root, f), 'utf8');
const out = join(mkdtempSync(join(tmpdir(), 'rp-')), 'bundle.mjs');
await build({
  stdin: {
    resolveDir: root,
    loader: 'tsx',
    contents: `
      import { renderToStaticMarkup } from 'react-dom/server';
      import React from 'react';
      import MarkEditor, { MarkedWord } from './src/cell/MarkEditor.tsx';
      import { Deciding, FirstUse } from './src/cell/RephraseConsent.tsx';
      import { Compared } from './src/cell/CompareViews.tsx';
      import { Hearing } from './src/cell/HearerViews.tsx';
      import { PhraseReview } from './src/cell/SpeakerViews.tsx';
      import { Controls } from './src/cell/RephraseControls.tsx';
      import { RephraseController } from './src/lib/rephraseController.ts';
      export { renderToStaticMarkup, React, MarkEditor, MarkedWord, Deciding, FirstUse, Compared, Hearing, PhraseReview, Controls, RephraseController };`,
  },
  bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'silent', jsx: 'automatic',
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});
const M: any = await import(pathToFileURL(out).href);
const h = M.React.createElement;
const html = (el: unknown) => M.renderToStaticMarkup(el) as string;
const text = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const words = ['You', 'were', 'late,', 'again.'];
const marks = new Map<number, string>([[2, 'saw'], [3, 'story']]);
const editor = html(h(M.MarkEditor, { id: 't', words, marks, hearer: false, onMark: () => undefined }));
const buttons = [...editor.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
ok('every word is a button with a name that says whether and how it is marked', buttons.length === 4 && buttons.every((b) => /aria-label="[^"]*(not marked|marked as)/.test(b) && /aria-pressed/.test(b)));
ok('a marked word shows its kind in words, with a glyph, not by colour', />late,<\/span><span class="block text-xs font-bold">■ saw</.test(editor) && />again\.<\/span><span class="block text-xs font-bold">○ story</.test(editor));
ok('each kind has a distinct line style, in the legend and on marked words', ['solid', 'dotted', 'double', 'dashed', 'wavy'].every((c) => editor.includes(`text-decoration-style:${c}`)) );
ok('the kind chooser is a labelled group of five radio buttons', /<fieldset[\s\S]*<legend[^>]*>Mark as<\/legend>/.test(editor) && (editor.match(/type="radio"/g) ?? []).length === 5);
ok('word buttons and radios are at least 44 px (min-h-11 / size-6 inside a min-h-11 label)', buttons.every((b) => /min-h-11/.test(b) && /min-w-11/.test(b)) && (editor.match(/<label[^>]*min-h-11/g) ?? []).length === 5);
ok('there is a polite live region for mark announcements', /role="status" aria-live="polite" class="sr-only"/.test(editor));
ok('the CNVC credit line, its link and the project-extension note are under the marks', editor.includes('The Center for Nonviolent Communication © 2023, www.CNVC.org') && /href="https:\/\/www\.cnvc\.org"/.test(editor) && /project extension/.test(editor));
const guess = html(h(M.MarkEditor, { id: 'h', words, marks: new Map([[1, 'feeling']]), hearer: true, onMark: () => undefined }));
ok('a hearer\'s feelings and needs are worded as guesses in the legend and on the word', /A feeling \(my guess\)/.test(guess) && /feeling, a guess/.test(guess) && /marked as a guess at a feeling/.test(guess));
ok('a read-only marked word has the same text name', /marked as a story/.test(html(h(M.MarkedWord, { word: 'again.', kind: 'story', hearer: false }))));

// Equal choices.
const ctl = new M.RephraseController({ send: async () => undefined });
const ctx = { ctl, client: null, paused: false, run: () => undefined, busy: false };
const deciding = html(h(M.Deciding, { ctx }));
const btns = [...deciding.matchAll(/<button[^>]*class="([^"]*)"[^>]*>([^<]*)</g)];
ok('the three answers are three buttons of the same look, none preselected', btns.length === 3 && new Set(btns.map((b) => b[1])).size === 1 && btns.map((b) => b[2]).join('|') === 'Yes, I will look|Not now|Not in this cell' && !/autofocus/.test(deciding));
ok('the request screen says nothing has been shown and shows no phrase', /Nothing has been shown yet/.test(deciding));
const first = text(html(h(M.FirstUse, { onUnderstood: () => undefined })));
ok('the first-use screen: copying, checks, two devices, hotline, therapy', /copy or screenshot/.test(first) && /can miss things/.test(first) && /two devices/.test(first) && /988/.test(first) && /not therapy/.test(first));

// A finished comparison, from both sides.
for (const viewer of ['speaker', 'hearer'] as const) {
  const c = new M.RephraseController({ send: async () => undefined });
  const phrase = 'You were late again, and I am tired of waiting.';
  c.state = viewer === 'speaker'
    ? { round: { id: 'a1b2c3d4', side: 'speaker', phase: 'revealed', phrase, meant: { marks: [[1, 2, 'saw'], [3, 3, 'story']], rewrite: 'I felt tired.' }, heard: { mode: 'send', marks: [[2, 2, 'saw'], [3, 3, 'feeling']], note: 'I heard worry.' } }, asksBlocked: false, ignoreAsks: false, notice: null, partnerAway: false }
    : { round: { id: 'a1b2c3d4', side: 'hearer', phase: 'compared', phrase, meant: { marks: [[1, 2, 'saw'], [3, 3, 'story']], rewrite: 'I felt tired.' }, heard: { mode: 'send', marks: [[2, 2, 'saw']] }, ownMarks: [[2, 2, 'saw'], [3, 3, 'feeling']] }, asksBlocked: false, ignoreAsks: false, notice: null, partnerAway: false };
  const m = html(h(M.Compared, { ctx: { ...ctx, ctl: c }, viewer }));
  const t = text(m);
  ok(`${viewer}: the comparison has a heading for each reading and one for word by word`, (m.match(/<h4/g) ?? []).length === 3 && /Word by word/.test(t));
  ok(`${viewer}: the four plain statements appear and nothing scores or judges`, /Marked by both of you, as different kinds/.test(t) && /Marked the same way by both of you/.test(t) && !/\b(wrong|mismatch|score|agree|gap|accurate|%)\b/i.test(t.replace('Neither is the right one.', '')) && !/\d/.test(t.replace('www.CNVC.org', '').replace('2023', '')));
  ok(`${viewer}: credit and the single remark`, t.includes('The Center for Nonviolent Communication © 2023, www.CNVC.org') && t.includes('Neither is the right one.'));
}
ok('the controls are Pause, Stop rephrasing and Close, as buttons', ['Pause', 'Stop rephrasing', 'Close and delete the cell'].every((l) => html(h(M.Controls, { ctx, onPause: () => undefined, onResume: () => undefined, onCloseCell: () => undefined })).includes(l)));

// Source rules.
const files = readdirSync(join(root, 'src/cell')).filter((f) => /^(Rephrase|Mark|Speaker|Hearer|Compare|Private|rephrase)/.test(f)).map((f) => `src/cell/${f}`)
  .concat(readdirSync(join(root, 'src/lib')).filter((f) => /^rephrase/.test(f)).map((f) => `src/lib/${f}`));
const all = files.map((f) => [f, src(f)] as const);
ok('there are rephrasing files to read', all.length >= 14);
ok('no rephrasing file touches browser storage, cookies or the URL', all.every(([, s]) => !/localStorage|sessionStorage|indexedDB|document\.cookie|location\.(search|hash)|history\.(push|replace)State/.test(s)));
ok('no rephrasing file makes its own request, logs, or reaches the coach or any AI route', all.every(([, s]) => !/\bfetch\(|XMLHttpRequest|sendBeacon|console\.|api\/coach|sealedCoach|veniceE2ee|workers-ai/.test(s)));
ok('no new colours: only theme tokens, no hex codes or palette colours in the screens', all.filter(([f]) => f.endsWith('.tsx')).every(([, s]) => !/#[0-9a-fA-F]{3,8}\b|text-(red|green|amber|blue|yellow|orange)-|bg-(red|green|amber|blue|yellow|orange)-/.test(s.replace(/border-amber-600/g, ''))));
ok('no text is lowered with opacity', all.filter(([f]) => f.endsWith('.tsx')).every(([, s]) => !/opacity-\d|text-foreground\/\d/.test(s)));
ok('polite live regions exist in the panel and the editor', /aria-live="polite"/.test(src('src/cell/RephrasePanel.tsx')) && /aria-live="polite"/.test(src('src/cell/MarkEditor.tsx')) && /aria-live="polite"/.test(src('src/cell/RephraseControls.tsx')));
ok('the panel is shown only with the switch on, and the switch is off by default', /rephraseOn\(\) && rephrase\.current/.test(src('src/cell/CellPage.tsx')) && /=== 'on'/.test(src('src/lib/rephraseSwitch.ts')));
ok('with the switch off a leaving page still closes the cell as before (the only early return needs the switch)', src('src/cell/CellPage.tsx').includes("if (rephraseOn() && e.persisted && rephrase.current) return;\n      void client.current?.close();"));
ok('the privacy notice for the writer is not in the coach\'s AI voice', !/I.m an AI|I am an AI/.test(src('src/cell/PrivateNotice.tsx') + src('src/lib/rephraseWords.ts')));
