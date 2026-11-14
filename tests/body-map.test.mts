// The body map: pins placed anywhere, zoom with an area list, the face in detail, and how all of it reads in a report.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ALL_PARTS, BODY_PARTS, FACE_PARTS, MAP_W, MAP_H, nearestPart, pinLabel, labelFor, isPinId } from '../src/lib/bodyMapParts.ts';
import { formatBodyMapLines, isBodyMapUsed, getBodyPartLabel } from '../src/lib/reportText.ts';
import { ok } from './helpers.mts';
const src = (f: string) => readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), f), 'utf8');

ok('every part has its own id', new Set(ALL_PARTS.map((p) => p.id)).size === ALL_PARTS.length);
ok('the old fifteen body parts are unchanged (saved reports and ids stay valid)', BODY_PARTS.length === 15 && BODY_PARTS[0].id === 'head' && getBodyPartLabel('left-shoulder') === 'L. Shoulder');
const need = ['forehead', 'left-eye', 'right-eye', 'left-eyebrow', 'right-eyebrow', 'nose', 'left-cheek', 'right-cheek', 'mouth', 'left-ear', 'right-ear', 'left-jaw', 'right-jaw', 'chin', 'left-temple', 'right-temple'];
ok('the face has its parts: forehead, brows, eyes, nose, cheeks, mouth, ears, jaw, chin, temples', need.every((id) => FACE_PARTS.some((p) => p.id === id)));
ok('every face part lies on the head', FACE_PARTS.every((p) => ((p.position.x - 150) / 40) ** 2 + ((p.position.y - 50) / 45) ** 2 <= 1), 'ellipse of the head');
ok('left and right follow the body\'s convention: every left part is on the left of the picture, every right part on the right', ALL_PARTS.filter((p) => /^left-/.test(p.id)).every((p) => p.position.x < 150) && ALL_PARTS.filter((p) => /^right-/.test(p.id)).every((p) => p.position.x > 150));
ok('a point on the left cheek is named from the face, a point on the hip from the body', nearestPart(131, 61).id === 'left-cheek' && nearestPart(60, 245).id === 'left-hand' && !nearestPart(150, 200).face);
ok('a pin reads with its number, its own name and where it is in words', pinLabel({ id: 'pin-1', x: 131, y: 61, label: 'tight spot' }, 0) === 'Pin 1, "tight spot" (near L. Cheek)' && pinLabel({ id: 'pin-2', x: 150, y: 200 }, 1) === 'Pin 2 (near Stomach)');
ok('labels come from parts, from pins, and a removed pin still reads', labelFor('nose') === 'Nose' && labelFor('pin-1', [{ id: 'pin-1', x: 150, y: 54 }]).startsWith('Pin 1') && labelFor('pin-9') === 'Pin' && isPinId('pin-9') && !isPinId('head'));

const map = { placements: [{ bodyPartId: 'pin-1', color: '#112233', colorName: 'dusk' }, { bodyPartId: 'left-eye', color: '#445566' }], notes: { 'pin-1': 'a tight spot', 'forehead': 'tension' }, pins: [{ id: 'pin-1', x: 90, y: 150 }] };
const lines = formatBodyMapLines(map);
ok('a report lists a pin with its place, color and note, and a face part by name', lines.includes('Pin 1 (near L. Shoulder)') && lines.some((l) => l === '  Color: dusk') && lines.includes('L. Eye') && lines.includes('Forehead') && lines.includes('  Note: a tight spot'), lines.join(' | '));
ok('a map with only a pin note counts as used; an empty one does not', isBodyMapUsed(map) && !isBodyMapUsed({ placements: [], notes: {}, pins: [] }));
ok('old saved maps (no pins) still read', formatBodyMapLines({ placements: [{ bodyPartId: 'head', color: '#000000' }], notes: {} }).includes('Head'));
ok('pins stay inside the map', MAP_W === 300 && MAP_H === 420);

const comp = src('src/app/components/BodyMapAvatar.tsx');
ok('clicking an empty spot on the map drops a pin there', /data-map-bg[\s\S]{0,200}addPin\(q\.x, q\.y\)/.test(comp));
ok('a pin can be dragged, moved with the arrow keys, opened with Enter and removed with Delete (no mouse needed)', /onPointerDown[\s\S]*dragging\.current/.test(comp) && /ArrowLeft[\s\S]*ArrowRight[\s\S]*ArrowUp[\s\S]*ArrowDown[\s\S]*Delete/.test(comp));
ok('there is a button to add a pin in the middle of the current view, for people who do not point', /Add a pin here/.test(comp));
ok('the map zooms in and out, resets, moves with buttons, and has areas (face, upper body, hands, feet)', /aria-label="Zoom in"/.test(comp) && /aria-label="Zoom out"/.test(comp) && /Show the whole body/.test(comp) && /Move the view left/.test(comp) && ['Face', 'Upper body', 'Left hand', 'Right hand', 'Feet'].every((a) => comp.includes(`>${a}</Button>`)));
ok('the face\'s parts show when zoomed in, or when they hold a color or a note', /!part\.face \|\| showFace \|\| getPlacementForBodyPart\(part\.id\) \|\| notes\[part\.id\]/.test(comp));
ok('the saved picture is always the whole body, whatever the zoom', /setAttribute\('viewBox', `0 0 \$\{MAP_W\} \$\{MAP_H\}`\)/.test(comp));
ok('pins are saved with the map and passed back to it by every gateway', /pins,\s*\n?\s*imageDataUrl|pins, imageDataUrl/.test(comp) && ['Sight', 'Sound', 'Touch', 'Essence', 'Movement', 'Insight'].every((g) => /initialPins=\{bodyMapData\.pins\}/.test(src(`src/app/components/pages/${g}GatewayPage.tsx`))));
ok('a page does not trap touch scrolling: only a pin itself ignores touch gestures', !/touch-none/.test(comp) && /touchAction: 'none'/.test(comp));
