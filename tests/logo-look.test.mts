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

// The preview's size in the breathing panel is a percentage of the standard preview, held to what the device and the screen can take.
import { DEFAULT_PREVIEW_PCT, DEFAULT_PREVIEW_SIZE, PREVIEW_PCT_MAX, PREVIEW_PCT_MIN, PREVIEW_PCT_STEP, availablePreviewPx, effectivePreviewPercent, percentFromOldPixels, previewCapForTier, previewMaxPercent, previewPixels, snapPreviewPercent } from '../src/lib/logoLook.ts';
ok('the preview size runs 50% to 200% in steps of 10%, the default is 120% (what the owner has set), and 100% is the standard 220 px', PREVIEW_PCT_MIN === 50 && PREVIEW_PCT_MAX === 200 && PREVIEW_PCT_STEP === 10 && (DEFAULT_PREVIEW_PCT as number) === 120 && DEFAULT_PREVIEW_SIZE === 220 && previewPixels(100, 'capable', 1600) === 220 && previewPixels(200, 'capable', 1600) === 440 && previewPixels(50, 'capable', 1600) === 110);
ok('a percentage is rounded to a step and kept between the limits', snapPreviewPercent(133) === 130 && snapPreviewPercent(5) === 50 && snapPreviewPercent(999) === 200 && snapPreviewPercent(145) === 150);
ok('an unreadable percentage becomes the default, 120%', snapPreviewPercent('big') === 120 && snapPreviewPercent(NaN) === 120 && snapPreviewPercent(null) === 120 && snapPreviewPercent(undefined) === 120);
ok('device caps: a light device 125%, an ordinary one 175%, a capable one 200%', previewCapForTier('lite') === 125 && previewCapForTier('standard') === 175 && previewCapForTier('capable') === 200);
ok('on a wide screen the cap is the device\'s', previewMaxPercent('lite', 1600) === 125 && previewMaxPercent('standard', 1600) === 175 && previewMaxPercent('capable', 1600) === 200);
ok('the maximum is a multiple of 10 where it can be, at most the cap, and never below 50%', [320, 375, 414, 600, 768, 900, 1024, 1440, 2560].every((w) => (['lite', 'standard', 'capable'] as const).every((t) => { const m = previewMaxPercent(t, w); return m >= 50 && m <= previewCapForTier(t) && (m % 10 === 0 || m === previewCapForTier(t)); })));
ok('the preview never needs more room than the screen has: at every width and tier the preview plus the panel\'s padding fits (no sideways scroll)', [320, 375, 414, 600, 700, 768, 900, 1024, 1440].every((w) => (['lite', 'standard', 'capable'] as const).every((t) => { const px = previewPixels(200, t, w); return px <= Math.max(availablePreviewPx(w), 110);})));
ok('the room grows with the screen', availablePreviewPx(375) < availablePreviewPx(700) && availablePreviewPx(800) < availablePreviewPx(1400) && availablePreviewPx(0) >= 0);
ok('a stored choice above this device\'s maximum is used at the maximum, and the choice itself is untouched', effectivePreviewPercent(200, 'lite', 1600) === 125 && snapPreviewPercent(200) === 200);
ok('a stored choice below the maximum is used as it is', effectivePreviewPercent(80, 'standard', 1600) === 80);
ok('a size kept in pixels by the older version is converted: 220 px is 100%, 120 px about 50%, 400 px 180%', percentFromOldPixels(220) === 100 && percentFromOldPixels(120) === 50 && percentFromOldPixels(400) === 180 && percentFromOldPixels(300) === 140);
ok('an unreadable or out-of-range old size becomes the default, 120%', percentFromOldPixels(5000) === 120 && percentFromOldPixels(10) === 120 && percentFromOldPixels('x') === 120 && percentFromOldPixels(NaN) === 120);

import { readFileSync } from 'node:fs';
const popout = readFileSync('src/app/components/BreathingPopout.tsx', 'utf8');
ok('the popout shows the percentage beside the label, takes the slider\'s top from the device and the width, and has a Reset to 100%', /\{previewPercent\}%/.test(popout) && /max=\{previewMax\}/.test(popout) && /previewMaxPercent\(tier, viewport\)/.test(popout) && /deviceProfile\(\)\.tier/.test(popout) && /setBreathPreviewPercent\(DEFAULT_PREVIEW_PCT\)/.test(popout) && /min=\{PREVIEW_PCT_MIN\}/.test(popout) && /step=\{PREVIEW_PCT_STEP\}/.test(popout));
ok('the stored choice is never overwritten by the cap (the cap is applied when drawing, not when saving)', !/setBreathPreviewPercent\(previewPercent\)|setBreathPreviewPercent\(previewMax\)/.test(popout));
