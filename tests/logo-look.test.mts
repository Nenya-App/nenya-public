// The visitor's look for the logo (src/lib/logoLook.ts, kept by deviceMemory.ts): presets, snapping, and what the gem draws.
import { DEFAULT_GEM_CHOICE, DEFAULT_LOGO_LEAVES, GEM_SIDE_PRESETS, LEAF_PRESETS, LOW_DEVICE_MAX_SIDES, effectiveGemSides, snapGemChoice, snapLeaves } from '../src/lib/logoLook.ts';
import { ok } from './helpers.mts';

ok('leaf presets are even and between 6 and 12', LEAF_PRESETS.every((n) => n % 2 === 0 && n >= 6 && n <= 12));
ok('gem presets are 6, 8 and 10', JSON.stringify(GEM_SIDE_PRESETS) === '[6,8,10]');
ok('a leaf count snaps to the nearest preset', snapLeaves(7) === 6 || snapLeaves(7) === 8);
ok('an odd or wild leaf count never reaches the generator', [0, 1, 5, 7, 9, 11, 13, 99, -4].every((n) => (LEAF_PRESETS as readonly number[]).includes(snapLeaves(n))));
ok('anything unreadable becomes the defaults', snapLeaves('8') === DEFAULT_LOGO_LEAVES && snapLeaves(NaN) === DEFAULT_LOGO_LEAVES && snapGemChoice(null) === DEFAULT_GEM_CHOICE && snapGemChoice('big') === DEFAULT_GEM_CHOICE);
ok("'match' stays 'match'; numbers snap to a preset", snapGemChoice('match') === 'match' && (snapGemChoice(9) as unknown) !== 9 && snapGemChoice(12) === 10 && snapGemChoice(3) === 6);
const live = { live: true, low: false }, low = { live: true, low: true };
ok('the gem follows the leaves by default, never fewer than 6 sides', effectiveGemSides('match', 6, live) === 6 && effectiveGemSides('match', 8, live) === 8 && effectiveGemSides('match', 10, live) === 10);
ok('twelve leaves give a ten-sided gem', effectiveGemSides('match', 12, live) === 10);
ok('a chosen number wins over the leaves', effectiveGemSides(6, 12, live) === 6 && effectiveGemSides(10, 6, live) === 10);
ok('a low-capability device never draws more than eight sides', effectiveGemSides(10, 8, low) === LOW_DEVICE_MAX_SIDES && effectiveGemSides('match', 12, low) === LOW_DEVICE_MAX_SIDES && effectiveGemSides(6, 8, low) === 6);
ok('without the live gem the stone is the sprite\'s hexagon', effectiveGemSides(10, 12, { live: false, low: false }) === 6);

// The outer orbs' glow: style, width and the random colours.
import { DEFAULT_HALO_STYLE, DEFAULT_HALO_WIDTH, HALO_STYLES, HALO_WIDTHS, haloStyleLabel, randomHaloColors, snapHaloSeed, snapHaloStyle, snapHaloWidth } from '../src/lib/logoLook.ts';
ok('the glow defaults to the orb\'s palette (owner, 2026-11-22) at five times the orb\'s width', DEFAULT_HALO_STYLE === 'palette' && DEFAULT_HALO_WIDTH === 5);
ok('the width presets are 3.4, 5 and 7, and the default is one of them', HALO_WIDTHS.join() === '3.4,5,7' && (HALO_WIDTHS as readonly number[]).includes(DEFAULT_HALO_WIDTH));
ok('a glow style that is not offered becomes the default', snapHaloStyle('neon') === 'palette' && snapHaloStyle(null) === 'palette' && HALO_STYLES.every((s) => snapHaloStyle(s) === s));
ok('a width snaps to the nearest preset, and anything unreadable becomes the default', snapHaloWidth(4.5) === 5 && snapHaloWidth(3) === 3.4 && snapHaloWidth(99) === 7 && snapHaloWidth('5') === 5 && snapHaloWidth(NaN) === 5);
ok('a seed is a whole number or it becomes 1', snapHaloSeed(42) === 42 && snapHaloSeed(1.5) === 1 && snapHaloSeed(-1) === 1 && snapHaloSeed('x') === 1);
const sample = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888'];
ok('random colours: six per orb, all from the list', randomHaloColors(3, 0, sample).length === 6 && randomHaloColors(3, 0, sample).every((c) => sample.includes(c)));
ok('the same seed gives the same colours (a reload does not reshuffle)', randomHaloColors(3, 4, sample).join() === randomHaloColors(3, 4, sample).join());
ok('another seed or another orb gives different colours', randomHaloColors(3, 4, sample).join() !== randomHaloColors(4, 4, sample).join() && randomHaloColors(3, 4, sample).join() !== randomHaloColors(3, 5, sample).join());
ok('every style has a label', HALO_STYLES.every((s) => haloStyleLabel(s).length > 0));

