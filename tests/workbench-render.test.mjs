// Renders the phrase workbench page on the server in each state (the same way tests/render.test.mjs does), so a page that builds but crashes when drawn is caught,
// and so the wording, roles and marks can be read from the real output. No browser. Interaction itself is tested on the state machine (workbench-view.test.mts).
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { ok } from './helpers.mts';

const root = fileURLToPath(new URL('..', import.meta.url));
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 };
globalThis.window ??= { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
const require = createRequire(root + 'package.json');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const vite = await createServer({ root, mode: 'test', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const draw = (V, props) => { try { return renderToStaticMarkup(React.createElement(V, props)); } catch (e) { return { error: e.message }; } };

try {
  const { WorkbenchView } = await vite.ssrLoadModule('/src/app/components/pages/PhraseWorkbenchPage.tsx');
  const view = await vite.ssrLoadModule('/src/lib/workbenchView.ts');
  const core = await vite.ssrLoadModule('/src/lib/phraseWorkbench.ts');
  const { initialView, reduce } = view;
  const noop = () => {};
  const text = (h) => (typeof h === 'string' ? h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') : '');

  let s = initialView();
  let h = draw(WorkbenchView, { s, send: noop, onBack: noop });
  ok('step 1 renders: the example sentence, the count, the make button, the credit, no verdict words', typeof h === 'string' && h.includes('When you left again') && h.includes('Make it markable') && h.includes('The Center for Nonviolent Communication © 2023, www.CNVC.org') && !/\b(wrong|correct|error|mistake|score)\b/i.test(text(h)), h.error ?? '');
  ok('the CNVC link goes to CNVC’s own page and opens in a new tab', typeof h === 'string' && h.includes('href="https://www.cnvc.org/store/feelings-and-needs-inventory"') && h.includes('target="_blank"'));

  s = reduce(reduce(s, { t: 'draft', text: 'I felt tired, and I need rest.' }), { t: 'make' });
  h = draw(WorkbenchView, { s, send: noop, onBack: noop });
  const chips = typeof h === 'string' ? (h.match(/data-tok="\d+"/g) ?? []).length : 0;
  ok('step 2 renders one button per word (punctuation is not a button), each with pressed state and name', chips === 7 && h.includes('aria-pressed="false"') && h.includes('aria-label="tired, no mark"'), h.error ?? '');
  ok('with nothing selected the marks wait: no mark buttons yet', typeof h === 'string' && !h.includes('Saw or heard</span>') && text(h).includes('Choose a word above to see the marks'));

  s = reduce(s, { t: 'select', id: 2 });
  h = draw(WorkbenchView, { s, send: noop, onBack: noop });
  ok('a selected word shows the four first marks, each with its plain line, and More marks', typeof h === 'string' && ['Saw or heard', 'A feeling', 'A need', 'A request'].every((n) => h.includes(n)) && !h.includes('A demand</span>') && h.includes('aria-expanded="false"') && h.includes('Selected:'));
  s = reduce(s, { t: 'more' });
  h = draw(WorkbenchView, { s, send: noop, onBack: noop });
  ok('More marks shows all eight', typeof h === 'string' && ['A story', 'A thought, passing as a feeling', 'A way to meet it', 'A demand'].every((n) => h.includes(n)));

  s = reduce(s, { t: 'mark', kind: 'feeling' });
  h = draw(WorkbenchView, { s, send: noop, onBack: noop });
  ok('a mark shows as a text tag, a dotted line, its name in the chip, and a Remove button in the list', typeof h === 'string' && h.includes('a feeling') && h.includes('text-decoration-style:dotted') && h.includes('aria-label="tired, A feeling"') && h.includes('Remove the mark from tired'));
  ok('the live region carries the announcement', typeof h === 'string' && h.includes('role="status" aria-live="polite"') && h.includes('Marked “tired” as a feeling.'));
  ok('the key names every shape in words', typeof h === 'string' && ['solid line under', 'dotted line under', 'box around', 'line over', 'dashed line under', 'double line under', 'dashed box around', 'wavy line under'].every((w) => h.includes(w)));
  ok('the page draws without a warning or error colour', typeof h === 'string' && !/destructive|text-red|border-red/.test(h.slice(h.indexOf('<main'), h.indexOf('</main>'))));
  ok('nothing in the page posts anywhere: no form, no action', typeof h === 'string' && !/<form|action=/.test(h));

  // say more and the slider step
  let n = reduce(reduce(initialView(), { t: 'draft', text: 'I need to count on you.' }), { t: 'make' });
  n = reduce(reduce(reduce(reduce(n, { t: 'select', id: 3 }), { t: 'extend' }), { t: 'extend' }), { t: 'mark', kind: 'need' });
  h = draw(WorkbenchView, { s: n, send: noop, onBack: noop });
  ok('after a need is marked the say-more panel offers the seven groups, optional, nothing chosen', typeof h === 'string' && ['Physical wellbeing', 'Connection', 'Honesty', 'Play', 'Peace', 'Autonomy', 'Meaning'].every((g) => h.includes(g)) && text(h).includes('This is optional') && !h.includes('Open this into specific needs'), h.error ?? '');
  n = reduce(n, { t: 'detail-pick', id: n.wb.marks[0].id, level: 'category', name: 'Connection' });
  h = draw(WorkbenchView, { s: n, send: noop, onBack: noop });
  ok('choosing a group offers "Open this into specific needs" but shows no words yet', typeof h === 'string' && h.includes('Open this into specific needs') && !h.includes('>trust<'));
  n = reduce(reduce(n, { t: 'spec' }), { t: 'detail-pick', id: n.wb.marks[0].id, level: 'family', name: 'Being able to count on people' });
  h = draw(WorkbenchView, { s: n, send: noop, onBack: noop });
  ok('opening shows the families and the words of the chosen family', typeof h === 'string' && h.includes('Being known') && h.includes('>trust<') && h.includes('>reliability<'));
  n = reduce(n, { t: 'step', step: 2 });
  h = draw(WorkbenchView, { s: n, send: noop, onBack: noop });
  ok('step 3 lists the need with an unchecked "Add a met-to-unmet slider" and no slider yet', typeof h === 'string' && h.includes('Add a met-to-unmet slider') && !h.includes('type="range"'));
  n = reduce(n, { t: 'slider', id: n.wb.marks[0].id, on: true });
  h = draw(WorkbenchView, { s: n, send: noop, onBack: noop });
  ok('with the slider on: a native range 0 to 6 with a spoken value, a visible label, "Not marked yet", and the seven steps as buttons', typeof h === 'string' && h.includes('type="range"') && h.includes('min="0"') && h.includes('max="6"') && h.includes('step="1"') && h.includes('aria-valuetext="Not marked yet"') && h.includes('How much is this need met, right now, here?') && text(h).includes('Not marked yet. Move the slider or pick a step') && ['Not at all', 'A little', 'Some', 'About half', 'Mostly', 'Almost fully', 'Fully'].every((w) => h.includes('>' + w + '<')));
  n = reduce(n, { t: 'level', id: n.wb.marks[0].id, level: 4 });
  h = draw(WorkbenchView, { s: n, send: noop, onBack: noop });
  ok('once set: the spoken value follows, the visible value is a name, and no number is shown', typeof h === 'string' && h.includes('aria-valuetext="Mostly, step 5 of 7"') && text(h).includes('Now: Mostly') && !/Now: [^A-Za-z]*\d/.test(text(h)));
  ok('there is no total, average or overall slider anywhere on the page', typeof h === 'string' && !/overall|average|total|in all/i.test(text(h.slice(h.indexOf('<main'), h.indexOf('</main>')))));
} finally {
  await vite.close();
}
