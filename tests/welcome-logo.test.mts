// The front page's breathing animation (owner, 2026-11-26): its size, the three presets that change it, and the equal gaps above it and under it.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { welcomeLogoSize } from '../src/lib/welcomeLogo.ts';

const before = (w: number, h: number) => Math.min(w - 48, h - 64 - 120, 600) * 0.675;
const screens: [string, number, number][] = [['small phone', 320, 568], ['phone', 375, 812], ['large phone', 430, 932], ['phone on its side', 812, 375], ['tablet', 768, 1024], ['small laptop', 1366, 650], ['laptop', 1024, 768], ['desktop', 1440, 900], ['large screen', 2560, 1440]];
/** The header, two gaps at their smallest (56px each), the button and a little room under it. */
const AROUND = 65 + 2 * 56 + 76 + 12;
for (const [name, w, h] of screens) {
  const small = welcomeLogoSize(w, h, 'small'), standard = welcomeLogoSize(w, h, 'standard'), large = welcomeLogoSize(w, h, 'large');
  const ring = w < 640 ? 64 : 96;
  const grew = standard / before(w, h);
  ok(`${name}: Standard is the size the owner kept, about 5% larger than the first one`, grew > 1.04 && grew < 1.06 && welcomeLogoSize(w, h) === standard, `${before(w, h).toFixed(0)} -> ${standard.toFixed(0)}`);
  ok(`${name}: Small is three quarters of Standard`, Math.abs(small / standard - 0.75) < 0.001, `${small.toFixed(0)}`);
  ok(`${name}: Large is never smaller than Standard, nor more than a quarter larger`, large >= standard && large <= standard * 1.25 + 0.001, `${standard.toFixed(0)} -> ${large.toFixed(0)}`);
  ok(`${name}: every size fits the width with the ring's padding`, large + ring <= w - 12, `${(large + ring).toFixed(0)} of ${w}`);
  ok(`${name}: Large grows only as far as leaves both gaps and the button on the screen`, large <= standard + 0.001 || large <= h - AROUND + 0.001, `${large.toFixed(0)} of ${h}`);
}
ok('on a desktop screen Large really is larger', welcomeLogoSize(1440, 900, 'large') > welcomeLogoSize(1440, 900, 'standard') * 1.2);
ok('on an upright phone Large really is larger', welcomeLogoSize(375, 812, 'large') > welcomeLogoSize(375, 812, 'standard') * 1.2);

const page = readFileSync('src/app/components/pages/WelcomePage.tsx', 'utf8');
ok('the front page takes its size from the one rule and the visitor\'s choice', /const animationSize = useAnimationSize\(\);/.test(page) && /setLogoSize\(welcomeLogoSize\(window\.innerWidth, window\.innerHeight, animationSize\)\)/.test(page) && /\}, \[animationSize\]\);/.test(page));
// The gap from the header to the top of the animation equals the gap from the animation to the button: two spaces that share the spare height equally.
// A column, not a grid: with only a minimum height, a grid made the bottom space as tall as the others and the screen overflowed (found 2026-11-26).
ok('the first screen is the space under the header, a column that grows only when it must', page.includes('className="min-h-full flex flex-col items-center px-6 relative snap-start overflow-x-clip"'));
ok('the spaces above and below the animation share the spare height from the same zero start, each at least 3.5rem', page.includes('<div aria-hidden="true" className="grow shrink-0 basis-0 min-h-14" />') && /<div style=\{\{[^}]*\}\} className="grow shrink-0 basis-0 flex flex-col items-center justify-center">\s*<div className="min-h-14 flex items-center pt-3">/.test(page));
ok('the space under the button shares what is left, and may be small', page.includes('<div aria-hidden="true" className="grow shrink-0 basis-0 min-h-3" />'));
ok('the ring\'s padding does not add to either gap', /className="-my-8 sm:-my-12 flex items-center justify-center/.test(page));
const first = page.slice(page.indexOf('First Section'), page.indexOf('Second Section'));
const at = (s: string) => first.indexOf(s);
ok('in order: space, the animation, the words in the middle gap, the button, space', at('min-h-14" />') < at('id="tutorial-logo"') && at('id="tutorial-logo"') < at('Take a Moment to Breathe') && at('Take a Moment to Breathe') < at('<MoreBelowButton') && at('min-h-3" />') > at('<MoreBelowButton') && !/h-screen|pb-8|mt-5|space-y-6/.test(first));
// (The column's overflow-x-clip also keeps the logo's wide glow from scrolling a phone sideways.)
