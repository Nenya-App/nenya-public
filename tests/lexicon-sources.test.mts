// Outside lexicons: every source records its licence and citation, and a noncommercial or ShareAlike source is never marked distributable.
import { LEXICON_SOURCES, pendingFor } from '../src/lib/lexiconSources.ts';
import { ok } from './helpers.mts';

const all = Object.values(LEXICON_SOURCES);
ok('every source has a licence, where it was read, a citation and an address', all.every((s) => s.licence && s.licenceStatedIn && s.citation.includes(s.url) && s.url.startsWith('https://')));
ok('a NonCommercial or ShareAlike source is never marked distributable', all.every((s) => !/NC|SA/.test(s.licence) || !s.may.distribute));
ok('HurtLex is recorded with its licence, as downloaded, and with confirmations still pending', LEXICON_SOURCES['hurtlex-en-1.2'].licence === 'CC BY-NC-SA 4.0' && LEXICON_SOURCES['hurtlex-en-1.2'].status === 'downloaded' && pendingFor('hurtlex-en-1.2').length >= 2);
ok('an unknown source is reported as pending, not silently allowed', pendingFor('nope')[0] === 'unknown source');
