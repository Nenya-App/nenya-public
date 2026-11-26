// The front page's breathing animation (owner, 2026-11-26: slightly larger and slightly nearer the top, on every screen; then scaled back the same day to 5% larger and 2% higher).
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { welcomeLogoSize } from '../src/lib/welcomeLogo.ts';

const before = (w: number, h: number) => Math.min(w - 48, h - 64 - 120, 600) * 0.675;
const screens: [string, number, number][] = [['small phone', 320, 568], ['phone', 375, 812], ['large phone', 430, 932], ['phone on its side', 812, 375], ['tablet', 768, 1024], ['small laptop', 1366, 650], ['desktop', 1440, 900], ['large screen', 2560, 1440]];
for (const [name, w, h] of screens) {
  const now = welcomeLogoSize(w, h);
  const grew = now / before(w, h);
  ok(`${name}: about 5% larger than before`, grew > 1.04 && grew < 1.06, `${before(w, h).toFixed(0)} -> ${now.toFixed(0)}`);
  ok(`${name}: still fits the width with the ring's padding`, now + 64 <= w - 12, `${(now + 64).toFixed(0)} of ${w}`);
}
const page = readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8');
ok('the front page takes its size from the one rule', /setLogoSize\(welcomeLogoSize\(window\.innerWidth, window\.innerHeight\)\)/.test(page));
ok('the first screen sits a little above the middle, except on very short screens where it would cut off the top', page.includes('h-screen flex flex-col items-center justify-center px-6 [@media(min-height:600px)]:pb-[4vh] relative snap-start'));
