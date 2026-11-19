// The animated layer of the Movement and Pattern drawings (src/lib/shapeAnimation.ts, src/app/components/ShapePicker.tsx): the still drawing always stays, and every
// kind of element in every drawing gets an animation that does something visible.
import { readFileSync } from 'node:fs';
import { SHAPES } from '../src/lib/gatewayShapes.ts';
import { animatedArt, SHAPE_ANIM_CSS, DRAW_CAP, POP_CAP } from '../src/lib/shapeAnimation.ts';
import { ok } from './helpers.mts';

const arts = SHAPES.map((s) => ({ s, a: animatedArt(s.svg) }));
const TAGS = /<(path|circle|rect|ellipse|line|polyline|polygon) /g;

ok('every drawn element in every drawing is animated (none is left out, whatever its tag)', arts.every(({ s, a }) => (s.svg.match(TAGS) ?? []).length === a.draws + a.pops && (a.svg.match(/class="sa-(draw|pop)"/g) ?? []).length === a.draws + a.pops));
ok('rectangles and ellipses animate too (the woven, maze, mosaic and layered patterns, and the movement drawings with ovals)', ['p-woven', 'p-maze', 'p-mosaic', 'p-layered', 'm-stretching', 'm-pushing'].every((id) => {
  const x = arts.find((r) => r.s.id === id)!;
  return /<(rect|ellipse) class="sa-draw"/.test(x.a.svg);
}));
ok('filled dots and triangles (no outline, nothing to draw) fade in instead, so scattered, clustered, emerging and triangles are not still', ['p-scattered', 'p-clustered', 'p-emerging', 'p-triangles'].every((id) => arts.find((r) => r.s.id === id)!.a.pops > 5) && arts.find((r) => r.s.id === 'p-unified')!.a.pops === 1);
ok('outlined elements never fade in and filled ones never draw', arts.every(({ a }) => !/class="sa-pop"[^>]*stroke="currentColor"/.test(a.svg)) && arts.every(({ a }) => !/class="sa-draw"[^>]*fill="currentColor"[^>]*stroke="none"/.test(a.svg)));
ok('every drawing has something that moves', arts.every(({ a }) => a.draws + a.pops > 0));
ok('start delays are staggered and capped, so a drawing with 27 pieces is not still for long', arts.every(({ a }) => [...a.svg.matchAll(/--delay:([\d.]+)s/g)].every((m) => +m[1] <= Math.max(DRAW_CAP, POP_CAP))) && /--delay:0s/.test(animatedArt(SHAPES[0].svg).svg) && /--delay:0\.25s/.test(animatedArt(SHAPES[0].svg).svg));
ok('the drawing is otherwise unchanged by the animated copy, so the still copy is exactly the drawing', arts.every(({ s, a }) => a.svg.replace(/ class="sa-(draw|pop)" style="--delay:[\d.]+s"/g, '') === s.svg));
ok('the same drawing gives the same animated copy every time', JSON.stringify(arts.map((r) => r.a.svg)) === JSON.stringify(SHAPES.map((s) => animatedArt(s.svg).svg)));

ok('the still drawing is dimmed only while it animates: full under reduced motion, when paused and when chosen', /\.shape-anim:not\(\.shape-paused\) \.shape-still \{ opacity: \.35/.test(SHAPE_ANIM_CSS) && /\.shape-chosen \.shape-still \{ opacity: 1/.test(SHAPE_ANIM_CSS) && /prefers-reduced-motion: reduce\) \{ \.shape-anim \.shape-live \{ display: none; \}[^}]*\.shape-still \{ opacity: 1 !important/.test(SHAPE_ANIM_CSS));
ok('paused and chosen drawings hide the animated copy', /\.shape-paused \.shape-live, \.shape-anim \.shape-chosen \.shape-live \{ display: none; \}/.test(SHAPE_ANIM_CSS));
ok('the line draws by its own measured length, not by pathLength (which browsers differ on)', /var\(--len/.test(SHAPE_ANIM_CSS) && !/pathLength/.test(SHAPE_ANIM_CSS) && !/pathLength/.test(readFileSync('src/app/components/ShapePicker.tsx', 'utf8')) && /getTotalLength/.test(readFileSync('src/app/components/ShapePicker.tsx', 'utf8')));
ok('the picture is hidden from screen readers and each button is named by the drawing and its description', /aria-hidden className=\{`relative block size-14 shape-art/.test(readFileSync('src/app/components/ShapePicker.tsx', 'utf8')) && /aria-label=\{`\$\{s\.label\}\. \$\{s\.alt\}`\}/.test(readFileSync('src/app/components/ShapePicker.tsx', 'utf8')) && SHAPES.every((s) => /aria-hidden="true"/.test(animatedArt(s.svg).svg)));
