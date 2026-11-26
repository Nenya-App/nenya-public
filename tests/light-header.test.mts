// The light theme's pale spots (owner, 2026-11-26): the front page button's outline, and the header's logo, which uses the round badge on a dark background.
import { readFileSync, statSync } from 'node:fs';
import { ok } from './helpers.mts';

const src = (p: string) => readFileSync(p, 'utf8');
const css = src('src/styles/globals.css');
const token = (start: RegExp, name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css.slice(start.exec(css)!.index))![1];
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c: number[]) => c.map((v) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (fg: string, bg: string, a: number) => { const m = rgb(fg).map((v, i) => v * a + rgb(bg)[i] * (1 - a)); const [x, y] = [lum(m), lum(rgb(bg))]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const button = src('src/app/components/MoreBelowButton.tsx');
const edge = /border border-nenya-gold-text\/(\d+) dark:border-nenya-accent-warm\/(\d+)/.exec(button);
ok('the button\'s outline is a darker gold on the light page and as before on the dark one', !!edge && edge[2] === '60');
const light = ratio(token(/^:root\s*\{/m, 'nenya-gold-text'), token(/^:root\s*\{/m, 'background'), Number(edge?.[1] ?? 0) / 100);
const dark = ratio(token(/^\.dark\s*\{/m, 'nenya-accent-warm'), token(/^\.dark\s*\{/m, 'background'), 0.6);
ok('the outline is at least 3:1 against the page in both themes', light >= 3 && dark >= 3, `light ${light.toFixed(2)}, dark ${dark.toFixed(2)}`);

const logo = src('src/app/components/HeaderLogo.tsx');
ok('the header shows the badge on the light theme and the living logo on the dark one', /const \{ theme \} = useTheme\(\);/.test(logo) && /if \(theme === 'light'\) return <img src=\{badge\} alt="" width=\{size\} height=\{size\}/.test(logo) && /return <NenyaLogo size=\{size\} technique=\{technique\} cycleStart=\{cycleStart\} \/>;/.test(logo));
ok('the badge is the round badge on a dark background, small enough for a header', /import badge from '\.\.\/\.\.\/assets\/nenya-badge\.webp';/.test(logo) && statSync('src/assets/nenya-badge.webp').size < 12000);
const nav = src('src/app/components/GlobalNavigation.tsx');
ok('both headers, wide and narrow, use it', /<HeaderLogo size=\{40\} technique=\{technique\} cycleStart=\{cycleStart\} \/>/.test(nav) && /<HeaderLogo size=\{32\} technique=\{technique\} cycleStart=\{cycleStart\} \/>/.test(nav) && !/<NenyaLogo/.test(nav));
