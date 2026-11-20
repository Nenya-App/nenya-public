// The inner ring's lights and the outer orbs' own halos (src/lib/orbitLook.ts; docs/eight-sided-gem-scope.md, Part 3).
import { readFileSync } from 'node:fs';
import { DEFAULT_INNER_ORBIT, DEFAULT_OUTER_ORBIT, emergence } from '../src/lib/orbitLook.ts';
import { ok } from './helpers.mts';

const L = { ...DEFAULT_INNER_ORBIT, style: 'light' as const };
ok('the outer orbs default to their own halos (the owner chose this on 2026-11-20); the inner ring keeps the orb look until chosen', DEFAULT_INNER_ORBIT.style === 'orb' && DEFAULT_OUTER_ORBIT.halo === 'own');
ok('orbs are always fully lit', [0, 3.3, 99].every((t) => emergence(2, t, DEFAULT_INNER_ORBIT) === 1));
const samples = (j: number) => Array.from({ length: 600 }, (_, k) => emergence(j, k * 0.1, L));
ok('a light stays between its dimmest and full', Array.from({ length: 16 }, (_, j) => samples(j)).every((a) => Math.min(...a) >= L.emergeDepth - 1e-9 && Math.max(...a) <= 1 + 1e-9));
ok('every light reaches (nearly) full brightness and (nearly) its dimmest within a minute', Array.from({ length: 16 }, (_, j) => samples(j)).every((a) => Math.max(...a) > 0.97 && Math.min(...a) < L.emergeDepth + 0.05));
ok('the lights start at their dimmest and rise', emergence(0, 0, L) === L.emergeDepth && emergence(0, L.emergeSeconds / 4, L) > L.emergeDepth);
ok('the lights are never lit in step: each has its own period', new Set(Array.from({ length: 16 }, (_, j) => (L.emergeSeconds + j * L.emergeStep).toFixed(3))).size === 16);
const never = Array.from({ length: 3000 }, (_, k) => k * 0.2).every((t) => Array.from({ length: 16 }, (_, j) => emergence(j, t, L)).some((v) => v < 0.9));
ok('the whole ring is never at full brightness at once', never);
ok('the depth is kept in range', emergence(0, 1, { ...L, emergeDepth: 5 }) === 1 && emergence(0, 1, { ...L, emergeDepth: -2 }) >= 0);

const src = (p: string) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const logo = src('src/app/components/NenyaLogo.tsx');
ok('a light draws no sphere layers and no seam cut', /\{!isLight && <OrbSurface/.test(logo) && /const wrapped = !isLight &&/.test(logo));
ok('the own halo replaces the shared glow class for that orb, and is a gradient (no blur)', /glow && !zoomed && !ownHalo \? 'absolute nenya-orb-glow'/.test(logo) && /const haloGradient = .*radial-gradient/.test(logo) && !/haloGradient[^\n]*blur/.test(logo) && /nenya-halo-hue/.test(logo) && !/<m\.div[^>]*nenya-orb-halo/.test(logo));
ok('the gem takes each light\'s brightness into its colour from below', /emergence\(j, tSec, emergeRef\.current\)/.test(src('src/app/components/SpectralGem.tsx')));
