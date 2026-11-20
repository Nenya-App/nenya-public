// Zoom-aware lite mode (src/lib/zoomLite.ts): pure state steps, and the logo uses them.
import { readFileSync } from 'node:fs';
import { LITE_ABOVE, LITE_HOLD_MS, NORMAL_BELOW, initialZoomState, stepZoom } from '../src/lib/zoomLite.ts';
import { ok } from './helpers.mts';

let st = initialZoomState;
ok('a page at normal zoom is not lite', !stepZoom(st, 1, 0).lite);
ok('a small zoom (text-size level) stays normal', !stepZoom(st, LITE_ABOVE - 0.01, 0).lite);
st = stepZoom(st, 2.5, 100);
ok('pinching in past the limit goes lite at once', st.lite);
st = stepZoom(st, 1.5, 200);
ok('still lite while zoomed', st.lite);
st = stepZoom(st, 1.0, 300);
ok('back at 1 it waits before returning (a pinch in progress does not flicker)', st.lite && st.calmSince === 300);
ok('zooming in again during the wait cancels it', stepZoom(st, 1.5, 500).calmSince === 0 && stepZoom(st, 1.5, 500).lite);
ok('it returns after the hold', !stepZoom(st, 1.0, 300 + LITE_HOLD_MS).lite);
ok('and not a moment before', stepZoom(st, 1.0, 300 + LITE_HOLD_MS - 5).lite);
ok('a scale between the two limits does not start the return', stepZoom(stepZoom(initialZoomState, 2, 0), (LITE_ABOVE + NORMAL_BELOW) / 2, 10).calmSince === 0);
ok('a broken reading changes nothing', stepZoom(st, NaN, 1) === st);

const src = (p: string) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const logo = src('src/app/components/NenyaLogo.tsx');
ok('zoomed in, the logo drops its shared glow, halos, blends and will-change, and the gem pauses', /const zoomed = useZoomedIn\(\)/.test(logo) && /glow && !zoomed && !ownHalo/.test(logo) && /mixBlendMode: zoomed \? undefined/.test(logo) && /paused=\{zoomed\}/.test(logo) && (logo.match(/willChange: zoomed \? undefined/g) ?? []).length === 2);
ok('the page still allows zoom (never capped)', /user-scalable=yes/.test(src('index.html')) && !/maximum-scale=1(\.0)?[,"]/.test(src('index.html')));
