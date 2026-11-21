// Sight: the Intensity slider sets the glow's brightness, and the palette maker shows the colors it starts from (owner's comment sheet, 2026-11-18).
import { readFileSync } from 'node:fs';
import { glowFor } from '../src/lib/glow.ts';
import { ok } from './helpers.mts';

const faint = glowFor('#336699', 0), mid = glowFor('#336699', null), strong = glowFor('#336699', 100);
ok('a faint intensity gives a dim, narrow glow; a strong one a bright, wide glow', faint.alpha < mid.alpha && mid.alpha < strong.alpha && faint.blurPx < mid.blurPx && mid.blurPx < strong.blurPx && faint.alpha <= 0.1 && strong.alpha >= 0.85);
ok('not set is the middle glow, as before', mid.alpha === 0.48 && glowFor('#336699', 50).alpha === mid.alpha);
ok('the glow is in the person\'s own color, brighter at the same color with more intensity, and the border follows', /#336699/.test(strong.boxShadow) && glowFor('#336699', 90).borderAlpha > glowFor('#336699', 10).borderAlpha);
ok('odd input is held to the range and a bad color does not break it', glowFor('#336699', 500).alpha === strong.alpha && glowFor('#336699', -40).alpha === faint.alpha && /#888888/.test(glowFor('nope', 50).boxShadow) && glowFor('#336699', NaN).alpha === mid.alpha);
const sight = readFileSync('src/app/components/pages/SightGatewayPage.tsx', 'utf8'), pal = readFileSync('src/app/components/PalettePanel.tsx', 'utf8');
ok('both color cards take their glow from their own Intensity slider', /glowFor\(color1, sliderValue\(color1Intensity\)\)/.test(sight) && /glowFor\(color2, sliderValue\(color2Intensity\)\)/.test(sight));
ok('the palette maker shows the two colors it starts from, with their names, as swatches and words', /The two colors it starts from/.test(pal) && /c\.name\.trim\(\)/.test(pal) && (sight.match(/color1Name=\{color1Name\} color2Name=\{color2Name\}/g) ?? []).length === 2);
ok('each made palette says which of your colors it came from, as swatches and words', /Made from:/.test(pal) && /your wish color/.test(pal) && /your current color and your wish color/.test(pal));
