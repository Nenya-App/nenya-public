// The pure part of selection by meaning (src/lib/semanticSelect.ts): similarity, ranking, thresholds, and the word-overlap stand-in. No model is used here.
import { cosine, rank, pick, topicVectors, selectTopics, lexicalEmbed, lexicalEmbedder, type Topic } from '../src/lib/semanticSelect.ts';
import { ok } from './helpers.mts';

ok('cosine: identical is 1, orthogonal is 0, empty or zero is 0, unequal lengths is 0', Math.abs(cosine([1, 2], [1, 2]) - 1) < 1e-9 && cosine([1, 0], [0, 1]) === 0 && cosine([], []) === 0 && cosine([0, 0], [1, 1]) === 0 && cosine([1], [1, 2]) === 0);
const r = rank([1, 0], { a: [0, 1], b: [1, 0], c: [1, 1] });
ok('rank orders by similarity and breaks ties by id', r[0].id === 'b' && r[1].id === 'c' && r[2].id === 'a');
ok('pick keeps only those at or above the threshold, at most max', pick(r, 0.5).length === 2 && pick(r, 0.99).length === 1 && pick(r, 0, 2).length === 2 && pick(r, 1.1).length === 0);
ok('the stand-in gives unit-length vectors, and none for text with only stop words', Math.abs(Math.hypot(...lexicalEmbed('I am exhausted and have nothing left')) - 1) < 1e-9 && lexicalEmbed('I am the and of').every((x) => x === 0));
ok('the stand-in ignores case, punctuation and simple endings', cosine(lexicalEmbed('Exhausted, drained!'), lexicalEmbed('exhausted drained')) > 0.99 && cosine(lexicalEmbed('worried'), lexicalEmbed('worry')) < 1.0001);
const topics: Topic[] = [
  { id: 'reserves', kind: 'lens', description: 'The person has no energy left and feels drained or worn out.' },
  { id: 'boundary', kind: 'move', description: 'The person wants to say no or set a limit with someone who keeps pushing.' },
];
const v = await topicVectors(lexicalEmbedder, topics);
ok('topic vectors are computed once for every topic', Object.keys(v).join() === 'reserves,boundary' && v.reserves.length === 512);
const got = await selectTopics('I feel so drained and worn out lately', topics, lexicalEmbedder, { threshold: 0.2, vectors: v });
ok('a message close in words to a description selects that topic first', got[0]?.id === 'reserves');
ok('an unrelated message selects nothing at a sensible threshold', (await selectTopics('what is the weather like in spring', topics, lexicalEmbedder, { threshold: 0.2, vectors: v })).length === 0);

// ── the topic descriptions and the invented test messages (src/lib/moduleDescriptions.ts, selectionEvalSet.ts)
import { TOPICS } from '../src/lib/moduleDescriptions.ts';
import { SELECTION_EVAL } from '../src/lib/selectionEvalSet.ts';
import { MODULE_IDS } from '../src/lib/coachModules.ts';
import { LEARNING_CARDS_DATA } from '../src/lib/learningCardsData.ts';
import { repeatsEarlier } from '../src/lib/coachRepeat.ts';
import { scrubPII } from '../src/lib/piiScrub.ts';

const ids = TOPICS.map((t) => t.id);
ok('every topic id is unique, and the evaluation set has exactly the same ids', new Set(ids).size === ids.length && JSON.stringify([...ids].sort()) === JSON.stringify(SELECTION_EVAL.map((e) => e.id).sort()));
ok('every module the phrase matcher can choose has a topic', MODULE_IDS.every((id) => ids.includes(id)), MODULE_IDS.filter((id) => !ids.includes(id)).join(','));
ok('every approved card has a topic', LEARNING_CARDS_DATA.every((c) => ids.includes(c.id)), LEARNING_CARDS_DATA.filter((c) => !ids.includes(c.id)).map((c) => c.id).join(','));
ok('each description is one plain sentence of at most 25 words', TOPICS.every((t) => t.description.trim().split(/\s+/).length <= 25 && (t.description.match(/[.!?](?:\s|$)/g) ?? []).length <= 1), TOPICS.filter((t) => t.description.trim().split(/\s+/).length > 25).map((t) => t.id).join(','));
ok('each topic has eight matching and four non-matching messages, of a sensible length', SELECTION_EVAL.every((e) => e.matches.length === 8 && e.nonMatches.length === 4 && [...e.matches, ...e.nonMatches].every((m) => { const n = m.trim().split(/\s+/).length; return n >= 5 && n <= 45; })));
ok('the descriptions are public text: none copies a run of eight words from an approved card', TOPICS.every((t) => LEARNING_CARDS_DATA.every((c) => !repeatsEarlier(t.description, [c.key, c.body, c.tryIt, c.more], 8))), TOPICS.filter((t) => LEARNING_CARDS_DATA.some((c) => repeatsEarlier(t.description, [c.key, c.body, c.tryIt, c.more], 8))).map((t) => t.id).join(','));
ok('no test message contains an email address, phone number or street address', SELECTION_EVAL.every((e) => [...e.matches, ...e.nonMatches].every((m) => { const s = scrubPII(m); return !Object.keys(s.counts).some((k) => /email|phone|address|street/i.test(k)); })));
ok('no test message is a duplicate of another', new Set(SELECTION_EVAL.flatMap((e) => [...e.matches, ...e.nonMatches]).map((m) => m.toLowerCase())).size === SELECTION_EVAL.length * 12);
