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

// ---- say more (need and feeling detail) and sliders
import { browseFor, browseGroups } from '../src/lib/workbenchView.ts';
import { markLabel } from '../src/lib/phraseWorkbench.ts';
let n = run(initialView(), { t: 'draft', text: 'I need to count on you.' }, { t: 'make' });
n = run(n, { t: 'select', id: id(n, 'count') }, { t: 'extend' }, { t: 'extend' }, { t: 'mark', kind: 'need' });
const nid = n.wb.marks[0].id;
ok('marking a need opens the optional say-more panel, nothing chosen for the person', n.detailFor === nid && n.specOpen === false && !n.wb.marks[0].detail);
ok('marking a saw-or-heard does not open it', run(run(initialView(), { t: 'draft', text: 'one two' }, { t: 'make' }), { t: 'select', id: 0 }, { t: 'mark', kind: 'saw' }).detailFor === null);
ok('the first tier is the seven need groups (feelings: two sides)', browseGroups('need').length === 7 && browseGroups('feeling').length === 2);
let d = run(n, { t: 'detail-pick', id: nid, level: 'category', name: 'Connection' });
ok('choosing a group sets it, announced; families stay closed until asked', d.wb.marks[0].detail?.category === 'Connection' && browseFor(d.wb.marks[0], d.specOpen).families.length === 0 && /Connection/.test(d.announce));
d = run(d, { t: 'spec' });
ok('"Open this into specific needs" shows the group’s three families', browseFor(d.wb.marks[0], d.specOpen).families.length === 3);
d = run(d, { t: 'detail-pick', id: nid, level: 'family', name: 'Being able to count on people' });
ok('choosing a family shows four to six words', (browseFor(d.wb.marks[0], d.specOpen).family?.words.length ?? 0) >= 4);
d = run(d, { t: 'detail-pick', id: nid, level: 'word', name: 'trust' });
ok('choosing a word narrows the mark, and the label says so in the person’s terms', markLabel(d.wb.marks[0]) === 'A need: trust (Being able to count on people)');
ok('tapping the chosen word again takes it back', run(d, { t: 'detail-pick', id: nid, level: 'word', name: 'trust' }).wb.marks[0].detail?.word === undefined);
ok('a family from another group is ignored', run(d, { t: 'detail-pick', id: nid, level: 'family', name: 'Body basics' }).wb.marks[0].detail?.family === 'Being able to count on people');
ok('a word not on the list is ignored', run(d, { t: 'detail-pick', id: nid, level: 'word', name: 'zzz' }).wb.marks[0].detail?.word === 'trust');
ok('choosing the same group again clears the detail', run(d, { t: 'detail-pick', id: nid, level: 'category', name: 'Connection' }).wb.marks[0].detail === undefined);
const own = run(d, { t: 'detail-custom', id: nid, text: '  being picked up on time ' });
ok('the person’s own word is kept beside the list word, and can be removed', own.wb.marks[0].detail?.custom === 'being picked up on time' && run(own, { t: 'detail-custom', id: nid, text: '' }).wb.marks[0].detail?.custom === undefined);
ok('Done closes the panel', run(d, { t: 'detail-close' }).detailFor === null);
ok('say-more can be reopened from the list and an unknown mark changes nothing', run(d, { t: 'detail-close' }, { t: 'detail-open', id: nid }).detailFor === nid && run(d, { t: 'detail-open', id: 99 }) === d);
// feelings use the same panel
let fe = run(initialView(), { t: 'draft', text: 'I felt hurt.' }, { t: 'make' }, { t: 'select', id: 2 }, { t: 'mark', kind: 'feeling' });
fe = run(fe, { t: 'detail-pick', id: fe.wb.marks[0].id, level: 'category', name: 'When a need seems not met' }, { t: 'spec' }, { t: 'detail-pick', id: fe.wb.marks[0].id, level: 'family', name: 'Hurt' }, { t: 'detail-pick', id: fe.wb.marks[0].id, level: 'word', name: 'lonely' });
ok('a feeling goes side, family, word, with none required', markLabel(fe.wb.marks[0]) === 'A feeling: lonely (Hurt)');

