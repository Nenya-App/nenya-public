// The custom lens model (src/lib/customLens.ts): name, palette colour, description, optional Pattern link, the limit of five, and the plain-text cleaning.
import { readFileSync } from 'node:fs';
import { addCustomLens, customLine, DESCRIPTION_MAX, MAX_CUSTOM_LENSES, NAME_MAX, nextCustomId, PALETTE_COUNT, removeCustomLens, sanitiseText, validateCustomLens, type CustomLens } from '../src/lib/customLens.ts';
import { SHAPES } from '../src/lib/gatewayShapes.ts';
import { ok } from './helpers.mts';

const good = { name: 'Quiet hour', color: 3, description: 'What I notice when it is still.', pattern: 'p-lines' };
const r = validateCustomLens(good);
ok('a good lens is accepted, with an id made here', r.ok && r.lens.id === 'custom-1' && r.lens.name === 'Quiet hour' && r.lens.color === 3 && r.lens.pattern === 'p-lines');
ok('the description and the Pattern are optional', (() => { const x = validateCustomLens({ name: 'A', color: 0 }); return x.ok && x.lens.description === '' && x.lens.pattern === null; })());
ok('the palette count matches valarColors', readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8').split('\n').filter((l) => /^ {4}vector:/.test(l)).length === PALETTE_COUNT);

const bad = (input: any, field: string, list: CustomLens[] = []) => { const x = validateCustomLens(input, list); return !x.ok && 'errors' in x && field in x.errors; };
ok('name: 1 to 24 characters', bad({ ...good, name: '' }, 'name') && bad({ ...good, name: '   ' }, 'name') && !bad({ ...good, name: 'x'.repeat(NAME_MAX) }, 'name') && bad({ ...good, name: 'x'.repeat(NAME_MAX + 1) }, 'name'));
ok('the length is counted after cleaning', !bad({ ...good, name: '  ' + 'x'.repeat(NAME_MAX) + '\n\n' }, 'name'));
ok('English only: other scripts and accented letters are refused, not changed', bad({ ...good, name: 'Café' }, 'name') && bad({ ...good, name: 'привет' }, 'name') && bad({ ...good, description: '日本語' }, 'description') && !bad({ ...good, name: "Dad's day - 2" }, 'name'));
ok('description: up to 120 characters, may be empty', !bad({ ...good, description: 'y'.repeat(DESCRIPTION_MAX) }, 'description') && bad({ ...good, description: 'y'.repeat(DESCRIPTION_MAX + 1) }, 'description') && !bad({ ...good, description: '' }, 'description'));
ok('colour is a palette index, never free text', bad({ ...good, color: -1 }, 'color') && bad({ ...good, color: PALETTE_COUNT }, 'color') && bad({ ...good, color: 1.5 }, 'color') && bad({ ...good, color: '#ff0000' }, 'color') && bad({ ...good, color: undefined }, 'color') && !bad({ ...good, color: PALETTE_COUNT - 1 }, 'color'));
const movement = SHAPES.find((s) => s.set === 'movement')!.id;
ok('the Pattern link is an id from the pattern set only: a movement drawing, an unknown id or an address is refused', bad({ ...good, pattern: movement }, 'pattern') && bad({ ...good, pattern: 'nope' }, 'pattern') && bad({ ...good, pattern: 'https://example.com' }, 'pattern') && bad({ ...good, pattern: 7 }, 'pattern') && !bad({ ...good, pattern: null }, 'pattern') && !bad({ ...good, pattern: '' }, 'pattern'));
ok('every Pattern drawing can be linked', SHAPES.filter((s) => s.set === 'pattern').every((s) => validateCustomLens({ ...good, pattern: s.id }).ok));

ok('cleaning removes control characters, angle brackets and direction marks, and folds white space', sanitiseText('a\u0000b\u0007c') === 'abc' && sanitiseText('<b>hi</b>') === 'bhi/b' && sanitiseText('a\u202Eb\u200Bc') === 'abc' && sanitiseText('  a \t\n  b  ') === 'a b' && sanitiseText('x\u0085y') === 'x y' && sanitiseText('x\u2028y') === 'x y');
ok('anything that is not a string is empty text', sanitiseText(5) === '' && sanitiseText(null) === '' && sanitiseText({}) === '' && sanitiseText(['a']) === '');
ok('markup never survives: a script tag cannot be stored as one', !/[<>]/.test((validateCustomLens({ ...good, name: '<script>alert(1)</script>' }) as any).lens?.name ?? ''));

let list: CustomLens[] = [];
for (let i = 1; i <= MAX_CUSTOM_LENSES; i++) { const a = addCustomLens(list, { name: `Lens ${i}`, color: i }); ok(`lens ${i} of ${MAX_CUSTOM_LENSES} is added`, a.errors === null && a.list.length === i); list = a.list; }
const sixth = addCustomLens(list, { name: 'Sixth', color: 1 });
ok('a sixth is refused with the limit message and the list is unchanged', sixth.errors !== null && 'limit' in sixth.errors && sixth.list.length === 5 && sixth.list.every((l, i) => l === list[i]));
ok('a repeated name (any case) is refused', bad({ ...good, name: 'lens 1' }, 'name', list.slice(0, 2)));
list = removeCustomLens(list, 'custom-2');
ok('removing frees a place and the next id fills the gap, never repeating one in use', list.length === 4 && nextCustomId(list) === 'custom-2' && addCustomLens(list, { name: 'Again', color: 0 }).list.length === 5);
ok('the original list is never changed in place', (() => { const l0: CustomLens[] = []; addCustomLens(l0, { name: 'A', color: 0 }); return l0.length === 0; })());
ok('the caption line is the description, or a plain default', customLine({ id: 'c', name: 'n', color: 0, description: 'Mine.', pattern: null }) === 'Mine.' && /for this visit/.test(customLine({ id: 'c', name: 'n', color: 0, description: '', pattern: null })));

// Nothing here may reach storage or the network.
const src = readFileSync('src/lib/customLens.ts', 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
ok('the model has no storage, network or coach code in it', !/localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon|deviceMemory|coach/i.test(src));
