// Surprise Me on the Sight page is per picker (owner, 2026-11-25): on the second picker it must leave the first color, its name and its words alone.
import { readFileSync } from 'node:fs';
import { surprisePatch, pickerForStage } from '../src/lib/sightSurprise.ts';
import { ok } from './helpers.mts';

const first = surprisePatch('present', '#123456');
ok('the first picker changes only the first color and what belonged to it', 'color1' in first && !('color2' in first) && first.color1 === '#123456');
ok('the first picker clears the old name and words', 'color1' in first && first.color1Name === '' && first.color1Qualities.length === 0);

const second = surprisePatch('wish', '#abcdef');
ok('the second picker changes only the second color and what belonged to it', 'color2' in second && !('color1' in second) && second.color2 === '#abcdef');
ok('the second picker names nothing of the first (no color1 field at all)', Object.keys(second).every((k) => k.startsWith('color2')));
ok('stages map to their pickers', pickerForStage('present') === 1 && pickerForStage('wish') === 2);

// The page must use the stage and never set both colors in the one handler.
const page = readFileSync('src/app/components/pages/SightGatewayPage.tsx', 'utf8');
const handler = page.slice(page.indexOf('const handleSurpriseMe'), page.indexOf('const handleNext'));
ok('the Surprise Me handler uses the current stage', handler.includes('surprisePatch(stage'));
ok('the Surprise Me handler does not set both colors', !(handler.includes('setColor1(hslToHex') && handler.includes('setColor2(hslToHex')));
