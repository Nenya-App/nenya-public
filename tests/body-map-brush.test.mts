// The shared body map's paintbrush: paints from the added lenses, first-time pick-up, strokes, and how the marks read in the report.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { brushesFor, paintsOf, pickupDiff, pickupAnnouncement, addPoint, effectiveSize, strokePath, describeStrokes, cleanStrokes, MAX_POINTS, type BrushStroke } from '../src/lib/bodyMapBrush.ts';
import { formatBodyMapLines, isBodyMapUsed } from '../src/lib/reportText.ts';
import { bodyMapAltFor, BODY_MAP_ALT } from '../src/lib/altText.ts';
import { ok } from './helpers.mts';
const src = (f: string) => readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), f), 'utf8');

const sight = { gateway: 'sight' as const, data: { color1: '#aa0000', color2: '#0000bb', color1Name: 'ember' } };
const touch = { gateway: 'touch' as const, data: { currentSurface: 'ac-Leather004', potentialSurface: 'ac-Leather004' } };
const sound = { gateway: 'sound' as const, data: { melody: [1, 2] } };

ok('Sight gives its two colors as brushes, named by the person or by hex', paintsOf('sight', sight.data).map((p) => p.label).join() === 'ember,#0000BB');
ok('Touch gives its surface; the same surface for now and wish is one brush', paintsOf('touch', touch.data).length === 1 && paintsOf('touch', touch.data)[0].kind === 'surface');
ok('a lens with nothing to paint with gives no brush', paintsOf('sound', sound.data).length === 0 && paintsOf('essence', {}).length === 0);
ok('brushes come only from added lenses, in lens order, and a removed lens gives none', brushesFor([touch, sight]).map((b) => b.lens).join() === 'sight,sight,touch' && brushesFor([]).length === 0);
const d1 = pickupDiff([], [sight, touch]);
ok('every lens added for the first time is new; once seen it is not new again', d1.fresh.join() === 'sight,touch' && pickupDiff(d1.seen, [sight, touch]).fresh.length === 0);
ok('a lens taken out is forgotten, so adding it again is new again', pickupDiff(d1.seen, [sight]).seen.join() === 'sight' && pickupDiff(['sight'], [sight, touch]).fresh.join() === 'touch');
ok('the announcement names the lens and what it gave', /^Sight picked up by the body map: 2 colors/.test(pickupAnnouncement(['sight'], [sight])) && /nothing to paint with/.test(pickupAnnouncement(['sound'], [sound])));

let pts: [number, number][] = [[10, 10]];
ok('a point nearly where the last one is is skipped; a far one is kept; points are clamped to the map', addPoint(pts, 10.3, 10.3) === pts && addPoint(pts, 20, 20).length === 2 && addPoint(pts, 999, -5)[1].join() === '300,0');
ok('a stroke stops growing at its limit', addPoint(Array.from({ length: MAX_POINTS }, (_, i) => [i % 300, 0] as [number, number]), 5, 400).length === MAX_POINTS);
ok('the brush keeps its size on the screen: zoomed in, the stroke is finer', effectiveSize(12, 1) === 12 && effectiveSize(12, 3) === 4 && effectiveSize(12, 0.5) === 12);
ok('a dab is a zero-length path a round cap draws as a dot', strokePath([[5, 6]]) === 'M5 6l0.01 0' && strokePath([[1, 2], [3, 4]]) === 'M1 2L3 4');

const pc = paintsOf('sight', sight.data)[0];
const strokes: BrushStroke[] = [{ paint: pc, size: 8, pts: [[150, 140], [152, 142]] }, { paint: pc, size: 8, pts: [[60, 240]] }];
ok('marks are described by paint with where they are', describeStrokes(strokes)[0].includes('ember (color, Sight, present): 2 strokes (1 near Chest, 1 near L. Hand)'), describeStrokes(strokes)[0]);
ok('bad saved strokes are dropped, good ones kept and clamped', cleanStrokes([{ nope: 1 }, { paint: { id: 'x', kind: 'color', label: 'a', hex: 'zz' }, size: 3, pts: [[1, 1]] }, { ...strokes[0], pts: [[-5, 9999]] }]).length === 1 && cleanStrokes('x').length === 0);

const map = { placements: [], notes: {}, strokes, pickedUp: ['Sight', 'Touch'] };
const lines = formatBodyMapLines(map);
ok('a map with only brush marks counts as used', isBodyMapUsed(map) && !isBodyMapUsed({ placements: [], notes: {}, strokes: [] }));
ok('the report names the picked-up lenses once and lists the brush marks', lines.filter((l) => l.startsWith('Lenses picked up by the body map: Sight, Touch')).length === 1 && lines.includes('Paintbrush marks'));
ok('with no picked-up lenses given (switch off) the line is absent', !formatBodyMapLines({ placements: [{ bodyPartId: 'head', color: '#000000' }], notes: {} }).some((l) => /picked up/.test(l)));
ok('the picture\'s alt text counts what is on it and falls back to the plain text', bodyMapAltFor(0, 0) === BODY_MAP_ALT && /2 places colored and 1 paintbrush stroke\./.test(bodyMapAltFor(2, 1)) && src('docs/brand/alt-text.md').includes('3 places colored and 2 paintbrush strokes'));

const comp = src('src/app/components/BodyMapAvatar.tsx'), tray = src('src/app/components/pages/LensTrayPage.tsx'), card = src('src/app/components/BodyMapCard.tsx'), app = src('src/app/App.tsx');
ok('the brush needs the lens tray switch: no provider, no brush', /enabled: false/.test(src('src/app/components/BodyMapBrushContext.ts')) && /const brushOn = bm\.enabled/.test(comp) && /enabled: lensTrayOn\(\)/.test(app));
ok('the brush works with a pointer (capture, cancel), the keyboard (arrows, Space, Control+Z) and buttons, and does not trap touch scrolling in pin mode', /setPointerCapture/.test(comp) && /onPointerCancel/.test(comp) && /Space|k === ' '/.test(comp) && /Paint without a pointer/.test(comp) && /brushing \? \{ touchAction: 'none' \}/.test(comp));
ok('the brush offers undo, put back, clear and put the cleared marks back', ['Undo the last stroke', 'Put the stroke back', 'Clear the brush marks', 'Put the cleared marks back'].every((t) => comp.includes(t)));
ok('the shared card is in the tray, announces politely, and opens the body map', /<BodyMapCard/.test(tray) && /aria-live="polite"/.test(card) && /Open the body map/.test(card));
ok('the report copy of the map names the lenses; the saved copy does not', /pickedUp: gatewayData\.map/.test(app) && /bodyMapData=\{reportBodyMap\}/.test(app));
