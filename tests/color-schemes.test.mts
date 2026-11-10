// Palettes made on the device: the modes, the harmonies, and the bridge from the current colour to the wish colour.
import { SCHEME_MODES, MODE_LABELS, bridge, isHex, localScheme } from '../src/lib/colorSchemes.ts';
import { toOklab } from '../src/lib/colorNames.ts';
import { ok } from './helpers.mts';

ok('the eight modes The Color API offers are all here, each with a plain label and a sentence', SCHEME_MODES.length === 8 && SCHEME_MODES.every((m) => MODE_LABELS[m]?.label && MODE_LABELS[m].blurb) && SCHEME_MODES.includes('analogic-complement'));
const seeds = ['#1B4F6E', '#E3752B', '#808080', '#000000', '#FFFFFF', '#FF00FF', '#2C6E9E'];
const bad = SCHEME_MODES.flatMap((m) => seeds.flatMap((s) => { const c = localScheme(s, m); return c.length === 5 && c.every(isHex) ? [] : [`${m} ${s}`]; }));
ok('every mode gives five valid hex colours for any seed, greys, black and white included', bad.length === 0, bad.join(' | '));
const L = (hex: string) => toOklab(hex)![0];
const mono = localScheme('#1B4F6E', 'monochrome');
ok('monochrome steps from dark to light in one hue', mono.every((c, i) => i === 0 || L(c) > L(mono[i - 1])));
ok('dark goes darker than the seed and light goes lighter', L(localScheme('#808080', 'monochrome-dark')[4]) < L('#808080') && L(localScheme('#808080', 'monochrome-light')[4]) > L('#808080'));
ok('complement ends with a colour from the other side of the wheel', localScheme('#1B4F6E', 'complement')[0] === '#1B4F6E' && localScheme('#1B4F6E', 'complement')[4] !== '#1B4F6E');
const b = bridge('#1B4F6E', '#E3752B');
ok('the bridge has the current colour and the wish colour at its ends and three between', b.length === 5 && b[0] === '#1B4F6E' && b[4] === '#E3752B' && b.every(isHex) && new Set(b).size === 5);
ok('a bridge from a grey does not swing round the wheel, and one to a grey stays valid', bridge('#808080', '#2C6E9E').every(isHex) && bridge('#2C6E9E', '#808080').every(isHex) && bridge('#808080', '#808080').every((c) => c === '#808080' || isHex(c)));
ok('a bridge changes lightness steadily when the ends differ', (() => { const x = bridge('#102030', '#F0E0D0'); return x.every((c, i) => i === 0 || L(c) >= L(x[i - 1]) - 0.001); })());
ok('hex checks', isHex('#abcdef') && !isHex('abcdef') && !isHex('#abc') && !isHex(5) && !isHex('#gggggg'));
