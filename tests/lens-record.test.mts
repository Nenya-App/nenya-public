// Everything a person sets in a lens reaches the added-lenses record, the review lines, the saved draft and the report (the Essence tray page once handed the record a wrapped object the report could not read).
import { readFileSync } from 'node:fs';
import { addLens, emptyLensState, readSavedDraft, reportShape } from '../src/lib/lensState.ts';
import { cleanV2, emptyDials, type EssenceV2 } from '../src/lib/flavour.ts';
import { formatGatewayData, gatewayTitles } from '../src/lib/reportText.ts';
import { buildFragments } from '../src/lib/reportFragments.ts';
import { ok } from './helpers.mts';

const essence: EssenceV2 = { v: 2, basis: 'memory', now: { ...emptyDials(), sweet: 3, bitter: 1 }, wish: { ...emptyDials(), sweet: 4, umami: 2 }, notes: ['smoky', 'citrus'], mouth: 'creamy', lingers: 'a warmth', tastingNote: 'Mostly sweet.', smallThing: 'Bake bread', extra: 'Grandmother kitchen' };
const has = (lines: string[], s: string) => lines.some((l) => l.includes(s));

// What the Essence page hands over now: the data itself, in the record.
const s1 = addLens(emptyLensState(), 'essence', essence);
const lines = formatGatewayData('essence', s1.added[0].data);
ok('Essence added to the record gives report lines, not "No data captured"', !has(lines, 'No data captured') && has(lines, 'Flavor of your life now: sweet strong, bitter faint') && has(lines, 'Flavor you want: sweet very strong, umami mild') && has(lines, 'Started from: a memory') && has(lines, 'Notes: smoky, citrus') && has(lines, 'In the mouth: creamy') && has(lines, 'What lingers: a warmth') && has(lines, 'Tasting note: Mostly sweet.') && has(lines, 'One small thing to try: Bake bread') && has(lines, 'Description: Grandmother kitchen'));
ok('the title is the same section name the report uses', gatewayTitles.essence === 'Essence - Aromatic Memory' && reportShape(s1).included.join() === 'essence');

// A record saved by the earlier page (wrapped as { essenceV2 }) still reads, in the report and when reopened.
const wrapped = { essenceV2: essence };
ok('an Essence saved wrapped still gives its lines and reopens (cleanV2 reads it)', has(formatGatewayData('essence', wrapped), 'Tasting note: Mostly sweet.') && JSON.stringify(cleanV2(wrapped)) === JSON.stringify(essence));

// The report as pieces (what the PDF and the coach read).
const frag = buildFragments([{ gateway: 'essence', data: essence }], undefined, () => null);
ok('the PDF fragment for Essence carries the words under "Essence"', frag.length === 1 && frag[0].section === 'Essence' && has(frag[0].lines, 'Flavor you want') && !has(frag[0].lines, 'No data captured'));

// The saved draft: version 2 round trip through JSON, a version 1 draft, and a version 2 draft with the earlier wrapped Essence.
const v2 = JSON.parse(JSON.stringify({ v: 2, examined: ['sight'], gatewayData: s1.added, bodyMapData: null, interfaceColors: { color1: '#111111', color2: '#222222' } }));
const r2 = readSavedDraft(v2)!;
ok('a saved version 2 draft keeps the Essence data exactly', JSON.stringify(cleanV2(r2.gatewayData[0].data)) === JSON.stringify(essence) && r2.examined.join() === 'sight');
const r1 = readSavedDraft({ v: 1, selectedGateways: ['essence'], gatewayData: [{ gateway: 'essence', data: essence }], bodyMapData: null, interfaceColors: {} })!;
ok('a saved version 1 draft with Essence still reads', has(formatGatewayData('essence', r1.gatewayData[0].data), 'Flavor of your life now'));
const rw = readSavedDraft({ v: 2, examined: [], gatewayData: [{ gateway: 'essence', data: wrapped }], bodyMapData: null, interfaceColors: {} })!;
ok('a draft holding the earlier wrapped Essence is read into the plain shape', (rw.gatewayData[0].data as any).v === 2 && has(formatGatewayData('essence', rw.gatewayData[0].data), 'Tasting note: Mostly sweet.'));
const old = { currentTastes: ['Sweet'], currentIntensity: 60 };
ok('the older taste and scent Essence still reads, with its intensity slider', has(formatGatewayData('essence', readSavedDraft({ v: 1, gatewayData: [{ gateway: 'essence', data: old }] })!.gatewayData[0].data), 'Intensity: 60/100'));

// Every lens: what its page hands over (the same keys) reaches the report lines.
const lens: Record<string, any> = {
  sight: { color1: '#ff0000', color2: '#0000ff' },
  sound: { melody: [0, 2, 4], tonalSystem: 'western', currentPitch: 40, currentVolume: 60, potentialPitch: 70, potentialVolume: 20, currentTimbres: ['warm'], currentDescription: 'hum' },
  touch: { currentSurface: null, currentTexture: 30, currentTemperature: 55, currentPressure: 10, potentialTexture: 80, potentialWeight: 45, potentialSharpness: 5 },
  movement: { currentEnergy: 35, currentSpeed: 65, potentialEnergy: 90, potentialSpeed: 15, currentDirections: ['Forward'], movementPathWords: 'a slow curve' },
  insight: { currentClarity: 25, currentDepth: 75, potentialClarity: 95, potentialDepth: 5, currentPatterns: ['Circular'], tapestryWords: 'three layers' },
};
const sliders: Record<string, string[]> = { sound: ['Pitch 40/100', 'Volume 60/100', 'Pitch 70/100', 'Volume 20/100'], touch: ['Texture 30/100', 'Temperature 55/100', 'Pressure 10/100', 'Texture 80/100', 'Weight 45/100', 'Sharpness 5/100'], movement: ['Energy: 35/100', 'Speed: 65/100', 'Energy: 90/100', 'Speed: 15/100', 'Path of movement: a slow curve'], insight: ['Clarity: 25/100', 'Depth: 75/100', 'Clarity: 95/100', 'Depth: 5/100', 'Tapestry: three layers'] };
let st = s1;
for (const [k, d] of Object.entries(lens)) st = addLens(st, k as any, d);
for (const a of st.added) {
  const l = formatGatewayData(a.gateway, a.data);
  ok(`${a.gateway}: everything set is in the report lines`, !has(l, 'No data captured') && (sliders[a.gateway] ?? []).every((x) => has(l, x)), l.join(' | '));
}
const full = readSavedDraft(JSON.parse(JSON.stringify({ v: 2, examined: [], gatewayData: st.added, bodyMapData: null, interfaceColors: {} })))!;
ok('all six lenses survive the saved draft and come back in the same order', full.gatewayData.map((g) => g.gateway).join() === 'sight,sound,touch,essence,movement,insight' && JSON.stringify(full.gatewayData) === JSON.stringify(st.added));

// The page hands the data over unwrapped, and reopening reads the record.
const page = readFileSync('src/app/components/pages/EssenceGatewayPage.tsx', 'utf8');
ok('the Essence page adds the data itself (no wrapper) and knows it is added by reading it', /onAdd=\{\(data\) => onComplete\(data\)\}/.test(page) && /added=\{cleanV2\(initialData\) !== null\}/.test(page) && !/onComplete\(\{ essenceV2/.test(page));
