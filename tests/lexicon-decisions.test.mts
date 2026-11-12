// The reviewers' decisions (src/lib/lexiconDecisions.ts), tested with invented words: no real list content is in the repository.
import { loadLexicon } from '../src/lib/lexiconLoader.ts';
import { match } from '../src/lib/lexicon.ts';
import { applyDecisions, parseDecisions } from '../src/lib/lexiconDecisions.ts';
import { readLexicon } from '../src/lib/lexiconLoader.ts';
import { offerFor } from '../src/lib/learningOffer.ts';
import { ok } from './helpers.mts';

const H = '"term","variants","category","target","severity","context_note","match_mode","cues","language","source","confidence"';
const row = (term: string, cat: string, target: string, sev: number): string => `"${term}","","${cat}","${target}","${sev}","","token","","en","test","high"`;
const csv = [H, row('zorkblat', 'slur', 'race-ethnicity', 2), row('zorkblat', 'harassing-insult', 'individual', 1), row('plimmo', 'slur', 'disability', 2), row('plimmo', 'dehumanizing-metaphor', 'group', 1), row('quuxer', 'slur', 'sexual-orientation', 2), row('snarfel', 'slur', 'disability', 2), row('wibbit', 'slur', 'race-ethnicity', 2), row('untouched', 'slur', 'race-ethnicity', 2)].join('\n');
const dec = parseDecisions('term,action,note\n"zorkblat","slur",""\n"plimmo","judgment",""\n"quuxer","model",""\n"snarfel","drop",""\n');

ok('the decisions file reads', dec.problems.length === 0 && dec.decisions.size === 4);
ok('an unknown action is reported', parseDecisions('term,action\n"x","maybe"\n').problems.length === 1);
ok('two actions for one term are reported', parseDecisions('term,action\n"x","drop"\n"x","slur"\n').problems.length === 1);

const { rows } = readLexicon(csv);
const out = applyDecisions(rows, dec.decisions);
const of = (t: string) => out.rows.filter((r) => r.term === t);
ok('a slur decision leaves one row at severity 2', of('zorkblat').length === 1 && of('zorkblat')[0].severity === 2 && of('zorkblat')[0].category === 'slur');
ok('a judgment decision leaves one severity-1 row that needs a person word near it', of('plimmo').length === 1 && of('plimmo')[0].severity === 1 && of('plimmo')[0].category === 'judgment' && of('plimmo')[0].matchMode === 'token_context' && of('plimmo')[0].cues.includes('you'));
ok('a model decision keeps the row, marked needs-model', of('quuxer').length === 1 && /needs-model/.test(of('quuxer')[0].contextNote));
ok('a drop decision removes every row of the term', of('snarfel').length === 0);
ok('terms without a decision are untouched', of('wibbit').length === 1 && of('untouched').length === 1);
ok('the counts add up', out.counts.dropped === 1 && out.counts.slur === 1 && out.counts.judgment === 1 && out.counts.model === 1 && out.counts.collapsed === 2);

const { matcher } = loadLexicon(csv, dec.decisions);
const flagsOffer = (text: string): boolean => offerFor({ hits: match(text, matcher), text, shown: [], available: ['dehum-01', 'dehum-04', 'conn-01'], flagged: false, abuseAtCoach: false }) !== null;
ok('a slur decision still offers a card', flagsOffer('they are zorkblat'));
ok('a judgment word aimed at a person gives a hit, but never a card offer', match('you are plimmo', matcher).some((h) => h.category === 'judgment') && !flagsOffer('you are plimmo'));
ok('a judgment word with no person near it gives no hit', match('plimmo', matcher).length === 0);
ok('a needs-model row is found but never offers a card on the list alone', match('they are quuxer', matcher).length === 1 && !flagsOffer('they are quuxer'));
ok('a dropped word matches nothing', match('snarfel', matcher).length === 0);
