// Screens that gate or protect the site must work with no animation library at all. The library's engine is a
// separate download, and an element that starts hidden and waits for it can stay invisible if that download is
// slow or fails. These files must therefore never use it.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';

const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const CRITICAL = [
  'src/app/components/OnboardingFlow.tsx', // the first-visit panel: rhythm, tour, terms
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
