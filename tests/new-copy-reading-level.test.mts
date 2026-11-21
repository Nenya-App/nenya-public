// The copy written for the lenses, the summary, the word help, the plain-English page and Essence reads at about grade 7 or below, as the site promises plain words (owner's goal: grade 5 to 8).
import { gradeLevel } from '../src/lib/readingLevel.ts';
import { SUMMARY_UI } from '../src/lib/summaryRequest.ts';
import { WORD_HELP_COPY } from '../src/lib/wordHelp.ts';
import { PLAIN_ENGLISH, PLAIN_INTRO } from '../src/lib/plainEnglish.ts';
import { BASES, IDEAS } from '../src/lib/flavour.ts';
import { NEED_TALLY_UI } from '../src/lib/needTallyView.ts';
import { ok } from './helpers.mts';

const sets: Record<string, string[]> = {
  'the summary request': [SUMMARY_UI.buttonNote, SUMMARY_UI.loading, SUMMARY_UI.note, SUMMARY_UI.cap, SUMMARY_UI.error],
  'word help': [WORD_HELP_COPY.nearNote, WORD_HELP_COPY.sends('tired'), WORD_HELP_COPY.none, WORD_HELP_COPY.failed],
  'the plain-English page': [PLAIN_INTRO, ...PLAIN_ENGLISH.map((i) => i.text)],
  'Essence': [...BASES.flatMap((b) => [b.line, b.ask]), ...IDEAS, 'If your life were a flavor, how much of each taste is in it?'],
  'the tally': [NEED_TALLY_UI.note],
};
for (const [name, texts] of Object.entries(sets)) {
  const g = gradeLevel(texts.join(' '));
  ok(`${name}, read together, is at grade 7 or below (${g.toFixed(1)})`, g <= 7);
  const worst = texts.filter((t) => t.split(/\s+/).length >= 8).map((t) => ({ t, g: gradeLevel(t) })).sort((a, b) => b.g - a.g)[0];
  ok(`${name}: no full sentence above grade 9${worst ? ` (worst ${worst.g.toFixed(1)})` : ''}`, !worst || worst.g <= 9);
}
