// The sixteen palettes live in two places in the code (the breathing logo's vectors and the color picker's lists) and in one document.
// This keeps all three the same, and keeps the wording honest: the palettes are starting points, not a measurement.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const logo = readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8');
const picker = readFileSync('src/app/components/ValarColorPicker.tsx', 'utf8');
const doc = readFileSync('docs/valar-color-palettes.md', 'utf8');

const vectors = [...logo.matchAll(/name: '([^']+)',\s*vector: \[([^\]]*)\]/g)].map((m) => ({ name: m[1], colors: [...m[2].matchAll(/#([0-9A-Fa-f]{6})/g)].map((x) => x[1].toUpperCase()) }));
ok('the logo has sixteen palettes of six colors', vectors.length === 16 && vectors.every((v) => v.colors.length === 6));

const lists = [...picker.matchAll(/name: '([^']+)',\s*domain: '[^']*',\s*colors: \[([^\]]*)\]/g)].map((m) => ({ name: m[1] === 'Morgoth' ? 'Ungoliant' : m[1], colors: [...m[2].matchAll(/#([0-9A-Fa-f]{6})/g)].map((x) => x[1].toUpperCase()) }));
ok('the picker has sixteen palettes', lists.length === 16);
const drift = vectors.filter((v) => (lists.find((l) => l.name === v.name)?.colors ?? []).join() !== v.colors.join()).map((v) => v.name);
ok('the picker offers exactly the logo\'s colors for every palette', drift.length === 0, drift.join(', '));

const inDoc = vectors.flatMap((v) => v.colors).filter((c) => !doc.toUpperCase().includes('`#' + c + '`'));
ok('the palette document lists every color', inDoc.length === 0, inDoc.join(', '));

const main = vectors.map((v) => v.colors[0]);
ok('every palette keeps its main color first (unchanged by the 2026-11-09 revision)', main.join() === '2C6E9E,F7D44A,1B4F6E,8B8B9E,9C5D3A,3B6E47,A8B84C,5C4B6E,3A6B6B,4D6E3B,E3752B,D9626B,845A9E,5A9C8E,5C2E2E,1E1E2A');
const dupes = vectors.filter((v) => new Set(v.colors).size !== 6).map((v) => v.name);
ok('no palette repeats a color', dupes.length === 0, dupes.join(', '));

const claims = /bayesian|diagnostic|gravity well|likely active/i;
const pages = ['src/app/components/about/PantheonOfNeeds.tsx', 'src/app/components/ValarColorPicker.tsx', 'src/app/components/ValarBreathingLogo.tsx', 'docs/valar-color-palettes.md'];
const hits = pages.filter((f) => claims.test(readFileSync(f, 'utf8')));
ok('no page claims the colors are measured, inferred or diagnostic', hits.length === 0, hits.join(', '));
