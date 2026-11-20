// The phrase workbench page's state machine (src/lib/workbenchView.ts): what each tap or key does, and what is announced. No browser needed.
import { initialView, reduce, selText, EXAMPLE_SENTENCE, type Action, type ViewState } from '../src/lib/workbenchView.ts';
import { tokensOf } from '../src/lib/phraseWorkbench.ts';
import { ok } from './helpers.mts';

const run = (s: ViewState, ...as: Action[]) => as.reduce(reduce, s);
const id = (s: ViewState, w: string) => tokensOf(s.wb).find((t) => t.text === w)!.id;

let s = initialView();
ok('it opens on the sentence step with an example, no marks and nothing selected', s.step === 0 && s.draft === EXAMPLE_SENTENCE && s.wb.marks.length === 0 && s.sel === null);
s = run(s, { t: 'draft', text: 'I felt tired and I need rest.' }, { t: 'make' });
ok('Make it markable turns the draft into the sentence and moves to Mark, announcing it', s.step === 1 && s.wb.sentence === 'I felt tired and I need rest.' && /ready to mark/.test(s.announce));
const long = run(initialView(), { t: 'draft', text: 'a '.repeat(250) }, { t: 'make' });
ok('a sentence that is too long stays on step 1 and says by how much, in plain words', long.step === 0 && /over/.test(long.announce) && !/wrong|error/i.test(long.announce));
ok('an empty draft says so and does not move on', run(initialView(), { t: 'draft', text: '   ' }, { t: 'make' }).step === 0);

s = run(s, { t: 'select', id: id(s, 'tired') });
ok('tapping a word selects it and announces it', s.sel?.a === id(s, 'tired') && s.announce === 'Selected “tired”.');
ok('tapping the same single word again unselects it', run(s, { t: 'select', id: id(s, 'tired') }).sel === null);
ok('punctuation cannot be selected', run(s, { t: 'select', id: tokensOf(s.wb).find((t) => t.text === '.')!.id }).sel?.a === id(s, 'tired'));
const ext = run(s, { t: 'extend' });
ok('Add the next word extends to the next word and skips punctuation', selText(ext) === 'tired and' && selText(run(ext, { t: 'extend' })) === 'tired and I');
ok('extending past the last word says so and stays', /last word/.test(run(run(initialView(), { t: 'draft', text: 'one two' }, { t: 'make' }), { t: 'select', id: 1 }, { t: 'extend' }).announce));
ok('Select the whole sentence covers first to last word', selText(run(s, { t: 'select-all' })) === 'I felt tired and I need rest');
ok('Unselect clears it', run(s, { t: 'unselect' }).sel === null);

ok('marks are four first, all eight after More marks, and back', run(s, { t: 'more' }).more === true && run(s, { t: 'more' }, { t: 'more' }).more === false);
const m = run(s, { t: 'mark', kind: 'feeling' });
ok('marking adds the mark, clears the selection, announces it plainly and remembers it for focus', m.wb.marks.length === 1 && m.sel === null && m.announce === 'Marked “tired” as a feeling.' && m.lastMark === m.wb.marks[0].id);
ok('marking with nothing selected does nothing', run(initialView(), { t: 'mark', kind: 'feeling' }).wb.marks.length === 0);
const m2 = run(m, { t: 'select', id: id(m, 'tired') }, { t: 'mark', kind: 'saw' });
ok('a word can carry more than one mark', m2.wb.marks.length === 2);
const r = run(m2, { t: 'remove', id: m2.wb.marks[0].id });
ok('removing a mark announces it, and an unknown id changes nothing', r.wb.marks.length === 1 && /^Removed the mark from “tired”/.test(r.announce) && run(m2, { t: 'remove', id: 99 }) === m2);
ok('clear all marks works and is announced', run(m2, { t: 'clear-marks' }).wb.marks.length === 0 && /All marks removed/.test(run(m2, { t: 'clear-marks' }).announce));
ok('stepping goes to a real step only', run(s, { t: 'step', step: 3 }).step === 3 && run(s, { t: 'step', step: 9 }).step === s.step && run(s, { t: 'step', step: 1.5 }).step === s.step);
ok('no announcement carries a verdict word', [s.announce, m.announce, r.announce, ext.announce].every((x) => !/\b(wrong|correct|good|bad|error|mistake|score)\b/i.test(x)));
ok('the state holds no time, counter or history', !('time' in s) && !('count' in s) && !('history' in s));
