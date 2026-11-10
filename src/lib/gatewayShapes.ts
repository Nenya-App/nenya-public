// Drawings for the Movement and Insight (pattern) gateways (docs/gateway-images-scope.md): made by us, in code, so there is no license to check and
// every picture can be described exactly. Each is a plain line drawing on a 100 by 100 square, drawn in the text color ("currentColor"), with no people
// and no words in it. Starting points to choose from, never a measurement: a person can always use words instead. The alt texts are the owner's to
// review and edit (see docs/accessibility-testing-list.md for the testing still to do with blind and low-vision readers).

export type ShapeSet = 'movement' | 'pattern';

export interface Shape {
  id: string;
  set: ShapeSet;
  /** A short name, shown under the picture. */
  label: string;
  /** What the picture is, in one plain sentence: what a screen reader says when choosing. Describes the drawing, never a feeling. */
  alt: string;
  /** The gateway's own words this drawing might go with (a suggestion; see src/lib/senseWords.ts). */
  words: string[];
  /** The drawing as an SVG document. */
  svg: string;
}

// ── helpers
const f = (n: number): string => String(Math.round(n * 10) / 10);
const wrap = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
const line = (x1: number, y1: number, x2: number, y2: number): string => `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}"/>`;
const poly = (pts: [number, number][]): string => `<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}"/>`;
const circle = (cx: number, cy: number, r: number, fill = false): string => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"${fill ? ' fill="currentColor" stroke="none"' : ''}/>`;
/** An arrowhead at (x, y) pointing at `deg` degrees (0 = right, 90 = down). */
const head = (x: number, y: number, deg: number, s = 7): string => {
  const a = (deg * Math.PI) / 180;
  const p = (d: number): [number, number] => [x - s * Math.cos(a + d), y - s * Math.sin(a + d)];
  const [x1, y1] = p(0.5);
  const [x2, y2] = p(-0.5);
  return `<path d="M${f(x1)} ${f(y1)}L${f(x)} ${f(y)}L${f(x2)} ${f(y2)}"/>`;
};
const arrow = (x1: number, y1: number, x2: number, y2: number, s = 7): string => line(x1, y1, x2, y2) + head(x2, y2, (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI, s);
const sample = (n: number, fn: (t: number) => [number, number]): [number, number][] => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
/** A small repeatable random source, so a drawing is the same every time. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

const m = (id: string, label: string, alt: string, words: string[], inner: string): Shape => ({ id, set: 'movement', label, alt, words, svg: wrap(inner) });
const p = (id: string, label: string, alt: string, words: string[], inner: string): Shape => ({ id, set: 'pattern', label, alt, words, svg: wrap(inner) });

// ───────────────────────────────────────── Movement ─────────────────────────────────────────
const MOVEMENT: Shape[] = [
  m('m-rising', 'Rising', 'Three arrows side by side, all pointing straight up, the middle one the longest.', ['Upward', 'Rising', 'Lifting'],
    arrow(25, 78, 25, 40) + arrow(50, 85, 50, 15) + arrow(75, 78, 75, 40)),
  m('m-falling', 'Falling', 'Three arrows side by side, all pointing straight down, the middle one the longest.', ['Downward', 'Falling', 'Sinking'],
    arrow(25, 22, 25, 60) + arrow(50, 15, 50, 85) + arrow(75, 22, 75, 60)),
  m('m-outward', 'Outward', 'Eight arrows pointing away from a small circle in the middle, one in each direction.', ['Outward', 'Expansive', 'Spreading', 'Opening'],
    circle(50, 50, 5) + [0, 45, 90, 135, 180, 225, 270, 315].map((d) => { const [a, b] = polar(50, 50, 14, d); const [c, e] = polar(50, 50, 40, d); return arrow(a, b, c, e, 6); }).join('')),
  m('m-inward', 'Inward', 'Eight arrows pointing toward a small circle in the middle, one from each direction.', ['Inward', 'Contracting', 'Gathering', 'Closing'],
    circle(50, 50, 5) + [0, 45, 90, 135, 180, 225, 270, 315].map((d) => { const [a, b] = polar(50, 50, 40, d); const [c, e] = polar(50, 50, 14, d); return arrow(a, b, c, e, 6); }).join('')),
  m('m-spiral', 'Spiral out', 'A line that starts at a point in the middle and winds outward in a spiral, ending in an arrowhead.', ['Spiraling', 'Circling'],
    poly(sample(90, (t) => polar(50, 50, 3 + 38 * t, t * 900))) + head(...(polar(50, 50, 41, 900) as [number, number]), 900 + 90 + 12, 7)),
  m('m-oscillating', 'Back and forth', 'A smooth wave running from left to right, rising and falling four times.', ['Oscillating', 'Wavelike', 'Rhythmic'],
    poly(sample(60, (t) => [8 + 84 * t, 50 - 22 * Math.sin(t * Math.PI * 8)]))),
  m('m-swaying', 'Swaying', 'A curved line like a swing\'s path, with three straight lines from the top reaching down to dots at the left, middle and right of the curve.', ['Swaying', 'Rocking'],
    poly(sample(30, (t) => polar(50, 12, 66, 55 + 70 * t))) + [55, 90, 125].map((d) => { const [x, y] = polar(50, 12, 66, d); return line(50, 12, x, y) + circle(x, y, 4, true); }).join('')),
  m('m-rocking', 'Rocking', 'A shallow bowl shape with a ball resting in it and a small curved arrow on each side tipping toward the ball.', ['Rocking', 'Swaying'],
    poly(sample(24, (t) => polar(50, 28, 52, 40 + 100 * t))) + circle(50, 70, 7, true) + arrow(12, 52, 22, 64, 6) + arrow(88, 52, 78, 64, 6)),
  m('m-orbiting', 'Orbiting', 'A large circle with a small filled dot on its edge at the upper right and a smaller dot in the middle.', ['Orbiting', 'Circling', 'Rotating'],
    circle(50, 50, 34) + circle(...(polar(50, 50, 34, -40) as [number, number]), 6, true) + circle(50, 50, 3, true)),
  m('m-pushing', 'Pushing', 'A square block on the right with a long arrow coming from the left, pointing at it, and three short lines beside the block.', ['Pushing', 'Pressing', 'Advancing'],
    arrow(8, 50, 54, 50) + `<rect x="58" y="30" width="30" height="40" rx="3"/>` + line(93, 36, 97, 33) + line(94, 50, 98, 50) + line(93, 64, 97, 67)),
  m('m-apart', 'Pulling apart', 'Two short blocks with a gap between them, and an arrow pointing out of the gap to the left and another to the right.', ['Pulling apart', 'Opening', 'Spreading'],
    `<rect x="8" y="34" width="22" height="32" rx="3"/><rect x="70" y="34" width="22" height="32" rx="3"/>` + arrow(46, 50, 36, 50, 6) + arrow(54, 50, 64, 50, 6)),
  m('m-together', 'Pulling together', 'Two short blocks far apart, each with an arrow pointing toward the other across the gap.', ['Pulling together', 'Converging', 'Gathering'],
    `<rect x="8" y="34" width="22" height="32" rx="3"/><rect x="70" y="34" width="22" height="32" rx="3"/>` + arrow(34, 50, 46, 50, 6) + arrow(66, 50, 54, 50, 6)),
  m('m-converging', 'Converging', 'Five lines starting spread out down the left side and all meeting at one dot on the right.', ['Converging', 'Toward something', 'Advancing'],
    [14, 32, 50, 68, 86].map((y) => line(10, y, 82, 50)).join('') + circle(86, 50, 4, true)),
  m('m-scattering', 'Scattering', 'A small circle in the middle with seven lines of different lengths going out from it, each ending in a dot.', ['Scattering', 'Spreading', 'Outward'],
    circle(50, 50, 5) + [10, 62, 118, 170, 225, 280, 330].map((d, i) => { const r = [30, 42, 24, 38, 44, 28, 36][i]; const [a, b] = polar(50, 50, 8, d); const [c, e] = polar(50, 50, r, d); return line(a, b, c, e) + circle(c, e, 3, true); }).join('')),
  m('m-stuck', 'Held fast', 'A circle gripped between two tall upright bars, with short lines on the outside of each bar as if pressed together.', ['Stuck', 'Tense', 'Bracing'],
    line(30, 15, 30, 85) + line(70, 15, 70, 85) + circle(50, 50, 20) + arrow(10, 50, 24, 50, 6) + arrow(90, 50, 76, 50, 6)),
  m('m-still', 'Still', 'A small circle resting on a long flat line, with nothing else around it.', ['Still', 'Hovering'],
    line(10, 70, 90, 70) + circle(50, 62, 8)),
  m('m-drifting', 'Drifting', 'A curved line of dots that drifts from the lower left up to the upper right, the dots getting smaller as they go.', ['Drifting', 'Flowing', 'Floating'],
    sample(8, (t) => [12 + 76 * t, 80 - 55 * t + 14 * Math.sin(t * Math.PI * 2)] as [number, number]).map(([x, y], i) => circle(x, y, 6 - i * 0.55, true)).join('')),
  m('m-folding', 'Folding', 'A single line folded back and forth in five equal zigzags, like an accordion.', ['Folding', 'Contracting'],
    poly([[10, 25], [26, 75], [42, 25], [58, 75], [74, 25], [90, 75]])),
  m('m-stretching', 'Stretching', 'A long oval with an arrow pointing out from each end, away from the middle.', ['Stretching', 'Expansive', 'Reaching'],
    `<ellipse cx="50" cy="50" rx="24" ry="12"/>` + arrow(24, 50, 6, 50, 6) + arrow(76, 50, 94, 50, 6)),
  m('m-flowing', 'Flowing', 'Three wavy lines running side by side from left to right, one above the other.', ['Flowing', 'Fluid', 'Smooth'],
    [28, 50, 72].map((y) => poly(sample(40, (t) => [8 + 84 * t, y + 7 * Math.sin(t * Math.PI * 4)]))).join('')),
  m('m-hovering', 'Hovering', 'A small circle held in the air above a short flat line, with three short lines under the circle.', ['Hovering', 'Floating', 'Buoyant'],
    circle(50, 38, 9) + line(30, 78, 70, 78) + line(40, 56, 40, 66) + line(50, 56, 50, 68) + line(60, 56, 60, 66)),
  m('m-looping', 'Looping', 'A line travelling left to right that makes three round loops along the way.', ['Looping', 'Circling'],
    poly(sample(150, (t) => { const th = t * Math.PI * 6; return [22 + 56 * t - 14 * Math.sin(th), 50 - 14 * Math.cos(th)] as [number, number]; }))),
  m('m-advancing', 'Forward', 'One long arrow pointing right, with three shorter arrows following behind it, getting shorter.', ['Forward', 'Advancing', 'Toward something'],
    arrow(40, 30, 92, 30, 7) + arrow(30, 50, 70, 50, 7) + arrow(20, 70, 48, 70, 7)),
  m('m-retreating', 'Backward', 'One long arrow pointing left, with three shorter arrows beside it, getting shorter.', ['Backward', 'Retreating', 'Away from something'],
    arrow(60, 30, 8, 30, 7) + arrow(70, 50, 30, 50, 7) + arrow(80, 70, 52, 70, 7)),
];

// ───────────────────────────────────────── Pattern ─────────────────────────────────────────
const dots = (n: number, seed: number, pad = 10): string => {
  const r = rng(seed);
  return Array.from({ length: n }, () => circle(pad + r() * (100 - 2 * pad), pad + r() * (100 - 2 * pad), 2.6, true)).join('');
};
const tangled = (seed: number): string => {
  const r = rng(seed);
  return poly(Array.from({ length: 16 }, () => [10 + r() * 80, 10 + r() * 80] as [number, number]));
};
const web = (): string => {
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  const rings = [12, 24, 36];
  return spokes.map((d) => { const [x, y] = polar(50, 50, 38, d); return line(50, 50, x, y); }).join('') +
    rings.map((r) => `<path d="M${spokes.map((d) => polar(50, 50, r, d).map(f).join(' ')).join('L')}Z"/>`).join('');
};
const sierpinski = (x: number, y: number, s: number, d: number): string => {
  if (d === 0) return `<path d="M${f(x)} ${f(y)}L${f(x + s)} ${f(y)}L${f(x + s / 2)} ${f(y - s * 0.866)}Z" fill="currentColor" stroke="none"/>`;
  const h = s / 2;
  return sierpinski(x, y, h, d - 1) + sierpinski(x + h, y, h, d - 1) + sierpinski(x + h / 2, y - h * 0.866, h, d - 1);
};
const hex = (cx: number, cy: number, r: number): string => `<path d="M${[0, 60, 120, 180, 240, 300].map((d) => polar(cx, cy, r, d + 30).map(f).join(' ')).join('L')}Z"/>`;

const PATTERN: Shape[] = [
  p('p-lines', 'Lines', 'Six straight lines, side by side, running from top to bottom with equal gaps.', ['Linear', 'Striped', 'Repeating'],
    [14, 30, 46, 62, 78, 94].map((x) => line(x - 4, 12, x - 4, 88)).join('')),
  p('p-branching', 'Branching', 'A line rising from the bottom that splits into two, and each of those splits into two again, like a small tree.', ['Branching', 'Fractal', 'Organic'],
    line(50, 90, 50, 62) + line(50, 62, 30, 42) + line(50, 62, 70, 42) + line(30, 42, 20, 20) + line(30, 42, 40, 20) + line(70, 42, 60, 20) + line(70, 42, 80, 20)),
  p('p-zigzag', 'Zigzag', 'One line going back and forth between two levels in six sharp points, left to right.', ['Zigzag'],
    poly([[8, 68], [24, 32], [38, 68], [52, 32], [66, 68], [80, 32], [92, 68]])),
  p('p-wavy', 'Waves', 'Three smooth wavy lines, one above the other, each rising and falling the same way.', ['Wavy', 'Repeating'],
    [28, 50, 72].map((y) => poly(sample(40, (t) => [8 + 84 * t, y + 8 * Math.sin(t * Math.PI * 4)]))).join('')),
  p('p-winding', 'Winding path', 'One line that winds from the top left to the bottom right in wide curves, like a road across hills.', ['Winding', 'Looping'],
    poly(sample(60, (t) => [12 + 76 * t, 12 + 76 * t + 22 * Math.sin(t * Math.PI * 4)]))),
  p('p-maze', 'Maze', 'A square maze with walls made of straight lines, with a single entrance on the left and an inner passage that turns three times.', ['Maze-like', 'Geometric'],
    `<rect x="12" y="12" width="76" height="76"/>` + poly([[12, 30], [30, 30], [30, 70], [70, 70], [70, 30], [48, 30], [48, 50]])),
  p('p-concentric', 'Rings', 'Five circles, one inside the next, all sharing the same center.', ['Concentric', 'Circular', 'Ripple-like', 'Radiating'],
    [8, 16, 25, 34, 43].map((r) => circle(50, 50, r)).join('')),
  p('p-spiral', 'Spiral', 'One line winding into the middle in a spiral, going around about three times.', ['Spiraling', 'Cyclical'],
    poly(sample(120, (t) => polar(50, 50, 42 * (1 - t) + 2, t * 1000)))),
  p('p-grid', 'Grid', 'A square grid, four rows by four columns, with straight lines crossing at right angles.', ['Grid-like', 'Geometric', 'Repeating'],
    [12, 31, 50, 69, 88].map((v) => line(v, 12, v, 88) + line(12, v, 88, v)).join('')),
  p('p-hex', 'Honeycomb', 'Seven six-sided cells packed together, one in the middle with six around it, with no gaps.', ['Tessellated', 'Cellular', 'Interlocking'],
    hex(50, 50, 15) + [0, 60, 120, 180, 240, 300].map((d) => { const [x, y] = polar(50, 50, 26, d); return hex(x, y, 15); }).join('')),
  p('p-woven', 'Woven', 'Horizontal and vertical bands crossing, each horizontal band going over one vertical band and under the next, like cloth.', ['Woven', 'Interlocking', 'Layered'],
    [20, 44, 68].map((y, r) => [20, 44, 68].map((x, c) => ((r + c) % 2 === 0 ? `<rect x="${x - 6}" y="${y}" width="36" height="12" rx="2"/>` : `<rect x="${x}" y="${y - 6}" width="12" height="36" rx="2"/>`)).join('')).join('')),
  p('p-nested', 'Squares in squares', 'Four squares, each inside the next, each turned a little further than the one around it.', ['Nested', 'Geometric', 'Layered'],
    [40, 30, 21, 13].map((r, i) => `<path d="M${[45, 135, 225, 315].map((d) => polar(50, 50, r * 1.2, d + i * 12).map(f).join(' ')).join('L')}Z"/>`).join('')),
  p('p-radiating', 'Sunburst', 'Twelve straight lines going out from the middle like the rays of a sun, with a gap left at the center.', ['Radiating', 'Symmetrical'],
    Array.from({ length: 12 }, (_, i) => { const [a, b] = polar(50, 50, 12, i * 30); const [c, d] = polar(50, 50, 42, i * 30); return line(a, b, c, d); }).join('')),
  p('p-ripples', 'Ripples', 'Three sets of rings spreading from three points, overlapping where they meet.', ['Ripple-like', 'Radiating', 'Concentric'],
    [[34, 40], [66, 40], [50, 68]].map(([x, y]) => [6, 13, 20].map((r) => circle(x, y, r)).join('')).join('')),
  p('p-cracked', 'Cracked', 'A rounded shape with several jagged lines running through it, like a cracked plate.', ['Cracked', 'Fragmented'],
    circle(50, 50, 38) + poly([[26, 22], [40, 40], [34, 54], [52, 62], [48, 88]]) + poly([[40, 40], [64, 36], [78, 48]]) + poly([[52, 62], [74, 70]])),
  p('p-scattered', 'Scattered dots', 'Twenty-four small filled dots spread across the square, unevenly, with no lines.', ['Scattered', 'Dotted', 'Chaotic'], dots(24, 3)),
  p('p-clustered', 'Clusters', 'Small dots gathered into three tight groups, with empty space between the groups.', ['Clustered', 'Dotted'],
    [[26, 30], [68, 40], [44, 72]].map(([cx, cy], k) => { const r = rng(10 + k); return Array.from({ length: 7 }, () => circle(cx + (r() - 0.5) * 22, cy + (r() - 0.5) * 22, 2.4, true)).join(''); }).join('')),
  p('p-web', 'Web', 'A spider web: eight lines going out from the middle, joined by three rings of straight segments.', ['Web-like', 'Radiating', 'Interlocking'], web()),
  p('p-triangles', 'Triangles in triangles', 'A large triangle made of smaller triangles, with the middle left empty, repeated down to very small ones.', ['Fractal', 'Nested', 'Crystalline'],
    sierpinski(10, 86, 80, 3)),
  p('p-tangled', 'Tangle', 'A single line crossing itself many times in all directions, like a knot of thread.', ['Tangled', 'Knotted', 'Chaotic'], tangled(5)),
  p('p-mosaic', 'Mosaic', 'A square divided into uneven pieces by straight lines, like a window of stained glass.', ['Mosaic', 'Fragmented', 'Geometric'],
    `<rect x="12" y="12" width="76" height="76"/>` + poly([[12, 40], [45, 34], [88, 46]]) + poly([[45, 34], [38, 88]]) + poly([[62, 40], [70, 88]]) + poly([[38, 62], [12, 70]]) + poly([[70, 66], [88, 60]])),
  p('p-layered', 'Layers over', 'Three outlined shapes lying on top of each other, a circle, a square and a triangle, each partly covering the one before.', ['Layered', 'Layered over'],
    circle(38, 42, 22) + `<rect x="40" y="38" width="42" height="42" rx="2"/>` + `<path d="M22 84L52 46L84 84Z"/>`),
  p('p-emerging', 'Emerging', 'A grid of dots where the bottom rows are bold and complete and the upper rows get smaller and fainter until they are tiny.', ['Emerging', 'Dissolving'],
    [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => circle(18 + c * 16, 20 + r * 16, 0.9 + r * 0.9, true)).join('')).join('')),
  p('p-unified', 'One whole', 'A single large circle with a smaller circle in the middle, drawn with one unbroken line each.', ['Unified', 'Symmetrical', 'Concentric'],
    circle(50, 50, 38) + circle(50, 50, 8, true)),
];

export const SHAPES: Shape[] = [...MOVEMENT, ...PATTERN];
export const shapesFor = (set: ShapeSet): Shape[] => SHAPES.filter((s) => s.set === set);
export const shapeById = (id: string): Shape | undefined => SHAPES.find((s) => s.id === id);

/** An image address for the drawing, for use in an <img> (the drawing is the text color only when inlined; as an image it is dark grey). */
export const shapeDataUrl = (s: Shape): string => `data:image/svg+xml;utf8,${encodeURIComponent(s.svg.replace('currentColor', '#3b3b3b').replace(/currentColor/g, '#3b3b3b'))}`;
