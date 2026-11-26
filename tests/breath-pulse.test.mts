// The "more below" button pulses once at the end of each breath, in that breath's colour (src/lib/breathPulse.ts).
import { nextBreathEnd, rgbTriplet } from '../src/lib/breathPulse.ts';
import { ok } from './helpers.mts';

ok('at the start of a breath the whole breath is still to come', nextBreathEnd(1000, 1000, 10000).delayMs === 10000 && nextBreathEnd(1000, 1000, 10000).index === 0);
ok('part way through, the delay is what remains', nextBreathEnd(4000, 1000, 10000).delayMs === 7000);
ok('the delay is never zero: at the exact end it waits for the next breath', nextBreathEnd(11000, 1000, 10000).delayMs === 10000 && nextBreathEnd(11000, 1000, 10000).index === 1);
ok('one millisecond before the end it fires almost at once', nextBreathEnd(10999, 1000, 10000).delayMs === 1);
ok('the breath is counted on and on, so a list of colours of any length can wrap it', nextBreathEnd(1000 + 96 * 10000, 1000, 10000).index === 96);
ok('a start in the future counts as the first breath', nextBreathEnd(0, 5000, 10000).index === 0);
ok('an unusable breath length falls back to ten seconds', nextBreathEnd(0, 0, 0).delayMs === 10000 && nextBreathEnd(0, 0, NaN).delayMs === 10000);
ok('a technique-length breath is respected', nextBreathEnd(2000, 0, 4000 + 7000 + 8000).delayMs === 17000);
ok('a colour becomes an rgb triplet; anything else gets the warm default', rgbTriplet('#ff0080') === '255, 0, 128' && rgbTriplet('red') === '232, 160, 32');
