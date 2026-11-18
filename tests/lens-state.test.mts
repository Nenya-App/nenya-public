// The lens tray's state rules (src/lib/lensState.ts): three states, add/update/remove, the report line, the soft limit, and reading saved drafts of both versions.
import { addLens, emptyLensState, lensStatus, needsFewerWarning, openLens, putDownLens, readSavedDraft, removeLens, reportShape, SOFT_LIMIT } from '../src/lib/lensState.ts';
import { ok } from './helpers.mts';

let s = emptyLensState();
ok('every lens starts not opened', (['sight', 'sound', 'touch', 'essence', 'movement', 'insight'] as const).every((l) => lensStatus(s, l) === 'not-opened'));
s = openLens(s, 'touch'); s = openLens(s, 'touch'); s = openLens(s, 'sight');
ok('opening a lens makes it examined, once, in lens order', lensStatus(s, 'touch') === 'examined' && s.examined.join() === 'sight,touch');
s = addLens(s, 'touch', { a: 1 });
ok('adding makes it included and it is no longer merely examined', lensStatus(s, 'touch') === 'included' && !s.examined.includes('touch') && s.added.length === 1);
s = addLens(s, 'touch', { a: 2 });
ok('adding again updates in place (one entry, new data)', s.added.length === 1 && (s.added[0].data as any).a === 2);
s = putDownLens(s, 'touch');
ok('putting down an included lens leaves it included', lensStatus(s, 'touch') === 'included');
s = removeLens(s, 'touch');
ok('removing drops the data and goes back to examined', lensStatus(s, 'touch') === 'examined' && s.added.length === 0);
ok('removing a lens that was never added changes nothing', removeLens(s, 'sound') === s);
s = addLens(s, 'movement', 1); s = addLens(s, 'sight', 2); s = openLens(s, 'insight');
const r = reportShape(s);
ok('the report lists included lenses in order and one line for the examined ones', r.included.join() === 'sight,movement' && r.examinedNotIncluded.join() === 'touch,insight' && r.line === 'Examined, not included: Touch, Pattern.');
ok('with nothing examined there is no line', reportShape(addLens(emptyLensState(), 'sound', 1)).line === '');
ok('the soft limit is three: a warning comes before the fourth, never before the third', SOFT_LIMIT === 3 && !needsFewerWarning(2) && needsFewerWarning(3) && needsFewerWarning(0, 4));

const v1 = { v: 1, selectedGateways: ['sight', 'sound', 'touch'], gatewayData: [{ gateway: 'sound', data: 1 }, { gateway: 'sight', data: 2 }], bodyMapData: { x: 1 }, interfaceColors: { color1: '#111111', color2: '#222222' } };
const d1 = readSavedDraft(v1)!;
ok('a version 1 draft reads: finished lenses are included, in order; a chosen but unfinished one is simply not opened', d1.v === 2 && d1.gatewayData.map((g) => g.gateway).join() === 'sight,sound' && d1.examined.length === 0 && (d1.bodyMapData as any).x === 1);
const d2 = readSavedDraft({ v: 2, examined: ['touch', 'sight', 'bogus'], gatewayData: [{ gateway: 'sight', data: 1 }, { gateway: 'nope', data: 1 }], bodyMapData: null, interfaceColors: v1.interfaceColors })!;
ok('a version 2 draft reads: unknown lenses dropped, an included lens is not also examined', d2.examined.join() === 'touch' && d2.gatewayData.length === 1);
ok('anything else is not a draft', readSavedDraft(null) === null && readSavedDraft({ v: 3, gatewayData: [] }) === null && readSavedDraft({ v: 1 }) === null);
