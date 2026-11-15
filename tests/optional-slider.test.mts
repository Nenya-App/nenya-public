// Sliders that were never touched leave no answer (src/lib/optionalSlider.ts).
import { unsetSlider, isUnset, sliderValue, isAnswered, sliderFrom } from '../src/lib/optionalSlider.ts';
import { ok } from './helpers.mts';

const s = unsetSlider();
ok('an untouched slider rests at the middle but has no answer', s[0] === 50 && isUnset(s) && sliderValue(s) === null);
ok('any change makes it an answer, including 50 and 0', sliderValue([50]) === 50 && sliderValue([0]) === 0 && !isUnset([50]) && sliderValue([100]) === 100);
ok('a new array made from an untouched one is an answer (a change)', sliderValue([...s]) === 50 && sliderValue(s) === null);
ok('two untouched sliders are independent', (() => { const a = unsetSlider(), b = unsetSlider(25); return isUnset(a) && isUnset(b) && a[0] === 50 && b[0] === 25; })());
ok('missing or odd values give no answer', sliderValue(undefined) === null && sliderValue(null) === null && sliderValue([] as any) === null && isAnswered(0) && !isAnswered(null) && !isAnswered(undefined) && !isAnswered('50') && !isAnswered(NaN));
ok('a saved answer returns as a set slider and a missing one as untouched', sliderValue(sliderFrom(35)) === 35 && isUnset(sliderFrom(null)) && isUnset(sliderFrom(undefined)));

// ── the reports leave out sliders that were never used
import { readFileSync } from 'node:fs';
import { formatGatewayData } from '../src/lib/reportText.ts';
{
  const soundNone = formatGatewayData('sound', { currentPitch: null, currentVolume: null, potentialPitch: null, potentialVolume: null }).join('\n');
  ok('a sound report with untouched sliders prints no numbers', !/\d+\/100/.test(soundNone), soundNone);
  const soundSome = formatGatewayData('sound', { currentPitch: 0, currentVolume: null, potentialPitch: 50, potentialVolume: 70 }).join('\n');
  ok('a slider moved to 0 or left at 50 on purpose is kept; an untouched one is not', /Present: Pitch 0\/100/.test(soundSome) && !/Volume 0|Present: .*Volume/.test(soundSome) && /Wish: Pitch 50\/100, Volume 70\/100/.test(soundSome), soundSome);
  const touch = formatGatewayData('touch', { currentTexture: 30, currentTemperature: null, currentPressure: null, currentWeight: 80, currentSharpness: null, potentialTexture: null, potentialTemperature: null, potentialPressure: null, potentialWeight: null, potentialSharpness: null }).join('\n');
  ok('touch prints only the answered sliders, in short lines', /Present: Texture 30\/100$/m.test(touch) && /^  Weight 80\/100$/m.test(touch) && !/Temperature|Pressure|Sharpness|Wish: \w/.test(touch), touch);
  ok('movement, insight and essence skip untouched sliders and keep a real 0', !/\/100/.test(formatGatewayData('movement', { currentEnergy: null, currentSpeed: null }).join('')) && /Clarity: 0\/100/.test(formatGatewayData('insight', { currentClarity: 0, currentDepth: null }).join('\n')) && !/Intensity/.test(formatGatewayData('essence', { currentIntensity: null }).join('\n')));
  ok('sight leaves out an intensity that was not set', !/Intensity/.test(formatGatewayData('sight', { color1: '#112233', color2: '#445566', color1Intensity: null, color2Intensity: null }).join('\n')) && /Intensity: 40\/100/.test(formatGatewayData('sight', { color1: '#112233', color2: '#445566', color1Intensity: 40 }).join('\n')));
  ok('an older saved report with plain numbers still prints them', /Pitch 50\/100, Volume 50\/100/.test(formatGatewayData('sound', { currentPitch: 50, currentVolume: 50 }).join('\n')));
}
// ── every gateway slider starts untouched and is recorded through sliderValue
for (const f of ['Touch', 'Movement', 'Insight', 'Essence', 'Sound', 'Sight']) {
  const src = readFileSync(new URL(`../src/app/components/pages/${f}GatewayPage.tsx`, import.meta.url), 'utf8');
  ok(`${f}: no slider starts at a default 50`, !/useState\(\[50\]\)/.test(src) && !/Intensity, set\w+\] = useState\(50\)/.test(src));
  ok(`${f}: sliders are recorded with sliderValue, not their raw value`, !/(?:current|potential)(?:Texture|Temperature|Pressure|Weight|Sharpness|Pitch|Volume|Energy|Speed|Clarity|Depth|Intensity): \w+\[0\]/.test(src));
}
