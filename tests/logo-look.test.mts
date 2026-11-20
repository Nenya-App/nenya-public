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