// sliders
let sl = run(n, { t: 'level', id: nid, level: 3 });
ok('a level cannot be set until the person turns the slider on', sl.wb.marks[0].level === undefined);
sl = run(n, { t: 'slider', id: nid, on: true });
ok('turning the slider on starts it unmarked and says so', sl.sliderOn[nid] === true && sl.wb.marks[0].level === undefined && /starts unmarked/.test(sl.announce));
sl = run(sl, { t: 'level', id: nid, level: 4 });
ok('a step sets the level and is announced by name, not number', sl.wb.marks[0].level === 4 && /Mostly\.$/.test(sl.announce) && !/\d/.test(sl.announce.replace(/[“”].*?[“”]/, '')));
ok('a level outside the seven steps is ignored', run(sl, { t: 'level', id: nid, level: 9 }) === sl && run(sl, { t: 'level', id: nid, level: 1.5 }) === sl);
ok('clearing returns to unmarked', run(sl, { t: 'level', id: nid, level: null }).wb.marks[0].level === undefined);
ok('turning the slider off clears the level', run(sl, { t: 'slider', id: nid, on: false }).wb.marks[0].level === undefined);
ok('only a need mark can have a slider', run(m, { t: 'slider', id: m.wb.marks[0].id, on: true }) === m);
ok('removing a mark takes its slider setting with it', Object.keys(run(sl, { t: 'remove', id: nid }).sliderOn).length === 0);
ok('no total or average of levels exists in the state', !Object.keys(sl).some((k) => /total|average|score|overall/i.test(k)));

// ---- frames
let fr = run(initialView(), { t: 'draft', text: 'You left, I felt hurt, and I need trust.' }, { t: 'make' });
fr = run(fr, { t: 'select', id: id(fr, 'hurt') }, { t: 'mark', kind: 'feeling' }, { t: 'select', id: id(fr, 'left') }, { t: 'mark', kind: 'saw' });
const feelMark = fr.wb.marks.find((x) => x.kind === 'feeling')!.id, sawMark = fr.wb.marks.find((x) => x.kind === 'saw')!.id;
ok('the first frame is chosen to begin with, with every slot empty', fr.frameId === 'four-parts' && Object.keys(fr.picks).length === 0);
ok('a frame can be chosen; an unknown one is ignored', run(fr, { t: 'frame', id: 'request-only' }).frameId === 'request-only' && run(fr, { t: 'frame', id: 'nope' }) === fr);
const open = run(fr, { t: 'pick-open', slot: 'feeling' });
ok('"Take from my sentence" opens and closes a slot’s list', open.pickOpen === 'feeling' && run(open, { t: 'pick-open', slot: 'feeling' }).pickOpen === null && run(fr, { t: 'pick-open', slot: 'bogus' }) === fr);
const took = run(open, { t: 'take', slot: 'feeling', markId: feelMark });
ok('taking a marked word fills the slot with it, as typed, and announces it', took.picks['four-parts'].feeling === 'hurt' && took.pickOpen === null && took.announce === 'Put “hurt” in the slot for a feeling.');
ok('only a word marked with the slot’s kind can be taken', run(open, { t: 'take', slot: 'feeling', markId: sawMark }) === open && run(open, { t: 'take', slot: 'feeling', markId: 99 }) === open);
const typed = run(took, { t: 'slot-text', slot: 'need', text: 'to count on you' });
ok('typing fills a slot with no mark at all, and is limited in length', typed.picks['four-parts'].need === 'to count on you' && run(took, { t: 'slot-text', slot: 'need', text: 'x'.repeat(500) }).picks['four-parts'].need.length === 200);
ok('each frame keeps its own slots', run(typed, { t: 'frame', id: 'need-first' }).picks['need-first'] === undefined && run(typed, { t: 'frame', id: 'need-first' }, { t: 'frame', id: 'four-parts' }).picks['four-parts'].feeling === 'hurt');
ok('the slots can be emptied', Object.keys(run(typed, { t: 'clear-frame' }).picks).length === 0);
ok('a new sentence clears the slots', Object.keys(run(typed, { t: 'step', step: 0 }, { t: 'make' }).picks).length === 0);
ok('the sentence is untouched by a frame', typed.wb.sentence === 'You left, I felt hurt, and I need trust.');
ok('an announcement can be sent from the page (for the copy button)', run(initialView(), { t: 'announce', text: 'Copied.' }).announce === 'Copied.');
