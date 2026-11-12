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
ok('a judgment decision leaves two severity-1 rows: the word of another person beside it, or a self cue beside it', of('plimmo').length === 2 && of('plimmo').every((r) => r.severity === 1 && r.matchMode === 'token_context' && (r.window === 3 || r.window === 4)) && of('plimmo').some((r) => r.category === 'judgment' && r.cues.includes('you')) && of('plimmo').some((r) => r.category === 'self-judgment' && r.cues.includes('am')));
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

// The frame rules (src/lib/learningOffer.ts): denouncing and negation are not use.
const offer = (text: string): boolean => flagsOffer(text);
ok('denouncing the words does not offer a card', !offer('It is really not okay to be calling people zorkblat.') && !offer('Why would you call me a zorkblat?') && !offer('We have to call out people saying zorkblat in our society.'));
ok('a negated word does not offer a card', !offer('They are not at all zorkblat.') && !offer('I never said they are zorkblat.'));
ok('plain use still offers a card', offer('They are all zorkblat.') && offer('You are not welcome here, you zorkblat.'));
ok('a negation in another clause does not hide the word', offer('I am not angry, they are zorkblat.'));

const kinds = (text: string): string[] => match(text, matcher).map((h) => h.category);
ok('a judgment word beside another person is a judgment', kinds('you are plimmo').includes('judgment') && kinds('my boss is plimmo').includes('judgment'));
ok('a judgment word about oneself is the separate self-judgment tier', kinds('I am so plimmo').includes('self-judgment') && !kinds('I am so plimmo').includes('judgment') && kinds('I feel plimmo').includes('self-judgment'));
ok('a first-person word alone is not enough', kinds('I love this plimmo').length === 0 && kinds('we saw the plimmo').length === 0);
ok('a person word far from the judgment word is not enough', kinds('you went to the shop and then after a long walk back it was plimmo').length === 0);
ok('a self-judgment may sit four words from its cue', kinds('I feel like such an plimmo').includes('self-judgment'));
