// The mark (owner, 2026-11-15): nenya.biz with a white e and a gold e behind it that turns counterclockwise a half circle and rests upside down, reading
// nənya.biz ("nunya biz"). The owner's values, set by eye. Plain "Nenya" everywhere else; screen readers hear "nenya.biz"; once only; still with reduced motion.
import { readFileSync } from 'node:fs';
import { MARK_MOTION, MARK_SETTINGS } from '../src/lib/nameMark.ts';
import { ok } from './helpers.mts';

ok("the owner's resting positions, per face", JSON.stringify(MARK_SETTINGS.lyric) === JSON.stringify({ nudge: 0.145, rise: 0.03, after: 0.075 }) && JSON.stringify(MARK_SETTINGS.body) === JSON.stringify({ nudge: 0.085, rise: 0.015, after: 0 }));
ok('the turn: counterclockwise half turn, 3.5 s after 0.5 s, settling', MARK_MOTION.degrees === -180 && MARK_MOTION.durationMs === 3500 && MARK_MOTION.delayMs === 500 && MARK_MOTION.easing === 'cubic-bezier(.2, .8, .2, 1)');
const src = readFileSync('src/app/components/NenyaMark.tsx', 'utf8') + readFileSync('src/lib/nameMark.ts', 'utf8');
ok('screen readers hear "nenya.biz"; the letters themselves are hidden from them', /role="img"\s+aria-label="nenya\.biz"/.test(src) && /aria-hidden="true"/.test(src));
ok('the gold e is behind the white one', /z-\[1\][^\n]*text-nenya-gold-text/.test(src) && /relative z-\[2\] inline-block leading-none/.test(src));
ok('it turns once, on first sight, and rests without moving under reduced motion', /if \(done\) return;/.test(src) && /observer\?\.disconnect\(\);\s*turn\(\);/.test(src) && /if \(reduce \|\| typeof spin\.animate !== 'function'\) \{\s*spin\.style\.transform = restTransform\(face\);/.test(src) && !/iterations/.test(src));
ok('the space after the pair moves only the letters after it; the nudge moves only the turned e', /marginRight: `\$\{MARK_SETTINGS\[face\]\.after\}em`/.test(src) && /translate\(\$\{MARK_SETTINGS\[face\]\.nudge\}em/.test(src));
const footer = readFileSync('src/app/components/AppFooter.tsx', 'utf8');
ok('the footer shows the mark only with VITE_NAME_MARK=on, and the plain name otherwise', /nameMarkOn\(\) \? <NenyaMark face="body"/.test(footer) && /: <span className="text-sm font-medium">Nenya<\/span>/.test(footer));
ok('the copyright line keeps the plain name', /<p>© 2025 Nenya<\/p>/.test(footer));
