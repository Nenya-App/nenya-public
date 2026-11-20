// The lens ring's geometry and words (src/lib/lensRing.ts): one leaf per lens, angular sectors, names, the size rule and keyboard movement.
import { announceLeaf, hitLeaf, leafAngle, leafCaption, leafDescription, leafName, leafPath, minRingSize, nextIndex, pressAction, ringFits, ringItems, sector, MAX_RING_LEAVES, TARGET_PX, type RingItem } from '../src/lib/lensRing.ts';
import { ok } from './helpers.mts';

const sight: RingItem = { id: 'sight', title: 'Sight', line: 'Explore through visual perception' };
ok('the accessible name follows the scope note', leafName(sight, 0, 8, 'not-opened') === 'Sight lens, not opened, 1 of 8');
ok('Pattern and status words read plainly', leafName({ id: 'insight', title: 'Pattern', line: '' }, 5, 8, 'included') === 'Pattern lens, included in my report, 6 of 8' && leafName(sight, 1, 6, 'examined').includes('examined'));
ok('a custom lens says so', leafName({ id: 'c1', title: 'Quiet', line: '', custom: true }, 6, 7, 'not-opened') === 'Quiet lens, custom, not opened, 7 of 7');
ok('the description is the line plus what a second press does', leafDescription(sight).startsWith('Explore through visual perception') && /again to pick it up/.test(leafDescription(sight)));
ok('the caption has the name, a capitalised status and the line', JSON.stringify(leafCaption(sight, 'examined')) === JSON.stringify({ title: 'Sight lens', status: 'Examined', line: 'Explore through visual perception' }));
ok('the announcement carries the position and the second-press hint', /^Sight lens, not opened, 1 of 8\./.test(announceLeaf(sight, 0, 8, 'not-opened')) && /Enter or Space again/.test(announceLeaf(sight, 0, 8, 'not-opened')));

ok('the ring has at most 13 leaves', MAX_RING_LEAVES === 13 && ringItems(Array.from({ length: 20 }, (_, i) => i)).length === 13 && ringItems([1, 2, 3]).length === 3);
ok('leaf 0 is at the top, then clockwise', leafAngle(0, 8) === 0 && leafAngle(2, 8) === 90 && leafAngle(1, 13) > 27.6 && leafAngle(1, 13) < 27.8);
ok('sectors tile the circle with no gap, for every count 1 to 13', Array.from({ length: 13 }, (_, k) => k + 1).every((n) => { let e = -180 / n; for (let i = 0; i < n; i++) { const s = sector(i, n); if (Math.abs(s.start - e) > 1e-9) return false; e = s.end; } return Math.abs(e - (360 - 180 / n)) < 1e-9; }));

const SIZE = 400, R = SIZE / 2;
const at = (deg: number, frac: number): [number, number] => [R * frac * Math.sin((deg * Math.PI) / 180), -R * frac * Math.cos((deg * Math.PI) / 180)];
ok('a tap at each leaf angle hits that leaf, for every count 1 to 13', Array.from({ length: 13 }, (_, k) => k + 1).every((n) => Array.from({ length: n }, (_, i) => i).every((i) => hitLeaf(...at(leafAngle(i, n), 0.7), SIZE, n) === i)));
ok('a tap just inside a sector edge still hits the leaf (odd count, 13)', hitLeaf(...at(sector(0, 13).end - 0.5, 0.7), SIZE, 13) === 0 && hitLeaf(...at(sector(0, 13).end + 0.5, 0.7), SIZE, 13) === 1 && hitLeaf(...at(-1, 0.7), SIZE, 13) === 0 && hitLeaf(...at(359, 0.7), SIZE, 13) === 0);
ok('the clear centre and the outside are no leaf', hitLeaf(0, 0, SIZE, 8) === -1 && hitLeaf(R * 1.2, 0, SIZE, 8) === -1 && hitLeaf(0, -R * 0.2, SIZE, 8) === -1);
ok('no leaves means no hit', hitLeaf(R * 0.7, 0, SIZE, 0) === -1);

ok('13 leaves need a ring of about 180 px (the scope note says about 90 px of radius)', minRingSize(13) >= 175 && minRingSize(13) <= 190);
ok('every sector is at least 44 px wide at the tips once the ring fits', Array.from({ length: 13 }, (_, k) => k + 1).filter((n) => n > 1).every((n) => (Math.PI * minRingSize(n)) / n >= TARGET_PX - 1e-9));
ok('the radial depth is at least 44 px at the smallest size, even for few leaves', (minRingSize(3) / 2) * (1 - 0.34) >= TARGET_PX - 1e-9);
ok('the minimum never falls as leaves are added', Array.from({ length: 12 }, (_, k) => k + 1).every((n) => minRingSize(n + 1) >= minRingSize(n)));
ok('below the minimum the text list is used; at it the ring is offered', !ringFits(minRingSize(8) - 1, 8) && ringFits(minRingSize(8), 8) && !ringFits(NaN, 8) && !ringFits(300, 0));

ok('arrows wrap, Home and End jump, other keys are not the ring\'s', nextIndex('ArrowRight', 7, 8) === 0 && nextIndex('ArrowLeft', 0, 8) === 7 && nextIndex('ArrowDown', 2, 8) === 3 && nextIndex('ArrowUp', 2, 8) === 1 && nextIndex('Home', 5, 8) === 0 && nextIndex('End', 1, 8) === 7 && nextIndex('a', 1, 8) === null && nextIndex('End', 0, 0) === null);
ok('first press informs, a second press on the same leaf picks up, a different leaf informs again', pressAction(null, 2) === 'inform' && pressAction(2, 2) === 'pick-up' && pressAction(2, 3) === 'inform');
ok('every leaf has its own closed path inside the ring', Array.from({ length: 13 }, (_, i) => leafPath(i, 13, 400)).every((d, i, all) => /^M[\d. ]+Q.*Z$/.test(d) && all.indexOf(d) === i));

import { lensRingOn, sectorPath } from '../src/lib/lensRing.ts';
ok('the ring is off unless VITE_LENS_RING=on is set (no environment here, so off)', lensRingOn() === false);
ok('every leaf has a closed sector path, and they are all different', Array.from({ length: 13 }, (_, i) => sectorPath(i, 13, 300)).every((d, i, all) => /^M.*Z$/.test(d) && all.indexOf(d) === i) && /A/.test(sectorPath(0, 1, 300)));
