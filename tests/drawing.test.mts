// The drawing space is built to be used without sight or a pointer: strokes as data, keyboard, buttons, shapes, and the drawing in words.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { CANVAS_W, CANVAS_H, SHAPES, SIZES, shapeStrokes, describeDrawing, clampPt, type ShapeId, type ShapeSize } from '../src/lib/drawingModel.ts';
import { ok } from './helpers.mts';
const comp = readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), 'src/app/components/DrawingCanvas.tsx'), 'utf8');

const centers = [{ x: 200, y: 90 }, { x: 5, y: 5 }, { x: 395, y: 175 }];
ok('every shape at every size and place stays inside the canvas', SHAPES.every((s) => (Object.keys(SIZES) as ShapeSize[]).every((z) => centers.every((c) => shapeStrokes(s.id as ShapeId, c, z).every((st) => st.length > 0 && st.every((p) => p.x >= 0 && p.x <= CANVAS_W && p.y >= 0 && p.y <= CANVAS_H))))));
ok('the points are clamped to the canvas', clampPt({ x: -5, y: 999 }).x === 0 && clampPt({ x: -5, y: 999 }).y === CANVAS_H);
ok('an empty drawing is described as empty', describeDrawing([]) === 'Empty.');
const c = { x: 200, y: 90 };
ok('a circle is described as a closed loop in the middle', /1 stroke: a closed loop in the middle/.test(describeDrawing(shapeStrokes('circle', c, 'medium'))), describeDrawing(shapeStrokes('circle', c, 'medium')));
ok('a line is described with its direction and place', /a straight line going left to right in the middle/.test(describeDrawing(shapeStrokes('line', c, 'medium'))) && /top to bottom/.test(describeDrawing(shapeStrokes('vertical', c, 'medium'))));
ok('a wave is a winding line, dots are dots', /a winding line/.test(describeDrawing(shapeStrokes('wave', c, 'large'))) && /all dots/.test(describeDrawing(shapeStrokes('dots', c, 'small'))) && /a dot/.test(describeDrawing(shapeStrokes('dots', c, 'small'))));
ok('the place is in words: a shape at the top left reads "at the top left"', /at the top left/.test(describeDrawing(shapeStrokes('circle', { x: 40, y: 30 }, 'small'))));
const many = Array.from({ length: 9 }, () => shapeStrokes('line', c, 'small')[0]);
ok('a long drawing lists the first six strokes and counts the rest', /9 strokes/.test(describeDrawing(many)) && /and 3 more/.test(describeDrawing(many)));

ok('the drawing area can be focused and has a name that includes the drawing in words', /tabIndex=\{0\}/.test(comp) && /role="img"/.test(comp) && /aria-label=\{`Drawing area\. \$\{description\}/.test(comp));
ok('the keyboard works: arrows (Shift for small steps), Space or Enter for the pen, Escape, and undo', /ArrowLeft/.test(comp) && /ArrowRight/.test(comp) && /ArrowUp/.test(comp) && /ArrowDown/.test(comp) && /e\.shiftKey/.test(comp) && /k === ' ' \|\| k === 'Enter'/.test(comp) && /Escape/.test(comp) && /e\.ctrlKey \|\| e\.metaKey/.test(comp));
ok('every action has a labelled button, for switches, voice control and screen readers', ['Put the pen down', 'Move the cursor left', 'Move the cursor up', 'Move the cursor down', 'Move the cursor right', 'Undo the last stroke', 'Add the shape at the cursor'].every((l) => comp.includes(l)) && /aria-pressed=\{penDown\}/.test(comp));
ok('the cursor can be moved to any of nine places by name, without pressing many keys', ['Top left', 'Top middle', 'Top right', 'Middle left', 'Center', 'Middle right', 'Bottom left', 'Bottom middle', 'Bottom right'].every((p) => comp.includes(`label: '${p}'`)));
ok('changes are announced in a polite live region, and the drawing is written out in words on the page', /role="status" aria-live="polite"/.test(comp) && /Your drawing, in words/.test(comp));
ok('the instructions are tied to the drawing area', /aria-describedby=\{`\$\{uid\}-help`\}/.test(comp) && /Every action also has a button below/.test(comp));
ok('the pointer still works, and pointer-only gestures are not the only way (2.5.7)', /onPointerDown=\{down\}/.test(comp) && /togglePen/.test(comp));