// The animation's size, chosen as one of three presets in the breathing panel: it sizes the front page (tests/welcome-logo.test.mts) and the panel's preview.
import { ANIMATION_SIZES, DEFAULT_ANIMATION_SIZE, animationSizeLabel, availablePreviewPx, previewPixels, snapAnimationSize } from '../src/lib/logoLook.ts';
ok('three presets, Small, Standard and Large, and Standard by default', ANIMATION_SIZES.join() === 'small,standard,large' && DEFAULT_ANIMATION_SIZE === 'standard' && ANIMATION_SIZES.map(animationSizeLabel).join() === 'Small,Standard,Large');
ok('anything unreadable becomes Standard', ['huge', 120, null, undefined, ''].every((v) => snapAnimationSize(v) === 'standard') && snapAnimationSize('large') === 'large');
ok('on a wide screen the preview is 220, 264 and 308 px: Standard is the size the owner had set', ANIMATION_SIZES.map((s) => previewPixels(s, 'capable', 1600)).join() === '220,264,308');
ok('a light device is asked to draw no more than 275 px', previewPixels('large', 'lite', 1600) === 275);
ok('the preview never needs more room than the screen has, and the three sizes differ on every screen', [320, 375, 414, 600, 700, 768, 900, 1024, 1440].every((w) => (['lite', 'standard', 'capable'] as const).every((t) => { const [a, b, c] = ANIMATION_SIZES.map((s) => previewPixels(s, t, w)); return c <= availablePreviewPx(w) && a < b && b < c; })));
ok('the room grows with the screen', availablePreviewPx(375) < availablePreviewPx(700) && availablePreviewPx(800) < availablePreviewPx(1400) && availablePreviewPx(0) >= 0);

import { readFileSync } from 'node:fs';
const popout = readFileSync('src/app/components/BreathingPopout.tsx', 'utf8');
ok('the popout offers the presets as pressed buttons at least 44px tall, and no slider', /ANIMATION_SIZES\.map/.test(popout) && /aria-pressed=\{animationSize === size\}/.test(popout) && /setAnimationSize\(size\)/.test(popout) && /min-h-11/.test(popout) && !/type="range"|preview-size|Preview size/.test(popout));
ok('it says what the size changes', popout.includes('Animation size, here and on the front page'));
ok('the preview follows the choice, the device and the width', /previewPixels\(animationSize, tier, viewport\)/.test(popout) && /deviceProfile\(\)\.tier/.test(popout));
ok('the panel keeps one width whichever preset is chosen', /const leftWidth = previewPixels\('large', tier, viewport\) \+ \(viewport < 640 \? 64 : 96\) \+ 48;/.test(popout));
ok('the size buttons sit above the preview, so they stay under the pointer as it grows and shrinks, with no empty space held for it', popout.indexOf('aria-label="Animation size"') < popout.indexOf('<ValarBreathingLogo') && !/minHeight: largestPreview/.test(popout));
ok('the logo\'s wide glow is clipped in the panel, so a phone never scrolls it sideways', popout.includes('flex flex-col items-center justify-center p-6 bg-background overflow-x-clip'));
