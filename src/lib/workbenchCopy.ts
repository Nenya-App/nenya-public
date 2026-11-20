// The words on the phrase workbench page and the marks' plain descriptions (docs/phrase-workbench-scope.md). Drafts for the owner's edit.
// Rules kept by tests/workbench-data.test.mts: no verdict words (wrong, correct, mistake, error, bad, good, score, result, should, fix), plain words
// (grade 5 to 8), every mark has a name, a plain description and a shape that does not depend on colour.

export const CNVC_CREDIT_LINE = 'The Center for Nonviolent Communication © 2023, www.CNVC.org';
export const CNVC_PAGE = 'https://www.cnvc.org/store/feelings-and-needs-inventory';

export type MarkKind = 'saw' | 'feeling' | 'need' | 'request' | 'story' | 'thought' | 'strategy' | 'demand';
export type MarkShape = 'underline-solid' | 'underline-dotted' | 'box-solid' | 'overline' | 'underline-dashed' | 'underline-double' | 'box-dashed' | 'underline-wavy';

export interface MarkInfo {
  kind: MarkKind;
  name: string;
  plain: string;
  shape: MarkShape;
  /** How the shape is described in words, for the key and for a screen reader. */
  shapeWords: string;
  /** Shown first; the rest appear under "More marks". */
  first: boolean;
}

export const MARKS: MarkInfo[] = [
  { kind: 'saw', name: 'Saw or heard', plain: 'Something a camera or a recorder would catch.', shape: 'underline-solid', shapeWords: 'solid line under', first: true },
  { kind: 'feeling', name: 'A feeling', plain: 'A sensation or emotion in me.', shape: 'underline-dotted', shapeWords: 'dotted line under', first: true },
  { kind: 'need', name: 'A need', plain: 'Something I value or lack, not tied to one person or one way.', shape: 'box-solid', shapeWords: 'box around', first: true },
  { kind: 'request', name: 'A request', plain: 'Something someone could say yes or no to.', shape: 'overline', shapeWords: 'line over', first: true },
  { kind: 'story', name: 'A story', plain: 'A reading of it: why it happened, what it means, what someone is like.', shape: 'underline-dashed', shapeWords: 'dashed line under', first: false },
  { kind: 'thought', name: 'A thought, passing as a feeling', plain: 'Often starts with "I feel that" or names what someone did to me. A useful thought too.', shape: 'underline-double', shapeWords: 'double line under', first: false },
  { kind: 'strategy', name: 'A way to meet it', plain: 'One particular action, time, person or thing.', shape: 'box-dashed', shapeWords: 'dashed box around', first: false },
  { kind: 'demand', name: 'A demand', plain: 'Only a yes is acceptable.', shape: 'underline-wavy', shapeWords: 'wavy line under', first: false },
];

export const markInfo = (k: MarkKind): MarkInfo => MARKS.find((m) => m.kind === k)!;

/** The seven steps of a met-to-unmet slider, in plain words. The slider starts with none of them chosen. */
export const LEVEL_NAMES = ['Not at all', 'A little', 'Some', 'About half', 'Mostly', 'Almost fully', 'Fully'] as const;

/** Words people often say as if they were feelings. Shown only on request, as a plain description, never as a verdict about the person's mark. */
export const PASSING_WORDS: { word: string; def: string }[] = [
  { word: 'ignored', def: 'Treated as if you were not there.' },
  { word: 'rejected', def: 'Turned away by someone.' },
  { word: 'betrayed', def: 'Let down by someone who was trusted.' },
  { word: 'misunderstood', def: 'Taken to mean something you did not mean.' },
  { word: 'abandoned', def: 'Left by someone who was meant to stay.' },
  { word: 'disrespected', def: 'Treated as if your view or time did not count.' },
  { word: 'used', def: 'Treated as a tool for what someone else wanted.' },
  { word: 'unappreciated', def: 'Your effort went unnoticed or unthanked.' },
  { word: 'pressured', def: 'Pushed to do something you did not choose.' },
  { word: 'judged', def: 'Looked at as if someone had already decided about you.' },
];
export const PASSING_NOTE = 'People often say this word as if it were a feeling. It also holds a guess about what someone did. Only you know what is under it.';

export const WB = {
  title: 'Phrase workbench',
  intro: 'A bench for working with words. It is not a test: nothing is graded, nothing is kept, and nothing is suggested unless you ask.',
  deviceNote: 'Text stays on this device. Nothing you type is sent anywhere, and it is gone when you close the tab. You can stop at any time. Marking is a way of reading a sentence, and any reading is a guess.',
  steps: ['Sentence', 'Mark', 'Slider', 'Frame', 'Words'],
  sentenceLabel: 'Your sentence (up to 400 characters)',
  sentenceHelp: 'Type or paste something you said, heard, or want to say.',
  elseNote: 'If this is someone else’s message, a mark is how you are reading it. It is a guess about them.',
  make: 'Make it markable',
  markHelp: 'Tap a word. Add the next word if you want a phrase. Then choose a mark. Every mark is optional, and a word can carry more than one.',
  noMarks: 'None yet. Leaving words unmarked is fine.',
  sliderHelp: 'Only for words you marked as a need, and only if you want it. It is a place to put your own mark. It starts unmarked, shows no numbers, and adds up to nothing.',
  sliderQuestion: 'How much is this need met, right now, here?',
  frameHelp: 'A frame is a sentence with slots. Move your own marked words in, or type. Nothing is filled in for you.',
  wordsHelp: 'Look up a word only if you want to. First comes our short meaning, written in plain words. A general dictionary comes second, and only if it is switched on.',
  nearNote: 'Words nearby, some closer and some further. From this device, nothing sent.',
  emptySlot: (label: string) => `Nothing marked as ${label} yet. You can type one, or go back and mark one.`,
  tooLong: (over: number) => `That is ${over} ${over === 1 ? 'character' : 'characters'} over. Cut a little and it will fit.`,
  credit: `The need families follow the structure of the Feelings and Needs Inventory, ${CNVC_CREDIT_LINE}. The words, their meanings, the marks and the frames on this page are this site’s own. A layer for the needs of groups, if one is added later, will be this project’s extension and not CNVC’s.`,
  creditLink: 'CNVC’s own page for the inventory',
  rememberLabel: 'Remember this sentence and my marks on this device',
  rememberHelp: 'Off unless you turn it on. It keeps only your latest sentence, its marks and its slider steps, in this browser. No time, no count, no history of earlier sentences. Nothing is sent. Forget removes it.',
  rememberOn: 'Kept on this device. It is replaced each time you change something.',
  forget: 'Forget what is kept',
  forgotten: 'Forgotten from this device.',
  starting: 'A starting point, not a complete list. Your own word is always welcome.',
} as const;
