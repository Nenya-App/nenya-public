// The outer orbs are fully opaque at every moment, and the breathing ring ends behind them (owner, 2026-11-22).
import { readFileSync } from 'node:fs';
import { DEFAULT_OUTER_ORBIT } from '../src/lib/orbitLook.ts';
import { ok } from './helpers.mts';

const logo = readFileSync('src/app/components/NenyaLogo.tsx', 'utf8');
const ring = readFileSync('src/app/components/ValarBreathingLogo.tsx', 'utf8');

// Opaque.
ok('the outer orbs\' opacity is a fixed 1', /const OUTER_ORB_OPACITY = 1;/.test(logo) && /opacity: OUTER_ORB_OPACITY,/.test(logo));
const outerBlock = logo.slice(logo.indexOf('key={`outer-${valar.name}`}'), logo.indexOf('<OrbSurface d={outerOrbSize} />'));
ok('the outer orbs\' animation no longer touches opacity (only size and a slow turn)', outerBlock.length > 100 && !/opacity: \{/.test(outerBlock) && !/opacity: OUTER_ORB_OPACITY,\s*scale/.test(outerBlock) && /scale: \[0\.95, 1\.05, 0\.95\]/.test(outerBlock));
const grad = logo.match(/const ORB_FADE_GRADIENT = '([^']+)'/)![1];
ok('the orb\'s gradient has no transparent stop: it darkens toward the rim by mixing with black', !/transparent/.test(grad) && (grad.match(/#000/g) ?? []).length >= 3);
ok('so every colour choice is opaque too (the colour is only the --hc value inside that gradient)', /background: ORB_FADE_GRADIENT/.test(outerBlock) && /\['--hc' as string\]: colors\[0\]/.test(outerBlock));
ok('the halo and glow stay soft and are not the orb (they keep their own opacity)', /className="absolute nenya-orb-halo"/.test(logo) && /opacity: outer\.opacityLow,/.test(logo));

// The ring ends behind the orbs.
const size = (s: number) => ({ ring: (s * DEFAULT_OUTER_ORBIT.radius * 2) / 2, centre: s * DEFAULT_OUTER_ORBIT.radius, orb: Math.max(8.5, s * DEFAULT_OUTER_ORBIT.orbSize * 2) * 0.5 / 2 });
ok('the ring\'s full-size radius is the orb ring\'s radius (the orbs\' centres), at every size', [40, 80, 220, 440, 600].every((s) => Math.abs(size(s).ring - size(s).centre) < 1e-9));
ok('so the ring\'s edge lies inside the band the orbs cover (from the orb\'s inner edge to its outer edge), and is not short of them or past them', [40, 80, 220, 440, 600].every((s) => { const v = size(s); return v.ring >= v.centre - v.orb && v.ring <= v.centre + v.orb; }));
ok('the ring\'s size comes from the orbs\' radius, so the two cannot drift apart', /RING_END_FRACTION = DEFAULT_OUTER_ORBIT\.radius \* 2/.test(ring) && /width: logoSize \* RING_END_FRACTION/.test(ring) && /left: \(logoSize \* \(1 - RING_END_FRACTION\)\) \/ 2/.test(ring));
ok('the orbs\' pulse (95% to 105%) keeps their edge over the ring\'s edge: the ring ends at their centres, which a 5% change in their size does not move', [80, 220, 440].every((s) => { const v = size(s); return v.ring >= v.centre - v.orb * 0.95; }));
ok('the ring is drawn below the logo and the orbs: the ring has z-index 1, the logo\'s content 10, and the outer orbs sit inside the logo', /zIndex: 1,/.test(ring) && /zIndex: 10,/.test(ring) && /zIndex: 5, \/\/ Below inner orbit/.test(logo));
