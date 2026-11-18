// Essence in the tray: the flavor of your life, five cards (src/lib/flavour.ts, EssenceFlavour.tsx).
import { readFileSync } from 'node:fs';
import { DIALS, cleanV2, differenceLine, dialsLine, emptyDials, figurePoints, randomDials, tastingNote, type Dials } from '../src/lib/flavour.ts';
import { formatGatewayData } from '../src/lib/reportText.ts';
import { ok } from './helpers.mts';

const d = (o: Partial<Dials>): Dials => ({ ...emptyDials(), ...o });
ok('five taste dials: sweet, sour, salty, bitter, umami', DIALS.join() === 'sweet,sour,salty,bitter,umami');
ok('the dials line lists only those above none, strongest first, and says so when there are none', dialsLine(d({ sweet: 4, bitter: 1 })) === 'sweet very strong, bitter faint' && dialsLine(emptyDials()) === 'nothing yet');
ok('the tasting note is composed from the choices: mostly, a little, notes, mouth, lingers', tastingNote({ now: d({ sweet: 3, bitter: 1 }), notes: ['smoky', 'citrus'], mouth: 'creamy', lingers: 'a warmth' }) === 'Mostly sweet, with a little bitter, with notes of smoky and citrus. Creamy in the mouth, and a warmth lingering.');
ok('the note is empty until there is something to say, and handles only a mouth feel', tastingNote({ now: emptyDials(), notes: [], mouth: null, lingers: null }) === '' && tastingNote({ now: emptyDials(), notes: [], mouth: 'dry', lingers: 'nothing much' }) === 'Dry in the mouth, and not much lingering.');
ok('the difference is said without judgement: more and less, or no difference yet', differenceLine(d({ sweet: 1, bitter: 3 }), d({ sweet: 3, bitter: 1 })) === 'more sweet, less bitter' && differenceLine(d({ sweet: 2 }), d({ sweet: 2 })) === 'no difference yet');
const fp = figurePoints(d({ sweet: 4, sour: 0 })).split(' ').map((p) => p.split(',').map(Number));
ok('the figure has five points; a full dial reaches the rim and a none dial stays near the centre', fp.length === 5 && Math.hypot(fp[0][0] - 50, fp[0][1] - 50) > 39 && Math.hypot(fp[1][0] - 50, fp[1][1] - 50) < 10);
ok('surprise me gives dials between none and very strong', Array.from({ length: 30 }, () => randomDials()).every((x) => DIALS.every((k) => Number.isInteger(x[k]) && x[k] >= 0 && x[k] <= 4)));
const saved = { v: 2, basis: 'memory', now: d({ sweet: 3 }), wish: d({ sweet: 4, bitter: 0 }), notes: ['smoky'], mouth: 'dry', lingers: 'smoke', tastingNote: 'Mostly sweet.', smallThing: 'A warm drink', extra: '' };
ok('a saved Essence reads back, and anything else is not one', JSON.stringify(cleanV2(saved)) === JSON.stringify(saved) && cleanV2({ currentTastes: ['sweet'] }) === null && cleanV2(null) === null && cleanV2({ v: 2, now: { sweet: 99 } })!.now.sweet === 4);
const lines = formatGatewayData('essence', saved);
ok('the report carries the two flavors, how they differ, the note and the small thing, in words only', lines.some((l) => l.startsWith('Flavor of your life now: sweet strong')) && lines.some((l) => l.includes('From now to what you want: more sweet')) && lines.some((l) => l.includes('Tasting note: Mostly sweet.')) && lines.some((l) => l.includes('One small thing to try: A warm drink')) && !lines.some((l) => /Present Taste/.test(l)));
ok('an Essence saved before still reads through the old lines', formatGatewayData('essence', { currentTastes: ['Sweet'] }).some((l) => l === 'Present Taste: Sweet'));
const comp = readFileSync('src/app/components/EssenceFlavour.tsx', 'utf8'), page = readFileSync('src/app/components/pages/EssenceGatewayPage.tsx', 'utf8');
ok('five cards: start, now, notes, wish, add; each with Put this down in the header and a words twin that updates politely', ['start', 'now', 'notes', 'wish', 'add'].every((c) => new RegExp(`card === '${c}'`).test(comp)) && (comp.match(/role="status" aria-live="polite"/g) ?? []).length >= 4 && /\{tray \? \(\s*\/\/ The tray's Essence/.test(page) || /EssenceFlavour initial=/.test(page));
ok('the soft limit of three on notes warns and never blocks; no food or hunger words', /needsFewerWarning\(notes\.length\)/.test(comp) && /FewerWarning/.test(comp) && !/\b(eat|meal|diet|hungry|hunger)\b/i.test(comp.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')));
ok('the tray shows the new Essence in place of the old taste and scent page; the old flow is untouched when off', /EssenceFlavour initial=\{initialData\}/.test(page) && /\) : step === 'instructions' \? \(/.test(page));

// The starting point sets the order of the two flavors, and Need an idea? offers a few prompts.
{
  const { IDEAS } = await import('../src/lib/flavour.ts');
  ok('a mood begins with now; a memory or a small thing to try begins with the flavor you want', /basis === 'mood' \? 'now' : 'wish'/.test(comp) && /\['start', 'now', 'notes', 'wish', 'add'\]/.test(comp) && /\['start', 'wish', 'notes', 'now', 'add'\]/.test(comp));
  ok('Need an idea? gives a few plain prompts with no food or hunger words', IDEAS.length === 3 && /Need an idea\?/.test(comp) && !IDEAS.some((i) => /\b(eat|meal|diet|hungry|hunger)\b/i.test(i)));
}
