// The simpler gateways (owner, 2026-11-15), starting with Touch: one main choice per step with a one-line instruction above it, the rest
// under "Add more detail", a short "How this works", plain wording at a lower-secondary reading level. Behind VITE_GATEWAYS_SIMPLE=on.
import { readFileSync } from 'node:fs';
import { gradeLevel, syllables } from '../src/lib/readingLevel.ts';
import { STEP_NAMES, TOUCH_COPY, touchCopyLines } from '../src/lib/gatewayCopy.ts';
import { ok } from './helpers.mts';

ok('the syllable rule is sane on plain words', syllables('cat') === 1 && syllables('surface') === 2 && syllables('optional') >= 3);
ok('a plain sentence scores low and a dense one scores high', gradeLevel('Pick the one that feels closest.') < 5 && gradeLevel('Physiological somatosensory integration facilitates multidimensional interoceptive awareness.') > 14);
const lines = touchCopyLines();
const worst = lines.map((l) => ({ l, g: gradeLevel(l) })).sort((a, b) => b.g - a.g)[0];
ok('every line of the Touch wording reads at grade 8 or below (WCAG AAA 3.1.5)', worst.g <= 8, `${worst.g.toFixed(1)}: ${worst.l}`);
ok('the whole Touch wording, read together, is at grade 7 or below', gradeLevel(lines.join(' ')) <= 7, gradeLevel(lines.join(' ')).toFixed(1));
ok('no abstract or overclaiming phrases from the old cards', !/wisdom|ritual|somatic|deep emotional information|landscape|Potential/i.test(lines.join(' ')));
ok('the steps are named plainly, and the same everywhere', STEP_NAMES.present === 'Now' && STEP_NAMES.wish === 'How you would like it to feel');
ok('"How this works" is three concrete steps and says nothing leaves the device', TOUCH_COPY.how.length === 3 && /nothing leaves your device/.test(TOUCH_COPY.how[2]));

const page = readFileSync('src/app/components/pages/TouchGatewayPage.tsx', 'utf8');
const more = readFileSync('src/app/components/MoreDetail.tsx', 'utf8');
ok('with the switch on, Touch skips the instruction cards and opens on the choice', /useState<'instructions' \| 'selection'>\(simple \? 'selection' : 'instructions'\)/.test(page));
ok('both steps lead with the surface, then "Add more detail" holds the five sliders and the words', (page.match(/<MoreDetail simple=\{simple && !tray\} label=\{TOUCH_COPY\.more\} hint=\{TOUCH_COPY\.moreHint\}>/g) ?? []).length === 2 && (page.match(/<\/MoreDetail>/g) ?? []).length === 2 && page.indexOf('<TouchSurfaceField stateName="Present"') < page.indexOf('<MoreDetail'));
ok('the instruction sits right above each choice', /simple \? TOUCH_COPY\.pick\.present/.test(page) && /simple \? TOUCH_COPY\.pick\.wish/.test(page));
ok('with the switch off, the earlier page is unchanged (cards, titles, wording)', /'Present State'/.test(page) && /'Wish State'/.test(page) && /INSTRUCTION_CARDS/.test(page) && /if \(!simple\) return <>\{children\}<\/>/.test(more));
ok('"Add more detail" and "How this works" are native disclosures with 44px targets', /<details/.test(more) && /<summary className="flex min-h-11/.test(more) && /<summary className="flex min-h-11 cursor-pointer items-center underline underline-offset-4">\{TOUCH_COPY\.howTitle\}/.test(page));
ok('the words box has a real label', /<Label htmlFor="touch-words-present"/.test(page) && /id="touch-words-present"/.test(page) && /<Label htmlFor="touch-words-wish"/.test(page));
ok('nothing collected changes: the same fields go to the report', /currentSharpness: sliderValue\(currentSharpness\)/.test(page) && /potentialDescription: potentialDescription \|\| null/.test(page));

const chord = readFileSync('src/app/components/ChordPrototype.tsx', 'utf8');
ok('chords: softened is the voicing people hear (as the color gives it on a non-Western scale)', /useState<Voicing>\(westernScale \? 'softened' : 'raw'\)/.test(chord));
ok('chords: the other voicings are under a closed "Other ways to hear them", and the prototype label is gone', /<summary[^>]*>Other ways to hear them<\/summary>/.test(chord) && !/prototype, staging only/.test(chord));
