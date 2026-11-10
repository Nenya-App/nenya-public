// The line drawings for the Movement and Insight (pattern) gateways (src/lib/gatewayShapes.ts).
import { SHAPES, shapesFor, shapeById, shapeDataUrl } from '../src/lib/gatewayShapes.ts';
import { SENSE_WORDS } from '../src/lib/senseWords.ts';
import { ok } from './helpers.mts';

const termsOf = (cats: (keyof typeof SENSE_WORDS)[]) => new Set(cats.flatMap((c) => SENSE_WORDS[c].flatMap((g) => g.words.map((w) => w.term))));
const MOVE_TERMS = termsOf(['direction', 'quality']);
const PAT_TERMS = termsOf(['pattern', 'perspective']);

ok('there are at least 18 drawings for movement and for patterns', shapesFor('movement').length >= 18 && shapesFor('pattern').length >= 18);
ok('every drawing has its own id, a name and a one-sentence alt text', new Set(SHAPES.map((s) => s.id)).size === SHAPES.length && SHAPES.every((s) => s.label.length > 1 && s.label.length <= 24 && /\.$/.test(s.alt) && s.alt.length >= 30 && s.alt.length <= 230));
ok('no alt text names a feeling or says what a drawing means', SHAPES.every((s) => !/\b(?:feel|feels|feeling|sad|happy|calm|anxious|angry|joy|fear|mean|means|symbol|represent|stress)/i.test(s.alt)), SHAPES.filter((s) => /\b(?:feel|sad|happy|calm|anxious|angry|joy|fear|mean|symbol|represent|stress)/i.test(s.alt)).map((s) => s.id).join(','));
ok('no drawing contains a number that is not a number, a script, a link or any text', SHAPES.every((s) => !/NaN|Infinity|undefined|<script|href=|<text|<image|<foreignObject|onload/i.test(s.svg)));
ok('every drawing is one well-formed svg on a 100 square, drawn in the text color', SHAPES.every((s) => {
  if (!/^<svg [^>]*viewBox="0 0 100 100"[^>]*>.*<\/svg>$/s.test(s.svg)) return false;
  const stack: string[] = [];
  for (const m of s.svg.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    if (m[4] === '/') continue;
    if (m[1] === '/') { if (stack.pop() !== m[2]) return false; } else stack.push(m[2]);
  }
  return stack.length === 0 && s.svg.includes('currentColor');
}));
ok('no drawing is large', SHAPES.every((s) => s.svg.length < 4000), SHAPES.filter((s) => s.svg.length >= 4000).map((s) => `${s.id}:${s.svg.length}`).join(','));
ok('the words each drawing might go with are words the gateway already offers', SHAPES.every((s) => s.words.length > 0 && s.words.every((w) => (s.set === 'movement' ? MOVE_TERMS : PAT_TERMS).has(w))), SHAPES.flatMap((s) => s.words.filter((w) => !(s.set === 'movement' ? MOVE_TERMS : PAT_TERMS).has(w)).map((w) => `${s.id}:${w}`)).join(','));
ok('drawings are the same every time they are made', JSON.stringify(SHAPES.map((s) => s.svg)) === JSON.stringify(SHAPES.map((s) => s.svg)) && shapeById('p-scattered')!.svg === shapeById('p-scattered')!.svg);
ok('a drawing can be used as an image address', shapeDataUrl(SHAPES[0]).startsWith('data:image/svg+xml;utf8,') && !shapeDataUrl(SHAPES[0]).includes('currentColor'));
ok('no two drawings are the same picture', new Set(SHAPES.map((s) => s.svg)).size === SHAPES.length);

// the saved choices, and how the reports carry them
import { chosenShapeIds } from '../src/lib/gatewayShapes.ts';
import { formatGatewayData } from '../src/lib/reportText.ts';
ok('the chosen drawings are read from a gateway\'s saved data, present first, without repeats or unknown ids', JSON.stringify(chosenShapeIds('movement', { currentMovementShapes: ['m-rising', 'nope'], potentialMovementShapes: ['m-rising', 'm-still'] })) === JSON.stringify(['m-rising', 'm-still']) && chosenShapeIds('insight', { currentPatternShapes: ['p-grid'] })[0] === 'p-grid' && chosenShapeIds('touch', { currentMovementShapes: ['m-rising'] }).length === 0 && chosenShapeIds('movement', null).length === 0);
{
  const mv = formatGatewayData('movement', { currentMovementShapes: ['m-rising'], potentialMovementShapes: ['m-still', 'm-flowing'] }).join('\n');
  ok('the movement report names each chosen drawing with its description', /Drawings chosen \(present\): Rising \(Three arrows side by side/.test(mv) && /Drawings chosen \(wish\): Still \(.*\) Flowing \(/.test(mv), mv);
  const pt = formatGatewayData('insight', { currentPatternShapes: ['p-grid'] }).join('\n');
  ok('the insight report does the same, and says nothing when none were chosen', /Drawings chosen \(present\): Grid \(/.test(pt) && !/Drawings chosen/.test(formatGatewayData('insight', { currentPatternShapes: [] }).join('\n')));
}
