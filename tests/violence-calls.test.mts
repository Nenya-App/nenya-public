// The violence-and-removal patterns (historyHits, src/lib/learningOffer.ts) against the invented scenes in src/lib/detectScenes.ts. These need no private list: the patterns are in the repository.
import { SCENES } from '../src/lib/detectScenes.ts';
import { OFFER_MAP, historyHits, offerFor } from '../src/lib/learningOffer.ts';
import { siteDecision } from '../src/lib/safetyEval.ts';
import { ok } from './helpers.mts';

const cards = [...new Set(Object.values(OFFER_MAP).flat())];
const offered = (text: string): boolean => offerFor({ hits: historyHits(text), text, shown: [], available: cards, flagged: false, abuseAtCoach: false }) !== null;
const stops = (text: string): boolean => siteDecision([text])?.tier === 'stop';
const scenes = SCENES.filter((s) => /^(viol|vnone|dehum|dnone)-/.test(s.id) && !s.edge);
ok('there are violence and dehumanization scenes to run', scenes.length >= 28);
for (const s of scenes) ok(`${s.id}: ${s.why}`, s.expect === 'stop' ? stops(s.text) : !stops(s.text) && offered(s.text) === (s.expect === 'flagged'));
for (const s of SCENES.filter((x) => /^viol-0[78]$/.test(x.id))) ok(`${s.id} (wish): ${s.why}`, offered(s.text));
ok('a call for violence offers the history card', offerFor({ hits: historyHits('Those people should all be killed.'), text: 'Those people should all be killed.', shown: [], available: ['hist-03', 'hist-01'], flagged: false, abuseAtCoach: false })?.id === 'hist-03');
ok('one person is never matched', !offered('Somebody should kill him.') && !offered('I will kill her if she lies again.'));
