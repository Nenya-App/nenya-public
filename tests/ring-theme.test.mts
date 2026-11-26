// Switching between light and dark mid-breath (owner, 2026-11-26): the breath under way keeps its color, and the other theme's colors start with
// the next breath. The ring, the gem and the button's pulse read the same rule.
import { readFileSync } from 'node:fs';
import { ok } from './helpers.mts';
import { getRingTheme, nextHeld, setRingClock, setRingTheme, subscribeRingTheme, themeForBreath } from '../src/lib/ringTheme.ts';

const clock = { start: 1000, breathMs: 12000 };
const first = nextHeld(null, 'dark', 5000, clock);
ok('the first theme applies at once', themeForBreath(first, 1000) === 'dark' && themeForBreath(first, 0) === 'dark');
// Breaths start at 1000, 13000, 25000... Switch to light in the middle of the second.
const light = nextHeld(first, 'light', 18000, clock);
ok('switching mid-breath: the breath under way keeps the old theme\'s color', themeForBreath(light, 13000) === 'dark');
ok('and the next breath takes the new one, exactly at its start', light.switchAt === 25000 && themeForBreath(light, 25000) === 'light' && themeForBreath(light, 37000) === 'light');
ok('switching back within the same breath changes nothing', (() => { const back = nextHeld(light, 'dark', 20000, clock); return themeForBreath(back, 13000) === 'dark' && themeForBreath(back, 25000) === 'dark'; })());
ok('switching three times within a breath ends on the last choice, from the next breath', (() => { const t = nextHeld(nextHeld(light, 'dark', 19000, clock), 'light', 21000, clock); return themeForBreath(t, 13000) === 'dark' && themeForBreath(t, 25000) === 'light'; })());
ok('switching again in a later breath keeps that breath\'s color too', (() => { const t = nextHeld(light, 'dark', 40000, clock); return themeForBreath(t, 37000) === 'light' && themeForBreath(t, 49000) === 'dark' && t.switchAt === 49000; })());
ok('setting the same theme again keeps what is held', nextHeld(light, 'light', 90000, clock) === light);
ok('with no breathing clock the theme applies at once', themeForBreath(nextHeld(first, 'light', 18000, null), 13000) === 'light');
ok('an unusable breath length applies at once rather than holding for ever', themeForBreath(nextHeld(first, 'light', 18000, { start: 1000, breathMs: 0 }), 13000) === 'light');

let told = 0;
const stop = subscribeRingTheme(() => { told++; });
ok('before the page says its theme, nothing is held', getRingTheme() === null);
setRingClock(1000, 12000);
setRingTheme('dark', 5000);
setRingTheme('dark', 6000);
const held = getRingTheme();
setRingTheme('light', 18000);
ok('the store holds the theme, tells its readers only when something changes, and uses the page\'s clock', told === 2 && held !== null && getRingTheme()!.switchAt === 25000 && themeForBreath(getRingTheme()!, 13000) === 'dark');
stop();

const src = (p: string) => readFileSync(p, 'utf8');
const ring = src('src/app/components/ValarBreathingLogo.tsx'), gem = src('src/app/components/SpectralGem.tsx'), button = src('src/app/components/MoreBelowButton.tsx');
ok('the page tells the store its theme and its breathing clock', /useEffect\(\(\) => \{ setRingTheme\(theme\); \}, \[theme\]\);/.test(src('src/app/components/ThemeProvider.tsx')) && /setRingClock\(cycleStart, breathLengthMs\(technique\)\)/.test(src('src/app/components/PortableBreath.tsx')));
ok('the colors are asked for by the time a breath started', /return useCallback\(\(breathStartMs: number\) => lists\[themeForBreath\(held, breathStartMs\)\], \[lists, held\]\);/.test(ring));
ok('the ring picks each breath\'s color by when it started', /const list = coloursFor\(breathStart\);\s*\n\s*setActiveColor\(list\[breath % list\.length\]\);/.test(ring));
ok('the button pulses in the ended breath\'s own color', /const list = coloursForRef\.current\(cycleStart \+ end\.index \* breathMs\);/.test(button) && /list\[end\.index % list\.length\]/.test(button) && /\}, \[cycleStart, breathMs\]\);/.test(button));
ok('the gem eases toward the next breath\'s color from that breath\'s own list, and counts breaths without wrapping at 96', /const breath = Math\.floor\(Math\.max\(0, elapsed\) \/ breathMs\);/.test(gem) && /const thisList = breathColoursRef\.current\(breathStart\), nextList = breathColoursRef\.current\(breathStart \+ breathMs\);/.test(gem) && !/tintIndex\(c\.idx/.test(gem));
