// Reading the private list: the safeguards, with an invented list (no real term appears here).
import { readLexicon, loadLexicon, parseCsv, NEUTRAL_IDENTITY, ENUMERATED_EXCEPTIONS } from '../src/lib/lexiconLoader.ts';
import { match } from '../src/lib/lexicon.ts';
import { ok } from './helpers.mts';

const H = '"term","variants","category","target","severity","context","language","source","confidence"\n';
const L = (...rows: string[][]) => H + rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
const csv = L(
  ['blorvish', 'blorv-ish|bl0rvish', 'slur', 'fixture-a', '3', '', 'en', 'fixture', 'high'],
  ['blorvish', 'blorvy', 'slur', 'fixture-a', '2', '', 'en', 'second source', 'low'],
  ['zibble gunk', '', 'dehumanizing-phrase', 'fixture-b', '2', '', 'en', 'fixture', 'medium'],
  ['grunnick', '', 'harassing-insult', 'fixture-a', '1', 'also an ordinary word (risk of false matches)', 'en', 'fixture', 'low'],
  ['-zorp', '', 'slur', 'fixture-a', '2', 'suffix', 'en', 'fixture', 'low'],
  ['refugee', '', 'slur', 'immigration-status', '1', '', 'en', 'fixture', 'low'],
  ['gay', '', 'slur', 'sexual-orientation', '1', 'neutral word too', 'en', 'fixture', 'low'],
  ['ab', '', 'slur', 'general', '1', '', 'en', 'fixture', 'low'],
  ['bad,comma "x"', '', 'slur', 'general', '1', 'has a comma, and "quotes"', 'en', 'fixture', 'low'],
);
const { rows, report } = readLexicon(csv);
ok('a quoted CSV with commas and doubled quotes is read', parseCsv('"a,b","c ""d"" e"\n"x","y"').join('|') === 'a,b,c "d" e|x,y' && rows.length === 6);
ok('neutral identity words are dropped and reported, and too-short terms are dropped', report.droppedNeutral.join() === 'refugee' && report.droppedShort === 1 && !rows.some((r) => r.term === 'refugee' || r.term === 'ab'));
ok('exact duplicates are merged: variants combined, the lower severity kept, sources joined', (() => { const b = rows.find((r) => r.term === 'blorvish')!; return report.merged === 1 && b.severity === 2 && b.variants.includes('blorvy') && b.variants.includes('bl0rvish') && /fixture; second source/.test(b.source); })());
ok('a word that is also an ordinary identity word is kept but switched off until it has cues, at severity 1', (() => { const g = rows.find((r) => r.term === 'gay')!; return g.matchMode === 'token_context' && g.cues.length === 0 && g.severity === 1 && report.switchedOff.includes('gay'); })());
ok('a row whose own note calls it an ordinary word becomes a context row with no cues', rows.find((r) => r.term === 'grunnick')!.matchMode === 'token_context' && report.contextWithoutCues >= 2);
ok('phrases and suffixes get their modes', rows.find((r) => r.term === 'zibble gunk')!.matchMode === 'phrase' && rows.find((r) => r.term === '-zorp')!.matchMode === 'suffix');
const { matcher } = loadLexicon(csv);
ok('a person describing themselves is never flagged, and ordinary words with no cues never match', match("I'm gay and I love my grunnick", matcher).length === 0 && match('a gay couple, a grunnick', matcher).length === 0);
ok('real hits still work after loading', match('what a blorvish', matcher).length === 1 && match('zibble gunk', matcher).length === 1 && match('fooazorp', matcher).length === 1);
ok('with cues supplied by the owner, a switched-off word matches only near a cue', (() => { const m2 = loadLexicon(H + '"gay","","slur","x","1","note","en","s","low"\n').matcher; return match('gay', m2).length === 0; })());
ok('missing required columns or an empty file give a reason, not a crash', readLexicon('').report.problems.length === 1 && readLexicon('"a","b"\n"1","2"\n').report.problems[0].startsWith('missing columns'));
ok('the neutral and exception lists contain only ordinary identity words', NEUTRAL_IDENTITY.has('muslim') && NEUTRAL_IDENTITY.has('refugee') && ENUMERATED_EXCEPTIONS.has('trans') && !ENUMERATED_EXCEPTIONS.has('muslim'));

// ── ordinary words the list also holds
import { ORDINARY_WORDS } from '../src/lib/lexiconLoader.ts';
{
  const c = L(['monkey', '', 'dehumanizing-metaphor', 'race-ethnicity', '3', '', 'en', 'fixture', 'low'], ['sheep', '', 'harassing-insult', 'general', '2', '', 'en', 'fixture', 'low'], ['blorvish', '', 'slur', 'fixture-a', '3', '', 'en', 'fixture', 'high']);
  const { rows: rr, report: rep } = readLexicon(c);
  ok('an ordinary word becomes a context key, never above severity 1, even if the file says 3', rr.filter((r) => ORDINARY_WORDS.has(r.term)).every((r) => r.matchMode === 'token_context' && r.severity === 1 && r.cues.length === 0) && rr.find((r) => r.term === 'blorvish')!.severity === 3 && rep.contextWithoutCues === 2);
  const { matcher: mm } = loadLexicon(c);
  ok('animals in ordinary sentences are never flagged, and a two-letter "it" is dropped by the length rule', readLexicon(L(['it', '', 'slur', 'general', '1', '', 'en', 'f', 'low'])).report.droppedShort === 1 && match('The monkey ate it. I saw a sheep and a monkey at the zoo and it was funny.', mm).length === 0);
}
