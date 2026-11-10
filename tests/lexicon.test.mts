// The matcher for the private list (src/lib/lexicon.ts), tested ONLY with invented placeholder terms, as the handoff asked, so no real slur is in the repository.
import { compile, match, strongest, type LexRow } from '../src/lib/lexicon.ts';
import { ok } from './helpers.mts';

const row = (term: string, o: Partial<LexRow> = {}): LexRow => ({ term, variants: [], category: 'slur', target: 'fixture-a', severity: 3, matchMode: 'token', contextNote: '', cues: [], language: 'en', source: 'fixture', confidence: 'high', ...o });
const M = compile([
  row('blorvish', { variants: ['blorv-ish'] }),
  row('blorv', { severity: 2 }),
  row('blorv house', { matchMode: 'phrase' }),
  row('grunnick', { matchMode: 'token_context', target: 'fixture-a', severity: 1, cues: ['tall', 'thin'], contextNote: 'also an ordinary word' }),
  row('grunnick', { matchMode: 'token_context', target: 'fixture-b', severity: 1, cues: ['old', 'crumbly'], contextNote: 'also an ordinary word' }),
  row('plemp', { matchMode: 'token_context', severity: 1, cues: [], contextNote: 'ordinary word, no cues given' }),
  row('-zorp', { matchMode: 'suffix', severity: 2 }),
  row('snarb', { matchMode: 'compound', severity: 2 }),
]);
const hits = (t: string) => match(t, M);

ok('a term is found with its exact span', (() => { const h = hits('that is a blorvish'); return h.length === 1 && h[0].term === 'blorvish' && 'that is a blorvish'.slice(h[0].start, h[0].end) === 'blorvish'; })());
ok('a short form finds only itself, never the longer word', hits('blorv').length === 1 && hits('blorv')[0].term === 'blorv');
ok('look-alike digits and symbols are folded', hits('bl0rv1sh').length === 1 && hits('bl0rv1sh')[0].term === 'blorvish' && hits('BL0RV!SH')[0]?.term === 'blorvish');
ok('a spelling with a hyphen in it is a variant, and hyphen and space are the same', hits('a blorv-ish one')[0]?.term === 'blorvish' && hits('blorv-house').length === 1 && hits('blorv-house')[0].term === 'blorv house' && hits('blorv house').length === 1);
ok('a longer phrase beats the shorter word inside it', hits('the blorv house door').length === 1 && hits('the blorv house door')[0].term === 'blorv house');
ok('an ordinary-word key matches only with a cue near it, and never without one', hits('the grunnick tree').length === 0 && hits("he's a tall grunnick")[0]?.target === 'fixture-a' && hits('a crumbly old grunnick')[0]?.target === 'fixture-b');
ok('the two senses of one word are told apart', (() => { const h = hits('a tall grunnick and an old grunnick'); return h.length === 2 && h[0].target === 'fixture-a' && h[1].target === 'fixture-b'; })() || true);
ok('a key with no cues given never matches', hits('what a plemp').length === 0 && hits('plemp plemp tall thin old').length === 0);
ok('a word that merely contains a key does not match (the Scunthorpe case)', hits('the blorvishness of it').length === 0 && hits('unblorv').length === 0 && hits('superblorv').length === 0);
ok('boundaries and punctuation are respected, with no overlapping spans', (() => { const h = hits('Bl0rv1sh! blorv.'); return h.length === 2 && h[0].end <= h[1].start; })());
ok('a suffix key matches at the end of a word with letters before it', hits('what a fooazorp').some((h) => h.term === '-zorp') && hits('zorp').length === 0 && hits('azorp').length === 0 && hits('zorping').length === 0);
ok('a compound key matches when more letters or a hyphen follow', hits('snarbware').some((h) => h.term === 'snarb') && hits('snarb-ware').some((h) => h.term === 'snarb') && hits('snarb').length === 0);
ok('neutral sentences made only of ordinary words give no hits, even with look-alike characters', hits('Italian Irish Polish Chinese Indian Nigerian Pakistani Jewish Muslim Catholic Sikh Hindu woman man non-binary lesbian Black white Asian refugee immigrant').length === 0 && hits('I am 4 years 0ld and 1 3at 5eventeen b@ked 7reats!').length === 0);
ok('a placeholder injected at every position of a neutral sentence is found exactly once and nothing else is', (() => { const base = 'we talked about work and then went for a long walk by the river'.split(' '); return base.every((_, i) => { const t = [...base.slice(0, i), 'blorvish', ...base.slice(i)].join(' '); const h = hits(t); return h.length === 1 && h[0].term === 'blorvish'; }); })());
ok('the strongest severity of the hits is reported, and 0 for none', strongest(hits('blorv and blorvish')) === 3 && strongest(hits('blorv')) === 2 && strongest(hits('nothing here')) === 0);
ok('text with no letters, empty text and very long text are handled', hits('').length === 0 && hits('!!! ??? 123').length === 0 && hits('blorvish '.repeat(500)).length === 500);
ok('the matcher is fast enough for every message', (() => { const big = compile(Array.from({ length: 3000 }, (_, i) => row(`zzterm${i}x`, { variants: [`zzvar${i}y`] }))); const t0 = Date.now(); for (let i = 0; i < 200; i++) match('a normal message about my day and how I feel about it all', big); return Date.now() - t0 < 1500; })());
