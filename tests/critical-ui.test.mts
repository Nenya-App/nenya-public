// Screens that gate or protect the site must work with no animation library at all. The library's engine is a
// separate download, and an element that starts hidden and waits for it can stay invisible if that download is
// slow or fails. These files must therefore never use it.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const CRITICAL = [
  'src/app/components/OnboardingFlow.tsx', // the first-visit panel: rhythm, terms
  'src/app/components/LoadingVeil.tsx', // the loading screen in front of the first screen
  'src/app/components/TourOffer.tsx', // the offer of a tour, right after the terms
  'src/app/components/EmergencyExit.tsx', // the emergency exit
  'src/app/components/AppFooter.tsx',
  'src/app/components/ErrorBoundary.tsx',
  'src/coach/FlagNotice.tsx', // the crisis resources
];
for (const f of CRITICAL) ok(`${f} does not depend on the animation library`, !/from\s+'motion\/|from\s+"motion\/|\bm\.(div|button|span)\b|\bAnimatePresence\b/.test(read(f)));

// Everywhere else, only the light `m` components may be used (the provider is in strict mode and throws on `motion.*`).
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(new URL('../src', import.meta.url).pathname).filter((f) => /\.tsx?$/.test(f));
const offenders = files.filter((f) => /\bmotion\.(div|button|span|p|section|ul|li|img|svg|path)\b|import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*'motion\/react'/.test(readFileSync(f, 'utf8')));
ok('no file uses the full `motion` components (they would pull the whole engine into the main bundle)', offenders.length === 0, offenders.join(', '));

// Opening the coach screen must not scroll the page to the bottom: the "follow the conversation" scroll may only run
// once there are messages.
{
  const coach = readFileSync(new URL('../src/coach/CoachDemo.tsx', import.meta.url), 'utf8');
  const i = coach.indexOf('scrollIntoView');
  const before = coach.slice(Math.max(0, i - 400), i);
  ok('coach screen: the auto-scroll waits for a first message', i > 0 && /if \(messages\.length === 0\) return;/.test(before));
}

// A change of breathing pace must fade, not snap: the ring and the gem go through the fade switch, and the orbit's
// phase is set once at mount so it does not jump back to angle 0 when the pace changes.
{
  const ring = read('src/app/components/ValarBreathingLogo.tsx');
  const gem = read('src/app/components/SpectralGem.tsx');
  const logo = read('src/app/components/NenyaLogo.tsx');
  ok('breathing ring and gem fade on a pace change', /useFadeSwitch\(/.test(ring) && /useFadeSwitch\(/.test(gem));
  ok('the orbit phase is set once, not on every clock change', /orbitSet\.current/.test(logo));
  ok('the gem does not resize (and so blank) its canvas on a restart', /if \(body\.width !== px\)/.test(gem));
}

// Starting the conversation must not leave the page scrolled to the bottom: the consent screen's start button is at its
// bottom, so entering the chat has to put the page back at the top.
{
  const coach = readFileSync(new URL('../src/coach/CoachDemo.tsx', import.meta.url), 'utf8');
  ok('coach screen: entering the chat resets the scroll to the top', /import \{ resetScroll \}/.test(coach) && /if \(stage !== 'chat'\) return;\s*resetScroll\(\);/.test(coach));
}

