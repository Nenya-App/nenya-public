// The Touch display: the picked surface on a sphere or flat circle, moved by the five sliders, with a words twin (src/lib/touchOrb.ts, TouchOrb.tsx; tray mode).
import { readFileSync } from 'node:fs';
import { orbLevels, orbStyle, orbWords, ORB_WORDS, type OrbValues } from '../src/lib/touchOrb.ts';
import { ok } from './helpers.mts';

const none: OrbValues = { texture: null, temperature: null, pressure: null, weight: null, sharpness: null };
ok('sliders not set rest at neutral and change nothing about the shape', (() => { const l = orbLevels(none), s = orbStyle(none, null); return l.texture === 2 && l.temp === 2 && l.pressure === 0 && l.weight === 0 && l.sharp === 0 && s.orb.borderRadius === '50%' && s.orb.clipPath === 'none' && s.orb.transform === 'translateY(0px) scale(1.00, 1.00)'; })());
ok('texture counts toward rough at the slider\'s left end (Rough to Smooth), the others toward their right end', orbLevels({ ...none, texture: 0 }).texture === 4 && orbLevels({ ...none, texture: 100 }).texture === 0 && orbLevels({ ...none, temperature: 100 }).temp === 4 && orbLevels({ ...none, pressure: 100 }).pressure === 4 && orbLevels({ ...none, weight: 100 }).weight === 4 && orbLevels({ ...none, sharpness: 100 }).sharp === 4);
ok('levels stay between 0 and 4 for odd values', [-20, 12, 49.9, 101, NaN].every((v) => { const l = orbLevels({ texture: v, temperature: v, pressure: v, weight: v, sharpness: v }); return Object.values(l).every((x) => x >= 0 && x <= 4 && Number.isInteger(x)); }));
const hot = orbStyle({ ...none, temperature: 100 }, null).orb.filter, cold = orbStyle({ ...none, temperature: 0 }, null).orb.filter;
ok('temperature tints: cool turns the hue, warm warms it', /hue-rotate/.test(cold) && /sepia/.test(hot) && cold !== hot);
const squash = orbStyle({ ...none, pressure: 100 }, null), heavy = orbStyle({ ...none, weight: 100 }, null);
ok('pressure squashes the orb and weight sinks it and grows its shadow', /scale\(1\.24, 0\.64\)/.test(squash.orb.transform) && /translateY\(20px\)/.test(heavy.orb.transform) && Number(heavy.shadow.opacity) > Number(orbStyle(none, null).shadow.opacity));
const sharp = orbStyle({ ...none, sharpness: 100 }, null).orb;
ok('sharpness turns the orb from round to a pointed star', sharp.borderRadius === '0' && /^polygon\(/.test(sharp.clipPath));
const pic = orbStyle(none, '/touch-textures/x.jpg', 'sphere').orb, flat = orbStyle(none, '/touch-textures/x.jpg', 'flat').orb;
ok('the picked picture is wrapped on the sphere with light and shade over it; the flat circle has the picture alone', /radial-gradient/.test(pic.backgroundImage) && /url\(\/touch-textures\/x\.jpg\)/.test(pic.backgroundImage) && !/radial-gradient/.test(flat.backgroundImage) && /url\(/.test(flat.backgroundImage));
ok('the grain is on the orb with or without a picture, and grainier as texture rises (the Texture slider shows on a photographed surface too)', /repeating-radial-gradient/.test(orbStyle(none, null).orb.backgroundImage) && /repeating-radial-gradient/.test(pic.backgroundImage) && orbStyle({ ...none, texture: 0 }, '/touch-textures/x.jpg').orb.backgroundImage !== orbStyle({ ...none, texture: 100 }, '/touch-textures/x.jpg').orb.backgroundImage);
ok('the words say only what was set, and say so when nothing was', orbWords(none) === 'no sliders moved yet' && orbWords({ ...none, temperature: 100, weight: 100 }) === `${ORB_WORDS.temp[4]}, ${ORB_WORDS.weight[4]}` && orbWords({ texture: 100, temperature: 50, pressure: 0, weight: 0, sharpness: 0 }) === 'very smooth, neutral, loose, weightless, blunt');
const comp = readFileSync('src/app/components/TouchOrb.tsx', 'utf8'), page = readFileSync('src/app/components/pages/TouchGatewayPage.tsx', 'utf8');
ok('the display has a text twin that updates politely, is a labelled image, and the change is instant under reduced motion', /role="status" aria-live="polite"/.test(comp) && /role="img"/.test(comp) && /motion-safe:transition/.test(comp) && !/[^-]transition-all|\btransition duration/.test(comp.replace(/motion-safe:transition[^"]*/g, '')));
ok('Touch shows it on both state cards in tray mode, from that card\'s sliders, with a sphere or flat circle choice', (page.match(/\{tray && <TouchOrb /g) ?? []).length === 2 && /sliderValue\(currentTexture\)/.test(page) && /sliderValue\(potentialSharpness\)/.test(page) && /a flat circle/.test(page) && /a sphere/.test(page));
